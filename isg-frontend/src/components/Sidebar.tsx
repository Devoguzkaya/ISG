"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Users, 
  Truck, 
  Notebook,
  Settings as SettingsIcon,
  CalendarDays,
  Zap,
  Sun,
  Moon,
  FileCheck,
  History
} from 'lucide-react';
import { settingsApi } from '@/lib/api';
import { useTheme } from './ThemeProvider';

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [companyName, setCompanyName] = useState('Öz Çeliker Elektrik');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsApi.getAll();
        if (res.data.companyName) setCompanyName(res.data.companyName);
      } catch (err) {
        console.error('Sidebar settings load error:', err);
      }
    };
    fetchSettings();
  }, [pathname]); // Refresh when navigating

  const navItems = [
    { name: 'Genel Durum', href: '/', icon: LayoutDashboard },
    { name: 'Evrak Takibi', href: '/documents', icon: FileCheck },
    { name: 'Takvim', href: '/calendar', icon: CalendarDays },
    { name: 'Denetim Geçmişi', href: '/checklists', icon: History },
    { name: 'Personel Dosyaları', href: '/personnel', icon: Users },
    { name: 'Vinç Bilgileri', href: '/vehicles', icon: Truck },
    { name: 'Saha Notları', href: '/notes', icon: Notebook },
  ];

  return (
    <aside className="h-screen w-64 bg-background text-foreground border-r border-border flex flex-col p-6 shrink-0 sticky top-0 transition-colors duration-300">
      <div className="mb-10 pb-6 border-b border-border">
        <h1 className="text-2xl font-black tracking-tighter text-accent italic">
          ISG PRO
        </h1>
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">
          {companyName}
        </p>
      </div>

      <div className="mb-8">
        <Link 
          href="/checklists/new?type=SITE_AUDIT"
          className="w-full bg-accent text-accent-foreground p-4 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] tracking-widest shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <Zap size={18} className="fill-current group-hover:animate-pulse" />
          SAHA DENETİMİ BAŞLAT
        </Link>
      </div>

      <nav className="flex-grow space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-primary-foreground' : 'group-hover:text-primary transition-colors'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
        
        {/* Mobile-only Quick Action */}
        <div className="lg:hidden mt-6 pb-4">
          <Link 
            href="/checklists/new?type=SITE_AUDIT"
            onClick={onClose}
            className="w-full bg-red-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm shadow-xl shadow-red-600/20 active:scale-[0.98] transition-all"
          >
            <Zap size={20} className="fill-current" />
            HIZLI DENETİM YAP
          </Link>
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-border space-y-2">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-lg"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span className="text-sm">{theme === 'light' ? 'Koyu Mod' : 'Aydınlık Mod'}</span>
        </button>

        <Link 
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          <SettingsIcon size={20} />
          <span className="text-sm">Ayarlar</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
