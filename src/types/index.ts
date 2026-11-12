export interface MemoryItem {
  id: string;
  date_key: string;
  type: string;
  title: string;
  content: string;
  photo_urls: string[];
  author: string;
  sticker?: string;
  created_at?: string;
}

export type MemoriesRecord = Record<string, MemoryItem[]>;

export interface ProfileData {
  id?: string;
  nickname: string;
  subtitle: string;
  avatar: string;
  likes: string[];
  dislikes: string[];
  notes: string;
  milestones: string[];
  milestone_photos?: string[];
}

export interface DialogConfig {
  isOpen: boolean;
  type: 'confirm' | 'alert';
  title?: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export type TabType = 'welcome' | 'memories' | 'em' | 'anh' | 'us' | 'secret';

export type SenderRole = 'em' | 'anh';

export interface SenderIdentity {
  role: SenderRole;
  displayName: string;
  recipientRole: SenderRole;
  recipientName: string;
}

export interface StickerItem {
  id: string;
  emoji: string;
  label: string;
  category?: 'love' | 'mood' | 'cute';
}

export type SignalNoticeType = 'memories_updated' | 'private_corner_share';

export interface SignalPayload {
  senderRole: SenderRole;
  senderName: string;
  recipientRole: SenderRole;
  recipientName: string;
  sticker?: string;
  notices?: SignalNoticeType[];
  noticeLabels?: string[];
  sentAt: string;
}

export interface SignalSendResult {
  success: boolean;
  message: string;
  cooldownSeconds: number;
  error?: string;
}
