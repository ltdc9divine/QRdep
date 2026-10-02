import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qrdep.vn";
const seoTitle = "QRDep - Tạo Mã QR Ngân Hàng Đẹp, Hút Lộc & Chuyên Nghiệp Standee 9:16";
const seoDescription = "Biến mã QR ngân hàng nhàm chán thành Standee nghệ thuật 9:16 thu hút tài lộc. Hơn 50+ mẫu Thần Tài, Mèo Chiêu Tài, Aesthetic cho shop online & quán cafe.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: seoTitle,
  description: seoDescription,
  keywords: [
    "QRDep",
    "tao ma QR dep",
    "QR ngan hang nghe thuat",
    "Standee VietQR",
    "VietQR 9:16",
    "QR Thien Tai",
    "QR shop quan ao",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: seoTitle,
    description: seoDescription,
    url: "/",
    siteName: "QRDep",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: seoTitle,
    description: seoDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020617",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-950 text-slate-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
