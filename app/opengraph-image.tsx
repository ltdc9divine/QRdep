import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "QRDep - Thiết kế Standee VietQR nghệ thuật 9:16";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "64px 74px",
          color: "#f8fafc",
          background: "linear-gradient(135deg, #020617 0%, #0f172a 52%, #064e3b 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ width: 720, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              width: 430,
              alignItems: "center",
              border: "1px solid rgba(52, 211, 153, 0.45)",
              borderRadius: 999,
              padding: "10px 18px",
              color: "#a7f3d0",
              background: "rgba(15, 23, 42, 0.75)",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            STANDEE VIETQR NGHỆ THUẬT · 9:16
          </div>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 28, fontSize: 68, lineHeight: 1.08, fontWeight: 800 }}>
            QRDep
            <span style={{ color: "#6ee7b7" }}>.</span>
          </div>
          <div style={{ display: "flex", marginTop: 14, maxWidth: 700, fontSize: 34, lineHeight: 1.28, color: "#dbeafe" }}>
            Biến mã QR ngân hàng thành Standee đẹp, hút lộc và mang dấu ấn riêng.
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 20, fontWeight: 600, color: "#a7f3d0" }}>
            Tạo mẫu nhanh · Tải ảnh HD 1080 × 1920
          </div>
        </div>
        <div
          style={{
            width: 270,
            height: 440,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(148, 163, 184, 0.55)",
            borderRadius: 34,
            padding: 15,
            background: "linear-gradient(180deg, #1e293b, #020617)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 22,
              color: "#fff7ed",
              background: "linear-gradient(145deg, #c23a37, #e05b3f 55%, #f29b48)",
            }}
          >
            <div style={{ display: "flex", fontSize: 20, fontWeight: 700 }}>THẦN TÀI KHAI LỘC</div>
            <div style={{ display: "flex", width: 150, height: 150, position: "relative", marginTop: 28, border: "10px solid white", borderRadius: 18, background: "#f8fafc" }}>
              <div style={{ position: "absolute", left: 8, top: 8, width: 38, height: 38, border: "7px solid #0f172a", borderRadius: 4, background: "#f8fafc" }} />
              <div style={{ position: "absolute", right: 8, top: 8, width: 38, height: 38, border: "7px solid #0f172a", borderRadius: 4, background: "#f8fafc" }} />
              <div style={{ position: "absolute", left: 8, bottom: 8, width: 38, height: 38, border: "7px solid #0f172a", borderRadius: 4, background: "#f8fafc" }} />
              <div style={{ position: "absolute", left: 62, top: 18, width: 10, height: 10, background: "#0f172a" }} />
              <div style={{ position: "absolute", left: 80, top: 54, width: 12, height: 12, background: "#0f172a" }} />
              <div style={{ position: "absolute", right: 18, bottom: 18, width: 12, height: 12, background: "#0f172a" }} />
            </div>
            <div style={{ display: "flex", marginTop: 25, fontSize: 16, fontWeight: 700 }}>QUÉT MÃ · CHUYỂN TIỀN</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}