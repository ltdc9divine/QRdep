import { createHash, createHmac, randomBytes, randomInt } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { TEMPLATES } from "@/constants/templates";
import { getPayOSClient, isPayOSConfigured } from "@/lib/payos";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const simulationEnabled =
    process.env.NODE_ENV !== "production" || process.env.PAYOS_SIMULATION_ENABLED === "true";
  return NextResponse.json(
    { enabled: isPayOSConfigured() && isSupabaseConfigured(), simulationEnabled },
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
  if (!payos || !isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Thanh toán PayOS chưa được cấu hình." },
      { status: 503 },
    );
  }

  const orderCode = Date.now() * 1000 + randomInt(0, 1000);
  const appUrlValue = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!appUrlValue) {
    return NextResponse.json({ error: "Thiếu cấu hình tên miền thanh toán." }, { status: 503 });
  }

  let appUrl: URL;
  try {
    appUrl = new URL(appUrlValue);
  } catch {
    return NextResponse.json({ error: "Cấu hình tên miền thanh toán không hợp lệ." }, { status: 500 });
  }
  if (appUrl.protocol !== "https:" && appUrl.hostname !== "localhost" && appUrl.hostname !== "127.0.0.1") {
    return NextResponse.json({ error: "Tên miền thanh toán phải dùng HTTPS." }, { status: 500 });
  }

  const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientIp = request.headers.get("x-real-ip")?.trim() || forwardedIp || "local-unknown";
  const ipHashKey = process.env.RATE_LIMIT_SALT?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!ipHashKey) {
    return NextResponse.json({ error: "Thiếu cấu hình bảo mật tạo đơn hàng." }, { status: 503 });
  }
  const clientIpHash = createHmac("sha256", ipHashKey).update(clientIp).digest("hex");
  const accessToken = randomBytes(32).toString("base64url");
  const accessTokenHash = createHash("sha256").update(accessToken).digest("hex");

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: "Supabase chưa được cấu hình." }, { status: 503 });
  }

  const { error: orderInsertError } = await supabase.rpc("create_pending_order", {
    p_order_code: orderCode,
    p_template_id: template.id,
    p_amount: template.price,
    p_client_ip_hash: clientIpHash,
    p_access_token_hash: accessTokenHash,
  });

  if (orderInsertError) {
    if (orderInsertError.message.includes("ORDER_RATE_LIMITED")) {
      return NextResponse.json(
        { error: "Bạn đã tạo quá nhiều đơn chờ. Vui lòng thử lại sau 15 phút." },
        { status: 429 },
      );
    }
    console.error("Supabase could not create a pending order:", orderInsertError.code);
    return NextResponse.json({ error: "Không thể tạo đơn hàng. Vui lòng thử lại." }, { status: 503 });
  }

  try {
    const returnUrl = new URL("/", appUrl);
    returnUrl.searchParams.set("payos", "return");
    returnUrl.searchParams.set("orderCode", String(orderCode));
    const cancelUrl = new URL("/", appUrl);
    cancelUrl.searchParams.set("payos", "cancel");
    cancelUrl.searchParams.set("orderCode", String(orderCode));

    const payment = await payos.paymentRequests.create({
      orderCode,
      amount: template.price,
      description: `QRDep ${String(orderCode).slice(-12)}`,
      returnUrl: returnUrl.toString(),
      cancelUrl: cancelUrl.toString(),
    });

    if (payment.orderCode !== orderCode || payment.amount !== template.price) {
      await supabase.from("orders").update({ status: "FAILED" }).eq("orderCode", orderCode);
      return NextResponse.json({ error: "Thông tin đơn thanh toán không khớp." }, { status: 502 });
    }

    return NextResponse.json({
      orderCode: payment.orderCode,
      amount: payment.amount,
      checkoutUrl: payment.checkoutUrl,
      qrCode: payment.qrCode,
      accessToken,
    });
  } catch {
    await supabase.from("orders").update({ status: "FAILED" }).eq("orderCode", orderCode);
    return NextResponse.json(
      { error: "Không thể tạo liên kết thanh toán. Vui lòng thử lại." },
      { status: 502 },
    );
  }
}