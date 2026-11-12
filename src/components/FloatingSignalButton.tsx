import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';

export interface FloatingSignalButtonProps {
  onClick: () => void;
  cooldownSeconds?: number;
  isModalOpen?: boolean;
}

/**
 * Nút công cụ nổi (FAB) cố định ở góc dưới bên phải màn hình (bottom-6 right-6, z-40).
 * Kế thừa CSS variables màu chủ đạo (--signal-primary, --signal-accent, --signal-glow)
 * và không che khuất Navbar trên cả mobile lẫn desktop.
 */
export const FloatingSignalButton = ({
  onClick,
  cooldownSeconds = 0,
  isModalOpen = false
}: FloatingSignalButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{ zoom: 0.8 }}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip hiển thị khi hover trên desktop */}
      <AnimatePresence>
        {isHovered && !isModalOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md text-xs font-semibold text-[#554444] shadow-lg border whitespace-nowrap pointer-events-none select-none"
            style={{
              borderColor: 'var(--signal-border)',
              boxShadow: '0 10px 25px -5px var(--signal-glow)'
            }}
          >
            <Sparkles size={13} style={{ color: 'var(--signal-primary)' }} />
            <span>
              {cooldownSeconds > 0
                ? `Chờ ${cooldownSeconds}s để gửi tín hiệu tiếp`
                : 'Gửi tín hiệu yêu thương 💌'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nút tròn chính với vòng hào quang nhịp đập (pulse/glow) */}
      <div className="relative">
        {!isModalOpen && cooldownSeconds === 0 && (
          <span
            aria-hidden="true"
            className="signal-pulse-ring absolute inset-0 rounded-full pointer-events-none"
            style={{
              backgroundColor: 'var(--signal-primary-soft)'
            }}
          />
        )}

        <motion.button
          type="button"
          onClick={onClick}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.93 }}
          aria-label="Mở hộp thoại gửi tín hiệu qua Email"
          className="relative flex items-center justify-center w-14 h-14 rounded-full text-white cursor-pointer border border-white/60 transition-shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-200"
          style={{
            background:
              'linear-gradient(135deg, var(--signal-primary) 0%, var(--signal-accent) 100%)',
            boxShadow: '0 10px 28px -4px var(--signal-glow)'
          }}
        >
          <Heart
            size={24}
            className="fill-white/25 stroke-white transition-transform duration-300"
          />

          {/* Chấm nhỏ lấp lánh hoặc bộ đếm cooldown */}
          {cooldownSeconds > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-white text-[10px] font-bold flex items-center justify-center shadow-md border border-rose-200 text-rose-500">
              {cooldownSeconds}s
            </span>
          ) : (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-80" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-300 border-2 border-white" />
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default FloatingSignalButton;

