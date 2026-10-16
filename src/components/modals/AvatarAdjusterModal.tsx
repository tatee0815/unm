import { useState, useRef, useEffect } from 'react';
import { ZoomIn, RotateCcw, X, Loader2, Check } from 'lucide-react';

export interface AvatarAdjusterModalProps {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => Promise<void>;
  isUploading: boolean;
}

const CONTAINER_SIZE = 220; // Đường kính khung tròn hiển thị (pixel)
const CANVAS_SIZE = 500;    // Độ phân giải ảnh avatar xuất ra (500x500)

export const AvatarAdjusterModal = ({
  imageSrc,
  onCancel,
  onConfirm,
  isUploading
}: AvatarAdjusterModalProps) => {
  const [zoom, setZoom] = useState(1);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ nw: number; nh: number }>({
    nw: CONTAINER_SIZE,
    nh: CONTAINER_SIZE
  });

  const dragStart = useRef({ x: 0, y: 0, initialPosX: 0, initialPosY: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  // Xác định kích thước gốc của ảnh
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    const update = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setNaturalSize({ nw: img.naturalWidth, nh: img.naturalHeight });
      }
    };
    if (img.complete && img.naturalWidth) {
      update();
    } else {
      img.onload = update;
    }
  }, [imageSrc]);

  // Tính toán tỉ lệ chuẩn để ảnh lấp đầy khung tròn (object-cover)
  const nw = naturalSize.nw || CONTAINER_SIZE;
  const nh = naturalSize.nh || CONTAINER_SIZE;
  const baseScale = Math.max(CONTAINER_SIZE / nw, CONTAINER_SIZE / nh);
  const baseWidth = nw * baseScale;
  const baseHeight = nh * baseScale;

  // Giới hạn kéo thả linh hoạt theo kích thước ảnh sau zoom
  const maxDragX = Math.max(120, Math.round((baseWidth * zoom) / 2));
  const maxDragY = Math.max(120, Math.round((baseHeight * zoom) / 2));

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      initialPosX: posX,
      initialPosY: posY
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosX(dragStart.current.initialPosX + dx);
    setPosY(dragStart.current.initialPosY + dy);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        initialPosX: posX,
        initialPosY: posY
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;
    setPosX(dragStart.current.initialPosX + dx);
    setPosY(dragStart.current.initialPosY + dy);
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Hỗ trợ lăn chuột để phóng to / thu nhỏ tiện lợi
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom(prev => Math.min(Math.max(1, +(prev + delta).toFixed(2)), 3));
  };

  const handleReset = () => {
    setZoom(1);
    setPosX(0);
    setPosY(0);
  };

  // Cắt ảnh chính xác từng pixel đúng với vị trí người dùng nhìn thấy trong preview
  const handleCropAndSave = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Tỉ lệ scale đồng nhất giữa Canvas xuất ra và Khung tròn preview
    const ratio = CANVAS_SIZE / CONTAINER_SIZE;

    ctx.save();
    // 1. Dời gốc tọa độ về tâm của Canvas
    ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);

    // 2. Dịch chuyển theo đúng tọa độ người dùng đã căn chỉnh
    ctx.translate(posX * ratio, posY * ratio);

    // 3. Phóng to theo đúng mức zoom
    ctx.scale(zoom, zoom);

    // 4. Kích thước vẽ ảnh đồng bộ 100% với khung xem trước
    const drawW = baseWidth * ratio;
    const drawH = baseHeight * ratio;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    canvas.toBlob(
      blob => {
        if (blob) {
          onConfirm(blob);
        }
      },
      'image/jpeg',
      0.95
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 border border-rose-100">
        <div className="flex items-center justify-between border-b border-rose-50 pb-3">
          <div>
            <h3 className="font-romantic text-xl font-bold text-[#443333]">
              Điều chỉnh khung hình Avatar
            </h3>
            <p className="text-xs text-stone-400">
              Kéo hoặc lăn chuột để ảnh vừa vặn khung tròn hoàn hảo
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isUploading}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Khung xem trước hình tròn chuẩn xác 100% */}
        <div className="flex justify-center py-2">
          <div
            style={{ width: `${CONTAINER_SIZE}px`, height: `${CONTAINER_SIZE}px` }}
            className="relative rounded-full overflow-hidden border-4 border-rose-300 shadow-xl cursor-grab active:cursor-grabbing bg-stone-100 select-none touch-none ring-4 ring-rose-100/50"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Avatar adjustment"
              draggable={false}
              onLoad={e => {
                const t = e.currentTarget;
                if (t.naturalWidth && t.naturalHeight) {
                  setNaturalSize({ nw: t.naturalWidth, nh: t.naturalHeight });
                }
              }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: `${baseWidth}px`,
                height: `${baseHeight}px`,
                maxWidth: 'none',
                maxHeight: 'none',
                transform: `translate(-50%, -50%) translate(${posX}px, ${posY}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.05s ease-out'
              }}
              className="pointer-events-none select-none"
            />
            {/* Vòng viền định vị tinh tế */}
            <div className="absolute inset-0 pointer-events-none rounded-full ring-1 ring-inset ring-black/10 flex items-center justify-center">
              <span className="text-[10px] text-white/90 bg-black/40 px-2 py-0.5 rounded-full opacity-0 hover:opacity-100 transition">
                Kéo ảnh để căn chỉnh
              </span>
            </div>
          </div>
        </div>

        {/* Bộ điều khiển */}
        <div className="space-y-3 bg-rose-50/40 p-4 rounded-2xl border border-rose-100/70 text-xs">
          {/* Zoom Slider */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold text-stone-600">
              <span className="flex items-center gap-1">
                <ZoomIn size={13} className="text-rose-400" /> Thu phóng (Zoom)
              </span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={e => setZoom(parseFloat(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer"
            />
          </div>

          {/* Dịch chuyển ngang / dọc */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-stone-500 font-medium">
                <span>Ngang (X)</span>
                <span>{posX}px</span>
              </div>
              <input
                type="range"
                min={-maxDragX}
                max={maxDragX}
                value={posX}
                onChange={e => setPosX(parseInt(e.target.value, 10))}
                className="w-full accent-stone-400 cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-stone-500 font-medium">
                <span>Dọc (Y)</span>
                <span>{posY}px</span>
              </div>
              <input
                type="range"
                min={-maxDragY}
                max={maxDragY}
                value={posY}
                onChange={e => setPosY(parseInt(e.target.value, 10))}
                className="w-full accent-stone-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-600 transition cursor-pointer"
            >
              <RotateCcw size={11} /> Đặt lại mặc định
            </button>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isUploading}
            className="px-4 py-2 rounded-full text-xs text-stone-400 hover:text-stone-600 transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleCropAndSave}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-rose-400 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-200 transition cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Đang cất giữ kỉ niệm...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>Đổi ảnh</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarAdjusterModal;
