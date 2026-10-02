import { NextRequest, NextResponse } from "next/server";
import type { Webhook } from "@payos/node/lib/resources/webhooks/webhook";
import { TEMPLATES } from "@/constants/templates";
import { getPayOSClient } from "@/lib/payos";

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
    const paid = payload.code === "00" && payload.success && verified.code === "00";
    if (paid && !TEMPLATES.some((template) => template.price > 0 && template.price === verified.amount)) {
      return NextResponse.json({ error: "Số tiền thanh toán không khớp bậc giá." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      paid,
      orderCode: verified.orderCode,
    });
  } catch {
    return NextResponse.json({ error: "Chữ ký webhook không hợp lệ." }, { status: 400 });
  }
}