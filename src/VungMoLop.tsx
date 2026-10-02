import { useRef, useState } from "react";

/** Một vùng làm mờ, đo bằng PHẦN TRĂM khung hình (khớp `export::VungMo` bên Rust). */
export type VungMoUI = { x_pct: number; y_pct: number; w_pct: number; h_pct: number };

/**
 * Bề rộng/cao tối thiểu tính theo % — khớp `VUNG_MO_MIN_PCT` bên Rust.
 *
 * Một cú bấm lỡ tay cho ra vùng 0% → `crop=0:0` → ffmpeg chết giữa lần xuất đã
 * chạy mấy phút. Bên Rust có kẹp, nhưng chặn ngay ở đây thì người dùng không
 * bao giờ thấy một ô vuông bé tí vô nghĩa nằm trên khung.
 */
export const VUNG_MO_MIN_PCT = 0.5;

/** Cạnh ô tay cầm để kéo giãn, tính bằng px trên màn hình. */
const TAY_CAM_PX = 14;

interface Props {
  vungMo: VungMoUI[];
  onDoi: (v: VungMoUI[]) => void;
  /** Bật thì lớp này ăn chuột để khoanh vùng; tắt thì chỉ hiện, cho xem video. */
  dangVe: boolean;
}

type Keo =
  | { kieu: "moi"; x0: number; y0: number }
  | { kieu: "di"; i: number; dx: number; dy: number }
  | { kieu: "gian"; i: number };

function chuanHoa(v: VungMoUI): VungMoUI {
  // Kéo ngược lên/sang trái cho ra bề rộng ÂM. Không chuẩn hoá thì ô biến mất
  // và `crop` nhận số âm.
  const x = Math.min(v.x_pct, v.x_pct + v.w_pct);
  const y = Math.min(v.y_pct, v.y_pct + v.h_pct);
  const w = Math.abs(v.w_pct);
  const h = Math.abs(v.h_pct);
  const xk = Math.max(0, Math.min(x, 100 - VUNG_MO_MIN_PCT));
  const yk = Math.max(0, Math.min(y, 100 - VUNG_MO_MIN_PCT));
  return {
    x_pct: xk,
    y_pct: yk,
    w_pct: Math.max(VUNG_MO_MIN_PCT, Math.min(w, 100 - xk)),
    h_pct: Math.max(VUNG_MO_MIN_PCT, Math.min(h, 100 - yk)),
  };
}

export default function VungMoLop({ vungMo, onDoi, dangVe }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [keo, setKeo] = useState<Keo | null>(null);
  // Ô đang vẽ dở, chỉ sống trong lúc giữ chuột. Giữ riêng thay vì nhét vào
  // `vungMo` để lúc buông chuột mà ô quá bé thì bỏ đi, không phải xoá ngược.
  const [nhap, setNhap] = useState<VungMoUI | null>(null);

  function phanTram(e: React.PointerEvent): { x: number; y: number } {
    const r = ref.current?.getBoundingClientRect();
    if (!r || r.width === 0 || r.height === 0) return { x: 0, y: 0 };
    return {
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    };
  }

  function batDau(e: React.PointerEvent) {
    if (!dangVe) return;
    e.preventDefault();
    // Bắt con trỏ: kéo ra ngoài khung rồi buông thì vẫn nhận được pointerup,
    // nếu không thao tác kéo bị treo và ô dính theo chuột.
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const { x, y } = phanTram(e);
    setKeo({ kieu: "moi", x0: x, y0: y });
    setNhap({ x_pct: x, y_pct: y, w_pct: 0, h_pct: 0 });
  }

  function diChuyen(e: React.PointerEvent) {
    if (!keo) return;
    const { x, y } = phanTram(e);
    if (keo.kieu === "moi") {
      setNhap({ x_pct: keo.x0, y_pct: keo.y0, w_pct: x - keo.x0, h_pct: y - keo.y0 });
      return;
    }
    const ds = vungMo.slice();
    const v = ds[keo.i];
    if (!v) return;
    if (keo.kieu === "di") {
      ds[keo.i] = chuanHoa({ ...v, x_pct: x - keo.dx, y_pct: y - keo.dy });
    } else {
      ds[keo.i] = chuanHoa({ ...v, w_pct: x - v.x_pct, h_pct: y - v.y_pct });
    }
    onDoi(ds);
  }

  function ketThuc() {
    if (keo?.kieu === "moi" && nhap) {
      const v = chuanHoa(nhap);
      // Bấm một phát rồi buông (không kéo) cho ra ô bé tí — gần như chắc chắn
      // là lỡ tay chứ không phải ý định, nên bỏ chứ không thêm vào danh sách.
      const daKeo = Math.abs(nhap.w_pct) > 1 && Math.abs(nhap.h_pct) > 1;
      if (daKeo) onDoi([...vungMo, v]);
    }
    setKeo(null);
    setNhap(null);
  }

  const kieuO = (v: VungMoUI): React.CSSProperties => ({
    left: `${v.x_pct}%`,
    top: `${v.y_pct}%`,
    width: `${v.w_pct}%`,
    height: `${v.h_pct}%`,
  });

  return (
    <div
      ref={ref}
      className={`vung-mo-lop${dangVe ? " dang-ve" : ""}`}
      onPointerDown={batDau}
      onPointerMove={diChuyen}
      onPointerUp={ketThuc}
      onPointerCancel={ketThuc}
    >
      {vungMo.map((v, i) => (
        <div key={i} className="vung-mo-o" style={kieuO(v)}>
          {dangVe && (
            <>
              <div
                className="vung-mo-than"
                title="Kéo để dời"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  (e.target as Element).setPointerCapture?.(e.pointerId);
                  const { x, y } = phanTram(e);
                  setKeo({ kieu: "di", i, dx: x - v.x_pct, dy: y - v.y_pct });
                }}
              />
              <button
                type="button"
                className="vung-mo-xoa"
                title="Xoá vùng này"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onDoi(vungMo.filter((_, k) => k !== i));
                }}
              >
                ×
              </button>
              <div
                className="vung-mo-tay-cam"
                style={{ width: TAY_CAM_PX, height: TAY_CAM_PX }}
                title="Kéo để giãn"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  (e.target as Element).setPointerCapture?.(e.pointerId);
                  setKeo({ kieu: "gian", i });
                }}
              />
            </>
          )}
        </div>
      ))}
      {nhap && <div className="vung-mo-o dang-nhap" style={kieuO(chuanHoa(nhap))} />}
    </div>
  );
}
