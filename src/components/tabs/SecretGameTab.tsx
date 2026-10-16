import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Coffee,
  Lock,
  CheckCircle2,
  PartyPopper,
  ArrowRight,
  HelpCircle,
  Trophy,
  Stars,
  Mail,
  RotateCcw,
  Sparkles,
  Gift,
  X,
  ZoomIn,
  Ticket,
  Eye,
  FastForward,
  Play
} from 'lucide-react';

// Nhập các tài nguyên ảnh kỷ niệm có sẵn trong src/assets/
import fbDatingImg from '../../assets/facebook-dating.jpg';
import messengerImg from '../../assets/messenger.jpg';
import huggingImg from '../../assets/hugging.jpg';
import phieu1Img from '../../assets/phieu1.jpg';
import phieu2Img from '../../assets/phieu2.jpg';
import phieu3Img from '../../assets/phieu3.jpg';

// ==========================================
// TYPES & DATA CHO MINI GAME TAB BÍ MẬT ("???")
// "HÀNH TRÌNH TỪ MÀN ẢO BƯỚC RA ĐỜI THỰC"
// ==========================================

export interface QuizOption {
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface SecretStation {
  id: number;
  stationNum: string;
  pieceLabel: string;
  milestone: string;
  title: string;
  subtitle: string;
  imageSrc?: string;
  themeColor: {
    gradient: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    accent: string;
    lightBg: string;
    glow: string;
    ring: string;
  };
  question: string;
  hint: string;
  options: QuizOption[];
  successCommentary: string;
  poeticQuote: string;
}

// Cấu hình ảnh dễ dàng tuỳ biến hoặc thay thế
export interface PuzzleImagesConfig {
  fbDating?: string;
  messenger?: string;
  hugging?: string;
  cafeDate?: string;
}

const DEFAULT_PUZZLE_IMAGES: PuzzleImagesConfig = {
  fbDating: fbDatingImg,
  messenger: messengerImg,
  hugging: huggingImg,
  cafeDate: undefined
};

// 3 Phiếu bé ngoan tặng đối phương
export interface PhieuBeNgoanItem {
  id: number;
  title: string;
  badge: string;
  desc: string;
  image: string;
}

const PHIEU_BE_NGOAN: PhieuBeNgoanItem[] = [
  {
    id: 1,
    title: 'Phiếu Bé Ngoan #01',
    badge: 'Đặc quyền #1',
    desc: 'Dành tặng người dễ thương nhất hôm nay',
    image: phieu1Img
  },
  {
    id: 2,
    title: 'Phiếu Bé Ngoan #02',
    badge: 'Đặc quyền #2',
    desc: 'Có giá trị sử dụng mãi mãi',
    image: phieu2Img
  },
  {
    id: 3,
    title: 'Phiếu Bé Ngoan #03',
    badge: 'Đặc quyền #3',
    desc: 'Tùy ý kích hoạt bất cứ lúc nào',
    image: phieu3Img
  }
];

const createSecretStations = (images: PuzzleImagesConfig = DEFAULT_PUZZLE_IMAGES): SecretStation[] => [
  {
    id: 1,
    stationNum: 'Trạm 01',
    pieceLabel: 'Mảnh #1',
    milestone: 'Khởi nguồn',
    title: 'Chiếc Quẹt Match Định Mệnh',
    subtitle: 'Khoảnh khắc hai tần số bắt trúng nhau trên FB Dating',
    imageSrc: images.fbDating,
    themeColor: {
      gradient: 'from-rose-400 via-pink-400 to-rose-500',
      border: 'border-rose-200/80',
      badgeBg: 'bg-rose-100 text-rose-600',
      badgeText: 'text-rose-500',
      accent: 'text-rose-500',
      lightBg: 'bg-rose-50/70',
      glow: 'rgba(244, 63, 94, 0.35)',
      ring: 'ring-rose-300'
    },
    question: 'Đố cậu biết hai đứa mình đã tìm thấy nhau bằng cách nào dạ? ✨',
    hint: 'Nhớ lại xem nơi đầu tiên hai chiếc "tần số" này vô tình va vào nhau là ở đâu nè...',
    options: [
      {
        text: 'Vô tình chạm mặt giữa dòng người ngoài phố rồi trúng tiếng sét ái tình.',
        isCorrect: false,
        feedback: 'Kịch bản phim Hàn Quốc lãng mạn quá gòi, ngoài đời chúng mình bắt đầu theo cách khác cơ! Thử lại nha 🙈'
      },
      {
        text: 'Được một người bạn thân làm "ông mai bà mối" mát tay kết nối hai đứa.',
        isCorrect: false,
        feedback: 'Hông có ông mai bà mối nào ở đây hết á, tự hai đứa mình "bắt sóng" được nhau đó! Đoán lại nè 😜'
      },
      {
        text: 'Một lượt quẹt match định mệnh trên FB Dating giữa hàng triệu người lướt qua.',
        isCorrect: true,
        feedback: 'Chính xác 100%! Một cái quẹt nhẹ ngỡ tình cờ mà hóa ra là mở đầu cho cả một hành trình ngọt ngào ✨'
      },
      {
        text: 'Vô tình cmt dạo chung một bài viết trên mạng rồi inbox làm quen.',
        isCorrect: false,
        feedback: 'Cũng là trên mạng nhưng hông phải cmt dạo đâu nè, có một nơi xịn xò hơn nhiều! Chọn lại nha 💌'
      }
    ],
    successCommentary: 'Giữa hàng triệu người lướt qua mỗi ngày, chiếc quẹt định mệnh trên FB Dating đã kết nối hai mảnh ghép lại với nhau.',
    poeticQuote: 'Có những cuộc gặp gỡ ngỡ tình cờ trên màn hình, nhưng hóa ra là món quà đẹp nhất của duyên số bước ra đời thực.'
  },
  {
    id: 2,
    stationNum: 'Trạm 02',
    pieceLabel: 'Mảnh #2',
    milestone: 'Gắn kết',
    title: 'Những Đêm Gõ Phím Thấu Sáng',
    subtitle: 'Nhịp rep tin nhắn, sticker vô tri và những câu chuyện không hồi kết',
    imageSrc: images.messenger,
    themeColor: {
      gradient: 'from-indigo-400 via-purple-400 to-indigo-500',
      border: 'border-indigo-200/80',
      badgeBg: 'bg-indigo-100 text-indigo-600',
      badgeText: 'text-indigo-500',
      accent: 'text-indigo-500',
      lightBg: 'bg-indigo-50/70',
      glow: 'rgba(99, 102, 241, 0.35)',
      ring: 'ring-indigo-300'
    },
    question: "Dấu hiệu rõ nhất cho thấy hai đứa đã bắt đầu 'dính cựa' từ những lần nhắn tin là gì?",
    hint: 'Nghĩ về những đêm mắt đã díp lại nhưng bàn tay vẫn gõ phím lia lịa...',
    options: [
      {
        text: 'Kho meme & sticker vô tri gửi cho nhau nhiều hơn cả tin nhắn nghiêm túc.',
        isCorrect: false,
        feedback: 'Meme vô tri thì chuẩn rùi, nhưng còn nhiều dấu hiệu ngọt ngào hơn thế nữa! 🐶'
      },
      {
        text: "Do cách nói chuyện của cả 2 quá hợp cạ nhauuu",
        isCorrect: false,
        feedback: 'Cũng đúng nhưng mà đó chưa phải là tất cả í 🌙'
      },
      {
        text: "Cảm giác hồi hộp, mong chờ mỗi khi thấy màn hình hiện 'đang soạn tin nhắn...'.",
        isCorrect: false,
        feedback: 'Cảm giác này đúng là xao xuyến ghê, nhưng hãy nhìn kỹ đáp án cuối cùng xem! 💓'
      },
      {
        text: 'Tất cả những điều đáng yêu ở trên đều chuẩn không trượt phát nào!',
        isCorrect: true,
        feedback: 'Chuẩn 1000%! Những dòng tin nhắn đã làm khoảng cách màn hình thành hư vô 💌'
      }
    ],
    successCommentary: 'Những dòng tin nhắn không chỉ rút ngắn khoảng cách màn hình mà còn mở lối vào thế giới nội tâm của nhau.',
    poeticQuote: 'Đêm muộn thành phố ngủ say, chỉ còn ánh sáng màn hình và nhịp tim hai đứa chung một điệu.'
  },
  {
    id: 3,
    stationNum: 'Trạm 03',
    pieceLabel: 'Mảnh #3',
    milestone: 'Thấu hiểu',
    title: 'Tần Số Đồng Điệu & An Tâm Sẻ Chia',
    subtitle: 'Sự bình yên khi trải lòng, góc nhìn cuộc sống và cảm giác được thấu hiểu',
    imageSrc: images.hugging,
    themeColor: {
      gradient: 'from-amber-400 via-orange-400 to-amber-500',
      border: 'border-amber-200/80',
      badgeBg: 'bg-amber-100 text-amber-700',
      badgeText: 'text-amber-600',
      accent: 'text-amber-600',
      lightBg: 'bg-amber-50/70',
      glow: 'rgba(245, 158, 11, 0.35)',
      ring: 'ring-amber-300'
    },
    question: 'Điều gì làm cho những buổi tâm sự, chia sẻ quan điểm sống của hai đứa trở nên đặc biệt và an tâm nhất?',
    hint: 'Cảm giác bình yên khi được cởi bỏ mọi lớp phòng bị và trải lòng...',
    options: [
      {
        text: 'Có thể thoải mái kể về những vụng về, con người thật mà không sợ bị phán xét.',
        isCorrect: false,
        feedback: 'Rất đúng luôn, nhưng hãy tìm đáp án chứa đựng trọn vẹn cảm xúc nhất nà 🧸'
      },
      {
        text: 'Sự đồng điệu kỳ lạ về góc nhìn, giá trị sống và cảm giác được lắng nghe chân thành.',
        isCorrect: false,
        feedback: 'Đồng điệu về tư duy là chìa khóa vàng! Nhưng còn nhiều điều hơn thế nữa 🕊️'
      },
      {
        text: 'Mỗi lần tâm sự xong đều thấy lòng nhẹ nhõm, được nạp đầy năng lượng tích cực.',
        isCorrect: false,
        feedback: 'Chữa lành tâm hồn tuyệt đối! Hãy chọn đáp án tổng hòa tất cả nhé ☕'
      },
      {
        text: 'Cả 3 điều trên - tìm được một người cùng tần số thực sự là một điều vô giá.',
        isCorrect: true,
        feedback: 'Chính xác tuyệt đối! Cùng tần số là món quà tuyệt vời nhất mà hai đứa dành cho nhau 🌿'
      }
    ],
    successCommentary: 'Thật may mắn khi giữa thế giới hối hả, mình tìm thấy một người có thể cùng ngồi lại lắng nghe những nỗi lòng nhỏ nhất.',
    poeticQuote: 'Không cần phải gắng gượng làm ai khác, bởi khi bên nhau, bình yên là điều tự nhiên nhất.'
  },
  {
    id: 4,
    stationNum: 'Trạm 04',
    pieceLabel: 'Mảnh #4',
    milestone: 'Hiện thực',
    title: 'Từ Màn Ảo Bước Ra Quán Cà Phê Hôm Nay',
    subtitle: 'Khoảnh khắc bước ra khỏi màn hình ảo để đối diện nhau ngoài đời thực',
    imageSrc: images.cafeDate,
    themeColor: {
      gradient: 'from-emerald-400 via-teal-400 to-emerald-500',
      border: 'border-emerald-200/80',
      badgeBg: 'bg-emerald-100 text-emerald-700',
      badgeText: 'text-emerald-600',
      accent: 'text-emerald-600',
      lightBg: 'bg-emerald-50/70',
      glow: 'rgba(16, 185, 129, 0.35)',
      ring: 'ring-emerald-300'
    },
    question: "Quyết định quan trọng nhất đã biến hành trình 'từ màn ảo bước ra đời thực' thành hiện thực là gì?",
    hint: 'Một lời hẹn đã được ấp ủ bấy lâu nay...',
    options: [
      {
        text: "Một lời rủ nhẹ nhàng: 'Hôm nào rảnh mình đi uống nước nha?' - và hôm nào chính là HÔM NAY!",
        isCorrect: true,
        feedback: 'Xuất sắc! Và buổi hẹn hò đầu tiên hôm nay chính là minh chứng ngọt ngào nhất 🧋'
      },
      {
        text: 'Cần tìm một người đồng hành cùng thử hết menu trà sữa và các quán ngon.',
        isCorrect: false,
        feedback: 'Haha ăn uống cũng quan trọng lắm, nhưng mục đích chính đâu chỉ là trà sữa nè 😋'
      },
      {
        text: 'Vì tò mò muốn xem đối phương ngoài đời có đáng yêu và cute như trên mạng không.',
        isCorrect: false,
        feedback: 'Ngoài đời còn đáng yêu hơn gấp trăm lần ấy chứ! Nhưng chọn lại câu ngọt hơn nha 🌸'
      },
      {
        text: 'Vì muốn xác nhận xem cảm xúc ấm áp qua tin nhắn có đúng là sự thật hay không.',
        isCorrect: false,
        feedback: 'Đúng là sự thật 100% rồi, và lời hẹn ấy đã đưa chúng mình đến đây hôm nay! ✨'
      }
    ],
    successCommentary: 'Và khoảnh khắc hai đứa ngồi đối diện nhau trong buổi hẹn hò đầu tiên hôm nay chính là mảnh ghép trọn vẹn nhất!',
    poeticQuote: 'Hôm nay, những dòng tin nhắn đã hóa thành ánh mắt, nụ cười và một buổi hẹn dịu dàng.'
  }
];

// Hiệu ứng pháo hoa khi giải từng trạm
const triggerStationConfetti = () => {
  try {
    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.65 },
      colors: ['#f472b6', '#fb7185', '#fbbf24', '#c084fc', '#38bdf8']
    });
  } catch (err) {
    console.warn('Confetti error:', err);
  }
};

// Hiệu ứng pháo hoa đại lễ khi ghép đủ 4/4 mảnh
const triggerGrandConfetti = () => {
  try {
    const duration = 2.8 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 120 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 45 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.35), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.65, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  } catch (err) {
    console.warn('Grand Confetti error:', err);
  }
};

// Component thẻ hình ảnh mảnh ghép
interface PuzzlePieceCardProps {
  station: SecretStation;
  isUnlocked: boolean;
  isSelected: boolean;
  onClick: () => void;
  onZoom: () => void;
}

const PuzzlePieceCard = ({
  station,
  isUnlocked,
  isSelected,
  onClick,
  onZoom
}: PuzzlePieceCardProps) => {
  return (
    <motion.div
      layout
      whileHover={{ scale: isUnlocked ? 1.02 : 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 min-h-[220px] sm:min-h-[250px] flex flex-col justify-between ${isUnlocked
        ? 'border-2 ' + station.themeColor.border + ' shadow-lg bg-white'
        : 'border-2 border-dashed border-rose-200/80 bg-white/60 backdrop-blur-md hover:bg-rose-50/50 hover:border-rose-300'
        } ${isSelected ? 'ring-2 ' + station.themeColor.ring : ''}`}
    >
      {isUnlocked ? (
        /* TRẠNG THÁI ĐÃ MỞ KHÓA */
        <motion.div
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full h-full flex flex-col justify-between p-4 group"
        >
          {station.imageSrc ? (
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={station.imageSrc}
                alt={station.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/35" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-400/20 to-rose-300/30 flex items-center justify-center p-4">
              <div className="text-center space-y-2">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200"
                >
                  <Coffee size={28} />
                </motion.div>
                <span className="text-xl">🧋 ☕ 🌸</span>
                <p className="font-romantic text-xs font-bold text-emerald-950">
                  Buổi hẹn đầu tiên ngoài đời thực
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </div>
          )}

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20">
              {station.pieceLabel} • {station.milestone}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-emerald-400/30">
              <CheckCircle2 size={11} /> Mở khóa
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onZoom();
            }}
            title="Xem chi tiết ảnh"
            className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition opacity-0 group-hover:opacity-100"
          >
            <ZoomIn size={14} />
          </button>

          <div className="relative z-10 text-white pt-8">
            <h4 className="font-romantic text-sm sm:text-base font-bold drop-shadow-md line-clamp-1">
              {station.title}
            </h4>
            <p className="text-[11px] text-white/90 line-clamp-1 italic drop-shadow-sm mt-0.5">
              "{station.poeticQuote}"
            </p>
          </div>
        </motion.div>
      ) : (
        /* TRẠNG THÁI KHÓA */
        <div className="p-6 flex flex-col items-center justify-center text-center h-full space-y-3">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-rose-100 flex items-center justify-center text-amber-500"
          >
            <Lock size={20} />
          </motion.div>
          <div>
            <div className="inline-block text-[10px] font-bold text-rose-400 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-full mb-1">
              {station.pieceLabel} • {station.milestone}
            </div>
            <h4 className="font-romantic text-sm font-semibold text-stone-700">
              {station.title}
            </h4>
          </div>
          <p className="text-[10px] text-stone-400 max-w-[190px] leading-relaxed">
            {isSelected
              ? '👉 Đang mở câu đố bên dưới, giải đúng để mở ảnh!'
              : 'Nhấn vào mảnh ghép này để giải đố ✨'}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export interface SecretGameTabProps {
  customImages?: PuzzleImagesConfig;
}

export const SecretGameTab = ({ customImages }: SecretGameTabProps) => {
  const stations = createSecretStations(customImages || DEFAULT_PUZZLE_IMAGES);

  // Lưu tiến trình mở khóa vào localStorage (app_secret_puzzle_progress)
  const [unlockedIds, setUnlockedIds] = useState<number[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved =
          localStorage.getItem('app_secret_puzzle_progress') ||
          localStorage.getItem('app_secret_game_progress');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch { }
    return [];
  });

  const [activeStationId, setActiveStationId] = useState<number>(() => {
    return 1;
  });

  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isShake, setIsShake] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'letter'>('board');
  const [zoomedStation, setZoomedStation] = useState<SecretStation | null>(null);
  const [zoomedCoupon, setZoomedCoupon] = useState<PhieuBeNgoanItem | null>(null);

  // Cơ chế hiện chữ từ từ trong Tâm thư (Step 1 đến 6)
  const [revealedLetterSteps, setRevealedLetterSteps] = useState<number>(1);
  const [autoPlayLetter, setAutoPlayLetter] = useState<boolean>(true);

  const isCompletedAll = unlockedIds.length === stations.length;
  const currentStation = stations.find(s => s.id === activeStationId) || stations[0];
  const isCurrentStationUnlocked = unlockedIds.includes(activeStationId);

  // Tự động chuyển tiếp từng đoạn tâm thư để tăng cảm xúc
  useEffect(() => {
    if (viewMode !== 'letter' || !autoPlayLetter) return;
    if (revealedLetterSteps >= 5) return;

    const timer = setTimeout(() => {
      setRevealedLetterSteps(prev => {
        const next = prev + 1;
        if (next === 5) {
          triggerStationConfetti();
        }
        return next;
      });
    }, 2400);

    return () => clearTimeout(timer);
  }, [viewMode, autoPlayLetter, revealedLetterSteps]);

  // Xử lý khi chọn phương án trắc nghiệm
  const handleSelectOption = (idx: number) => {
    if (isCurrentStationUnlocked) return;
    setSelectedOptionIdx(idx);
    const chosenOption = currentStation.options[idx];

    if (chosenOption.isCorrect) {
      setIsShake(false);
      setFeedback({
        isCorrect: true,
        text: chosenOption.feedback
      });

      triggerStationConfetti();

      if (!unlockedIds.includes(currentStation.id)) {
        const nextUnlocked = [...unlockedIds, currentStation.id];
        setUnlockedIds(nextUnlocked);
        try {
          localStorage.setItem('app_secret_puzzle_progress', JSON.stringify(nextUnlocked));
        } catch { }

        if (nextUnlocked.length === stations.length) {
          setTimeout(() => {
            triggerGrandConfetti();
          }, 350);
        }
      }
    } else {
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
      setFeedback({
        isCorrect: false,
        text: chosenOption.feedback
      });
    }
  };

  // Chuyển sang trạm tiếp theo
  const handleNextStation = () => {
    setSelectedOptionIdx(null);
    setFeedback(null);
    if (activeStationId < stations.length) {
      setActiveStationId(prev => prev + 1);
    } else {
      setViewMode('letter');
      setRevealedLetterSteps(1);
      setAutoPlayLetter(true);
    }
  };

  // Reset chơi lại từ đầu
  const handleResetGame = () => {
    if (
      window.confirm(
        'Bạn có muốn chơi lại Mini Game Ghép Hình từ đầu không? Các mảnh ghép sẽ được khóa lại để hai bạn trải nghiệm lại lần nữa.'
      )
    ) {
      setUnlockedIds([]);
      setActiveStationId(1);
      setSelectedOptionIdx(null);
      setFeedback(null);
      setViewMode('board');
      setRevealedLetterSteps(1);
      setAutoPlayLetter(true);
      try {
        localStorage.removeItem('app_secret_puzzle_progress');
        localStorage.removeItem('app_secret_game_progress');
      } catch { }
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-10">
      {/* HEADER MINI GAME */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 via-rose-100 to-pink-100 text-stone-700 text-xs font-semibold border border-rose-200/60 shadow-sm">
          <Sparkles size={14} className="text-amber-500 animate-spin" />
          <span>Mini Game Ghép Hình • Buổi Gặp Mặt Đầu Tiên</span>
        </div>
        <h2 className="font-romantic text-2xl sm:text-3xl font-bold text-[#443333] tracking-tight">
          Hành Trình Từ Màn Ảo Bước Ra Đời Thực
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
          Giải mã 4 trạm kỷ niệm để lật mở bức tranh 4 mảnh ghép và khám phá bức thư bí mật dành cho buổi hẹn hôm nay ✨
        </p>
      </div>

      {/* THANH ĐIỀU HƯỚNG & TIẾN ĐỘ CHƠI */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-rose-100 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-600">Tiến độ ghép tranh:</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-600 border border-rose-200">
            {unlockedIds.length} / {stations.length} mảnh ghép
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isCompletedAll && (
            <button
              onClick={() => {
                if (viewMode === 'board') {
                  setViewMode('letter');
                  setRevealedLetterSteps(1);
                  setAutoPlayLetter(true);
                } else {
                  setViewMode('board');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-400 to-rose-400 text-white shadow-sm hover:brightness-105 transition cursor-pointer"
            >
              {viewMode === 'board' ? (
                <>
                  <Mail size={13} />
                  <span>Mở Bức Thư Bí Mật 💌</span>
                </>
              ) : (
                <>
                  <Gift size={13} />
                  <span>Xem Bảng Tranh 🧩</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleResetGame}
            title="Chơi lại từ đầu"
            className="p-1.5 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* VIEW 1: BẢNG GHÉP TRANH 2x2 & CÂU ĐỐ TRẮC NGHIỆM */}
      {viewMode === 'board' ? (
        <div className="space-y-8">
          {/* KHUNG BẢNG GHÉP TRANH 2x2 */}
          <div className="relative">
            {/* Hào quang vàng kim bừng sáng khi ghép đủ 4/4 mảnh */}
            {isCompletedAll && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="absolute -inset-2 bg-gradient-to-r from-amber-300 via-rose-300 to-pink-300 rounded-[32px] blur-md -z-10"
              />
            )}

            <div
              className={`p-4 sm:p-6 rounded-3xl bg-white/85 backdrop-blur-md border ${isCompletedAll
                ? 'border-amber-300 shadow-xl shadow-amber-200/40 ring-2 ring-amber-300/60'
                : 'border-rose-100 shadow-md'
                }`}
            >
              {/* Tiêu đề Bảng ghép */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-rose-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                    <Trophy size={16} />
                  </div>
                  <div>
                    <h3 className="font-romantic text-base sm:text-lg font-bold text-stone-800">
                      Bảng Ghép Hình Kỷ Niệm 2x2
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      {isCompletedAll
                        ? '✨ 4 mảnh ghép đã hội tụ đầy đủ và tỏa sáng!'
                        : 'Click vào mảnh ghép để xem câu đố và mở khóa hình ảnh'}
                    </p>
                  </div>
                </div>

                {isCompletedAll && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <PartyPopper size={13} /> Hoàn hảo!
                  </span>
                )}
              </div>

              {/* LƯỚI 2x2 PUZZLE GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {stations.map(station => {
                  const isUnlocked = unlockedIds.includes(station.id);
                  const isSelected = activeStationId === station.id;

                  return (
                    <PuzzlePieceCard
                      key={station.id}
                      station={station}
                      isUnlocked={isUnlocked}
                      isSelected={isSelected}
                      onClick={() => {
                        setActiveStationId(station.id);
                        setSelectedOptionIdx(null);
                        setFeedback(null);
                        if (isUnlocked) {
                          setZoomedStation(station);
                        }
                      }}
                      onZoom={() => setZoomedStation(station)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* KHUNG CÂU ĐỐ TRẮC NGHIỆM */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-md space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-rose-50">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {stations.map(s => {
                  const isDone = unlockedIds.includes(s.id);
                  const isCurrent = activeStationId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveStationId(s.id);
                        setSelectedOptionIdx(null);
                        setFeedback(null);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${isCurrent
                        ? 'bg-rose-400 text-white shadow-sm'
                        : isDone
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                    >
                      {isDone ? <CheckCircle2 size={12} /> : null}
                      <span>{s.pieceLabel}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-medium text-stone-400">
                {isCurrentStationUnlocked ? '✅ Mảnh ghép đã mở' : '🔒 Đang giải câu đố'}
              </span>
            </div>

            {/* Nội dung câu hỏi trắc nghiệm */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${currentStation.themeColor.badgeBg}`}>
                    {currentStation.pieceLabel} • {currentStation.milestone}
                  </span>
                </div>
                <h3 className="font-romantic text-lg sm:text-xl font-bold text-[#443333] leading-snug">
                  {currentStation.question}
                </h3>
                <p className="text-xs text-stone-400 italic">
                  💡 Gợi ý: {currentStation.hint}
                </p>
              </div>

              {/* 4 Lựa chọn trắc nghiệm */}
              <motion.div
                animate={isShake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 gap-3 pt-2"
              >
                {currentStation.options.map((option, idx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const isSelected = selectedOptionIdx === idx;
                  const isCorrect = option.isCorrect;

                  let btnStyle =
                    'bg-stone-50/80 border-stone-200/80 hover:bg-rose-50/50 hover:border-rose-200 text-stone-700';

                  if (isSelected) {
                    if (isCorrect) {
                      btnStyle =
                        'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm ring-2 ring-emerald-200';
                    } else {
                      btnStyle = 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-200';
                    }
                  } else if (isCurrentStationUnlocked && isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold';
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isCurrentStationUnlocked}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition flex items-start gap-3 cursor-pointer ${btnStyle} ${isCurrentStationUnlocked ? 'cursor-default' : ''
                        }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${isSelected
                          ? isCorrect
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-400 text-white'
                          : isCurrentStationUnlocked && isCorrect
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-stone-500 border border-stone-200'
                          }`}
                      >
                        {letters[idx]}
                      </span>
                      <span className="text-xs sm:text-sm leading-relaxed">{option.text}</span>
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Thông báo phản hồi khi chọn */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${feedback.isCorrect
                      ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50/90 border-amber-200 text-amber-900'
                      }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {feedback.isCorrect ? (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <HelpCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {feedback.isCorrect ? 'Đáp án hoàn toàn chính xác! 🎉' : 'Gần đúng rồi nè! 💭'}
                        </p>
                        <p className="text-stone-600">{feedback.text}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lời nhắn gửi kỷ niệm */}
              {isCurrentStationUnlocked && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/80 via-pink-50/80 to-amber-50/80 border border-rose-100 text-xs sm:text-sm text-stone-700 leading-relaxed space-y-1">
                  <span className="font-bold text-rose-500 flex items-center gap-1">
                    <Sparkles size={14} /> Lời nhắn gửi của tui đến cậu nè:
                  </span>
                  <p className="italic font-romantic text-stone-800">
                    "{currentStation.successCommentary}"
                  </p>
                </div>
              )}

              {/* Nút tiếp tục trạm kế tiếp */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-stone-400">
                  {isCompletedAll ? '🎉 Cả 4 mảnh ghép đã hội tụ!' : 'Mở khóa từng mảnh để xem thư'}
                </span>

                {isCurrentStationUnlocked && (
                  <button
                    onClick={handleNextStation}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-rose-400 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-rose-200 transition cursor-pointer"
                  >
                    <span>
                      {activeStationId < stations.length ? 'Trạm tiếp theo' : 'Mở Bức Thư Bí Mật 💌'}
                    </span>
                    <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: MÀN KẾT THÚC - BỨC TÂM THƯ BÍ MẬT (CHỮ TO, RÕ RÀNG & HIỆN RA TỪ TỪ) */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative bg-gradient-to-b from-[#fffbf5] via-[#fff8f2] to-[#fff5f5] rounded-3xl p-6 sm:p-10 md:p-12 border-2 border-amber-200/90 shadow-2xl space-y-8 max-w-3xl mx-auto"
        >
          {/* Thanh công cụ điều khiển hiện chữ từ từ */}
          <div className="flex items-center justify-between border-b border-amber-100 pb-3 text-xs text-stone-500">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles size={14} className="text-amber-500" />
              <span>Đang hé mở tâm tình: Bước {revealedLetterSteps}/5</span>
            </div>
            <div className="flex items-center gap-2">
              {revealedLetterSteps < 5 ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setRevealedLetterSteps(prev => {
                        const next = Math.min(prev + 1, 5);
                        if (next === 5) triggerStationConfetti();
                        return next;
                      });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200 font-semibold transition cursor-pointer"
                  >
                    <Play size={12} /> Đọc tiếp
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRevealedLetterSteps(5);
                      setAutoPlayLetter(false);
                      triggerStationConfetti();
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 font-semibold transition cursor-pointer"
                  >
                    <FastForward size={12} /> Xem tất cả ngay
                  </button>
                </>
              ) : (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Đã hiển thị trọn vẹn
                </span>
              )}
            </div>
          </div>

          {/* Dấu sáp thư */}
          <div className="flex justify-center -mt-3">
            <motion.div
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-rose-400 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-amber-200 ring-4 ring-white"
            >
              <PartyPopper size={32} />
            </motion.div>
          </div>

          {/* BƯỚC 1: TIÊU ĐỀ LÃNG MẠN (CHỮ TO, RÕ RÀNG) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3 border-b border-amber-200/80 pb-6"
          >
            <span className="inline-block text-xs sm:text-sm font-bold tracking-widest text-amber-700 uppercase bg-amber-100/70 px-4 py-1 rounded-full">
              Bức Thư Gửi Người Ngồi Đối Diện Hôm Nay
            </span>
            <h2 className="font-romantic text-3xl sm:text-4xl md:text-5xl font-bold text-amber-950 leading-tight">
              Gửi Cậu, Buổi Hẹn Đầu Tiên 💕
            </h2>
            <p className="text-sm sm:text-base text-stone-600 font-medium">
              Từ chiếc quẹt match định mệnh đến ánh mắt và nụ cười thật ngoài đời
            </p>
          </motion.div>

          {/* BƯỚC 2: ĐOẠN 1 - LỜI MỞ ĐẦU CHÂN THÀNH (CHỮ TO & DỄ ĐỌC) */}
          {revealedLetterSteps >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="p-5 sm:p-7 rounded-3xl bg-white/80 border border-amber-200/70 shadow-sm"
            >
              <p className="font-sans text-base sm:text-lg md:text-xl text-stone-800 leading-relaxed sm:leading-9">
                Thế là sau bao ngày đêm chỉ biết nhau qua những dòng tin nhắn nhảy múa trên màn hình điện thoại, hôm nay hai đứa mình đã thật sự ngồi đối diện nhau. Nhìn thấy nụ cười thật, nghe giọng nói thật và ánh mắt ngoài đời thực... mọi thứ đều dịu dàng, tự nhiên và ấm áp hơn bất kỳ dòng tin nhắn hay biểu tượng cảm xúc nào.
              </p>
            </motion.div>
          )}

          {/* BƯỚC 3: ĐOẠN 2 - LỜI CẢM ƠN TỪ TẬN ĐÁY LÒNG */}
          {revealedLetterSteps >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="p-5 sm:p-7 rounded-3xl bg-rose-50/50 border border-rose-200/70 shadow-sm"
            >
              <p className="font-sans text-base sm:text-lg md:text-xl text-stone-800 leading-relaxed sm:leading-9">
                Cảm ơn bạn vì đã bước ra từ màn hình điện thoại để cùng có mặt trong buổi gặp gỡ hôm nay; vượt qua những bỡ ngỡ ban đầu để chúng mình có một buổi hẹn trọn vẹn, nhiều tiếng cười và sự an tâm khó tả. Khoảng cách giữa hai chiếc màn hình ảo cuối cùng đã được khỏa lấp bằng một buổi chiều thật trọn vẹn.
              </p>
            </motion.div>
          )}

          {/* BƯỚC 4: NHỮNG MONG ĐỢI DỊU DÀNG CHO TƯƠNG LAI */}
          {revealedLetterSteps >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-rose-200/90 shadow-md space-y-4"
            >
              <div className="flex items-center gap-2 text-rose-800 font-romantic font-bold text-lg sm:text-xl md:text-2xl">
                <Sparkles size={20} className="text-rose-500" />
                <span>Những mong đợi dịu dàng cho tương lai ✨</span>
              </div>

              <ul className="space-y-3.5 text-sm sm:text-base md:text-lg text-stone-700 leading-relaxed font-sans">
                <li className="flex items-start gap-3">
                  <span className="text-xl shrink-0">☕</span>
                  <span>Thêm nhiều buổi cà phê chuyện trò thong thả, nơi hai đứa có thể ngồi buôn đủ thứ mà không cần canh giờ về.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl shrink-0">🛵</span>
                  <span>Những vòng xe dạo quanh phố phường ngắm hoàng hôn, hít hà gió mát và chia sẻ muôn vàn câu chuyện nhỏ bé.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl shrink-0">🧋</span>
                  <span>Cùng nhau oanh tạc những quán ăn vặt, quán trà sữa thơm ngon mà hai đứa từng ghim trong danh sách.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl shrink-0">📸</span>
                  <span>Và hẹn những lần gặp tiếp theo, chắc chắn chúng mình sẽ có thêm thật nhiều kỷ niệm đẹp và những bức ảnh chung đầu tiên thật xinh xắn!</span>
                </li>
              </ul>
            </motion.div>
          )}

          {/* BƯỚC 5: PHIẾU BÉ NGOAN TẶNG CẬU NHÉ (3 ẢNH PHIEU1, PHIEU2, PHIEU3) */}
          {revealedLetterSteps >= 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-pink-50/95 via-rose-50/90 to-amber-50/95 border-2 border-rose-300 shadow-xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-200/80 text-rose-800 text-xs sm:text-sm font-bold shadow-xs">
                  <Ticket size={16} className="text-rose-600" />
                  <span>Phần quà đặc quyền dành riêng cho cậu</span>
                </div>
                <h3 className="font-romantic text-2xl sm:text-3xl md:text-4xl font-bold text-rose-950">
                  Phiếu Bé Ngoan Tặng Cậu Nhé 🎟️💖
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-stone-600 max-w-lg mx-auto">
                  Tadaaa! 3 chiếc phiếu bé ngoan phiên bản đặc biệt dành cho người đã có một buổi hẹn thật ngoan và đáng yêu hôm nay ✨ (Click vào từng phiếu để phóng to xem chi tiết nhé)
                </p>
              </div>

              {/* 3 TẤM HÌNH PHIẾU BÉ NGOAN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 pt-2">
                {PHIEU_BE_NGOAN.map((phieu) => (
                  <motion.div
                    key={phieu.id}
                    whileHover={{ scale: 1.04, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setZoomedCoupon(phieu)}
                    className="relative rounded-2xl overflow-hidden bg-white p-2.5 border-2 border-rose-200/90 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-[3/4] bg-stone-50 flex items-center justify-center">
                      <img
                        src={phieu.image}
                        alt={phieu.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="p-2 rounded-full bg-white/90 text-rose-600 shadow-md">
                          <Eye size={20} />
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 pb-1 text-center space-y-1">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-600">
                        {phieu.badge}
                      </span>
                      <h5 className="font-romantic font-bold text-sm text-stone-800">
                        {phieu.title}
                      </h5>
                      <p className="text-[11px] text-stone-500 italic">
                        {phieu.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* LỜI KẾT VÀ NÚT ĐIỀU HƯỚNG */}
          <div className="pt-4 text-center space-y-4">
            <p className="font-romantic text-base sm:text-lg md:text-xl font-bold text-rose-500">
              "Cảm ơn vì buổi gặp mặt hôm nay, và cảm ơn vì đã đến bên đời nhau." 🌸
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => setViewMode('board')}
                className="px-6 py-2.5 rounded-full bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <Gift size={15} className="text-rose-400" />
                <span>Xem lại bảng tranh 4 mảnh</span>
              </button>

              <button
                onClick={() => {
                  setRevealedLetterSteps(1);
                  setAutoPlayLetter(true);
                }}
                className="px-6 py-2.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <Play size={15} />
                <span>Đọc lại tâm thư từ đầu</span>
              </button>

              <button
                onClick={handleResetGame}
                className="px-6 py-2.5 rounded-full bg-rose-400 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-rose-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={15} />
                <span>Chơi lại Mini Game</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* POPUP PHÓNG TO XEM ẢNH CỦA BẢNG GHÉP TRANH */}
      <AnimatePresence>
        {zoomedStation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setZoomedStation(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl border border-rose-100 space-y-4 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-rose-50 pb-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${zoomedStation.themeColor.badgeBg}`}>
                  {zoomedStation.pieceLabel} • {zoomedStation.milestone}
                </span>
                <button
                  onClick={() => setZoomedStation(null)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1">
                <h4 className="font-romantic text-lg font-bold text-stone-800">
                  {zoomedStation.title}
                </h4>
                <p className="text-xs text-stone-400">
                  {zoomedStation.subtitle}
                </p>
              </div>

              <div className="rounded-2xl overflow-hidden max-h-[320px] bg-stone-100 border border-rose-100 flex items-center justify-center">
                {zoomedStation.imageSrc ? (
                  <img
                    src={zoomedStation.imageSrc}
                    alt={zoomedStation.title}
                    className="w-full h-full object-contain max-h-[320px]"
                  />
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <Coffee size={36} className="mx-auto text-emerald-500" />
                    <p className="text-xs font-romantic font-bold text-stone-700">
                      Buổi hẹn hò đầu tiên tại quán cà phê hôm nay ✨
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-1">
                <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                  <Stars size={12} /> Cảm xúc giai đoạn này:
                </span>
                <p className="font-romantic text-xs sm:text-sm text-stone-700 italic">
                  "{zoomedStation.poeticQuote}"
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setZoomedStation(null)}
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-rose-400 hover:bg-rose-500 text-white transition cursor-pointer shadow-sm"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP PHÓNG TO XEM CHI TIẾT "PHIẾU BÉ NGOAN" */}
      <AnimatePresence>
        {zoomedCoupon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setZoomedCoupon(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border-2 border-rose-200 space-y-4 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-rose-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Ticket size={18} className="text-rose-500" />
                  <span className="font-romantic text-base sm:text-lg font-bold text-rose-950">
                    {zoomedCoupon.title}
                  </span>
                </div>
                <button
                  onClick={() => setZoomedCoupon(null)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Ảnh phiếu bé ngoan phóng to */}
              <div className="rounded-2xl overflow-hidden bg-stone-50 border border-rose-100 flex items-center justify-center p-1">
                <img
                  src={zoomedCoupon.image}
                  alt={zoomedCoupon.title}
                  className="w-full max-h-[70vh] object-contain rounded-xl"
                />
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-center space-y-1">
                <p className="font-romantic font-bold text-rose-800 text-xs sm:text-sm">
                  🎟️ Phiếu bé ngoan tặng cậu - Có giá trị sử dụng vô thời hạn ✨
                </p>
                <p className="text-[11px] text-stone-500">
                  Cậu có thể kích hoạt phiếu này bất cứ lúc nào cậu muốn nhé!
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setZoomedCoupon(null)}
                  className="px-6 py-2 rounded-full text-xs sm:text-sm font-semibold bg-rose-400 hover:bg-rose-500 text-white transition cursor-pointer shadow-sm"
                >
                  Đã nhận phiếu 💖
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecretGameTab;
