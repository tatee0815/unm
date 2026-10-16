import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export interface WelcomeTabProps {
  onGoToMemories: () => void;
}

export const WelcomeTab = ({ onGoToMemories }: WelcomeTabProps) => {
  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="text-center py-10 space-y-6 max-w-xl mx-auto"
    >
      <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400">
        <Sparkles size={28} />
      </div>
      <h1 className="font-romantic text-4xl sm:text-5xl text-[#443333] font-semibold">
        Xin chào, góc nhỏ của hai ta
      </h1>
      <p className="text-stone-500 leading-relaxed text-sm sm:text-base">
        Nơi đây là một trang giấy yên tĩnh để lưu lại những mẩu chuyện nhỏ,
        những ngày thời tiết đẹp và những điều giản dị mà chúng mình cùng trải qua.
      </p>
      <div className="pt-4 flex justify-center gap-4">
        <button
          onClick={onGoToMemories}
          className="px-6 py-2.5 rounded-full bg-rose-400 text-white text-xs sm:text-sm font-medium hover:bg-rose-500 transition shadow-sm cursor-pointer"
        >
          🎶✨ Tò mò quá ta ơiiiii 🌟💖
        </button>
      </div>
    </motion.div>
  );
};

export default WelcomeTab;
