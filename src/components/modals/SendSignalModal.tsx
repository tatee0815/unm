import { useState, useEffect, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  RotateCcw,
  SmilePlus,
  AlertCircle
} from 'lucide-react';
import type {
  ProfileData,
  SenderRole,
  SignalNoticeType,
  SignalPayload,
  StickerItem
} from '../../types';
import {
  getSavedSenderDisplayName,
  getSavedSenderRole,
  saveSenderDisplayName,
  saveSenderRole,
  sendSignal
} from '../../lib/signalService';

export interface SendSignalModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Record<SenderRole, ProfileData>;
  cooldownSeconds: number;
  onSignalSent: () => void;
}

/**
 * Bộ sticker & icon tình yêu dễ thương dùng để gửi kèm trong email.
 */
const LOVE_STICKERS: StickerItem[] = [
  { id: 'heart-sparkle', emoji: '💖', label: 'Trái tim lấp lánh', category: 'love' },
  { id: 'in-love', emoji: '🥰', label: 'Đang tan chảy', category: 'love' },
  { id: 'love-letter', emoji: '💌', label: 'Thư tình', category: 'love' },
  { id: 'hug', emoji: '🫂', label: 'Ôm một cái', category: 'cute' },
  { id: 'kiss', emoji: '😘', label: 'Hôn gió', category: 'love' },
  { id: 'rose', emoji: '🌹', label: 'Hoa hồng', category: 'love' },
  { id: 'sparkles', emoji: '✨', label: 'Lấp lánh', category: 'mood' },
  { id: 'strawberry', emoji: '🍓', label: 'Dâu ngọt', category: 'cute' },
  { id: 'teddy', emoji: '🧸', label: 'Gấu bông', category: 'cute' },
  { id: 'coffee', emoji: '☕', label: 'Cà phê cùng nhau', category: 'mood' },
  { id: 'moon', emoji: '🌙', label: 'Chúc ngủ ngon', category: 'mood' },
  { id: 'pleading', emoji: '🥺', label: 'Nhớ quá trời', category: 'cute' }
];

/**
 * 2 tùy chọn thông báo đính kèm cố định trong hộp thoại gửi tín hiệu.
 */
const SIGNAL_NOTICE_OPTIONS: ReadonlyArray<{
  id: SignalNoticeType;
  label: string;
  emailText: string;
}> = [
  {
    id: 'memories_updated',
    label: 'Đính kèm thông báo đang có thay đổi ở tab kỉ niệm',
    emailText: 'Đang có thay đổi mới ở tab Kỉ niệm để bạn xem nè.'
  },
  {
    id: 'private_corner_share',
    label: 'Đính kèm thông báo đang có kỉ niệm muốn chia sẻ với bạn ở góc riêng',
    emailText: 'Đang có kỉ niệm muốn chia sẻ với bạn ở góc riêng đó.'
  }
];

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

const getDefaultNameForRole = (
  role: SenderRole,
  profiles: Record<SenderRole, ProfileData>
): string => {
  const nick = profiles[role]?.nickname?.trim();
  if (nick) return nick;
  return role === 'em' ? 'Em' : 'Anh';
};

export const SendSignalModal = ({
  isOpen,
  onClose,
  profiles,
  cooldownSeconds,
  onSignalSent
}: SendSignalModalProps) => {
  const [senderRole, setSenderRole] = useState<SenderRole>(() => getSavedSenderRole());
  const [senderNameDrafts, setSenderNameDrafts] = useState<Partial<Record<SenderRole, string>>>(() => {
    const emSaved = getSavedSenderDisplayName('em');
    const anhSaved = getSavedSenderDisplayName('anh');
    return {
      em: emSaved || undefined,
      anh: anhSaved || undefined
    };
  });

  const [selectedSticker, setSelectedSticker] = useState<string>('💌');
  const [selectedNotices, setSelectedNotices] = useState<SignalNoticeType[]>([]);

  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const autoCloseTimerRef = useRef<number | null>(null);

  const recipientRole: SenderRole = senderRole === 'em' ? 'anh' : 'em';
  const recipientName = getDefaultNameForRole(recipientRole, profiles);
  const defaultSenderNickname = getDefaultNameForRole(senderRole, profiles);
  const senderName = senderNameDrafts[senderRole] ?? defaultSenderNickname;

  const clearAutoCloseTimer = () => {
    if (autoCloseTimerRef.current !== null) {
      window.clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  };

  const handleClose = () => {
    clearAutoCloseTimer();
    setStatus('idle');
    setErrorMessage('');
    onClose();
  };

  // Khóa cuộn nền và hỗ trợ đóng modal bằng phím Escape
  useEffect(() => {
    if (!isOpen) return;

    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'sending') {
        clearAutoCloseTimer();
        setStatus('idle');
        setErrorMessage('');
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = origOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, status, onClose]);

  // Dọn dẹp bộ đếm tự đóng modal khi component unmount
  useEffect(() => {
    return () => {
      clearAutoCloseTimer();
    };
  }, []);

  const handleSelectRole = (nextRole: SenderRole) => {
    setSenderRole(nextRole);
    saveSenderRole(nextRole);
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSenderNameChange = (value: string) => {
    setSenderNameDrafts(prev => ({ ...prev, [senderRole]: value }));
    saveSenderDisplayName(senderRole, value);
  };

  const handleResetSenderName = () => {
    setSenderNameDrafts(prev => ({ ...prev, [senderRole]: undefined }));
    saveSenderDisplayName(senderRole, '');
  };

  const handleToggleNotice = (noticeId: SignalNoticeType) => {
    setSelectedNotices(prev =>
      prev.includes(noticeId)
        ? prev.filter(id => id !== noticeId)
        : [...prev, noticeId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending' || status === 'success' || cooldownSeconds > 0) return;

    setStatus('sending');
    setErrorMessage('');

    const cleanSenderName = senderName.trim() || defaultSenderNickname;
    const noticeLabels = SIGNAL_NOTICE_OPTIONS
      .filter(opt => selectedNotices.includes(opt.id))
      .map(opt => opt.emailText);

    const payload: SignalPayload = {
      senderRole,
      senderName: cleanSenderName,
      recipientRole,
      recipientName,
      sticker: selectedSticker || undefined,
      notices: selectedNotices,
      noticeLabels,
      sentAt: new Date().toISOString()
    };

    const result = await sendSignal(payload);

    if (result.success) {
      setStatus('success');
      onSignalSent();

      // Tự động đóng modal sau 1.5 giây sau hiệu ứng thành công ngọt ngào
      autoCloseTimerRef.current = window.setTimeout(() => {
        handleClose();
      }, 1500);
    } else {
      setStatus('error');
      setErrorMessage(result.message);
      if (result.cooldownSeconds > 0) {
        onSignalSent();
      }
    }
  };

  const isLocked = status === 'sending' || status === 'success';
  const isDisabledSubmit = isLocked || cooldownSeconds > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          style={{ zoom: 0.8 }}
          onClick={() => {
            if (status !== 'sending') handleClose();
          }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-950/70 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="send-signal-modal-title"
        >
          {/* Khung ánh sáng mềm bao quanh modal giống lightbox kỷ niệm */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-[2rem] p-[2px] my-auto"
            style={{
              background:
                'linear-gradient(135deg, rgba(251, 207, 232, 0.95) 0%, rgba(255, 255, 255, 0.9) 50%, rgba(253, 164, 175, 0.95) 100%)',
              boxShadow:
                '0 0 60px -10px var(--signal-glow), 0 25px 50px -12px rgba(15, 23, 42, 0.45)'
            }}
          >
            {/* Họa tiết trái tim & lấp lánh tinh tế ở 2 góc đối diện */}
            <span
              aria-hidden="true"
              className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white/95 shadow-md border border-rose-100 flex items-center justify-center text-rose-400 pointer-events-none select-none"
            >
              <Heart size={15} className="fill-rose-400/30" />
            </span>
            <span
              aria-hidden="true"
              className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-white/95 shadow-md border border-pink-100 flex items-center justify-center text-amber-400 pointer-events-none select-none"
            >
              <Sparkles size={15} />
            </span>

            {/* Thân hộp thoại */}
            <div
              className="relative rounded-[calc(2rem-2px)] p-6 sm:p-8 backdrop-blur-xl overflow-hidden"
              style={{ backgroundColor: 'var(--signal-surface)' }}
            >
              {/* Nút đóng góc trên phải */}
              <button
                type="button"
                onClick={handleClose}
                disabled={status === 'sending'}
                aria-label="Đóng hộp thoại gửi tín hiệu"
                className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer disabled:opacity-40"
              >
                <X size={20} />
              </button>

              {/* Header với tiêu đề động */}
              <div className="pr-9 mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase mb-2.5 bg-rose-50 text-rose-500 border border-rose-100">
                  <Sparkles size={12} />
                  <span>Tín hiệu nhanh qua Email</span>
                </div>
                <h2
                  id="send-signal-modal-title"
                  className="font-romantic text-2xl sm:text-[26px] font-bold text-[#443333] leading-snug"
                >
                  Gửi thông báo đến với{' '}
                  <span
                    className="italic"
                    style={{ color: 'var(--signal-primary)' }}
                  >
                    {recipientName}
                  </span>
                </h2>
              </div>

              {/* Trạng thái Thành công: Hiệu ứng thông báo ngọt ngào */}
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success-view"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-10 px-4 flex flex-col items-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.45 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-4 text-4xl shadow-lg border border-rose-100 bg-gradient-to-br from-rose-50 to-pink-100"
                    >
                      {selectedSticker || '💌'}
                    </motion.div>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg mb-1.5">
                      <CheckCircle2 size={22} />
                      <span>Tín hiệu đã bay đi rồi nè!</span>
                    </div>
                    <p className="text-sm text-[#685757] max-w-xs leading-relaxed">
                      Thư thông báo ngọt ngào đã được gửi tới hộp thư của{' '}
                      <strong className="text-rose-500">{recipientName}</strong> 💕
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form-view"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {/* 1. Chọn người gửi (Em / Anh) & Chỉnh sửa tên hiển thị */}
                    <div className="bg-white/80 rounded-2xl p-3.5 border border-rose-100/80 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-stone-500">
                          Bạn là:
                        </span>
                        <div className="inline-flex p-1 rounded-full bg-rose-50/90 border border-rose-100">
                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => handleSelectRole('em')}
                            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                              senderRole === 'em'
                                ? 'bg-pink-400 text-white shadow-sm'
                                : 'text-stone-500 hover:text-pink-500'
                            }`}
                          >
                            Her ({getDefaultNameForRole('em', profiles)})
                          </button>
                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => handleSelectRole('anh')}
                            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                              senderRole === 'anh'
                                ? 'bg-indigo-400 text-white shadow-sm'
                                : 'text-stone-500 hover:text-indigo-500'
                            }`}
                          >
                            Him ({getDefaultNameForRole('anh', profiles)})
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label
                            htmlFor="signal-sender-name"
                            className="text-xs font-semibold text-stone-500"
                          >
                            Tên hiển thị của người gửi:
                          </label>
                          {senderName.trim() !== defaultSenderNickname && (
                            <button
                              type="button"
                              onClick={handleResetSenderName}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 hover:text-rose-500 cursor-pointer"
                              title="Khôi phục về nickname mặc định"
                            >
                              <RotateCcw size={11} /> Mặc định ({defaultSenderNickname})
                            </button>
                          )}
                        </div>
                        <input
                          id="signal-sender-name"
                          type="text"
                          maxLength={40}
                          disabled={isLocked}
                          value={senderName}
                          onChange={e => handleSenderNameChange(e.target.value)}
                          placeholder={`Nhập tên hiển thị (mặc định: ${defaultSenderNickname})`}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-rose-200/80 bg-white text-[#443333] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 transition"
                        />
                      </div>
                    </div>

                    {/* 2. Bảng chọn Sticker gửi kèm */}
                    <div className="bg-white/80 rounded-2xl p-3.5 border border-rose-100/80">
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500">
                          <SmilePlus size={14} className="text-rose-400" />
                          <span>Chọn Sticker gửi kèm:</span>
                        </span>

                        {selectedSticker && (
                          <span className="inline-flex items-center gap-1.5 text-xs bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full border border-rose-100">
                            <span className="text-base leading-none">{selectedSticker}</span>
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => setSelectedSticker('')}
                              className="text-rose-400 hover:text-rose-600 cursor-pointer"
                              title="Bỏ chọn sticker"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-6 gap-1.5">
                        {LOVE_STICKERS.map(item => {
                          const isSelected = selectedSticker === item.emoji;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={isLocked}
                              onClick={() =>
                                setSelectedSticker(prev =>
                                  prev === item.emoji ? '' : item.emoji
                                )
                              }
                              title={item.label}
                              className={`h-11 rounded-xl text-2xl flex items-center justify-center border transition cursor-pointer select-none ${
                                isSelected
                                  ? 'bg-rose-100 border-rose-300 scale-105 shadow-xs'
                                  : 'bg-white border-rose-50 hover:bg-rose-50 hover:scale-105'
                              }`}
                            >
                              {item.emoji}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Hai mục chọn đính kèm thông báo */}
                    <div className="space-y-2">
                      {SIGNAL_NOTICE_OPTIONS.map(option => {
                        const checked = selectedNotices.includes(option.id);
                        return (
                          <label
                            key={option.id}
                            className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs leading-relaxed cursor-pointer select-none transition ${
                              checked
                                ? 'bg-rose-50/90 border-rose-300 text-[#443333] font-medium'
                                : 'bg-white/75 border-rose-100/80 text-[#685757] hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              disabled={isLocked}
                              checked={checked}
                              onChange={() => handleToggleNotice(option.id)}
                              className="w-4 h-4 mt-0.5 rounded accent-pink-500 cursor-pointer shrink-0"
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Hiển thị lỗi nếu có */}
                    {status === 'error' && errorMessage && (
                      <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs leading-relaxed">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* 4. Nút gửi tín hiệu với đầy đủ trạng thái */}
                    <button
                      type="submit"
                      disabled={isDisabledSubmit}
                      className="w-full py-3.5 px-5 rounded-2xl text-white text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed hover:brightness-105 active:scale-[0.99]"
                      style={{
                        background:
                          cooldownSeconds > 0
                            ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                            : 'linear-gradient(135deg, var(--signal-primary) 0%, var(--signal-accent) 100%)',
                        boxShadow:
                          cooldownSeconds > 0
                            ? 'none'
                            : '0 10px 24px -6px var(--signal-glow)'
                      }}
                    >
                      {status === 'sending' ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          <span>Đang gửi tín hiệu...</span>
                        </>
                      ) : cooldownSeconds > 0 ? (
                        <>
                          <Clock size={16} />
                          <span>Chờ {cooldownSeconds} giây để gửi tiếp</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Gửi tín hiệu đến {recipientName}</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SendSignalModal;
