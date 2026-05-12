"use client";

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft,
  Loader2,
  Filter,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { personnelApi, documentsApi } from '@/lib/api';
import { REQUIRED_PERSONNEL_DOCUMENTS } from '@/lib/templates';

export default function DocumentTrackingPage() {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [docStatuses, setDocStatuses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, dRes] = await Promise.all([
        personnelApi.getAll(),
        documentsApi.getAll()
      ]);
      setPersonnel(pRes.data);
      
      // Organize documents by personnelId
      const statusMap: Record<string, any> = {};
      dRes.data.forEach((doc: any) => {
        const pId = doc.personnel.id;
        if (!statusMap[pId]) statusMap[pId] = {};
        statusMap[pId][doc.documentType] = doc.ready;
      });
      setDocStatuses(statusMap);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (personnelId: number, docType: string, currentStatus: boolean) => {
    const key = `${personnelId}-${docType}`;
    setUpdating(key);
    try {
      await documentsApi.updateStatus(personnelId, docType, !currentStatus);
      
      // Update local state
      setDocStatuses(prev => ({
        ...prev,
        [personnelId]: {
          ...(prev[personnelId] || {}),
          [docType]: !currentStatus
        }
      }));
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setUpdating(null);
    }
  };

  const filteredPersonnel = personnel.filter(p => 
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.role && p.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-foreground font-bold">Fiziksel Evrak Takibi</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-primary">ARŞİV & EVRAK YÖNETİMİ</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Saha Personeli Fiziksel Dosya Takip Çizelgesi</p>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Personel adı veya görevi ile ara..."
            className="w-full pl-12 pr-4 py-4 bg-background border-2 border-border rounded-2xl focus:border-primary focus:ring-0 transition-all font-bold text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Veriler Yükleniyor...</p>
        </div>
      ) : (
        <div className="card-premium overflow-hidden border-2 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary/50 border-b-2 border-border">
                  <th className="sticky left-0 z-20 bg-secondary/80 backdrop-blur-md p-4 text-left min-w-[200px] border-r border-border">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">PERSONEL BİLGİSİ</span>
                  </th>
                  {REQUIRED_PERSONNEL_DOCUMENTS.map(doc => (
                    <th key={doc} className="p-4 text-center min-w-[120px] border-r border-border last:border-r-0">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-black uppercase leading-tight text-slate-500 max-w-[100px]">{doc}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-border">
                {filteredPersonnel.map(person => (
                  <tr key={person.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="sticky left-0 z-10 bg-background/95 backdrop-blur-sm p-4 border-r border-border group-hover:bg-secondary/50 transition-colors">
                      <Link href={`/personnel/${person.id}`} className="block group/link">
                        <p className="font-black text-foreground text-sm leading-tight flex items-center gap-2">
                          {person.fullName}
                          <ArrowRight size={14} className="opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{person.role || 'GÖREV BELİRTİLMEMİŞ'}</p>
                      </Link>
                    </td>
                    {REQUIRED_PERSONNEL_DOCUMENTS.map(doc => {
                      const isReady = docStatuses[person.id]?.[doc] || false;
                      const isUpdating = updating === `${person.id}-${doc}`;
                      
                      return (
                        <td key={doc} className="p-4 text-center border-r border-border last:border-r-0">
                          <button
                            onClick={() => handleToggle(person.id, doc, isReady)}
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
          {filteredPersonnel.length === 0 && (
            <div className="py-20 text-center">
              <FileText className="mx-auto text-slate-200 mb-4" size={64} />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Aranan kriterde personel bulunamadı.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
