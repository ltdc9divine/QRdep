"use client";

import { ChevronDown, CreditCard, Landmark, UserRound } from "lucide-react";
import { BANKS } from "@/constants/banks";
import { TemplateSelector } from "@/components/TemplateSelector";
import type { QRFormData } from "@/types";

type QRFormProps = {
  value: QRFormData;
  onChange: (value: QRFormData) => void;
};

export function QRForm({ value, onChange }: QRFormProps) {
  const updateField = <Key extends keyof QRFormData>(key: Key, nextValue: QRFormData[Key]) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <div className="space-y-5">
      <div>
      <label className="mb-2 block text-sm font-semibold text-slate-200" htmlFor="bankCode">Ngân hàng nhận tiền</label>
      <div className="relative">
        <Landmark className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} strokeWidth={1.8} aria-hidden="true" />
        <select
          id="bankCode"
          className="h-12 w-full appearance-none rounded-xl border border-slate-800 bg-slate-950/80 pl-11 pr-11 text-sm font-medium text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          value={value.bankCode}
          onChange={(event) => updateField("bankCode", event.target.value)}
        >
          <option value="" disabled>Chọn ngân hàng...</option>
          {BANKS.map((bank) => (
            <option key={bank.code} value={bank.code}>{bank.name} · {bank.shortName}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} aria-hidden="true" />
      </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-200" htmlFor="accountNumber">Số tài khoản</label>
        <div className="relative">
        <CreditCard className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} aria-hidden="true" />
        <input
          id="accountNumber"
          className="h-12 w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-11 pr-4 text-sm font-medium text-slate-100 outline-none transition placeholder:font-normal placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          type="text"
          inputMode="text"
          autoComplete="off"
          maxLength={19}
          placeholder="Nhập số tài khoản ngân hàng..."
          value={value.accountNumber}
          onChange={(event) => updateField("accountNumber", event.target.value.trimStart())}
        />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <label className="block text-sm font-semibold text-slate-200" htmlFor="accountName">Tên chủ tài khoản</label>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300">Tự viết hoa</span>
        </div>
        <div className="relative">
        <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} aria-hidden="true" />
        <input
          id="accountName"
          className="h-12 w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-11 pr-4 text-sm font-semibold uppercase tracking-wide text-slate-100 outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          type="text"
          autoComplete="name"
          maxLength={50}
          placeholder="VD: NGUYEN VAN A"
          value={value.accountName}
          onChange={(event) => updateField("accountName", event.target.value.toLocaleUpperCase("vi-VN"))}
        />
        </div>
      </div>

      <TemplateSelector
        value={value.templateId}
        onChange={(templateId) => updateField("templateId", templateId)}
      />
    </div>
  );
}