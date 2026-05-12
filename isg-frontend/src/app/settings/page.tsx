"use client";

import { useEffect, useState } from 'react';
import { 
  Settings, 
  Building2, 
  Globe, 
  Bell, 
  ShieldCheck, 
  Save, 
  Loader2,
  User,
  Layout,
  RefreshCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { settingsApi } from '@/lib/api';

const SettingsPage = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    companyName: 'Öz Çeliker Elektrik',
    projectName: 'Sinop LED Dönüşüm Projesi',
    alertThreshold: '30'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsApi.getAll();
        if (Object.keys(res.data).length > 0) {
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Ayarlar yüklenemedi:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await settingsApi.update(settings);
      setStatus({ type: 'success', message: 'Ayarlar başarıyla kaydedildi.' });
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: 'Kaydedilirken bir hata oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1550px] mx-auto space-y-8 animate-fade pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary flex items-center gap-3">
            <Settings className="text-accent" />
            Sistem Ayarları
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Uygulama genelindeki yapılandırmaları ve tercihlerini yönet.</p>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ayarlar yükleniyor...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-premium space-y-6 shadow-xl border-slate-100">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Building2 size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-primary">Kurumsal Bilgiler</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-300 tracking-widest">Şirket Adı</label>
                  <input 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-primary focus:ring-2 focus:ring-primary/10 outline-none"
                    value={settings.companyName}
                    onChange={e => setSettings({...settings, companyName: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-300 tracking-widest">Proje Adı</label>
                  <input 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-primary focus:ring-2 focus:ring-primary/10 outline-none"
                    value={settings.projectName}
                    onChange={e => setSettings({...settings, projectName: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="card-premium space-y-6 shadow-xl border-slate-100">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <Bell size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-primary">Bildirim ve Uyarılar</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Evrak Uyarı Eşiği (Gün)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range"
                      min="7"
                      max="90"
                      step="1"
                      className="flex-grow accent-primary"
                      value={settings.alertThreshold}
                      onChange={e => setSettings({...settings, alertThreshold: e.target.value})}
                    />
                    <span className="w-12 text-center p-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-black text-primary text-sm">
                      {settings.alertThreshold}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-2 italic">
                    * Evrak bitişine bu kadar gün kala sistem uyarı verir.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar / Info */}
          <div className="space-y-6">
            <div className="card-premium text-center py-8 shadow-xl border-slate-100">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 mx-auto mb-4 flex items-center justify-center text-primary shadow-inner">
                <User size={40} />
              </div>
              <h3 className="text-xl font-black text-primary">Oğuzhan Kaya</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-1">Sistem Yöneticisi</p>
              
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4 text-left">
                <div className="flex items-center gap-3 text-xs text-primary">
                  <ShieldCheck size={16} className="text-accent" />
                  <span className="font-bold">Tam Yetkili Erişim</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-primary">
                  <RefreshCcw size={16} className="text-accent" />
                  <span className="font-bold">Son Giriş: Bugün, 09:20</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 hover:bg-slate-800 shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest"
            >
              {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
              DEĞİŞİKLİKLERİ KAYDET
            </button>

            {status && (
              <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300 ${
                status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <p className="text-xs font-bold">{status.message}</p>
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;
