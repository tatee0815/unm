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
