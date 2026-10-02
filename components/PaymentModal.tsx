"use client";

import { useEffect } from "react";
import { Check, CreditCard, ExternalLink, LoaderCircle, ShieldCheck, X } from "lucide-react";

type PaymentModalProps = {
  isOpen: boolean;
  isProcessing: boolean;
  isCreatingPayment: boolean;
  payosEnabled: boolean;
  price: number;
  error: string;
  onClose: () => void;
  onPayOSPayment: () => void;
  onSimulatePayment: () => void;
};

export function PaymentModal({ isOpen, isProcessing, isCreatingPayment, payosEnabled, price, error, onClose, onPayOSPayment, onSimulatePayment }: PaymentModalProps) {
  const isBusy = isProcessing || isCreatingPayment;
  const priceLabel = new Intl.NumberFormat("vi-VN").format(price);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, isBusy, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isBusy) onClose();
      }}
    >
      <section
        aria-labelledby="payment-title"
        aria-modal="true"
        className="relative w-full max-w-[460px] animate-[modal-in_220ms_ease-out] rounded-t-[28px] border border-slate-700/80 bg-slate-900/95 p-6 text-slate-100 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:rounded-[28px] sm:p-8"
        role="dialog"
      >
        <button
          type="button"
          className="absolute right-5 top-5 grid size-9 place-items-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-white disabled:opacity-40"
          aria-label="Đóng cửa sổ"
          disabled={isBusy}
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <div className="mb-5 grid size-14 place-items-center rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.15)]">
          <CreditCard size={24} />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
          <ShieldCheck size={13} /> BẢN HD KHÔNG LOGO
        </span>
        <h2 id="payment-title" className="mt-3 max-w-sm text-2xl font-black leading-tight text-white">
          Mở khóa Standee QR HD không logo
        </h2>

        <div className="mt-6 flex items-end justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/[0.04] p-4">
          <span className="text-sm font-semibold text-slate-300">Số tiền</span>
          <span className="text-2xl font-black text-emerald-300">{priceLabel} <span className="text-sm font-extrabold">VNĐ</span></span>
        </div>

        <ul className="mt-5 space-y-3 text-sm font-medium text-slate-200">
          <li className="flex items-center gap-2.5"><Check className="text-emerald-400" size={17} /> Tải ảnh PNG sắc nét 1080 × 1920 px</li>
          <li className="flex items-center gap-2.5"><Check className="text-emerald-400" size={17} /> Không dấu nhận diện trên Standee</li>
          <li className="flex items-center gap-2.5"><Check className="text-emerald-400" size={17} /> Mã VietQR tạo trực tiếp trên thiết bị</li>
        </ul>

        {error && <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 px-3.5 py-3 text-xs font-semibold leading-relaxed text-rose-200" role="alert">{error}</p>}

        <button
          type="button"
          className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 px-4 py-3 text-sm font-extrabold text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(16,185,129,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-wait disabled:opacity-75"
          disabled={isBusy}
          onClick={onSimulatePayment}
        >
          {isProcessing ? <LoaderCircle className="animate-spin" size={19} /> : <CreditCard size={18} />}
          {isProcessing ? "Đang mở khóa và tạo ảnh…" : "Mô phỏng thanh toán & tải ảnh"}
        </button>

        {payosEnabled && (
          <button
            type="button"
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm font-bold text-slate-100 transition hover:border-emerald-500/50 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 disabled:cursor-wait disabled:opacity-60"
            disabled={isBusy}
            onClick={onPayOSPayment}
          >
            {isCreatingPayment ? <LoaderCircle className="animate-spin" size={18} /> : <ExternalLink size={17} />}
            {isCreatingPayment ? "Đang kết nối PayOS…" : "Thanh toán an toàn qua PayOS"}
          </button>
        )}

        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-3 text-center text-[11px] leading-relaxed text-slate-400">
          <p className="font-bold text-slate-200">Chế độ thử nghiệm · không trừ tiền thật</p>
          <p className="mt-1">{payosEnabled ? "Bạn cũng có thể thanh toán thật qua PayOS." : "PayOS chưa cấu hình khóa API; bạn vẫn có thể thử luồng mở khóa."}</p>
        </div>
      </section>
    </div>
  );
}