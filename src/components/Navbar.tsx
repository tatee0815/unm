import { Home, CalendarDays, BookHeart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  enableSecretTab: boolean;
}

export const Navbar = ({ activeTab, setActiveTab, enableSecretTab }: NavbarProps) => {
  return (
    <nav className="flex flex-wrap justify-center items-center gap-2 bg-white/70 backdrop-blur-md p-2 rounded-full border border-rose-100 shadow-sm max-w-fit mx-auto">
      <button
        onClick={() => setActiveTab('welcome')}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition cursor-pointer ${
          activeTab === 'welcome'
            ? 'bg-rose-400 text-white shadow-sm'
            : 'text-stone-500 hover:text-rose-400'
        }`}
      >
        <Home size={15} /> Lời chào
      </button>

      <button
        onClick={() => setActiveTab('memories')}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition cursor-pointer ${
          activeTab === 'memories'
            ? 'bg-rose-400 text-white shadow-sm'
            : 'text-stone-500 hover:text-rose-400'
        }`}
      >
        <CalendarDays size={15} /> Kỷ niệm
      </button>

      <button
        onClick={() => setActiveTab('em')}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition cursor-pointer ${
          activeTab === 'em'
            ? 'bg-pink-400 text-white shadow-sm'
            : 'text-stone-500 hover:text-pink-400'
        }`}
      >
        Her
      </button>

      <button
        onClick={() => setActiveTab('anh')}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition cursor-pointer ${
          activeTab === 'anh'
            ? 'bg-indigo-300 text-white shadow-sm'
            : 'text-stone-500 hover:text-indigo-400'
        }`}
      >
        Him
      </button>

      <button
        onClick={() => setActiveTab('us')}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition cursor-pointer ${
          activeTab === 'us'
            ? 'bg-rose-400 text-white shadow-sm'
            : 'text-stone-500 hover:text-rose-400'
        }`}
      >
        <BookHeart size={15} /> Chúng ta
      </button>

      {/* TAB BÍ MẬT ??? (HIỆU ỨNG NỔI BẬT LUNG LINH) */}
      {enableSecretTab && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: 1,
            boxShadow: [
              '0px 0px 0px rgba(245, 158, 11, 0)',
              '0px 0px 18px rgba(245, 158, 11, 0.7)',
              '0px 0px 0px rgba(245, 158, 11, 0)'
            ]
          }}
          transition={{
            scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
            boxShadow: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
          }}
          onClick={() => setActiveTab('secret')}
          className="relative flex items-center gap-1.5 px-5 py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 shadow-md cursor-pointer border border-amber-200"
        >
          <Sparkles size={14} className="animate-spin text-amber-200" />
          <span>???</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        </motion.button>
      )}
    </nav>
  );
};

export default Navbar;
