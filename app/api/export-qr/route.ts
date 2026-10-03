import { createHash, timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { GlobalFonts, createCanvas, loadImage, type SKRSContext2D } from "@napi-rs/canvas";
import { generateVietQR } from "@viet-qr/core";
import QRCode from "qrcode";
import { NextRequest, NextResponse } from "next/server";
import { BANKS } from "@/constants/banks";
import { getTemplateById } from "@/constants/templates";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 15;

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;
const EXPORT_TIMEOUT_MS = 12000;

const templatePalettes: Record<string, [string, string, string]> = {
  "fortune-free": ["#c23a37", "#e05b3f", "#f29b48"],
  "minimal-free": ["#2f6d59", "#438b73", "#b0c9a4"],
  "lucky-cat": ["#f5a34b", "#e87863", "#b74d73"],
  "cafe-story": ["#715244", "#b47b59", "#e4bd91"],
  "spring-luxe": ["#a32139", "#da4e46", "#efbd68"],
  "fortune-gold": ["#74511d", "#c59338", "#f2d083"],
  "aesthetic-bloom": ["#8a688f", "#cb8b9c", "#edc0a3"],
  "royal-red": ["#561d43", "#a33153", "#e68c5d"],
  "night-market": ["#27215e", "#564a9c", "#e56f88"],
  "minimal-gold": ["#263f4a", "#4c6b66", "#b08b62"],
};

type ExportBody = {
  orderCode?: unknown;
  token?: unknown;
  simulation?: unknown;
  formData?: unknown;
};

type ExportFormData = {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  templateId: string;
};

function isExportFormData(value: unknown): value is ExportFormData {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return typeof data.bankCode === "string" &&
    typeof data.accountNumber === "string" &&
    typeof data.accountName === "string" &&
    typeof data.templateId === "string";
}

function roundedRect(ctx: SKRSContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function drawText(ctx: SKRSContext2D, text: string, x: number, y: number, maxWidth: number, fontSize: number, weight = 600) {
  ctx.font = `${weight} ${fontSize}px Geist, Arial, sans-serif`;
  ctx.fillText(text, x, y, maxWidth);
}

function drawPoster(
  qrImage: Awaited<ReturnType<typeof loadImage>>,
  templateName: string,
  accountName: string,
  accountNumber: string,
  bankName: string,
  palette: [string, string, string],
) {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d");
  const background = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  background.addColorStop(0, palette[0]);
  background.addColorStop(0.55, palette[1]);
  background.addColorStop(1, palette[2]);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-100, 380);
  ctx.lineTo(1180, -120);
  ctx.moveTo(-120, 560);
  ctx.lineTo(1180, 60);
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  drawText(ctx, "QRDEP  ·  STANDEE VIETQR", 540, 145, 900, 28, 700);
  ctx.fillStyle = "#ffffff";
  drawText(ctx, templateName.toLocaleUpperCase("vi-VN"), 540, 230, 900, 52, 800);
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  drawText(ctx, "QUÉT MÃ · CHUYỂN TIỀN", 540, 300, 900, 28, 600);

  ctx.shadowColor = "rgba(15,23,42,0.3)";
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 16;
  roundedRect(ctx, 170, 390, 740, 740, 42);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.drawImage(qrImage, 230, 450, 620, 620);

  roundedRect(ctx, 105, 1195, 870, 440, 32);
  ctx.fillStyle = "rgba(15,23,42,0.18)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  drawText(ctx, "TÊN CHỦ TÀI KHOẢN", 155, 1275, 770, 22, 700);
  ctx.fillStyle = "#ffffff";
  drawText(ctx, accountName, 155, 1340, 770, 42, 800);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  drawText(ctx, "NGÂN HÀNG", 155, 1430, 280, 22, 700);
  ctx.fillStyle = "#ffffff";
  drawText(ctx, bankName, 155, 1485, 280, 34, 700);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  drawText(ctx, "SỐ TÀI KHOẢN", 500, 1430, 430, 22, 700);
  ctx.fillStyle = "#ffffff";
  drawText(ctx, accountNumber, 500, 1485, 430, 34, 700);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  drawText(ctx, "CẢM ƠN BẠN · QRDEP", 540, 1745, 900, 28, 700);

  return canvas;
}

function fail(status: number, message: string) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

async function readLimitedJson(request: NextRequest): Promise<
  { ok: true; value: unknown } | { ok: false; status: number; message: string }
> {
  if (!request.body) return { ok: false, status: 400, message: "Thiếu dữ liệu yêu cầu." };
  const reader = request.body.getReader();
  const chunks: Buffer[] = [];
  let byteLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > 12_000) {
        await reader.cancel();
        return { ok: false, status: 413, message: "Dữ liệu ảnh vượt quá giới hạn." };
      }
      chunks.push(Buffer.from(value));
    }
    return { ok: true, value: JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown };
  } catch {
    return { ok: false, status: 400, message: "Dữ liệu yêu cầu không hợp lệ." };
  }
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 12_000) return fail(413, "Dữ liệu ảnh vượt quá giới hạn.");
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return fail(415, "Yêu cầu phải gửi dữ liệu JSON.");
  }

  const parsedBody = await readLimitedJson(request);
  if (!parsedBody.ok) return fail(parsedBody.status, parsedBody.message);
  const body = parsedBody.value as ExportBody;
  if (!isExportFormData(body.formData)) return fail(400, "Thiếu thông tin tài khoản.");

  const formData = body.formData;
  const template = getTemplateById(formData.templateId);
  if (template.id !== formData.templateId) return fail(400, "Mẫu Standee không hợp lệ.");
  const bank = BANKS.find((item) => item.code === formData.bankCode);
  if (!bank) return fail(400, "Ngân hàng không hợp lệ.");

  const accountNumber = formData.accountNumber.trim();
  const accountName = formData.accountName.trim().toLocaleUpperCase("vi-VN");
  if (!accountNumber || accountNumber.length > 19 || /[\u0000-\u001f]/.test(accountNumber)) {
    return fail(400, "Số tài khoản không hợp lệ.");
  }
  if (!accountName || accountName.length > 50 || /[\u0000-\u001f]/.test(accountName)) {
    return fail(400, "Tên chủ tài khoản không hợp lệ.");
  }

  const simulation = process.env.NODE_ENV !== "production" && body.simulation === true;
  if (template.price > 0 && !simulation) {
    if (typeof body.orderCode !== "string" || !/^\d{10,16}$/.test(body.orderCode)) {
      return fail(403, "Cần đơn hàng đã thanh toán để tải mẫu này.");
    }
    if (typeof body.token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(body.token)) {
      return fail(403, "Mã xác thực đơn hàng không hợp lệ.");
    }

    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch {
      return fail(503, "Dịch vụ xác thực đơn hàng chưa sẵn sàng.");
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select('"templateId", amount, status, access_token_hash')
      .eq("orderCode", Number(body.orderCode))
      .maybeSingle();

    if (error) {
      console.error("Could not authorize QR export:", error.code);
      return fail(503, "Không thể xác thực đơn hàng lúc này.");
    }
    if (!order || !order.access_token_hash || order.status !== "PAID" || order.templateId !== template.id || order.amount !== template.price) {
      return fail(403, "Đơn hàng chưa thanh toán hoặc không có quyền tải mẫu này.");
    }

    const providedHash = createHash("sha256").update(body.token).digest();
    const storedHash = Buffer.from(order.access_token_hash, "hex");
    if (storedHash.length !== providedHash.length || !timingSafeEqual(storedHash, providedHash)) {
      return fail(403, "Đơn hàng chưa thanh toán hoặc không có quyền tải mẫu này.");
    }
  }

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error("QR_EXPORT_TIMEOUT")), EXPORT_TIMEOUT_MS);
    timeoutHandle.unref();
  });
  try {
    const renderPromise = (async () => {
      const fontPath = path.join(process.cwd(), "app", "fonts", "GeistVF.woff");
      try {
        if (existsSync(fontPath) && !GlobalFonts.has("Geist")) {
          GlobalFonts.registerFromPath(fontPath, "Geist");
        }
      } catch {}
      const qrPayload = generateVietQR({
        bankId: bank.bin,
        accountNo: accountNumber,
        accountName,
      });
      const qrBuffer = await QRCode.toBuffer(qrPayload, {
        width: 620,
        margin: 1,
        errorCorrectionLevel: "H",
        color: { dark: "#111827FF", light: "#FFFFFFFF" },
      });
      const qrImage = await loadImage(qrBuffer);
      const palette = templatePalettes[template.id];
      if (!palette) throw new Error("QR_EXPORT_TEMPLATE_PALETTE_MISSING");
      const canvas = drawPoster(qrImage, template.name, accountName, accountNumber, bank.name, palette);
      return canvas.encode("png");
    })();

    const png = await Promise.race([renderPromise, timeout]);
    const pngArrayBuffer = new ArrayBuffer(png.byteLength);
    new Uint8Array(pngArrayBuffer).set(png);
    const pngBlob = new Blob([pngArrayBuffer], { type: "image/png" });

    return new Response(pngBlob, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="qrdep-thanh-toan.png"',
        "Content-Length": String(pngBlob.size),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.message === "QR_EXPORT_TIMEOUT";
    if (timedOut) return fail(504, "Tạo ảnh mất quá nhiều thời gian. Vui lòng thử lại.");
    console.error("Server-side QR export failed:", error instanceof Error ? error.message : "unknown");
    return fail(500, "Không thể tạo ảnh Standee. Vui lòng thử lại.");
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}