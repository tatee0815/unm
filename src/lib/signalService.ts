import type {
  SenderRole,
  SignalPayload,
  SignalSendResult
} from '../types';

/**
 * Thời gian chờ tối thiểu giữa 2 lần gửi tín hiệu (chống spam: 30 giây).
 */
export const SIGNAL_COOLDOWN_SECONDS = 30;
const SIGNAL_COOLDOWN_MS = SIGNAL_COOLDOWN_SECONDS * 1000;

/**
 * Các khóa lưu trữ cục bộ trong localStorage để ghi nhớ người gửi và chống spam.
 */
const STORAGE_KEYS = {
  lastSentAt: 'love_signal_last_sent_at',
  senderRole: 'love_signal_sender_role',
  senderNames: 'love_signal_sender_names'
} as const;

/**
 * Lấy số giây cooldown còn lại từ localStorage (trả về 0 nếu đã sẵn sàng gửi).
 */
export const getRemainingCooldownSeconds = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.lastSentAt);
    if (!raw) return 0;
    const lastSentAt = Number(raw);
    if (!Number.isFinite(lastSentAt) || lastSentAt <= 0) return 0;

    const elapsed = Date.now() - lastSentAt;
    if (elapsed >= SIGNAL_COOLDOWN_MS) return 0;

    return Math.ceil((SIGNAL_COOLDOWN_MS - elapsed) / 1000);
  } catch {
    return 0;
  }
};

export const canSendSignal = (): boolean => {
  return getRemainingCooldownSeconds() === 0;
};

const markSignalSentNow = (): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.lastSentAt, String(Date.now()));
  } catch {
    // Bỏ qua nếu trình duyệt chặn localStorage
  }
};

/**
 * Đọc và lưu vai trò người gửi gần nhất ('em' | 'anh') trong localStorage.
 */
export const getSavedSenderRole = (): SenderRole => {
  if (typeof window === 'undefined') return 'em';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEYS.senderRole);
    return saved === 'anh' || saved === 'em' ? saved : 'em';
  } catch {
    return 'em';
  }
};

export const saveSenderRole = (role: SenderRole): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.senderRole, role);
  } catch {
    // Bỏ qua lỗi storage
  }
};

/**
 * Đọc và lưu tên hiển thị tuỳ chỉnh theo từng người gửi ('em' / 'anh').
 */
export const getSavedSenderDisplayName = (role: SenderRole): string => {
  if (typeof window === 'undefined') return '';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.senderNames);
    if (!raw) return '';
    const parsed = JSON.parse(raw) as Partial<Record<SenderRole, string>>;
    return typeof parsed[role] === 'string' ? parsed[role] : '';
  } catch {
    return '';
  }
};

export const saveSenderDisplayName = (role: SenderRole, displayName: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.senderNames);
    const current: Partial<Record<SenderRole, string>> = raw ? JSON.parse(raw) : {};
    current[role] = displayName;
    window.localStorage.setItem(STORAGE_KEYS.senderNames, JSON.stringify(current));
  } catch {
    // Bỏ qua lỗi storage
  }
};

/**
 * Gửi tín hiệu nhanh qua POST tới Google Apps Script Web App URL.
 * Sử dụng mode: 'no-cors' và Content-Type: 'text/plain;charset=utf-8'
 * để trình duyệt không gửi preflight OPTIONS (vốn không được GAS hỗ trợ)
 * nhưng vẫn truyền nguyên vẹn chuỗi JSON vào e.postData.contents.
 */
export const sendSignal = async (payload: SignalPayload): Promise<SignalSendResult> => {
  const remaining = getRemainingCooldownSeconds();
  if (remaining > 0) {
    return {
      success: false,
      message: `Bạn vừa gửi tín hiệu rồi, vui lòng chờ ${remaining} giây nữa nhé!`,
      cooldownSeconds: remaining,
      error: 'COOLDOWN_ACTIVE'
    };
  }

  const webhookUrl = import.meta.env.VITE_GAS_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return {
      success: false,
      message: 'Chưa cấu hình VITE_GAS_WEBHOOK_URL trong file .env!',
      cooldownSeconds: 0,
      error: 'MISSING_WEBHOOK_URL'
    };
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    // Lưu mốc thời gian gửi thành công để kích hoạt cooldown 30 giây
    markSignalSentNow();

    return {
      success: true,
      message: `Đã gửi tín hiệu yêu thương đến ${payload.recipientName}!`,
      cooldownSeconds: SIGNAL_COOLDOWN_SECONDS
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Không thể kết nối tới máy chủ Google Apps Script.';
    return {
      success: false,
      message: 'Gửi tín hiệu thất bại, bạn kiểm tra lại mạng và thử lại nhé.',
      cooldownSeconds: 0,
      error: errorMessage
    };
  }
};

