import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import {
  Pencil,
  PlusCircle,
  Upload,
  Trash2,
  X,
  Check,
  CalendarDays,
  Smile,
  Frown,
  ChevronLeft,
  ChevronRight,
  Gift,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { AvatarAdjusterModal } from '../modals/AvatarAdjusterModal';
import type { ProfileData, MemoriesRecord } from '../../types';

const isoToVn = (iso: string): string => {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return iso;
};

const parseToIso = (text: string): string | null => {
  const clean = text.trim();
  // Khớp định dạng DD/MM/YYYY hoặc DD-MM-YYYY hoặc DD.MM.YYYY
  const dmy = clean.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10);
    const year = parseInt(dmy[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day <= daysInMonth) {
        const dd = String(day).padStart(2, '0');
        const mm = String(month).padStart(2, '0');
        return `${year}-${mm}-${dd}`;
      }
    }
    return null;
  }
  // Khớp định dạng YYYY-MM-DD
  const ymd = clean.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (ymd) {
    const year = parseInt(ymd[1], 10);
    const month = parseInt(ymd[2], 10);
    const day = parseInt(ymd[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day <= daysInMonth) {
        const dd = String(day).padStart(2, '0');
        const mm = String(month).padStart(2, '0');
        return `${year}-${mm}-${dd}`;
      }
    }
    return null;
  }
  return null;
};

const CustomDatePicker = ({
  value,
  onChange,
  className
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState(() => isoToVn(value));
  const [inputError, setInputError] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const [currentMonth, setCurrentMonth] = useState(() => {
    return value ? new Date(value) : new Date();
  });
  const popupRef = useRef<HTMLDivElement>(null);
  const [todayDate] = useState(() => new Date());

  // Đồng bộ khi value từ bên ngoài thay đổi (chuẩn React pattern)
  if (value !== prevValue) {
    setPrevValue(value);
    setInputText(isoToVn(value));
    setInputError(false);
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentMonth(d);
      }
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
    onChange(localISOTime);
    setInputText(isoToVn(localISOTime));
    setInputError(false);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

    const parsedIso = parseToIso(text);
    if (parsedIso) {
      setInputError(false);
      onChange(parsedIso);
      const d = new Date(parsedIso);
      if (!isNaN(d.getTime())) {
        setCurrentMonth(d);
      }
    }
  };

  const handleInputBlur = () => {
    if (!inputText.trim()) {
      setInputText(isoToVn(value));
      setInputError(false);
      return;
    }
    const parsedIso = parseToIso(inputText);
    if (parsedIso) {
      setInputText(isoToVn(parsedIso));
      setInputError(false);
      onChange(parsedIso);
    } else {
      setInputError(true);
      setTimeout(() => {
        setInputText(isoToVn(value));
        setInputError(false);
      }, 1800);
    }
  };

  const today = todayDate;

  return (
    <div className={`relative ${className || ''}`} ref={popupRef}>
      <div className="flex items-center gap-1.5 w-full">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="DD/MM/YYYY (VD: 25/12/2024)"
            className={`w-full px-3 py-2 rounded-xl bg-sky-50/40 border text-xs font-semibold text-stone-700 transition focus:outline-none focus:ring-2 ${
              inputError
                ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30 text-rose-700'
                : 'border-sky-100 focus:ring-sky-200 focus:border-sky-300'
            }`}
          />
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
            isOpen
              ? 'bg-sky-400 text-white border-sky-400 shadow-sm'
              : 'bg-sky-50/60 hover:bg-sky-100 text-sky-600 border-sky-100'
          }`}
          title="Chọn ngày từ lịch"
        >
          <CalendarDays size={16} />
        </button>
      </div>

      {inputError && (
        <span className="text-[10px] text-rose-500 mt-1 block">
          Ngày không hợp lệ (hãy nhập ngày/tháng/năm, VD: 20/10/2024)
        </span>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 p-4 bg-white rounded-2xl shadow-xl border border-sky-100 z-50 w-72 origin-top-left"
          >
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-sky-50 text-sky-600 transition cursor-pointer">
                <ChevronLeft size={18} />
              </button>
              <span className="font-semibold text-stone-700 text-sm">
                Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
              </span>
              <button type="button" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-sky-50 text-sky-600 transition cursor-pointer">
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-bold text-stone-400">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {blanks.map(b => <div key={`blank-${b}`} className="h-8"></div>)}
              {days.map(d => {
                const isSelected = value &&
                  new Date(value).getDate() === d &&
                  new Date(value).getMonth() === currentMonth.getMonth() &&
                  new Date(value).getFullYear() === currentMonth.getFullYear();

                const isToday = today.getDate() === d &&
                  today.getMonth() === currentMonth.getMonth() &&
                  today.getFullYear() === currentMonth.getFullYear();

                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleSelectDay(d)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer mx-auto
                      ${isSelected
                        ? 'bg-sky-400 text-white shadow-md font-bold'
                        : isToday
                          ? 'text-sky-500 font-bold border border-sky-200'
                          : 'text-stone-600 hover:bg-sky-50'
                      }
                    `}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Component ProfileCard có tính năng Chỉnh Sửa
const ProfileCard = ({
  profileKey,
  profile,
  badgeColor,
  onSave,
  onViewPhoto,
  memories,
  onSaveMilestone,
  onDeleteMilestone,
  showConfirm
}: {
  profileKey: 'em' | 'anh';
  profile: ProfileData;
  badgeColor: string;
  onSave: (key: 'em' | 'anh', updated: ProfileData) => Promise<void>;
  onViewPhoto: (url: string) => void;
  memories?: MemoriesRecord;
  onSaveMilestone?: (milestone: { id: string; date: string; title?: string; text: string; photos: string[] }) => Promise<void>;
  onDeleteMilestone?: (id: string) => Promise<void>;
  showConfirm?: (message: string, onConfirm: () => void, title?: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formNickname, setFormNickname] = useState(profile.nickname);
  const [formSubtitle, setFormSubtitle] = useState(profile.subtitle);
  const [formAvatar, setFormAvatar] = useState(profile.avatar);
  const [formLikes, setFormLikes] = useState(profile.likes.join('\n'));
  const [formDislikes, setFormDislikes] = useState(profile.dislikes.join('\n'));
  const [formNotes, setFormNotes] = useState(profile.notes);
  const [formMilestones, setFormMilestones] = useState(profile.milestones?.join('\n') || '');
  const [formMilestonePhotos, setFormMilestonePhotos] = useState<{ url: string, file?: File }[]>(
    profile.milestone_photos?.map(url => ({ url })) || []
  );
  const [isEditingMilestones, setIsEditingMilestones] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingMilestones, setIsSavingMilestones] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [avatarError, setAvatarError] = useState('');
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [formMilestoneDate, setFormMilestoneDate] = useState<string>('');
  const [formMilestoneTitle, setFormMilestoneTitle] = useState<string>('');

  // Danh sách kỷ niệm khó quên: đồng bộ từ cả memories và profile.milestones
  const authorMilestones = (() => {
    const list: { id: string; title?: string; text: string; timestamp: string; photos: string[] }[] = [];
    const seenIds = new Set<string>();
    const nonSpecialIds = new Set<string>();

    if (memories) {
      Object.values(memories).forEach(dayList => {
        dayList.forEach(m => {
          if (m.type !== 'special') {
            nonSpecialIds.add(m.id);
            return;
          }
          if (m.author === profileKey) {
            seenIds.add(m.id);
            list.push({
              id: m.id,
              title: m.title || '',
              text: m.content || m.title || '',
              timestamp: m.created_at || (m.date_key ? `${m.date_key}T00:00:00.000Z` : ''),
              photos: m.photo_urls || []
            });
          }
        });
      });
    }

    if (profile.milestones) {
      profile.milestones.forEach((mStr, idx) => {
        try {
          const mData = JSON.parse(mStr);
          if (mData && mData.id && !seenIds.has(mData.id) && !nonSpecialIds.has(mData.id)) {
            seenIds.add(mData.id);
            list.push({
              id: mData.id,
              title: mData.title || '',
              text: mData.text || '',
              timestamp: mData.timestamp || '',
              photos: mData.photos || []
            });
          }
        } catch {
          const legacyId = `legacy-${idx}`;
          if (!seenIds.has(legacyId) && !nonSpecialIds.has(legacyId)) {
            seenIds.add(legacyId);
            list.push({
              id: legacyId,
              title: '',
              text: mStr,
              timestamp: '',
              photos: []
            });
          }
        }
      });
    }

    list.sort((a, b) => {
      let tA = 0, tB = 0;
      try { tA = new Date(a.timestamp).getTime(); } catch { }
      try { tB = new Date(b.timestamp).getTime(); } catch { }
      return tB - tA;
    });

    return list;
  })();

  const handleDeleteMilestone = (idToDelete: string) => {
    const doDelete = async () => {
      if (onDeleteMilestone) {
        await onDeleteMilestone(idToDelete);
      } else {
        const newArr = (profile.milestones || []).filter(mStr => {
          try { return JSON.parse(mStr).id !== idToDelete; } catch { return true; }
        });
        await onSave(profileKey, { ...profile, milestones: newArr });
      }
    };

    if (showConfirm) {
      showConfirm('Bạn có chắc chắn muốn xóa kỷ niệm này không?', doDelete, 'Xóa kỷ niệm');
    } else {
      if (confirm('Bạn có chắc chắn muốn xóa kỷ niệm này không?')) {
        doDelete();
      }
    }
  };

  const handleEditClick = () => {
    setFormNickname(profile.nickname);
    setFormSubtitle(profile.subtitle);
    setFormAvatar(profile.avatar);
    setFormLikes(profile.likes.join('\n'));
    setFormDislikes(profile.dislikes.join('\n'));
    setFormNotes(profile.notes);
    setFormMilestones(profile.milestones?.join('\n') || '');
    setFormMilestonePhotos(profile.milestone_photos?.map(url => ({ url })) || []);
    setAvatarError('');
    setRawImageForCrop(null);
    setIsEditing(true);
  };

  const handleAvatarFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageForCrop(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleConfirmCrop = async (croppedBlob: Blob) => {
    setAvatarBlob(croppedBlob);
    const url = URL.createObjectURL(croppedBlob);
    setFormAvatar(url);
    setRawImageForCrop(null);
    setAvatarError('');
  };

  const handleRemoveAvatar = () => {
    setFormAvatar('');
    setAvatarBlob(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setAvatarError('');

    let finalAvatarUrl = formAvatar.trim();

    try {
      if (avatarBlob) {
        finalAvatarUrl = await uploadToCloudinary(avatarBlob);
      }

      const likesList = formLikes
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      const dislikesList = formDislikes
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      const milestonesList = formMilestones
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const updated: ProfileData = {
        id: profileKey,
        nickname: formNickname.trim() || (profileKey === 'em' ? '' : ''),
        subtitle: formSubtitle.trim(),
        avatar: finalAvatarUrl,
        likes: likesList,
        dislikes: dislikesList,
        notes: formNotes.trim(),
        milestones: milestonesList,
      };

      await onSave(profileKey, updated);
      setAvatarBlob(null);
      setIsEditing(false);
    } catch (err: any) {
      setAvatarError(err.message || 'Lỗi lưu thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMilestones = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingMilestones(true);
    try {
      // Tải lên đồng loạt tất cả các ảnh mới song song bằng Promise.all
      const finalPhotos = await Promise.all(
        formMilestonePhotos.map(async (p) => {
          if (p.file) {
            return await uploadToCloudinary(p.file);
          }
          return p.url;
        })
      );

      if (!formMilestones.trim() && !formMilestoneTitle.trim() && finalPhotos.length === 0) {
        setIsEditingMilestones(false);
        return;
      }

      const milestoneId = editingMilestoneId && editingMilestoneId !== 'new'
        ? editingMilestoneId
        : crypto.randomUUID();
      const milestoneDate = formMilestoneDate || new Date().toISOString().split('T')[0];

      if (onSaveMilestone) {
        await onSaveMilestone({
          id: milestoneId,
          date: milestoneDate,
          title: formMilestoneTitle.trim(),
          text: formMilestones.trim(),
          photos: finalPhotos
        });
      } else {
        const finalTimestamp = new Date(milestoneDate).toISOString();
        const currentMilestones = [...(profile.milestones || [])];
        const newMilestone = {
          id: milestoneId,
          title: formMilestoneTitle.trim(),
          text: formMilestones.trim(),
          timestamp: finalTimestamp,
          photos: finalPhotos
        };
        const idx = currentMilestones.findIndex(mStr => {
          try { return JSON.parse(mStr).id === milestoneId; } catch { return false; }
        });
        if (idx !== -1) {
          currentMilestones[idx] = JSON.stringify(newMilestone);
        } else {
          currentMilestones.unshift(JSON.stringify(newMilestone));
        }
        await onSave(profileKey, { ...profile, milestones: currentMilestones });
      }

      setIsEditingMilestones(false);
      setFormMilestoneTitle('');
      setFormMilestones('');
      setFormMilestonePhotos([]);
      setEditingMilestoneId(null);
    } catch (err: any) {
      console.error('Lỗi lưu kỷ niệm đáng nhớ:', err);
    } finally {
      setIsSavingMilestones(false);
    }
  };

  if (isEditing) {
    return (
      <>
        {rawImageForCrop && (
          <AvatarAdjusterModal
            imageSrc={rawImageForCrop}
            onCancel={() => setRawImageForCrop(null)}
            onConfirm={handleConfirmCrop}
            isUploading={false}
          />
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-[0_10px_30px_-15px_rgba(255,182,193,0.3)] space-y-5"
        >
          <div className="flex items-center justify-between border-b border-rose-50 pb-3">
            <h3 className="font-romantic text-2xl font-bold text-[#443333]">
              Chỉnh sửa góc nhỏ của 🌸 {profile.nickname || (profileKey === 'em' ? 'Em' : 'Anh')} 🍀
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormAvatar(profile.avatar);
                setAvatarBlob(null);
                setFormNickname(profile.nickname);
                setFormSubtitle(profile.subtitle);
                setFormLikes(profile.likes.join('\n'));
                setFormDislikes(profile.dislikes.join('\n'));
                setFormNotes(profile.notes);
                setFormMilestones(profile.milestones?.join('\n') || '');
              }}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1">Gọi tui là </label>
              <input
                type="text"
                value={formNickname}
                onChange={e => setFormNickname(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-xl bg-white border border-rose-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1">Mô tả ngắn</label>
              <input
                type="text"
                placeholder="Ví dụ: Cô gái thích trà sữa ít đường..."
                value={formSubtitle}
                onChange={e => setFormSubtitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white border border-rose-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>
          </div>

          {/* Mục ảnh đại diện: Chỉ tải lên từ máy + Căn chỉnh khung hình, KHÔNG dùng URL */}
          <div className="bg-rose-50/30 p-4 rounded-2xl border border-rose-100/70 space-y-3">
            <label className="block text-xs font-semibold text-stone-600">
              Ảnh của tui nèeee
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                {formAvatar ? (
                  <img
                    src={formAvatar}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-rose-200 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-rose-100 ring-4 ring-rose-200 flex items-center justify-center text-xl font-bold text-rose-500">
                    {formNickname ? formNickname.charAt(0) : '?'}
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-400 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer">
                    <Upload size={13} />
                    <span>Ảnh này hong hợp</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </label>
                  {formAvatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-3 py-1.5 rounded-full text-xs text-stone-400 hover:text-red-500 transition cursor-pointer"
                    >
                      Gỡ ảnh
                    </button>
                  )}
                </div>
              </div>
            </div>
            {avatarError && (
              <p className="text-[11px] text-red-500">{avatarError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-pink-600 mb-1">
                Những điều tui iu thích (mỗi điều 1 dòng)  💖
              </label>
              <textarea
                rows={4}
                placeholder="Trà hoa cúc&#10;Ngắm hoàng hôn&#10;Mèo con"
                value={formLikes}
                onChange={e => setFormLikes(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-pink-50/30 border border-pink-100 text-xs focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1">
                Những điều hong thích (mỗi điều 1 dòng)  💔
              </label>
              <textarea
                rows={4}
                placeholder="Vị đắng&#10;Nơi ồn ào đông đúc"
                value={formDislikes}
                onChange={e => setFormDislikes(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-stone-50/50 border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-stone-200 resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-700 mb-1">Lưu ý nhỏ / Ghi chú</label>
            <textarea
              rows={2}
              placeholder="Rất dễ xúc động trước những hành động nhỏ..."
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-amber-50/40 border border-amber-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-full text-xs text-stone-400 hover:text-stone-600 transition cursor-pointer"
            >
              Hong được rùi 💧
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-rose-400 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <Check size={14} /> {isSaving ? 'Đang lưu... ><' : 'Xongggg 🐰'}
            </button>
          </div>
        </form>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-[0_10px_30px_-15px_rgba(255,182,193,0.3)] space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.nickname}
                className="w-28 h-28 rounded-full object-cover ring-4 ring-rose-100 shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-rose-50 ring-4 ring-rose-100 flex items-center justify-center text-3xl font-romantic font-bold text-rose-400 shadow-md">
                {profile.nickname ? profile.nickname.charAt(0) : '?'}
              </div>
            )}
            <div className="space-y-1">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
                Góc riêng
              </span>
              <h2 className="font-romantic text-3xl font-semibold text-[#443333] pt-1">
                {profile.nickname || (profileKey === 'em' ? '' : '')}
              </h2>
              <p className="text-sm text-stone-400 italic">
                {profile.subtitle || 'Chưa có mô tả'}
              </p>
            </div>
          </div>

          <button
            onClick={handleEditClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition cursor-pointer self-center sm:self-start"
          >
            <Pencil size={13} /> Mún thay đổi gì đó ?
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100/60">
            <h3 className="font-medium text-rose-500 flex items-center gap-2 mb-3 text-sm">
              <Smile size={18} /> Những điều tui thích nèee 😊
            </h3>
            {profile.likes.length > 0 ? (
              <ul className="space-y-2 text-sm text-[#5c4a4a]">
                {profile.likes.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-400 italic">Chưa thêm sở thích nào</p>
            )}
          </div>

          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
            <h3 className="font-medium text-stone-500 flex items-center gap-2 mb-3 text-sm">
              <Frown size={18} /> Những điều hong thích nhé 😒
            </h3>
            {profile.dislikes.length > 0 ? (
              <ul className="space-y-2 text-sm text-stone-600">
                {profile.dislikes.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-400 italic">Chưa thêm điều không thích</p>
            )}
          </div>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 text-xs text-amber-700 leading-relaxed">
          <strong>Lưu ý nhỏ:</strong> {profile.notes || 'Chưa có ghi chú đặc biệt'}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-[0_10px_30px_-15px_rgba(135,206,235,0.3)] space-y-4">
        <div className="flex items-center justify-between border-b border-sky-50 pb-3">
          <h3 className="font-romantic text-2xl text-sky-600 font-bold flex items-center gap-2">
            <Gift size={24} /> Những kỷ niệm khó quên của tuiii
          </h3>
          {!isEditingMilestones && (
            <button
              onClick={() => {
                setFormMilestoneTitle('');
                setFormMilestones('');
                setFormMilestonePhotos([]);
                setFormMilestoneDate(new Date().toISOString().split('T')[0]);
                setEditingMilestoneId('new');
                setIsEditingMilestones(true);
              }}
              className="text-xs font-semibold text-sky-500 hover:text-sky-600 flex items-center gap-1 transition cursor-pointer"
            >
              <PlusCircle size={12} /> Thêm kỷ niệm
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isEditingMilestones ? (
            <motion.form
              key="milestone-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              onSubmit={handleSaveMilestones}
              className="space-y-4 pt-2 overflow-hidden"
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-sky-600 mb-1">
                    Ngày diễn ra sự kiện (nhập tay hoặc chọn lịch) 📅
                  </label>
                  <CustomDatePicker
                    value={formMilestoneDate}
                    onChange={(val) => setFormMilestoneDate(val)}
                    className="w-full sm:w-72"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sky-600 mb-1">
                    Tiêu đề kỷ niệm ✨
                  </label>
                  <input
                    type="text"
                    placeholder="Tiêu đề (VD: Đi xem phim cùng nhau, Lần đầu gặp mặt...)"
                    value={formMilestoneTitle}
                    onChange={e => setFormMilestoneTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-sky-50/40 border border-sky-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 text-stone-800 placeholder:text-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sky-600 mb-1">
                    Kỉ niệm đó như nào đó? 💌
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Kể chi tiết nghe đi nè.."
                    value={formMilestones}
                    onChange={e => setFormMilestones(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-sky-50/40 border border-sky-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200 resize-none leading-relaxed text-stone-800 placeholder:text-stone-400"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-sky-600">Có hình ảnh hongg? 📸</label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-600 text-xs font-semibold transition cursor-pointer">
                    <ImageIcon size={14} /> Có ảnh nhaaa
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const newPhotos = files.map(file => ({
                          url: URL.createObjectURL(file),
                          file
                        }));
                        setFormMilestonePhotos(prev => [...prev, ...newPhotos]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                {formMilestonePhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formMilestonePhotos.map((photo, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden shadow-sm">
                        <img src={photo.url} className="w-16 h-16 sm:w-20 sm:h-20 object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormMilestonePhotos(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingMilestones(false);
                    setFormMilestoneTitle('');
                    setFormMilestones(profile.milestones?.join('\n') || '');
                    setFormMilestonePhotos(profile.milestone_photos?.map(url => ({ url })) || []);
                  }}
                  className="px-4 py-2 rounded-full text-xs text-stone-400 hover:text-stone-600 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingMilestones}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-sky-400 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  <Check size={14} /> {isSavingMilestones ? 'Đang lưu...' : 'Lưu kỷ niệm'}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="milestone-display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 pt-2"
            >
              {authorMilestones && authorMilestones.length > 0 ? (
                <div className="space-y-4">
                  {authorMilestones.map((mData) => {
                    return (
                      <div key={mData.id} className="relative group bg-sky-50/40 p-4 rounded-2xl border border-sky-100/50">
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => {
                              setEditingMilestoneId(mData.id);
                              setFormMilestoneTitle(mData.title || '');
                              setFormMilestones(mData.text);
                              setFormMilestonePhotos(mData.photos ? mData.photos.map((url: string) => ({ url })) : []);
                              setFormMilestoneDate(mData.timestamp ? new Date(mData.timestamp).toISOString().split('T')[0] : '');
                              setIsEditingMilestones(true);
                            }}
                            className="text-stone-400 hover:text-sky-500 transition cursor-pointer p-1"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteMilestone(mData.id)}
                            className="text-stone-400 hover:text-rose-500 transition cursor-pointer p-1"
                            title="Xóa"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="flex flex-col gap-2 pr-16">
                          {mData.timestamp && (
                            <div className="inline-flex items-center gap-1.5 bg-sky-50/80 text-sky-600 px-3 py-1 rounded-full font-semibold text-xs self-start shadow-sm border border-sky-100/60">
                              <CalendarDays size={14} className="text-sky-500" />
                              {new Date(mData.timestamp).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                          {mData.title && (
                            <h4 className="font-semibold text-base sm:text-lg text-stone-800 tracking-tight">
                              {mData.title}
                            </h4>
                          )}
                          {mData.text && mData.text !== mData.title && (
                            <p className="text-sm sm:text-base text-[#4a3b3b] leading-relaxed whitespace-pre-wrap">
                              {mData.text}
                            </p>
                          )}
                          {mData.text && !mData.title && (
                            <p className="text-base text-[#4a3b3b] leading-relaxed whitespace-pre-wrap">
                              {mData.text}
                            </p>
                          )}
                        </div>
                        {mData.photos && mData.photos.length > 0 && (
                          <div className="flex flex-wrap gap-3 mt-3">
                            {mData.photos.map((url: string, i: number) => (
                              <img
                                key={i}
                                src={url}
                                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl shadow-sm cursor-pointer hover:scale-105 transition"
                                onClick={() => onViewPhoto(url)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">Chưa có kỷ niệm nào được ghi lại</p>
              )}

              {profile.milestone_photos && profile.milestone_photos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-sky-50">
                  <h4 className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-3">Kỷ niệm cũ</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {profile.milestone_photos.map((url, idx) => (
                      <div key={idx} className="relative rounded-2xl overflow-hidden shadow-sm aspect-square cursor-pointer" onClick={() => onViewPhoto(url)}>
                        <img src={url} className="absolute inset-0 w-full h-full object-cover hover:scale-110 transition duration-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
export const ProfileTab = ProfileCard;
export default ProfileTab;
