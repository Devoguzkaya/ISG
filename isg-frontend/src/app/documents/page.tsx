"use client";

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft,
  Loader2,
  Calendar,
  MapPin,
  Construction,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { workStatusApi } from '@/lib/api';

export default function DocumentTrackingPage() {
  const [workDays, setWorkDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await workStatusApi.getAll();
      // Only show days where work occurred
      const filtered = res.data
        .filter((d: any) => d.workOccurred)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setWorkDays(filtered);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (day: any, field: string) => {
    const key = `${day.id}-${field}`;
    setUpdating(key);
    try {
      const updatedDay = { ...day, [field]: !day[field] };
      await workStatusApi.save(updatedDay);
      
      // Update local state
      setWorkDays(prev => prev.map(d => d.id === day.id ? updatedDay : d));
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setUpdating(null);
    }
  };

  const filteredDays = workDays.filter(d => 
    d.date.includes(searchQuery) ||
    (d.location && d.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const docColumns = [
    { key: 'siteAuditReady', label: 'Saha Denetimi' },
    { key: 'craneChecklistReady', label: 'Vinç Kontrolü' },
    { key: 'workPermitReady', label: 'İş İzin Formu' },
    { key: 'riskAnalysisReady', label: 'Risk Analizi' }
  ];

  return (
    <div className="space-y-8 animate-fade pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Link href="/" className="hover:text-primary transition-colors font-bold">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-foreground font-black uppercase tracking-tighter">Evrak Takibi</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-primary">GÜNLÜK EVRAK TAKİBİ</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Çalışma Yapılan Günlere Ait Zorunlu Form Kontrolü</p>
        </div>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Tarih veya lokasyon ile ara..."
          className="w-full pl-12 pr-4 py-4 bg-background border-2 border-border rounded-2xl focus:border-primary focus:ring-0 transition-all font-bold text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Veriler Yükleniyor...</p>
        </div>
      ) : (
        <div className="card-premium overflow-hidden border-2 shadow-2xl p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary/50 border-b-2 border-border">
                  <th className="p-4 text-left min-w-[150px] border-r border-border">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">TARİH & LOKASYON</span>
                  </th>
                  {docColumns.map(col => (
                    <th key={col.key} className="p-4 text-center min-w-[140px] border-r border-border last:border-r-0">
                      <span className="text-[9px] font-black uppercase leading-tight text-slate-500">{col.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-border">
                {filteredDays.map(day => (
                  <tr key={day.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="p-4 border-r border-border">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-primary" />
                          <span className="font-black text-sm text-foreground">{new Date(day.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{day.location || 'KONUM BELİRTİLMEMİŞ'}</span>
                        </div>
                      </div>
                    </td>
                    {docColumns.map(col => {
                      const isReady = day[col.key] || false;
                      const isUpdating = updating === `${day.id}-${col.key}`;
                      
                      return (
                        <td key={col.key} className="p-4 text-center border-r border-border last:border-r-0">
                          <button
                            onClick={() => handleToggle(day, col.key)}
                            disabled={isUpdating}
                            className={`
                              w-10 h-10 rounded-xl flex items-center justify-center transition-all mx-auto
                              ${isReady 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}
                              ${isUpdating ? 'animate-pulse opacity-50' : ''}
                            `}
                          >
                            {isUpdating ? (
                              <Loader2 className="animate-spin" size={20} />
                            ) : isReady ? (
                              <CheckCircle2 size={22} />
                            ) : (
                              <XCircle size={22} />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredDays.length === 0 && (
            <div className="py-20 text-center">
              <Construction className="mx-auto text-slate-200 mb-4" size={64} />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 px-10">
                Henüz çalışma yapılan gün işaretlenmemiş. Takvimden "Çalışma Var" olarak işaretlediğiniz günler burada listelenir.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
