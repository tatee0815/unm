import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import type { MemoryItem, MemoriesRecord, ProfileData, DialogConfig } from './types';

// Các component modular
import Navbar from './components/Navbar';
import WelcomeTab from './components/tabs/WelcomeTab';
import MemoriesTab, { type PendingFormOpen } from './components/tabs/MemoriesTab';
import ProfileTab from './components/tabs/ProfileTab';
import UsTab from './components/tabs/UsTab';
import SecretGameTab from './components/tabs/SecretGameTab';
import CustomDialog from './components/modals/CustomDialog';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('app_active_tab') || 'memories';
  });

  useEffect(() => {
    localStorage.setItem('app_active_tab', activeTab);
  }, [activeTab]);

  const [viewPhoto, setViewPhoto] = useState<string | null>(null);

  // Trạng thái tab bí mật
  const [enableSecretTab, setEnableSecretTab] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('unlock') === 'true') {
        localStorage.setItem('secret_tab_active', 'true');
        return true;
      }
    }
    return localStorage.getItem('secret_tab_active') === 'true';
  });

  // Hàm cập nhật trạng thái unlock lên Supabase
  const syncUnlockToSupabase = async (val: boolean) => {
    try {
      await supabase.from('app_settings').upsert({
        key: 'secret_tab_unlocked',
        value: val,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    } catch (err) {
      console.warn('Lỗi đồng bộ app_settings lên Supabase:', err);
    }
  };

  // --- CƠ CHẾ KÍCH HOẠT TAB BÍ MẬT & ĐỒNG BỘ SUPABASE ---
  useEffect(() => {
    // 1. Kích hoạt bằng URL (ví dụ: your-domain.com?unlock=true)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('unlock') === 'true') {
      syncUnlockToSupabase(true);
    }

    // 2. Gõ bàn phím từ khóa bí mật 'secret' bất kỳ lúc nào trên web
    let typedKeys = '';
    const secretCode = 'secret';

    const handleKeyDown = (e: KeyboardEvent) => {
      typedKeys += e.key.toLowerCase();
      if (typedKeys.length > secretCode.length) {
        typedKeys = typedKeys.slice(-secretCode.length);
      }
      if (typedKeys === secretCode) {
        setEnableSecretTab(prev => {
          const nextState = !prev;
          localStorage.setItem('secret_tab_active', String(nextState));
          syncUnlockToSupabase(nextState);
          return nextState;
        });
        typedKeys = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Format YYYY-MM-DD
  const formatDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [todayKey] = useState(() => formatDateKey(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);

  // Lưu trữ dữ liệu nhật ký (fallback localStorage nếu offline)
  const [memories, setMemories] = useState<MemoriesRecord>(() => {
    const saved = localStorage.getItem('app_memories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed[todayKey]?.title === 'Một ngày thật đặc biệt') {
          return {};
        }
        return parsed;
      } catch {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('app_memories', JSON.stringify(memories));
  }, [memories]);

  // Hồ sơ Em & Anh lấy 100% từ Supabase
  const [profiles, setProfiles] = useState<Record<'em' | 'anh', ProfileData>>({
    em: {
      id: 'em',
      nickname: '',
      subtitle: '',
      avatar: '',
      likes: [],
      dislikes: [],
      notes: '',
      milestones: [],
      milestone_photos: []
    },
    anh: {
      id: 'anh',
      nickname: '',
      subtitle: '',
      avatar: '',
      likes: [],
      dislikes: [],
      notes: '',
      milestones: [],
      milestone_photos: []
    }
  });

  // Custom Dialog State
  const [dialogConfig, setDialogConfig] = useState<DialogConfig>({
    isOpen: false,
    type: 'alert',
    message: ''
  });

  const showAlert = (message: string, title?: string) => {
    setDialogConfig({
      isOpen: true,
      type: 'alert',
      message,
      title,
    });
  };

  const showConfirm = (message: string, onConfirm: () => void, title?: string) => {
    setDialogConfig({
      isOpen: true,
      type: 'confirm',
      message,
      title,
      onConfirm,
    });
  };

  const closeDialog = () => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }));
  };

  // State chuyển hướng mở form từ UsTab sang MemoriesTab
  const [pendingFormOpen, setPendingFormOpen] = useState<PendingFormOpen | null>(null);

  // Đồng bộ với Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .eq('key', 'secret_tab_unlocked')
          .maybeSingle();

        if (!error && data) {
          const isUnlocked = Boolean(data.value);
          setEnableSecretTab(isUnlocked);
          localStorage.setItem('secret_tab_active', String(isUnlocked));
        }
      } catch (err) {
        console.warn('Lỗi lấy app_settings từ Supabase:', err);
      }
    };

    const fetchMemories = async () => {
      try {
        const { data, error } = await supabase
          .from('memories')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: MemoriesRecord = {};
          data.forEach((row: any) => {
            const key = row.date_key;
            if (!mapped[key]) mapped[key] = [];
            mapped[key].push({
              id: row.id,
              date_key: row.date_key,
              type: row.type || 'journal',
              title: row.title || '',
              content: row.content || '',
              photo_urls: Array.isArray(row.photo_urls) ? row.photo_urls : (row.photo_url ? [row.photo_url] : []),
              author: row.author || 'anh',
              sticker: row.sticker || '',
              created_at: row.created_at || new Date().toISOString()
            });
          });
          setMemories(mapped);
        }
      } catch (err) {
        console.warn('Lỗi lấy memories từ Supabase:', err);
      }
    };

    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data) {
          const mapped: any = {};
          data.forEach((p: any) => {
            if (p.id === 'em' || p.id === 'anh') {
              mapped[p.id] = {
                id: p.id,
                nickname: p.nickname || (p.id === 'em' ? '' : ''),
                subtitle: p.subtitle || '',
                avatar: p.avatar || '',
                likes: Array.isArray(p.likes) ? p.likes : [],
                dislikes: Array.isArray(p.dislikes) ? p.dislikes : [],
                notes: p.notes || '',
                milestones: Array.isArray(p.milestones) ? p.milestones : [],
                milestone_photos: Array.isArray(p.milestone_photos) ? p.milestone_photos : []
              };

              if (p.milestones && Array.isArray(p.milestones)) {
                p.milestones.forEach((mStr: string) => {
                  try {
                    const mData = JSON.parse(mStr);
                    if (mData && mData.id && mData.text) {
                      const dateKey = mData.timestamp ? mData.timestamp.split('T')[0] : todayKey;
                      setMemories(prevMem => {
                        const dayArr = prevMem[dateKey] || [];
                        if (!dayArr.some(m => m.id === mData.id)) {
                          const newMem: MemoryItem = {
                            id: mData.id,
                            date_key: dateKey,
                            type: 'special',
                            title: mData.text.split('\n')[0].slice(0, 40) || 'Kỷ niệm khó quên',
                            content: mData.text,
                            photo_urls: mData.photos || [],
                            author: p.id,
                            sticker: '💖',
                            created_at: mData.timestamp || new Date().toISOString()
                          };
                          supabase.from('memories').upsert({
                            id: newMem.id,
                            date_key: newMem.date_key,
                            type: newMem.type,
                            title: newMem.title,
                            content: newMem.content,
                            photo_urls: newMem.photo_urls,
                            author: newMem.author,
                            sticker: newMem.sticker,
                            created_at: newMem.created_at,
                            updated_at: new Date().toISOString()
                          }, { onConflict: 'id' }).then();

                          return {
                            ...prevMem,
                            [dateKey]: [...dayArr, newMem]
                          };
                        }
                        return prevMem;
                      });
                    }
                  } catch { }
                });
              }
            }
          });
          setProfiles(prev => ({ ...prev, ...mapped }));
        }
      } catch (err) {
        console.warn('Lỗi lấy profiles từ Supabase:', err);
      }
    };

    fetchSettings();
    fetchMemories();
    fetchProfiles();

    // Đăng ký Supabase Realtime
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings' },
        (payload: any) => {
          if (payload.new && payload.new.key === 'secret_tab_unlocked') {
            const isUnlocked = Boolean(payload.new.value);
            setEnableSecretTab(isUnlocked);
            localStorage.setItem('secret_tab_active', String(isUnlocked));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'memories' },
        (payload: any) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row = payload.new;
            if (row && row.date_key) {
              const memoryItem: MemoryItem = {
                id: row.id,
                date_key: row.date_key,
                type: row.type || 'journal',
                title: row.title || '',
                content: row.content || '',
                photo_urls: Array.isArray(row.photo_urls) ? row.photo_urls : (row.photo_url ? [row.photo_url] : []),
                author: row.author || 'anh',
                sticker: row.sticker || '',
                created_at: row.created_at || new Date().toISOString()
              };

              setMemories(prev => {
                const arr = prev[row.date_key] || [];
                const exists = arr.findIndex(m => m.id === row.id);
                if (exists >= 0) {
                  const newArr = [...arr];
                  newArr[exists] = memoryItem;
                  return { ...prev, [row.date_key]: newArr };
                }
                return { ...prev, [row.date_key]: [...arr, memoryItem] };
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old;
            if (oldRow && oldRow.id) {
              setMemories(prev => {
                const next = { ...prev };
                for (const key of Object.keys(next)) {
                  const arr = next[key];
                  const filtered = arr.filter(m => m.id !== oldRow.id);
                  if (filtered.length !== arr.length) {
                    if (filtered.length === 0) {
                      delete next[key];
                    } else {
                      next[key] = filtered;
                    }
                    break;
                  }
                }
                return next;
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload: any) => {
          if (payload.new && (payload.new.id === 'em' || payload.new.id === 'anh')) {
            const p = payload.new;
            setProfiles(prev => ({
              ...prev,
              [p.id]: {
                id: p.id,
                nickname: p.nickname || (p.id === 'em' ? '' : ''),
                subtitle: p.subtitle || '',
                avatar: p.avatar || '',
                likes: Array.isArray(p.likes) ? p.likes : [],
                dislikes: Array.isArray(p.dislikes) ? p.dislikes : [],
                notes: p.notes || '',
                milestones: Array.isArray(p.milestones) ? p.milestones : []
              }
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [todayKey]);

  // Lưu kỷ niệm
  const handleSaveMemory = async (newMemory: MemoryItem) => {
    // 1. Cập nhật UI ngay lập tức
    setMemories(prev => {
      const dayMemories = prev[selectedDateKey] || [];
      const isEdit = dayMemories.some(m => m.id === newMemory.id);
      return {
        ...prev,
        [selectedDateKey]: isEdit
          ? dayMemories.map(m => m.id === newMemory.id ? newMemory : m)
          : [...dayMemories, newMemory]
      };
    });

    // 2. Đồng bộ vào profile.milestones nếu là KỶ NIỆM ('special') của Em hoặc Anh
    (['em', 'anh'] as const).forEach(authorKey => {
      const shouldBeInMilestones = newMemory.type === 'special' && newMemory.author === authorKey;

      setProfiles(prev => {
        const p = prev[authorKey];
        if (!p) return prev;
        const cur = [...(p.milestones || [])];
        const idx = cur.findIndex(s => {
          try { return JSON.parse(s).id === newMemory.id; } catch { return false; }
        });

        let changed = false;
        if (shouldBeInMilestones) {
          const mStr = JSON.stringify({
            id: newMemory.id,
            text: newMemory.content.trim() || newMemory.title,
            timestamp: new Date(selectedDateKey).toISOString(),
            photos: newMemory.photo_urls
          });
          if (idx !== -1) {
            cur[idx] = mStr;
            changed = true;
          } else {
            cur.unshift(mStr);
            changed = true;
          }
        } else {
          if (idx !== -1) {
            cur.splice(idx, 1);
            changed = true;
          }
        }

        if (!changed) return prev;

        cur.sort((a, b) => {
          let tA = 0, tB = 0;
          try { tA = new Date(JSON.parse(a).timestamp).getTime(); } catch { }
          try { tB = new Date(JSON.parse(b).timestamp).getTime(); } catch { }
          return tB - tA;
        });

        supabase.from('profiles').update({
          milestones: cur,
          updated_at: new Date().toISOString()
        }).eq('id', authorKey).then();

        return {
          ...prev,
          [authorKey]: { ...p, milestones: cur }
        };
      });
    });

    // 3. Lưu đồng bộ lên Supabase
    const { error } = await supabase.from('memories').upsert({
      id: newMemory.id,
      date_key: selectedDateKey,
      type: newMemory.type,
      title: newMemory.title,
      content: newMemory.content,
      photo_urls: newMemory.photo_urls,
      author: newMemory.author,
      sticker: newMemory.sticker,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    if (error) {
      console.error('Lỗi lưu kỷ niệm:', error);
      showAlert('Lỗi lưu kỷ niệm lên Supabase: ' + error.message, 'Lỗi lưu trữ');
    }
  };

  // Xóa kỷ niệm
  const handleDeleteMemory = async (idToDelete: string) => {
    showConfirm('Bạn có chắc chắn muốn xóa mẩu chuyện này không? Hành động này không thể hoàn tác.', async () => {
      // Xóa ở local trước
      setMemories((prev: MemoriesRecord) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          const arr = next[key];
          const filtered = arr.filter(m => m.id !== idToDelete);
          if (filtered.length !== arr.length) {
            if (filtered.length === 0) {
              delete next[key];
            } else {
              next[key] = filtered;
            }
            break;
          }
        }
        return next;
      });

      // Đồng thời đồng bộ xóa trong profiles.em và profiles.anh nếu có milestone tương ứng
      setProfiles(prev => {
        let changed = false;
        const next = { ...prev };
        (['em', 'anh'] as const).forEach(k => {
          const p = next[k];
          if (p && p.milestones) {
            const filtered = p.milestones.filter(s => {
              try { return JSON.parse(s).id !== idToDelete; } catch { return true; }
            });
            if (filtered.length !== p.milestones.length) {
              changed = true;
              next[k] = { ...p, milestones: filtered };
              supabase.from('profiles').update({
                milestones: filtered,
                updated_at: new Date().toISOString()
              }).eq('id', k).then();
            }
          }
        });
        return changed ? next : prev;
      });

      // Xóa trên Supabase
      const { error } = await supabase.from('memories').delete().eq('id', idToDelete);
      if (error) {
        console.error('Lỗi xóa trên Supabase:', error);
        showAlert('Lỗi xóa kỷ niệm trên Supabase: ' + error.message, 'Lỗi lưu trữ');
      }
    });
  };

  // Lưu milestone trực tiếp từ profile
  const handleSaveMilestoneFromProfile = async (
    author: 'em' | 'anh',
    milestone: { id: string; date: string; text: string; photos: string[] }
  ) => {
    const dateKey = milestone.date || todayKey;
    const finalTitle = milestone.text.trim().split('\n')[0].slice(0, 40) || 'Kỷ niệm khó quên';

    const memoryItem: MemoryItem = {
      id: milestone.id,
      date_key: dateKey,
      type: 'special',
      title: finalTitle,
      content: milestone.text.trim(),
      photo_urls: milestone.photos,
      author: author,
      sticker: '💖',
      created_at: new Date(dateKey).toISOString()
    };

    setMemories(prev => {
      const next: MemoriesRecord = { ...prev };
      for (const k of Object.keys(next)) {
        const filtered = next[k].filter(m => m.id !== milestone.id);
        if (filtered.length === 0) delete next[k];
        else next[k] = filtered;
      }
      next[dateKey] = [memoryItem, ...(next[dateKey] || [])];
      return next;
    });

    const milestoneStr = JSON.stringify({
      id: milestone.id,
      text: milestone.text,
      timestamp: new Date(dateKey).toISOString(),
      photos: milestone.photos
    });

    setProfiles(prev => {
      const p = prev[author];
      const cur = [...(p.milestones || [])];
      const idx = cur.findIndex(s => {
        try { return JSON.parse(s).id === milestone.id; } catch { return false; }
      });
      if (idx !== -1) {
        cur[idx] = milestoneStr;
      } else {
        cur.unshift(milestoneStr);
      }
      cur.sort((a, b) => {
        let tA = 0, tB = 0;
        try { tA = new Date(JSON.parse(a).timestamp).getTime(); } catch { }
        try { tB = new Date(JSON.parse(b).timestamp).getTime(); } catch { }
        return tB - tA;
      });
      return {
        ...prev,
        [author]: { ...p, milestones: cur }
      };
    });

    try {
      await supabase.from('memories').upsert({
        id: memoryItem.id,
        date_key: memoryItem.date_key,
        type: memoryItem.type,
        title: memoryItem.title,
        content: memoryItem.content,
        photo_urls: memoryItem.photo_urls,
        author: memoryItem.author,
        sticker: memoryItem.sticker,
        created_at: memoryItem.created_at,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      const cur = profiles[author]?.milestones || [];
      const filtered = cur.filter(s => {
        try { return JSON.parse(s).id !== milestone.id; } catch { return true; }
      });
      const updatedCur = [milestoneStr, ...filtered];
      await supabase.from('profiles').update({
        milestones: updatedCur,
        updated_at: new Date().toISOString()
      }).eq('id', author);
    } catch (err) {
      console.error('Lỗi lưu milestone profile:', err);
    }
  };

  // Xóa milestone từ profile
  const handleDeleteMilestoneFromProfile = async (author: 'em' | 'anh', milestoneId: string) => {
    try {
      setMemories(prev => {
        const next: MemoriesRecord = { ...prev };
        for (const k of Object.keys(next)) {
          const filtered = next[k].filter(m => m.id !== milestoneId);
          if (filtered.length === 0) delete next[k];
          else next[k] = filtered;
        }
        return next;
      });

      setProfiles(prev => {
        const p = prev[author];
        const cur = (p.milestones || []).filter(s => {
          try { return JSON.parse(s).id !== milestoneId; } catch { return true; }
        });
        return {
          ...prev,
          [author]: { ...p, milestones: cur }
        };
      });

      await supabase.from('memories').delete().eq('id', milestoneId);

      const cur = profiles[author]?.milestones || [];
      const updatedCur = cur.filter(s => {
        try { return JSON.parse(s).id !== milestoneId; } catch { return true; }
      });
      await supabase.from('profiles').update({
        milestones: updatedCur,
        updated_at: new Date().toISOString()
      }).eq('id', author);
    } catch (err) {
      console.error('Lỗi xóa milestone profile:', err);
    }
  };

  // Lưu profile
  const handleSaveProfile = async (profileKey: 'em' | 'anh', updated: ProfileData) => {
    setProfiles(prev => ({ ...prev, [profileKey]: updated }));
    try {
      await supabase.from('profiles').upsert({
        id: profileKey,
        nickname: updated.nickname,
        subtitle: updated.subtitle,
        avatar: updated.avatar,
        likes: updated.likes,
        dislikes: updated.dislikes,
        notes: updated.notes,
        milestones: updated.milestones,
        milestone_photos: updated.milestone_photos || [],
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    } catch (err) {
      console.warn('Lỗi lưu profile lên Supabase:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff6f6] via-[#fffafb] to-[#fbf7f8] text-[#554444] px-4 py-8 selection:bg-rose-100 selection:text-rose-600">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* --- THANH MENU ĐIỀU HƯỚNG --- */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          enableSecretTab={enableSecretTab}
        />

        {/* --- NỘI DUNG CHÍNH CỦA CÁC TAB --- */}
        <main>
          <AnimatePresence mode="wait">
            {/* TAB LỜI CHÀO */}
            {activeTab === 'welcome' && (
              <WelcomeTab
                key="welcome"
                onGoToMemories={() => setActiveTab('memories')}
              />
            )}

            {/* TAB KỶ NIỆM & LỊCH TƯƠNG TÁC */}
            {activeTab === 'memories' && (
              <MemoriesTab
                key="memories"
                memories={memories}
                selectedDateKey={selectedDateKey}
                setSelectedDateKey={setSelectedDateKey}
                todayKey={todayKey}
                onSaveMemory={handleSaveMemory}
                onDeleteMemory={handleDeleteMemory}
                onViewPhoto={setViewPhoto}
                showAlert={showAlert}
                pendingFormOpen={pendingFormOpen}
                onClearPendingFormOpen={() => setPendingFormOpen(null)}
              />
            )}

            {/* TAB HER */}
            {activeTab === 'em' && (
              <motion.div
                key="em"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <ProfileTab
                  profileKey="em"
                  profile={profiles.em}
                  badgeColor="bg-pink-100 text-pink-600"
                  onSave={handleSaveProfile}
                  onViewPhoto={setViewPhoto}
                  memories={memories}
                  onSaveMilestone={(m) => handleSaveMilestoneFromProfile('em', m)}
                  onDeleteMilestone={(id) => handleDeleteMilestoneFromProfile('em', id)}
                  showConfirm={showConfirm}
                />
              </motion.div>
            )}

            {/* TAB HIM */}
            {activeTab === 'anh' && (
              <motion.div
                key="anh"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <ProfileTab
                  profileKey="anh"
                  profile={profiles.anh}
                  badgeColor="bg-indigo-50 text-indigo-500"
                  onSave={handleSaveProfile}
                  onViewPhoto={setViewPhoto}
                  memories={memories}
                  onSaveMilestone={(m) => handleSaveMilestoneFromProfile('anh', m)}
                  onDeleteMilestone={(id) => handleDeleteMilestoneFromProfile('anh', id)}
                  showConfirm={showConfirm}
                />
              </motion.div>
            )}

            {/* TAB CHÚNG TA (FEED) */}
            {activeTab === 'us' && (
              <UsTab
                key="us"
                memories={memories}
                onOpenMemoryForm={(dateKey, existing, defaultAuthor, defaultType) => {
                  setPendingFormOpen({
                    dateKey,
                    memory: existing,
                    defaultAuthor,
                    defaultType
                  });
                  if (dateKey) setSelectedDateKey(dateKey);
                  setActiveTab('memories');
                }}
                onDeleteMemory={handleDeleteMemory}
                onViewPhoto={setViewPhoto}
              />
            )}

            {/* TAB BÍ MẬT ??? (MINI GAME) */}
            {activeTab === 'secret' && enableSecretTab && (
              <motion.div
                key="secret"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <SecretGameTab />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* DIALOG TUỲ CHỈNH */}
      <CustomDialog dialogConfig={dialogConfig} onClose={closeDialog} />

      {/* MODAL XEM ẢNH TOÀN CỤC */}
      <AnimatePresence>
        {viewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setViewPhoto(null)}
          >
            <button
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition cursor-pointer"
              onClick={() => setViewPhoto(null)}
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={viewPhoto}
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}