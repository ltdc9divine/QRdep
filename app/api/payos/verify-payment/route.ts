import { NextRequest, NextResponse } from "next/server";
import { TEMPLATES } from "@/constants/templates";
import { getPayOSClient } from "@/lib/payos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const orderCodeParam = request.nextUrl.searchParams.get("orderCode");
  const templateId = request.nextUrl.searchParams.get("templateId");
  if (!orderCodeParam || !/^\d{10,16}$/.test(orderCodeParam)) {
    return NextResponse.json({ error: "Mã đơn hàng không hợp lệ." }, { status: 400 });
  }

  const orderCode = Number(orderCodeParam);
  if (!Number.isSafeInteger(orderCode)) {
    return NextResponse.json({ error: "Mã đơn hàng không hợp lệ." }, { status: 400 });
  }

  const template = TEMPLATES.find((item) => item.id === templateId && item.price > 0);
  if (!template) {
    return NextResponse.json({ error: "Mẫu Standee cần mở khóa không hợp lệ." }, { status: 400 });
  }

  const payos = getPayOSClient();
  if (!payos) {
    return NextResponse.json({ error: "Thanh toán PayOS chưa được cấu hình." }, { status: 503 });
  }

  try {
    const payment = await payos.paymentRequests.get(orderCode);
    const paid = payment.status === "PAID" && payment.amount === template.price && payment.amountPaid >= template.price;
    return NextResponse.json(
      { paid, orderCode, status: payment.status },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Không thể xác minh thanh toán." }, { status: 502 });
  }
}