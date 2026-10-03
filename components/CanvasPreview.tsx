"use client";

import { forwardRef } from "react";
import { VietQR } from "@viet-qr/react";
import { ArrowDownToLine, Check, Copy, QrCode, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PosterTemplate } from "@/constants/templates";
import type { Bank, QRFormData } from "@/types";

type CanvasPreviewProps = {
  value: QRFormData;
  bank?: Bank;
  template: PosterTemplate;
  isUnlocked: boolean;
  isReady: boolean;
  isProcessing: boolean;
  paymentAvailable: boolean;
  isDownloading: boolean;
  error: string;
  onPrimaryAction: () => void;
  onCopy: (value: string, label: string) => void;
};

const CanvasPreview = forwardRef<HTMLDivElement, CanvasPreviewProps>(function CanvasPreview(
  { value, bank, template, isUnlocked, isReady, isProcessing, paymentAvailable, isDownloading, error, onPrimaryAction, onCopy },
  ref,
) {
  const qrIsReady = Boolean(isReady && bank);
  const isFreeTemplate = template.price === 0;
  const priceLabel = new Intl.NumberFormat("vi-VN").format(template.price);

  return (
    <section className="min-w-0 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-4 shadow-[0_24px_80px_-38px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/20 to-teal-500/5 text-sm font-black text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.12)]">02</span>
          <span>
            <span className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-emerald-400">BƯỚC 2</span>
            <h2 className="mt-1 text-base font-extrabold text-white sm:text-lg">Xem trước Standee 9:16</h2>
          </span>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-1.5 text-[10px] font-bold text-emerald-300 sm:flex">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" /> TRỰC TIẾP · XEM TRƯỚC 9:16
        </span>
      </div>

      <div className="relative mx-auto w-full max-w-[390px] rounded-[2.5rem] border border-slate-700/60 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(16,185,129,0.15)]">
        <div className="pointer-events-none absolute inset-0 z-20 rounded-[2.5rem] bg-gradient-to-br from-white/[0.1] via-transparent to-white/[0.02]" aria-hidden="true" />
        <div className="mx-auto mb-2 flex h-3 items-center justify-center gap-1.5" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-slate-700/80" />
          <span className="size-1 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
        </div>
        <div
          ref={ref}
          className={cn("relative isolate mx-auto flex aspect-[9/16] w-full max-w-[340px] flex-col overflow-hidden rounded-[22px] px-5 pb-5 pt-5 text-white shadow-[0_24px_50px_-18px_rgba(15,23,42,0.4)] sm:px-6 sm:pb-6 sm:pt-6", `bg-gradient-to-br ${template.canvasClass}`)}
        >
          <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.45)_48%,transparent_49%,transparent_51%,rgba(255,255,255,0.24)_52%,transparent_100%)]" />
          <div className="absolute -right-9 top-[22%] -z-10 h-px w-[125%] rotate-[-28deg] bg-white/30" />
          <div className="absolute -left-10 top-[27%] -z-10 h-px w-[130%] rotate-[-28deg] bg-white/20" />

          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[8px] font-extrabold tracking-[0.13em] text-white/90 backdrop-blur-sm">
              <Sparkles size={11} /> QRDEP · MÃ QR CÁ NHÂN
            </span>
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/35 bg-white/10">
              <Check size={13} />
            </span>
          </div>

          <div className="mb-3 mt-5 text-center sm:mb-4 sm:mt-6">
            <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/75">CHUYỂN KHOẢN CỰC XINH</p>
            <h3 className="mt-2 text-[clamp(17px,3vw,23px)] font-black leading-tight tracking-tight text-white">
              Mỗi lần chuyển khoản<br />thêm một chút <span className="font-serif font-medium italic text-amber-100">niềm vui.</span>
            </h3>
          </div>

          <div className="mx-auto grid aspect-square w-[min(74%,230px)] shrink-0 place-items-center rounded-[20px] border border-white/60 bg-white p-2.5 shadow-[0_12px_28px_rgba(27,35,28,0.22)] sm:p-3">
            {qrIsReady && bank ? (
              <VietQR
                bankId={bank.bin}
                accountNo={value.accountNumber.trim()}
                accountName={value.accountName.trim()}
                renderAs="svg"
                size={200}
                level="H"
                includeMargin
                className="max-h-full max-w-full"
              />
            ) : (
              <div className="flex flex-col items-center text-center text-slate-400">
                <span className="mb-2 grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <QrCode size={29} strokeWidth={1.6} />
                </span>
                <span className="text-[9px] font-bold leading-relaxed">Mã QR sẽ hiện tại đây<br />sau khi điền đủ thông tin</span>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2.5 rounded-2xl border border-white/20 bg-black/10 px-4 py-3 backdrop-blur-sm sm:mt-5 sm:px-4 sm:py-3.5">
            <div>
              <p className="text-[7px] font-bold uppercase tracking-[0.17em] text-white/65">TÊN CHỦ TÀI KHOẢN</p>
              <p className="mt-0.5 truncate text-[11px] font-extrabold uppercase tracking-wide text-white sm:text-xs">{value.accountName || "TÊN CỦA BẠN"}</p>
            </div>
            <div className="grid grid-cols-[1fr_1.4fr] gap-3 border-t border-white/20 pt-2.5">
              <div className="min-w-0">
                <p className="text-[7px] font-bold uppercase tracking-[0.17em] text-white/65">NGÂN HÀNG</p>
                <p className="mt-0.5 truncate text-[10px] font-bold text-white">{bank?.name || "Chưa chọn"}</p>
              </div>
              <div className="min-w-0 text-right">
                <p className="text-[7px] font-bold uppercase tracking-[0.17em] text-white/65">SỐ TÀI KHOẢN</p>
                <p className="mt-0.5 truncate text-[10px] font-bold tracking-wide text-white">{value.accountNumber || "•••• •••• ••••"}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-white/30 pt-3 text-[8px] font-extrabold tracking-[0.15em] text-white/85">
            <span>QUÉT MÃ · CHUYỂN TIỀN</span>
            <span className="font-serif text-sm italic tracking-normal">QRDep</span>
          </div>

          {!isUnlocked && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden" aria-hidden="true">
              <span className="w-[150%] -rotate-[19deg] border-y border-white/60 bg-white/35 py-2.5 text-center text-[10px] font-black tracking-[0.18em] text-slate-900/65 shadow-sm backdrop-blur-[1px]">
                QRDEP · MẪU XEM TRƯỚC · QRDEP · MẪU XEM TRƯỚC
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] font-bold text-slate-400">
        <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-500" /> MẪU 9:16 · DẠNG ĐỨNG</span>
        <span>{isUnlocked ? "ĐÃ MỞ KHÓA" : "MẪU CÓ DẤU NHẬN DIỆN"}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/50 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!value.accountNumber}
          onClick={() => onCopy(value.accountNumber, "Số tài khoản")}
        >
          <Copy size={14} /> Sao chép số tài khoản
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/50 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!bank}
          onClick={() => bank && onCopy(`${bank.name} · ${bank.bin}`, "Thông tin ngân hàng")}
        >
          <Copy size={14} /> Sao chép ngân hàng
        </button>
      </div>
      {error && <p className="mt-3 rounded-xl border border-rose-400/20 bg-rose-500/10 px-3.5 py-2.5 text-xs font-semibold text-rose-200" role="alert">{error}</p>}
      {!isReady && <p className="mt-2 px-1 text-xs text-slate-400">Điền đủ ngân hàng, số tài khoản và tên chủ tài khoản để tạo mã QR.</p>}
      <button
        type="button"
        className="group relative isolate mt-4 flex min-h-14 w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 px-4 py-4 text-center text-sm font-bold text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_45px_rgba(16,185,129,0.5)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:scale-100 disabled:cursor-not-allowed disabled:from-slate-700 disabled:via-slate-800 disabled:to-slate-700 disabled:text-slate-500 disabled:shadow-none sm:text-base"
        disabled={!isReady || !paymentAvailable || isDownloading || isProcessing}
        onClick={onPrimaryAction}
      >
        <span className="pointer-events-none absolute inset-y-0 -left-1/2 z-0 w-1/3 skew-x-[-20deg] bg-white/35 opacity-0 blur-md transition-all duration-700 group-hover:left-full group-hover:opacity-100" aria-hidden="true" />
        <span className="relative z-10 flex items-center justify-center gap-2.5">
          {isDownloading || isProcessing ? <ArrowDownToLine className="animate-bounce" size={19} /> : isUnlocked ? <ArrowDownToLine size={19} /> : <Zap size={19} fill="currentColor" />}
          {isProcessing
            ? "Đang xác minh thanh toán…"
            : isDownloading
            ? "Đang tạo ảnh HD…"
            : isFreeTemplate
              ? "Tải Ảnh HD Ngay - Miễn Phí"
              : isUnlocked
                ? "Tải ảnh PNG HD ngay"
              : !paymentAvailable
                ? "Thanh toán chưa khả dụng"
                : `Mở Khóa Standee HD - ${priceLabel}đ`}
        </span>
      </button>
        {!isUnlocked && !isFreeTemplate && <p className="mt-2 text-center text-[11px] font-medium text-slate-400">Thanh toán một lần · tải ảnh 1080 × 1920 px</p>}
    </section>
  );
});

export { CanvasPreview };