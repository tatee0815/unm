import { useState, useRef } from 'react';
import { ZoomIn, RotateCcw, X, Loader2, Check } from 'lucide-react';

export interface AvatarAdjusterModalProps {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => Promise<void>;
  isUploading: boolean;
}

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
  const dragStart = useRef({ x: 0, y: 0, initialPosX: 0, initialPosY: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

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

  const handleReset = () => {
    setZoom(1);
    setPosX(0);
    setPosY(0);
  };

  const handleCropAndSave = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const CANVAS_SIZE = 400;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const wrapper = img.parentElement;
    const wrapperSize = wrapper ? wrapper.offsetWidth : 208;
    const scaleRatio = CANVAS_SIZE / wrapperSize;

    const nw = img.naturalWidth || CANVAS_SIZE;
    const nh = img.naturalHeight || CANVAS_SIZE;
    const baseScale = Math.max(wrapperSize / nw, wrapperSize / nh);

    ctx.save();
    ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    ctx.translate(posX * scaleRatio, posY * scaleRatio);
    ctx.scale(zoom, zoom);
    const drawW = nw * baseScale * scaleRatio;
    const drawH = nh * baseScale * scaleRatio;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    canvas.toBlob(
      blob => {
        if (blob) {
          onConfirm(blob);
        }
      },
      'image/jpeg',
      0.92
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
              Kéo hoặc dùng thanh trượt để ảnh vừa vặn khung tròn
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

        {/* Khung xem trước hình tròn */}
        <div className="flex justify-center py-2">
          <div
            className="relative w-52 h-52 rounded-full overflow-hidden border-4 border-rose-300 shadow-lg cursor-grab active:cursor-grabbing bg-stone-100 select-none touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Avatar adjustment"
              draggable={false}
              style={{
                transform: `translate(${posX}px, ${posY}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.05s ease-out'
              }}
              className="w-full h-full object-contain pointer-events-none select-none"
            />
            <div className="absolute inset-0 pointer-events-none rounded-full ring-1 ring-inset ring-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition">
              <span className="text-[10px] text-white bg-black/50 px-2 py-0.5 rounded-full">
                Kéo để di chuyển
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
                min="-120"
                max="120"
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
                min="-120"
                max="120"
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
