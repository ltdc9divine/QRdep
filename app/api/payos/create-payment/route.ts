import { NextRequest, NextResponse } from "next/server";
import { TEMPLATES } from "@/constants/templates";
import { getPayOSClient, isPayOSConfigured } from "@/lib/payos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { enabled: isPayOSConfigured() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Mẫu Standee không hợp lệ." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || typeof (body as Record<string, unknown>).templateId !== "string") {
    return NextResponse.json({ error: "Mẫu Standee không hợp lệ." }, { status: 400 });
  }
  const template = TEMPLATES.find((item) => item.id === (body as { templateId: string }).templateId);
  if (!template) {
    return NextResponse.json({ error: "Mẫu Standee không hợp lệ." }, { status: 400 });
  }
  if (template.price <= 0) {
    return NextResponse.json({ error: "Mẫu miễn phí không cần thanh toán." }, { status: 400 });
  }

  const payos = getPayOSClient();
  if (!payos) {
    return NextResponse.json(
      { error: "Thanh toán PayOS chưa được cấu hình." },
      { status: 503 },
    );
  }

  const orderCode = Date.now();
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || request.nextUrl.origin;
  const returnUrl = new URL("/", appUrl);
  returnUrl.searchParams.set("payos", "return");
  returnUrl.searchParams.set("orderCode", String(orderCode));
  const cancelUrl = new URL("/", appUrl);
  cancelUrl.searchParams.set("payos", "cancel");
  cancelUrl.searchParams.set("orderCode", String(orderCode));

  try {
    const payment = await payos.paymentRequests.create({
      orderCode,
      amount: template.price,
      description: `QRDep ${String(orderCode).slice(-12)}`,
      returnUrl: returnUrl.toString(),
      cancelUrl: cancelUrl.toString(),
    });

    return NextResponse.json({
      orderCode: payment.orderCode,
      amount: payment.amount,
      checkoutUrl: payment.checkoutUrl,
      qrCode: payment.qrCode,
    });
  } catch {
    return NextResponse.json(
      { error: "Không thể tạo liên kết thanh toán. Vui lòng thử lại." },
      { status: 502 },
    );
  }
}