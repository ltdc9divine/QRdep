"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { toPng } from "html-to-image";
import { ArrowDownToLine, Check, CircleCheck, LockKeyhole, Sparkles } from "lucide-react";
import { CanvasPreview } from "@/components/CanvasPreview";
import { Header } from "@/components/Header";
import { PaymentModal } from "@/components/PaymentModal";
import { QRForm } from "@/components/QRForm";
import { BANKS } from "@/constants/banks";
import { getTemplateById } from "@/constants/templates";
import type { QRFormData } from "@/types";

const initialFormData: QRFormData = {
  bankCode: "",
  accountNumber: "",
  accountName: "",
  templateId: "fortune-free",
};

const pendingPaymentKey = "qrdep:pending-payos-payment";

type PendingPayment = {
  orderCode: string;
  formData: QRFormData;
};

function isQRFormData(value: unknown): value is QRFormData {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return typeof data.bankCode === "string" &&
    typeof data.accountNumber === "string" &&
    typeof data.accountName === "string" &&
    typeof data.templateId === "string";
}

export default function Home() {
  const posterRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<QRFormData>(initialFormData);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingPayOSPayment, setIsCreatingPayOSPayment] = useState(false);
  const [isPayOSEnabled, setIsPayOSEnabled] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const toastTimeoutRef = useRef<number | null>(null);
  const selectedBank = BANKS.find((bank) => bank.code === formData.bankCode);
  const selectedTemplate = getTemplateById(formData.templateId);
  const canCreateQr = Boolean(
    selectedBank && formData.accountNumber.trim() && formData.accountName.trim(),
  );

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(""), 3200);
  }, []);

  useEffect(() => {
    let active = true;
    void fetch("/api/payos/create-payment", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { enabled?: boolean }) => {
        if (active) setIsPayOSEnabled(data.enabled === true);
      })
      .catch(() => {
        if (active) setIsPayOSEnabled(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentResult = params.get("payos");
    if (!paymentResult) return;

    let pendingPayment: PendingPayment | null = null;
    try {
      const rawPendingPayment = sessionStorage.getItem(pendingPaymentKey);
      if (rawPendingPayment) {
        const parsed = JSON.parse(rawPendingPayment) as Partial<PendingPayment>;
        if (typeof parsed.orderCode === "string" && isQRFormData(parsed.formData)) {
          pendingPayment = { orderCode: parsed.orderCode, formData: parsed.formData };
          setFormData(parsed.formData);
        }
      }
    } catch {
      sessionStorage.removeItem(pendingPaymentKey);
    }

    const orderCode = params.get("orderCode");
    window.history.replaceState({}, document.title, window.location.pathname);

    if (paymentResult === "cancel") {
      sessionStorage.removeItem(pendingPaymentKey);
      showToast("Bạn đã hủy thanh toán. Mẫu thiết kế vẫn được giữ lại.");
      return;
    }

    if (paymentResult !== "return" || !orderCode || pendingPayment?.orderCode !== orderCode) {
      sessionStorage.removeItem(pendingPaymentKey);
      showToast("Không tìm thấy đơn thanh toán cần xác minh.");
      return;
    }

    let active = true;
    setIsProcessing(true);
    const templateId = pendingPayment.formData.templateId;
    void fetch(`/api/payos/verify-payment?orderCode=${encodeURIComponent(orderCode)}&templateId=${encodeURIComponent(templateId)}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { paid?: boolean };
        if (!response.ok) throw new Error("Không thể xác minh thanh toán.");
        if (!active) return;
        if (result.paid) {
          setIsUnlocked(true);
          showToast("Thanh toán thành công. Standee HD đã được mở khóa.");
        } else {
          showToast("Thanh toán chưa hoàn tất. Bạn có thể thử lại.");
        }
      })
      .catch(() => {
        if (active) showToast("Chưa xác minh được thanh toán. Vui lòng tải lại trang để thử lại.");
      })
      .finally(() => {
        sessionStorage.removeItem(pendingPaymentKey);
        if (active) setIsProcessing(false);
      });

    return () => {
      active = false;
    };
  }, [showToast]);

  useEffect(() => () => {
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
  }, []);

  const updateFormData = (nextData: QRFormData) => {
    const wasReady = Boolean(selectedBank && formData.accountNumber.trim() && formData.accountName.trim());
    const willBeReady = Boolean(
      BANKS.find((bank) => bank.code === nextData.bankCode) &&
      nextData.accountNumber.trim() &&
      nextData.accountName.trim(),
    );
    setFormData(nextData);
    setIsUnlocked(false);
    if (nextData.templateId !== formData.templateId) {
      showToast("Đã đổi phong cách Standee.");
    } else if (!wasReady && willBeReady) {
      showToast("Mã VietQR đã sẵn sàng để xem trước.");
    }
  };

  const copyInfo = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast(`${label} đã được sao chép.`);
    } catch {
      showToast("Không thể sao chép. Vui lòng thử lại.");
    }
  };

  const downloadPoster = async () => {
    const poster = posterRef.current;
    if (!poster || !canCreateQr) return false;

    setIsDownloading(true);
    setDownloadError("");
    try {
      await document.fonts.ready;
      await Promise.all(Array.from(poster.querySelectorAll("img"), (image) => image.decode()));
      const width = poster.getBoundingClientRect().width;
      const height = width * (16 / 9);
      const scale = 1080 / width;
      const imageUrl = await toPng(poster, {
        cacheBust: true,
        width: 1080,
        height: 1920,
        canvasWidth: 1080,
        canvasHeight: 1920,
        pixelRatio: 1,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: "none",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        },
      });
      const pngImage = new Image();
      pngImage.src = imageUrl;
      await pngImage.decode();
      if (pngImage.naturalWidth !== 1080 || pngImage.naturalHeight !== 1920) {
        throw new Error("Kích thước ảnh chưa chính xác.");
      }
      const imageBlob = await (await fetch(imageUrl)).blob();
      const imageObjectUrl = URL.createObjectURL(imageBlob);
      const downloadLink = document.createElement("a");
      downloadLink.download = "standee-qrdep-hd-1080x1920.png";
      downloadLink.href = imageObjectUrl;
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(imageObjectUrl), 1000);
      showToast("Đang tải Standee PNG HD về thiết bị.");
      return true;
    } catch (error) {
      console.error("Không thể xuất ảnh Standee:", error);
      setDownloadError("Chưa thể tạo ảnh. Vui lòng thử lại sau ít giây.");
      return false;
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrimaryAction = () => {
    if (selectedTemplate.price === 0) {
      void downloadPoster();
    } else if (isUnlocked) {
      void downloadPoster();
    } else if (canCreateQr) {
      setDownloadError("");
      setIsModalOpen(true);
    }
  };

  const handleSimulatedPayment = async () => {
    setIsProcessing(true);
    setDownloadError("");
    flushSync(() => setIsUnlocked(true));
    const downloaded = await downloadPoster();
    if (downloaded) {
      setIsModalOpen(false);
    } else {
      flushSync(() => setIsUnlocked(false));
    }
    setIsProcessing(false);
  };

  const handlePayOSPayment = async () => {
    setIsCreatingPayOSPayment(true);
    setDownloadError("");
    try {
      const response = await fetch("/api/payos/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplate.id }),
      });
      const result = await response.json() as {
        orderCode?: number;
        checkoutUrl?: string;
        error?: string;
      };
      if (!response.ok || !result.orderCode || !result.checkoutUrl) {
        throw new Error(result.error || "Không thể tạo liên kết PayOS.");
      }
      const pendingPayment: PendingPayment = {
        orderCode: String(result.orderCode),
        formData,
      };
      sessionStorage.setItem(pendingPaymentKey, JSON.stringify(pendingPayment));
      showToast("Đang chuyển tới trang thanh toán PayOS.");
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Không thể kết nối PayOS.");
      setIsCreatingPayOSPayment(false);
    }
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[920px] overflow-hidden" aria-hidden="true">
        <div className="absolute -left-48 -top-40 size-[560px] rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute -right-40 top-24 size-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] opacity-40 [background-size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/35 to-slate-950" />
      </div>
      <div className="relative z-20"><Header /></div>
      <div className="relative z-10 mx-auto max-w-[1280px] px-4 pb-10 pt-8 sm:px-7 sm:pt-12 lg:px-10 lg:pt-16">
        <section className="mb-9 flex flex-col justify-between gap-6 sm:mb-12 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex animate-pulse items-center gap-2 rounded-full border border-emerald-500/30 bg-slate-900/80 px-3.5 py-2 text-[10px] font-extrabold tracking-[0.14em] text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-md sm:text-[11px]">
              <Sparkles size={14} className="text-emerald-300" />
              XƯỞNG THIẾT KẾ MÃ QR · TOP 1 STANDEE 9:16
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.08] sm:text-5xl lg:text-[62px]">
              <span className="block bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">Mã QR của bạn.</span>
              <span className="block bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">Ấn tượng hơn mỗi lần nhận tiền.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
              Tạo Standee chuyển khoản mang dấu ấn riêng. Chọn phong cách, xem trước tức thì và tải ảnh sắc nét chỉ trong vài giây.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5 text-[11px] font-semibold text-slate-300 sm:text-xs">
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Mã tạo ngay trên thiết bị</span>
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Chuẩn ảnh dọc 9:16</span>
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Tải ảnh HD 1080 × 1920</span>
            </div>
          </div>
          <div className="flex w-fit shrink-0 items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/70 px-4 py-3 shadow-xl shadow-black/20 backdrop-blur-xl">
            <span className="grid size-10 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <ArrowDownToLine size={19} />
            </span>
            <span>
              <span className="block text-sm font-extrabold text-white">Ảnh siêu nét</span>
              <span className="mt-0.5 block text-xs font-medium text-slate-400">1080 × 1920 điểm ảnh</span>
            </span>
          </div>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
          <section className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl transition-all hover:border-slate-700/80 sm:p-7">
            <div className="mb-7 flex items-center gap-3.5">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/20 to-teal-500/5 text-base font-black text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.12)]">01</span>
              <span>
                <span className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-emerald-400">BƯỚC 1</span>
                <h2 className="mt-1 text-lg font-extrabold text-white">Thông tin thanh toán</h2>
              </span>
            </div>
            <QRForm value={formData} onChange={updateFormData} />
            <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.07] px-3.5 py-3 text-xs leading-5 text-emerald-100/90">
              <LockKeyhole className="mt-0.5 shrink-0 text-emerald-400" size={15} />
              <p>🔒 Thông tin tài khoản của bạn được xử lý an toàn trực tiếp trên trình duyệt.</p>
            </div>
          </section>

          <CanvasPreview
            ref={posterRef}
            value={formData}
            bank={selectedBank}
            template={selectedTemplate}
            isUnlocked={isUnlocked || selectedTemplate.price === 0}
            isReady={canCreateQr}
            isDownloading={isDownloading}
            error={downloadError}
            onPrimaryAction={handlePrimaryAction}
            onCopy={copyInfo}
          />
        </div>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-5 text-[10px] font-semibold tracking-wide text-slate-500">
          <span>QRDep · THIẾT KẾ TẠI VIỆT NAM</span>
          <span>MÃ VIETQR TẠO TRỰC TIẾP TRÊN THIẾT BỊ</span>
        </footer>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        isProcessing={isProcessing}
        isCreatingPayment={isCreatingPayOSPayment}
        payosEnabled={isPayOSEnabled}
        price={selectedTemplate.price}
        error={downloadError}
        onClose={() => setIsModalOpen(false)}
        onPayOSPayment={handlePayOSPayment}
        onSimulatePayment={handleSimulatedPayment}
      />
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2.5 rounded-2xl border border-emerald-400/25 bg-slate-900/95 px-4 py-3 text-sm font-semibold text-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_24px_rgba(16,185,129,0.12)] backdrop-blur-xl" role="status" aria-live="polite">
          <CircleCheck className="shrink-0 text-emerald-400" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}