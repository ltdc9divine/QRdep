import Link from "next/link";
import { QrCode, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 sm:px-8 sm:py-4">
      <Link className="flex items-center gap-2.5 text-xl font-black tracking-tight text-white" href="/" aria-label="Trang chủ QRDep">
        <span className="grid size-10 place-items-center rounded-xl border border-emerald-300/20 bg-gradient-to-br from-emerald-400 to-teal-700 text-white shadow-[0_0_24px_rgba(16,185,129,0.22)]">
          <QrCode size={22} strokeWidth={2.1} />
        </span>
        <span>QRDep<span className="text-emerald-400">.</span></span>
      </Link>
      <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-slate-900/80 px-3.5 py-2 text-[10px] font-black tracking-[0.08em] text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-md sm:text-xs">
        <Sparkles size={14} />
        TOP #1 TẠO STANDEE QR 9:16
      </div>
      <p className="order-3 w-full text-center text-xs font-medium leading-relaxed text-slate-300 sm:order-none sm:w-auto sm:text-right sm:text-sm">
        Tạo Mã QR Ngân Hàng Đẹp, Hút Lộc &amp; Chuyên Nghiệp Trong 3 Giây
      </p>
      </div>
    </header>
  );
}