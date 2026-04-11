"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Users, 
  Truck, 
  Notebook,
  Settings,
  CalendarDays,
  Zap
} from 'lucide-react';

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Takvim', href: '/calendar', icon: CalendarDays },
    { name: 'Denetim Geçmişi', href: '/checklists', icon: ClipboardCheck },
    { name: 'Personel Dosyaları', href: '/personnel', icon: Users },
    { name: 'Vinç Bilgileri', href: '/vehicles', icon: Truck },
    { name: 'Saha Notları', href: '/notes', icon: Notebook },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary text-white flex flex-col p-6 z-50">
      <div className="mb-10 pb-6 border-b border-white/10">
        <h1 className="text-2xl font-black tracking-tighter text-accent italic">
          ISG PRO
        </h1>
        <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mt-1">
          Öz Çeliker Elektrik
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

      <nav className="flex-grow space-y-2">
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
                  ? 'bg-accent text-accent-foreground font-bold shadow-lg shadow-accent/20' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-accent-foreground' : 'group-hover:text-accent transition-colors'} />
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

      <div className="mt-auto pt-6 border-t border-white/10">
        <Link 
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white transition-colors"
        >
          <Settings size={20} />
          <span className="text-sm">Ayarlar</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
