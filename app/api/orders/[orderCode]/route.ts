import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: { orderCode: string };
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  if (!/^\d{10,16}$/.test(params.orderCode)) {
    return NextResponse.json({ error: "Mã đơn hàng không hợp lệ." }, { status: 400 });
  }

  const requestedTemplateId = request.nextUrl.searchParams.get("templateId");
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!/^[A-Za-z0-9_-]{43}$/.test(accessToken)) {
    return NextResponse.json({ error: "Thiếu mã xác thực đơn hàng." }, { status: 401 });
  }
  const providedHash = createHash("sha256").update(accessToken).digest();
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: "Supabase chưa được cấu hình." }, { status: 503 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select('"orderCode", "templateId", amount, status, access_token_hash')
    .eq("orderCode", params.orderCode)
    .maybeSingle();

  if (error) {
    console.error("Could not read order status:", error.code);
    return NextResponse.json({ error: "Không thể kiểm tra trạng thái đơn hàng." }, { status: 500 });
  }
  if (!order || !order.access_token_hash || (requestedTemplateId && requestedTemplateId !== order.templateId)) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }

  const storedHash = Buffer.from(order.access_token_hash, "hex");
  if (storedHash.length !== providedHash.length || !timingSafeEqual(storedHash, providedHash)) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }

  return NextResponse.json(
    {
      orderCode: String(order.orderCode),
      templateId: order.templateId,
      amount: order.amount,
      status: order.status,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}