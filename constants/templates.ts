import {
  Cat,
  Coffee,
  Flower2,
  Gem,
  Landmark,
  Leaf,
  MoonStar,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";

export type TemplateCategory = "free" | "vip" | "fortune" | "tet" | "cafe-shop" | "minimalist" | "aesthetic";

export type PosterTemplate = {
  id: string;
  name: string;
  description: string;
  price: number;
  categories: TemplateCategory[];
  icon: LucideIcon;
  thumbnail: string;
  canvasClass: string;
};

export const TEMPLATE_CATEGORIES: { id: "all" | TemplateCategory; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "free", label: "Miễn phí" },
  { id: "vip", label: "VIP" },
  { id: "fortune", label: "Thần Tài" },
  { id: "tet", label: "Tết" },
  { id: "cafe-shop", label: "Cafe/Shop" },
  { id: "minimalist", label: "Tối giản" },
  { id: "aesthetic", label: "Aesthetic" },
];

export const TEMPLATES: PosterTemplate[] = [
  {
    id: "fortune-free",
    name: "Thần Tài Khai Lộc",
    description: "Đỏ may mắn · Tải miễn phí",
    price: 0,
    categories: ["free", "fortune", "tet"],
    icon: Sparkles,
    thumbnail: "from-[#c23a37] via-[#e05b3f] to-[#f29b48]",
    canvasClass: "from-[#c23a37] via-[#e05b3f] to-[#f29b48]",
  },
  {
    id: "minimal-free",
    name: "Tối Giản Xanh",
    description: "Tinh gọn · Dễ ứng dụng",
    price: 0,
    categories: ["free", "minimalist"],
    icon: Leaf,
    thumbnail: "from-[#2f6d59] via-[#438b73] to-[#b0c9a4]",
    canvasClass: "from-[#2f6d59] via-[#438b73] to-[#b0c9a4]",
  },
  {
    id: "lucky-cat",
    name: "Mèo Chiêu Tài",
    description: "Vui tươi · Hút khách",
    price: 9000,
    categories: ["vip", "fortune", "cafe-shop"],
    icon: Cat,
    thumbnail: "from-[#f5a34b] via-[#e87863] to-[#b74d73]",
    canvasClass: "from-[#f5a34b] via-[#e87863] to-[#b74d73]",
  },
  {
    id: "cafe-story",
    name: "Góc Cafe Thơ",
    description: "Ấm áp · Hợp quán xinh",
    price: 9000,
    categories: ["vip", "cafe-shop", "aesthetic"],
    icon: Coffee,
    thumbnail: "from-[#715244] via-[#b47b59] to-[#e4bd91]",
    canvasClass: "from-[#715244] via-[#b47b59] to-[#e4bd91]",
  },
  {
    id: "spring-luxe",
    name: "Xuân Phú Quý",
    description: "Sắc Tết · Chúc vạn điều lành",
    price: 19000,
    categories: ["vip", "tet", "fortune"],
    icon: Sun,
    thumbnail: "from-[#a32139] via-[#da4e46] to-[#efbd68]",
    canvasClass: "from-[#a32139] via-[#da4e46] to-[#efbd68]",
  },
  {
    id: "fortune-gold",
    name: "Kim Tài Đại Cát",
    description: "Vàng sang · Hút lộc đầu năm",
    price: 19000,
    categories: ["vip", "fortune", "tet"],
    icon: Gem,
    thumbnail: "from-[#74511d] via-[#c59338] to-[#f2d083]",
    canvasClass: "from-[#74511d] via-[#c59338] to-[#f2d083]",
  },
  {
    id: "aesthetic-bloom",
    name: "Hoa Nở An Yên",
    description: "Aesthetic · Dịu mắt, tinh tế",
    price: 19000,
    categories: ["vip", "aesthetic", "cafe-shop"],
    icon: Flower2,
    thumbnail: "from-[#8a688f] via-[#cb8b9c] to-[#edc0a3]",
    canvasClass: "from-[#8a688f] via-[#cb8b9c] to-[#edc0a3]",
  },
  {
    id: "royal-red",
    name: "Hồng Phát Vương Gia",
    description: "Đẳng cấp · Lì xì phát tài",
    price: 29000,
    categories: ["vip", "fortune", "tet"],
    icon: Sparkles,
    thumbnail: "from-[#561d43] via-[#a33153] to-[#e68c5d]",
    canvasClass: "from-[#561d43] via-[#a33153] to-[#e68c5d]",
  },
  {
    id: "night-market",
    name: "Phố Đêm Rực Rỡ",
    description: "Nổi bật · Cá tính Gen Z",
    price: 29000,
    categories: ["vip", "cafe-shop", "aesthetic"],
    icon: MoonStar,
    thumbnail: "from-[#27215e] via-[#564a9c] to-[#e56f88]",
    canvasClass: "from-[#27215e] via-[#564a9c] to-[#e56f88]",
  },
  {
    id: "minimal-gold",
    name: "Tối Giản Thượng Lưu",
    description: "Thanh lịch · Dành cho thương hiệu",
    price: 29000,
    categories: ["vip", "minimalist", "aesthetic"],
    icon: Landmark,
    thumbnail: "from-[#263f4a] via-[#4c6b66] to-[#b08b62]",
    canvasClass: "from-[#263f4a] via-[#4c6b66] to-[#b08b62]",
  },
];

export function getTemplateById(templateId: string) {
  return TEMPLATES.find((template) => template.id === templateId) ?? TEMPLATES[0];
}