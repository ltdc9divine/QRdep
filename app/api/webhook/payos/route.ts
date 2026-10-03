import { NextRequest, NextResponse } from "next/server";
import type { Webhook } from "@payos/node/lib/resources/webhooks/webhook";
import { TEMPLATES } from "@/constants/templates";
import { getPayOSClient } from "@/lib/payos";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function isPayOSWebhook(value: unknown): value is Webhook {
  if (!value || typeof value !== "object") return false;
  const webhook = value as Record<string, unknown>;
  if (
    typeof webhook.code !== "string" ||
    typeof webhook.desc !== "string" ||
    typeof webhook.success !== "boolean" ||
    typeof webhook.signature !== "string" ||
    !webhook.data ||
    typeof webhook.data !== "object"
  ) return false;

  const data = webhook.data as Record<string, unknown>;
  return typeof data.orderCode === "number" && typeof data.amount === "number" && typeof data.code === "string";
}

export async function POST(request: NextRequest) {
  const payos = getPayOSClient();
  if (!payos) {
    return NextResponse.json({ error: "Webhook PayOS chưa được cấu hình." }, { status: 503 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: "Supabase chưa được cấu hình." }, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu webhook không hợp lệ." }, { status: 400 });
  }

  if (!isPayOSWebhook(payload)) {
    return NextResponse.json({ error: "Dữ liệu webhook không hợp lệ." }, { status: 400 });
  }

  try {
    const verified = await payos.webhooks.verify(payload);
    if (verified.orderCode !== payload.data.orderCode || verified.amount !== payload.data.amount) {
      return NextResponse.json({ error: "Dữ liệu webhook đã xác thực không khớp." }, { status: 400 });
    }
    const paid = payload.code === "00" && payload.success && verified.code === "00";

    const { data: order, error: lookupError } = await supabase
      .from("orders")
      .select('id, amount, status, "templateId"')
      .eq("orderCode", verified.orderCode)
      .maybeSingle();

    if (lookupError) {
      console.error("Could not look up PayOS order:", lookupError.code);
      return NextResponse.json({ error: "Không thể tra cứu đơn hàng." }, { status: 500 });
    }
    if (!order) {
      return NextResponse.json({ success: true });
    }
    if (order.status === "PAID") {
      return NextResponse.json({ success: true });
    }
    if (order.status !== "PENDING" && !(order.status === "FAILED" && paid)) {
      return NextResponse.json({ success: true });
    }

    const expectedTemplate = TEMPLATES.find((template) => template.id === order.templateId);
    if (!expectedTemplate || expectedTemplate.price !== order.amount || verified.amount !== order.amount) {
      return NextResponse.json({ error: "Số tiền thanh toán không khớp đơn hàng." }, { status: 400 });
    }

    if (!paid) {
      const { error: failedOrderError } = await supabase
        .from("orders")
        .update({ status: "FAILED" })
        .eq("id", order.id)
        .eq("status", "PENDING");
      if (failedOrderError) {
        console.error("Could not mark PayOS order failed:", failedOrderError.code);
        return NextResponse.json({ error: "Không thể cập nhật đơn hàng." }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ status: "PAID" })
      .eq("id", order.id)
      .in("status", ["PENDING", "FAILED"])
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("Could not mark PayOS order paid:", updateError.code);
      return NextResponse.json({ error: "Không thể xác nhận đơn hàng." }, { status: 500 });
    }
    if (!updatedOrder) {
      const { data: currentOrder, error: currentOrderError } = await supabase
        .from("orders")
        .select("status")
        .eq("id", order.id)
        .maybeSingle();
      if (currentOrderError) return NextResponse.json({ error: "Không thể xác nhận đơn hàng." }, { status: 500 });
      if (currentOrder?.status === "PAID") {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "Đơn hàng không còn chờ thanh toán." }, { status: 409 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Chữ ký webhook không hợp lệ." }, { status: 400 });
  }
}