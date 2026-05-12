"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  ClipboardCheck,
  Zap,
  ShieldCheck,
  ArrowRight,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Construction
} from 'lucide-react';
import { CHECKLIST_TYPES } from '@/lib/templates';
import { Modal } from '@/components/Modal';
import { checklistsApi, workStatusApi } from '@/lib/api';

const CalendarPage = () => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [checklists, setChecklists] = useState<any[]>([]);
  const [workStatuses, setWorkStatuses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const [cRes, wRes] = await Promise.all([
        checklistsApi.getAll(),
        workStatusApi.getAll()
      ]);
      setChecklists(cRes.data);
      
      const statusMap: Record<string, any> = {};
      wRes.data.forEach((s: any) => {
        statusMap[s.date] = s;
      });
      setWorkStatuses(statusMap);
    } catch (err) {
      console.error('Takvim verisi çekme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSaveDayStatus = async (dateStr: string, workOccurred: boolean, location: string) => {
    try {
      const existing = workStatuses[dateStr] || { date: dateStr };
      const updated = { ...existing, workOccurred, location };
      const res = await workStatusApi.save(updated);
      setWorkStatuses(prev => ({ ...prev, [dateStr]: res.data }));
    } catch (err) {
      console.error('Durum kaydetme hatası:', err);
    }
  };

  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);
  const today = new Date();

  const handleDateClick = (day: number) => {
    const d = new Date(year, month, day);
    setSelectedDate(d);
    setIsModalOpen(true);
  };

  const handleFormSelect = (type: string) => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    router.push(`/checklists/new?type=${type}&date=${dateStr}`);
  };

  const renderCells = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-28 sm:h-36 border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30"></div>);
    }
    
    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
      const status = workStatuses[dateStr] || { workOccurred: false };
      const workOccurred = status.workOccurred;
      const dayChecklists = checklists.filter(c => c.createdAt && c.createdAt.startsWith(dateStr));
      
      // Compliance Logic: Red if work occurred but no reports
      const isCriticalMissing = workOccurred && dayChecklists.length === 0;
      const isCompliant = workOccurred && dayChecklists.length > 0;

      cells.push(
        <div 
          key={d} 
          onClick={() => handleDateClick(d)}
          className={`h-28 sm:h-36 border-b border-r border-slate-100 dark:border-slate-800 p-2 sm:p-3 transition-all relative group flex flex-col cursor-pointer ${
            isCriticalMissing ? 'bg-red-50/50 dark:bg-red-900/20' : isCompliant ? 'bg-green-50/30 dark:bg-green-900/20' : ''
          } ${isToday ? 'ring-2 ring-primary ring-inset z-10' : ''}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-black ${isToday ? 'text-primary' : 'text-slate-400'}`}>
              {d.toString().padStart(2, '0')}
            </span>
            {workOccurred && (
              <div className="text-amber-500" title="Çalışma Var">
                <Construction size={14} />
              </div>
            )}
          </div>

          <div className="flex-grow">
            {status.location && (
              <p className="text-[9px] font-black text-slate-500 uppercase leading-tight truncate mb-1" title={status.location}>
                {status.location}
              </p>
            )}
            <div className="flex flex-wrap gap-1 mt-1">
              {dayChecklists.map((c, idx) => (
                <div key={idx} className="w-2 h-2 rounded-full bg-primary" title={c.type}></div>
              ))}
            </div>
            
            {isCriticalMissing && (
              <div className="mt-2 animate-pulse flex items-center gap-1 text-[8px] font-black text-red-600 uppercase tracking-tighter">
                <AlertCircle size={10} /> Eksik Rapor!
              </div>
            )}
            
            {isCompliant && (
              <div className="mt-2 flex items-center gap-1 text-[8px] font-black text-green-600 uppercase tracking-tighter">
                <CheckCircle2 size={10} /> Tamamlandı
              </div>
            )}
          </div>

          <button 
            className="absolute bottom-2 right-2 p-1.5 bg-white border border-slate-200 rounded-lg text-primary opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:scale-110"
          >
            <Plus size={14} />
          </button>
        </div>
      );
    }
    return cells;
  };

  const selectedDateStr = selectedDate?.toISOString().split('T')[0] || '';
  const selectedStatus = workStatuses[selectedDateStr] || { workOccurred: false, location: '' };

  return (
    <div className="space-y-8 animate-fade pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary flex items-center gap-3">
            <CalendarIcon className="text-accent" />
            İSG Denetim Takvimi
          </h1>
          <p className="text-muted-foreground mt-1">
            Çalışma olan günlerde ( <Construction className="inline text-amber-500" size={14} /> ) denetim formu doldurmak zorunludur.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white border border-border p-1 rounded-xl shadow-sm">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ChevronLeft size={20} /></button>
          <div className="font-bold text-slate-700 min-w-[140px] text-center">
            {monthNames[month]} {year}
          </div>
          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ChevronRight size={20} /></button>
        </div>
      </header>

      {loading ? (
        <div className="card-premium py-20 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Veriler Yükleniyor...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Desktop Grid View */}
          <div className="hidden lg:block card-premium p-0 overflow-hidden border-border bg-white shadow-xl">
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              {dayNames.map(d => (
                <div key={d} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 italic">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 border-l border-slate-100">
              {renderCells()}
            </div>
          </div>

          {/* Mobile Agenda View */}
          <div className="lg:hidden space-y-3">
            {Array.from({ length: days }, (_, i) => i + 1).map(d => {
              const date = new Date(year, month, d);
              const dateStr = date.toISOString().split('T')[0];
              const status = workStatuses[dateStr] || { workOccurred: false };
              const workOccurred = status.workOccurred;
              const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
              const dayChecklists = checklists.filter(c => c.createdAt && c.createdAt.startsWith(dateStr));
              const isCriticalMissing = workOccurred && dayChecklists.length === 0;
              const isCompliant = workOccurred && dayChecklists.length > 0;

              return (
                <div 
                  key={d} 
                  onClick={() => handleDateClick(d)}
                  className={`card-premium p-4 flex items-center justify-between gap-4 transition-all active:scale-[0.98] ${
                    isCriticalMissing ? 'border-l-4 border-l-red-600 bg-red-50/30 dark:bg-red-900/20' : 
                    isCompliant ? 'border-l-4 border-l-green-600 bg-green-50/30 dark:bg-green-900/20' : 
                    isToday ? 'ring-2 ring-primary ring-inset' : 'border-l-4 border-l-slate-100 dark:border-l-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center min-w-[40px]">
                      <span className={`text-lg font-black leading-none ${isToday ? 'text-primary' : 'text-slate-700'}`}>{d.toString().padStart(2, '0')}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{dayNames[new Date(year, month, d).getDay()]}</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        {workOccurred ? (
                          <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded uppercase tracking-tighter">ÇALIŞMA VAR</span>
                        ) : (
                          <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">TATİL</span>
                        )}
                        {status.location && (
                          <span className="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[100px]">{status.location}</span>
                        )}
                      </div>
                      
                      <div className="mt-1 flex gap-1">
                        {dayChecklists.length > 0 ? (
                          <span className="text-[10px] font-bold text-slate-500">{dayChecklists.length} Rapor</span>
                        ) : workOccurred ? (
                          <span className="text-[10px] font-bold text-red-600 animate-pulse">EKSİK RAPOR!</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 text-primary">
                      <Plus size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`${selectedDate?.toLocaleDateString('tr-TR')} - Gün Özeti & İşlemler`}
      >
        <div className="space-y-8">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <Construction size={14} className="text-amber-500" />
              Günün Çalışma Durumu
            </h3>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleSaveDayStatus(selectedDateStr, !selectedStatus.workOccurred, selectedStatus.location || '')}
                className={`flex-1 py-4 rounded-xl font-black text-sm transition-all border-2 ${
                  selectedStatus.workOccurred 
                    ? 'bg-amber-500 border-amber-600 text-white shadow-lg shadow-amber-200' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                {selectedStatus.workOccurred ? 'ÇALIŞMA VAR' : 'ÇALIŞMA YOK'}
              </button>
            </div>

            {selectedStatus.workOccurred && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Çalışma Yapılan Bölge / Lokasyon</label>
                <input 
                  type="text"
                  placeholder="Örn: Sinop Merkez Gelincik Mah."
                  className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl focus:border-amber-500 focus:ring-0 transition-all font-bold text-sm"
                  value={selectedStatus.location || ''}
                  onChange={(e) => handleSaveDayStatus(selectedDateStr, true, e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Hızlı Form Oluştur</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(CHECKLIST_TYPES).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => handleFormSelect(type)}
                  className="group flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-blue-50/50 transition-all text-left"
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm text-primary group-hover:scale-110 transition-transform">
                    {type === 'DAILY_VEHICLE' && <Truck size={16} />}
                    {type === 'WORK_PERMIT' && <ShieldCheck size={16} />}
                    {type === 'RISK_ANALYSIS' && <Zap size={16} />}
                    {type === 'SITE_AUDIT' && <ClipboardCheck size={16} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">{type}</p>
                    <p className="text-xs font-bold text-slate-700 leading-tight">{label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarPage;
