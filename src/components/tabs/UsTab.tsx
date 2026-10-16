import { motion } from 'framer-motion';
import { BookHeart, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import type { MemoriesRecord, MemoryItem } from '../../types';

export interface UsTabProps {
  memories: MemoriesRecord;
  onOpenMemoryForm: (dateKey?: string, existing?: MemoryItem, defaultAuthor?: 'em' | 'anh' | 'both', defaultType?: string) => void;
  onDeleteMemory: (id: string) => void;
  onViewPhoto: (url: string) => void;
}

export const UsTab = ({
  memories,
  onOpenMemoryForm,
  onDeleteMemory,
  onViewPhoto
}: UsTabProps) => {
  const bothMemoriesByDate = Object.entries(memories)
    .map(([dateKey, dayMemories]) => {
      const filtered = dayMemories.filter(m => m.author === 'both' && m.type === 'special');
      return [dateKey, filtered] as [string, MemoryItem[]];
    })
    .filter(([, dayMemories]) => dayMemories.length > 0)
    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());

  return (
    <motion.div
      key="us"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-romantic text-3xl sm:text-4xl text-[#443333] font-bold mb-1">
            Chuyện Của Chúng Mình
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            Dòng thời gian lưu giữ những kỉ niệm chung của cả 2 đứa 💕
          </p>
        </div>
        <button
          onClick={() => onOpenMemoryForm(undefined, undefined, 'both', 'special')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-400 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer self-start sm:self-auto shrink-0"
        >
          <PlusCircle size={15} />
          <span>Thêm kỷ niệm</span>
        </button>
      </div>

      {bothMemoriesByDate.length === 0 ? (
        <div className="text-center py-12 px-4 text-stone-400 bg-white/70 backdrop-blur-sm rounded-3xl border border-rose-100 shadow-sm space-y-3">
          <BookHeart size={36} className="mx-auto text-rose-300" />
          <p className="text-stone-500 text-sm">Chưa có kỉ niệm chung nào của cả hai đứa được lưu lại.</p>
          <button
            onClick={() => onOpenMemoryForm(undefined, undefined, 'both', 'special')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-rose-400 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <PlusCircle size={15} /> Viết kỷ niệm của cả 2 đứa 💕
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bothMemoriesByDate.map(([dateKey, dayMemories]) => (
            <div key={dateKey} className="relative pl-6 sm:pl-8 py-2">
              {/* Timeline line */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-rose-200"></div>
              {/* Timeline dot */}
              <div className="absolute left-[-4px] top-6 w-2.5 h-2.5 rounded-full bg-rose-400 ring-4 ring-rose-50"></div>

              <div className="mb-4">
                <span className="text-sm font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                  {dateKey.split('-').reverse().join('/')}
                </span>
              </div>

              <div className="space-y-4">
                {dayMemories.map(memo => (
                  <div key={memo.id} className="bg-white/80 backdrop-blur-sm border border-rose-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-600">
                          Cả 2 đứa 💕
                        </span>
                        {memo.type === 'special' && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-500 border border-rose-100">
                            Khoảnh khắc đặc biệt
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenMemoryForm(memo.date_key || dateKey, memo)}
                          className="p-1 text-stone-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteMemory(memo.id)}
                          className="p-1 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-romantic text-xl font-bold text-[#3d2f2f] mb-1 flex items-center gap-2">
                      {memo.title} {memo.sticker && <span className="text-xl">{memo.sticker}</span>}
                    </h4>
                    <p className="text-sm text-[#685757] whitespace-pre-line mb-3">
                      {memo.content}
                    </p>
                    {memo.photo_urls && memo.photo_urls.length > 0 && (
                      <div className={`grid gap-2 ${memo.photo_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {memo.photo_urls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`${memo.title} - ${idx}`}
                            className="rounded-xl w-full object-cover max-h-64 cursor-pointer"
                            onClick={() => onViewPhoto(url)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default UsTab;
