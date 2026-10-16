import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import type { DialogConfig } from '../../types';

export interface CustomDialogProps {
  dialogConfig: DialogConfig;
  onClose: () => void;
}

export const CustomDialog = ({ dialogConfig, onClose }: CustomDialogProps) => {
  return (
    <AnimatePresence>
      {dialogConfig.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-rose-100/50"
          >
            <h3 className="font-romantic text-2xl font-bold text-[#443333] mb-3 flex items-center gap-2">
              {dialogConfig.type === 'confirm' ? 'Thắc mắc chút 💭' : (dialogConfig.title || 'Thông báo 🔔')}
            </h3>
            <p className="text-[#685757] text-sm mb-8 leading-relaxed">
              {dialogConfig.message}
            </p>
            <div className="flex justify-end gap-3">
              {dialogConfig.type === 'confirm' && (
                <button
                  onClick={() => {
                    onClose();
                    dialogConfig.onCancel?.();
                  }}
                  className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-stone-500 hover:bg-stone-100 transition cursor-pointer"
                >
                  Thoy nghĩ lại 🥺
                </button>
              )}
              <button
                onClick={() => {
                  onClose();
                  dialogConfig.onConfirm?.();
                }}
                className={`px-6 py-2.5 rounded-2xl text-white text-xs font-semibold shadow-sm transition cursor-pointer flex items-center gap-1.5 ${
                  dialogConfig.type === 'confirm'
                    ? 'bg-rose-400 hover:bg-rose-500'
                    : 'bg-indigo-400 hover:bg-indigo-500'
                }`}
              >
                {dialogConfig.type === 'confirm' ? (
                  <>
                    <Check size={14} /> Xóa ik 😝
                  </>
                ) : (
                  'Đã hiểu'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomDialog;
