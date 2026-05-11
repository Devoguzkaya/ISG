"use client";

import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Shell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on navigation (mobile)
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container — desktop: flex item, mobile: fixed overlay */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:static lg:inset-auto lg:z-auto transform lg:transform-none transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={closeSidebar} />
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-primary text-white sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-black italic tracking-tighter text-accent">ISG PRO</h1>
          </div>
          <Link 
            href="/checklists/new?type=SITE_AUDIT"
            className="p-2 bg-accent text-accent-foreground rounded-lg shadow-lg animate-pulse"
          >
            <Zap size={20} className="fill-current" />
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-4 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
