"use client";

import { useMemo, useState } from "react";
import { Check, type LucideIcon } from "lucide-react";
import { TEMPLATE_CATEGORIES, TEMPLATES, type PosterTemplate, type TemplateCategory } from "@/constants/templates";
import { cn } from "@/lib/utils";

type TemplateSelectorProps = {
  value: string;
  onChange: (templateId: string) => void;
};

function formatPrice(price: number) {
  return price === 0 ? "MIỄN PHÍ" : `${Math.round(price / 1000)}K`;
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | TemplateCategory>("all");
  const filteredTemplates = useMemo(
    () => activeCategory === "all"
      ? TEMPLATES
      : TEMPLATES.filter((template) => template.categories.includes(activeCategory)),
    [activeCategory],
  );

  return (
    <section aria-label="Chọn mẫu Standee" className="space-y-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-200">Mẫu thiết kế</span>
        <span className="text-[11px] font-semibold text-slate-500">{filteredTemplates.length} mẫu</span>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Lọc mẫu theo danh mục">
        {TEMPLATE_CATEGORIES.map((category) => {
          const selected = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40",
                selected
                  ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.12)]"
                  : "border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700 hover:text-slate-200",
              )}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2.5" role="tabpanel">
        {filteredTemplates.map((template) => {
          const selected = value === template.id;
          const Icon: LucideIcon = template.icon;
          return (
            <TemplateCard
              key={template.id}
              template={template}
              selected={selected}
              Icon={Icon}
              onSelect={() => onChange(template.id)}
            />
          );
        })}
      </div>
    </section>
  );
}

function TemplateCard({
  template,
  selected,
  Icon,
  onSelect,
}: {
  template: PosterTemplate;
  selected: boolean;
  Icon: LucideIcon;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "group relative overflow-hidden rounded-2xl border text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40",
        selected
          ? "border-emerald-400/70 bg-emerald-400/[0.07] shadow-[0_0_22px_rgba(16,185,129,0.12)]"
          : "border-slate-800 bg-slate-950/50 hover:border-slate-700",
      )}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className={cn("relative flex h-[92px] items-center justify-center overflow-hidden bg-gradient-to-br", template.thumbnail)}>
        <span className="absolute inset-0 bg-black/10 transition group-hover:bg-black/0" />
        <span className="flex aspect-[9/12] h-[76px] flex-col items-center justify-center gap-1 rounded-md border border-white/50 bg-white/15 text-white shadow-lg backdrop-blur-sm transition group-hover:-translate-y-0.5">
          <Icon size={20} strokeWidth={1.8} />
          <span className="max-w-[76px] px-1 text-center text-[7px] font-black leading-tight">{template.name}</span>
        </span>
        <span className={cn(
          "absolute right-2 top-2 rounded-full px-2 py-1 text-[9px] font-black shadow-lg backdrop-blur-md",
          template.price === 0
            ? "border border-emerald-200/40 bg-emerald-300/90 text-emerald-950"
            : "border border-amber-200/40 bg-amber-300/90 text-amber-950",
        )}>
          {formatPrice(template.price)}
        </span>
        {selected && <span className="absolute left-2 top-2 grid size-5 place-items-center rounded-full bg-emerald-300 text-emerald-950"><Check size={12} strokeWidth={3} /></span>}
      </span>
      <span className="block px-2.5 py-2.5">
        <span className={cn("block truncate text-[11px] font-bold", selected ? "text-emerald-200" : "text-slate-200")}>{template.name}</span>
        <span className="mt-1 block truncate text-[9px] text-slate-500">{template.description}</span>
      </span>
    </button>
  );
}