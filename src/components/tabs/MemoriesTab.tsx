import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  BookHeart,
  BookOpen,
  PlusCircle,
  Pencil,
  Trash2,
  Upload,
  Loader2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadToCloudinary } from '../../lib/cloudinary';
import type { MemoriesRecord, MemoryItem } from '../../types';

export interface PendingFormOpen {
  dateKey?: string;
  memory?: MemoryItem;
  defaultAuthor?: 'em' | 'anh' | 'both';
  defaultType?: string;
}

export interface MemoriesTabProps {
  memories: MemoriesRecord;
  selectedDateKey: string;
  setSelectedDateKey: (dateKey: string) => void;
  todayKey: string;
  onSaveMemory: (newMemory: MemoryItem) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
  onViewPhoto: (url: string) => void;
  showAlert: (message: string, title?: string) => void;
  pendingFormOpen?: PendingFormOpen | null;
  onClearPendingFormOpen?: () => void;
}

const formatDateKey = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const MemoriesTab = ({
  memories,
  selectedDateKey,
  setSelectedDateKey,
  todayKey,
  onSaveMemory,
  onDeleteMemory,
  onViewPhoto,
  showAlert,
  pendingFormOpen,
  onClearPendingFormOpen
}: MemoriesTabProps) => {
  // Lịch
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [formType, setFormType] = useState('journal');
  const [formAuthor, setFormAuthor] = useState<'em' | 'anh' | 'both'>('em');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formSticker, setFormSticker] = useState('');
  const [formPhotos, setFormPhotos] = useState<{ url: string; file?: File }[]>([]);
  const [isUploadingMemoryPhoto, setIsUploadingMemoryPhoto] = useState(false);
  const [memoryPhotoError, setMemoryPhotoError] = useState('');

  const handleOpenForm = (existing?: MemoryItem, defaultAuthor?: 'em' | 'anh' | 'both', defaultType?: string) => {
    setIsUploadingMemoryPhoto(false);
    setMemoryPhotoError('');
    if (existing) {
      setEditingMemoryId(existing.id);
      setFormType(existing.type || 'journal');
      setFormTitle(existing.title || '');
      setFormContent(existing.content || '');
      setFormPhotos(existing.photo_urls ? existing.photo_urls.map(url => ({ url })) : []);
      setFormAuthor((existing.author as 'em' | 'anh' | 'both') || defaultAuthor || 'em');
      setFormSticker(existing.sticker || '');
    } else {
      setEditingMemoryId(null);
      setFormType(defaultType || (defaultAuthor === 'both' ? 'special' : 'journal'));
      setFormTitle('');
      setFormContent('');
      setFormPhotos([]);
      setFormAuthor(defaultAuthor || 'em');
      setFormSticker('');
    }
    setShowAddForm(true);
  };

  // Lắng nghe khi được chuyển hướng từ UsTab
  useEffect(() => {
    if (pendingFormOpen) {
      if (pendingFormOpen.dateKey) {
        setSelectedDateKey(pendingFormOpen.dateKey);
      }
      handleOpenForm(pendingFormOpen.memory, pendingFormOpen.defaultAuthor, pendingFormOpen.defaultType);
      onClearPendingFormOpen?.();
    }
  }, [pendingFormOpen, onClearPendingFormOpen, setSelectedDateKey]);

  const handleMemoryPhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPhotos = files.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    setFormPhotos(prev => [...prev, ...newPhotos]);
    setMemoryPhotoError('');
    e.target.value = '';
  };

  const handleRemoveMemoryPhoto = (index: number) => {
    setFormPhotos(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploadingMemoryPhoto(true);
    setMemoryPhotoError('');

    try {
      const finalPhotoUrls: string[] = [];
      for (const p of formPhotos) {
        if (p.file) {
          const url = await uploadToCloudinary(p.file);
          finalPhotoUrls.push(url);
        } else {
          finalPhotoUrls.push(p.url);
        }
      }

      const finalTitle = formTitle.trim() || 'Kỷ niệm hôm nay';
      const idToSave = editingMemoryId || crypto.randomUUID();

      const newMemory: MemoryItem = {
        id: idToSave,
        date_key: selectedDateKey,
        type: formType,
        title: finalTitle,
        content: formContent.trim(),
        photo_urls: finalPhotoUrls,
        author: formAuthor,
        sticker: formSticker,
      };

      await onSaveMemory(newMemory);

      setShowAddForm(false);
      setFormPhotos([]);
    } catch (err: any) {
      console.error('Lỗi lưu kỷ niệm:', err);
      showAlert('Lỗi: ' + (err.message || 'Không thể lưu kỷ niệm'), 'Có lỗi xảy ra');
      setMemoryPhotoError(err.message || 'Lỗi lưu bài viết');
    } finally {
      setIsUploadingMemoryPhoto(false);
    }
  };

  // Logic Lịch
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const generateCalendarDays = () => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    const days = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      days.push({
        dayNumber: d,
        dateKey: formatDateKey(new Date(currentYear, currentMonth - 1, d)),
        isCurrentMonth: false
      });
    }

    for (let i = 1; i <= totalDaysInMonth; i++) {
      days.push({
        dayNumber: i,
        dateKey: formatDateKey(new Date(currentYear, currentMonth, i)),
        isCurrentMonth: true
      });
    }

    const remainingSlots = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        dayNumber: i,
        dateKey: formatDateKey(new Date(currentYear, currentMonth + 1, i)),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <motion.div
      key="memories"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Lưới lịch */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-[0_10px_30px_-15px_rgba(255,182,193,0.3)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-romantic text-2xl font-bold text-[#443333]">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-rose-50 text-stone-500 hover:text-rose-500 rounded-full transition cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-rose-50 text-stone-500 hover:text-rose-500 rounded-full transition cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Header Thứ */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, index) => (
            <div
              key={d}
              className={`text-xs font-bold py-1 ${index === 0 ? 'text-rose-400' : 'text-stone-400'}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Lưới ngày */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
          {calendarDays.map((item, idx) => {
            const dayMemories = memories[item.dateKey] || [];
            const hasSpecial = dayMemories.some(m => m.type === 'special');
            const hasJournal = dayMemories.some(m => m.type === 'journal');
            const isSelected = selectedDateKey === item.dateKey;
            const isToday = todayKey === item.dateKey;

            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedDateKey(item.dateKey);
                  setShowAddForm(false);
                }}
                className={`relative p-2 sm:p-2.5 rounded-2xl transition flex flex-col items-center justify-between min-h-[75px] sm:min-h-[85px] cursor-pointer ${isSelected
                  ? 'bg-rose-100/70 border-2 border-rose-300 ring-2 ring-rose-200/50'
                  : item.isCurrentMonth
                    ? 'bg-white/60 border border-rose-50 hover:bg-rose-50/50'
                    : 'bg-transparent text-stone-300'
                  }`}
              >
                <div className="flex items-center justify-center">
                  <span
                    className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${isToday
                      ? 'bg-sky-400 text-white font-bold shadow-sm'
                      : isSelected
                        ? 'text-rose-700 font-bold'
                        : item.isCurrentMonth
                          ? 'text-stone-600'
                          : 'text-stone-300'
                      }`}
                  >
                    {item.dayNumber}
                  </span>
                </div>

                <div className="my-1 flex gap-1 justify-center flex-wrap">
                  {hasSpecial && (
                    <div
                      className="w-5 h-5 rounded-full bg-rose-200 flex items-center justify-center text-rose-600 shadow-sm"
                      title="Kỷ niệm đặc biệt"
                    >
                      <BookHeart size={10} />
                    </div>
                  )}
                  {hasJournal && (
                    <div
                      className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100"
                      title="Nhật ký ngày thường"
                    >
                      <BookOpen size={10} />
                    </div>
                  )}
                  {dayMemories.length === 0 && item.isCurrentMonth && (
                    <div className="w-1 h-1 rounded-full bg-stone-200" />
                  )}
                </div>

                <span className="text-[9px] font-medium truncate w-full text-stone-400">
                  {dayMemories.length > 0 ? `${dayMemories.length} bài viết` : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Khung xem & Tạo mới */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-rose-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-rose-50 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Ngày đang chọn</span>
            <h3 className="font-romantic text-xl font-bold text-[#443333]">
              {selectedDateKey.split('-').reverse().join('-')}
            </h3>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition cursor-pointer"
          >
            <PlusCircle size={15} />
            Thêm bài viết
          </button>
        </div>

        {/* FORM NHẬP LIỆU */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              key="add-memory-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onSubmit={handleSubmit}
              className="space-y-4 pt-2 bg-rose-50/30 p-5 rounded-2xl border border-rose-100 overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <label className="text-xs font-semibold text-stone-500">Phân loại:</label>
                <label className="flex items-center gap-1 text-xs cursor-pointer text-stone-700">
                  <input
                    type="radio"
                    name="type"
                    checked={formType === 'journal'}
                    onChange={() => setFormType('journal')}
                    className="accent-amber-500"
                  />
                  Nhật ký thường thuiii
                </label>
                <label className="flex items-center gap-1 text-xs cursor-pointer text-rose-600 font-semibold">
                  <input
                    type="radio"
                    name="type"
                    checked={formType === 'special'}
                    onChange={() => setFormType('special')}
                    className="accent-rose-500"
                  />
                  Kỷ niệm mún lưu lại mãi mãi
                </label>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <label className="text-xs font-semibold text-stone-500">Người đăng:</label>
                <label className="flex items-center gap-1 text-xs cursor-pointer text-pink-600 font-medium">
                  <input
                    type="radio"
                    name="author"
                    checked={formAuthor === 'em'}
                    onChange={() => setFormAuthor('em')}
                    className="accent-pink-500"
                  />
                  Em
                </label>
                <label className="flex items-center gap-1 text-xs cursor-pointer text-indigo-500 font-medium">
                  <input
                    type="radio"
                    name="author"
                    checked={formAuthor === 'anh'}
                    onChange={() => setFormAuthor('anh')}
                    className="accent-indigo-500"
                  />
                  Anh
                </label>
                <label className="flex items-center gap-1 text-xs cursor-pointer text-rose-500 font-medium">
                  <input
                    type="radio"
                    name="author"
                    checked={formAuthor === 'both'}
                    onChange={() => setFormAuthor('both')}
                    className="accent-rose-500"
                  />
                  Cả 2 đứa 💕
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 block mb-1">Cảm xúc / Sticker:</label>
                <div className="flex gap-2 text-xl">
                  {['💖', '✨', '☕', '🌧️', '🌸', '🍕', '🐱'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormSticker(formSticker === emoji ? '' : emoji)}
                      className={`p-1.5 rounded-xl border transition cursor-pointer ${formSticker === emoji ? 'bg-rose-100 border-rose-300 scale-110' : 'bg-white border-rose-50 hover:bg-rose-50'
                        }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Tiêu đề (VD: Đi dạo phố, Xem phim...)"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                />
              </div>

              <div>
                <textarea
                  placeholder="Hôm nay có điều gì đặc biệt hong ta..."
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                />
              </div>

              {/* Upload ảnh */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-500 block">Hình ảnh kỷ niệm:</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {formPhotos.map((p, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-rose-100 group">
                      <img src={p.url} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveMemoryPhoto(idx)}
                        className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-rose-200 flex flex-col items-center justify-center text-rose-400 hover:bg-rose-50/50 hover:border-rose-300 transition cursor-pointer">
                    <Upload size={16} />
                    <span className="text-[9px] mt-0.5">Thêm ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMemoryPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {memoryPhotoError && (
                  <p className="text-xs text-rose-500 font-semibold">{memoryPhotoError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-full text-xs text-stone-400 hover:text-stone-600 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUploadingMemoryPhoto}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-rose-400 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-200 transition cursor-pointer disabled:opacity-50"
                >
                  {isUploadingMemoryPhoto ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check size={13} />
                      <span>{editingMemoryId ? 'Lưu chỉnh sửa' : 'Lưu lại'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* DANH SÁCH BÀI VIẾT TRONG NGÀY */}
        {(() => {
          const dayMemories = memories[selectedDateKey] || [];
          if (dayMemories.length > 0) {
            return (
              <div className="space-y-4 pt-2">
                {dayMemories.map(memo => (
                  <div
                    key={memo.id}
                    className="p-5 rounded-2xl bg-white border border-rose-100/70 shadow-sm space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold ${memo.author === 'em'
                            ? 'bg-pink-100 text-pink-600'
                            : memo.author === 'anh'
                              ? 'bg-indigo-50 text-indigo-500'
                              : 'bg-rose-100 text-rose-600'
                            }`}
                        >
                          {memo.author === 'em'
                            ? ''
                            : memo.author === 'anh'
                              ? ''
                              : 'Cả 2 đứa 💕'}
                        </span>
                        {memo.type === 'special' && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-500 border border-rose-100">
                            Khoảnh khắc đặc biệt
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenForm(memo)}
                          className="p-1.5 text-stone-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteMemory(memo.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-romantic text-2xl font-bold text-[#3d2f2f] pr-12 flex items-center gap-2">
                      {memo.title} {memo.sticker && <span className="text-2xl">{memo.sticker}</span>}
                    </h4>
                    <p className="text-sm leading-relaxed text-[#685757] whitespace-pre-line">
                      {memo.content}
                    </p>
                    {memo.photo_urls && memo.photo_urls.length > 0 && (
                      <div
                        className={`pt-2 grid gap-2 ${memo.photo_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                          }`}
                      >
                        {memo.photo_urls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`${memo.title} - ${idx}`}
                            className="rounded-2xl max-h-[400px] w-full object-contain bg-stone-50 border border-rose-50 cursor-pointer"
                            onClick={() => onViewPhoto(url)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          } else if (!showAddForm) {
            return (
              <div className="text-center py-6 text-stone-400 text-sm">
                <p>Ngày này chưa có mẩu chuyện nào được lưu lại.</p>
                <button
                  onClick={() => handleOpenForm()}
                  className="mt-2 text-xs text-rose-400 font-semibold hover:underline cursor-pointer"
                >
                  + Có tâm sự gì hongg nè
                </button>
              </div>
            );
          }
          return null;
        })()}
      </div>
    </motion.div>
  );
};

export default MemoriesTab;
