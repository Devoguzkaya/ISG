"use client";

import { useEffect, useState } from 'react';
import { ClipboardCheck, Plus, Search, Calendar, CheckCircle2, XCircle, Clock, ChevronRight, Loader2, MapPin, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { checklistsApi } from '@/lib/api';
import { MapModal } from '@/components/MapModal';

const ChecklistsPage = () => {
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForMap, setSelectedForMap] = useState<any>(null);

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      const res = await checklistsApi.getAll();
      setChecklists(res.data);
    } catch (err) {
      console.error('Checklist çekme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  const handleUpdateLocation = async (pos: [number, number]) => {
    if (!selectedForMap) return;
    try {
      const updated = { ...selectedForMap, latitude: pos[0], longitude: pos[1] };
      await checklistsApi.update(selectedForMap.id, updated);
      alert('Konum başarıyla güncellendi kanka!');
      fetchChecklists();
    } catch (err) {
      console.error(err);
      alert('Güncelleme sırasında hata oluştu.');
    }
  };

  const getOverallStatus = (item: any) => {
    // If any PERSONNEL audit is faulty, the whole report is "KUSURLU" for visual clarity
    const hasFaultyPersonnel = item.personnelAudits?.some((p: any) => !p.isCompliant);
    const hasFaultyItems = item.items?.some((i: any) => i.result === false);
    return (hasFaultyPersonnel || hasFaultyItems) ? 'KUSURLU' : 'UYGUN';
  };

  return (
    <div className="space-y-8 animate-fade">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">Denetim Geçmişi</h1>
          <p className="text-muted-foreground mt-1">Vinç denetimleri ve saha İSG denetim kayıtları.</p>
        </div>
        <Link href="/checklists/new" className="bg-primary text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
          <Plus size={22} />
          Yeni Denetim Başlat
        </Link>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : (
        <div className="card-premium overflow-hidden p-0 bg-white shadow-xl border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Tarih</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Araç / Lokasyon</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Denetlenen Ekip</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tür</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Durum</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {checklists.map((item) => {
                  const status = getOverallStatus(item);
                  const isSiteAudit = item.type === 'SITE_AUDIT';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-6">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-black text-slate-700">{new Date(item.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}</span>
                          <span className="text-[10px] font-bold text-slate-400">{new Date(item.createdAt).getFullYear()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-black text-primary">{item.vehicle?.plate || item.siteLocation || 'BELİRTİLMEMİŞ'}</span>
                             {item.latitude && (
                               <a 
                                 href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`} 
                                 target="_blank" 
                                 className="text-blue-500 hover:text-blue-700 transition-colors"
                                 title="Google Maps üzerinde gör"
                                 onClick={(e) => e.stopPropagation()}
                               >
                                 <ExternalLink size={14} />
                               </a>
                             )}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-slate-300" />
                            <span className="text-xs text-slate-500 font-medium">{item.siteLocation || 'Konum bilgisi yok'}</span>
                            <button 
                              onClick={() => setSelectedForMap(item)} 
                              className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter ml-2"
                            >
                              {item.latitude ? 'KONUMU GÜNCELLE' : 'KONUM EKLE'}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {isSiteAudit ? (
                            item.personnelAudits?.map((p: any) => (
                              <span key={p.id} title={p.remarks} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.isCompliant ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100 ring-1 ring-red-200'}`}>
                                {p.personnelName}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-600 font-bold">{item.personnel?.fullName}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6 font-black italic">
                        <div className="text-[10px] text-slate-400">
                          {item.type === 'DAILY_VEHICLE' ? 'GÜNLÜK VİNÇ' : 'SAHA İSG'}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className={`flex items-center justify-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-lg w-fit mx-auto ${
                          status === 'UYGUN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'
                        }`}>
                          {status === 'UYGUN' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                          {status}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button className="p-2 hover:bg-white rounded-lg transition-all group-hover:scale-110 active:scale-95 shadow-sm border border-transparent hover:border-slate-200 text-primary">
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {checklists.length === 0 && (
            <div className="py-24 text-center">
              <ClipboardCheck className="mx-auto text-slate-200 mb-4" size={64} />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Henüz denetim kaydı bulunmamaktadır kanka.</p>
            </div>
          )}
        </div>
      )}

      <MapModal 
        isOpen={!!selectedForMap}
        onClose={() => setSelectedForMap(null)}
        initialPos={selectedForMap?.latitude ? [selectedForMap.latitude, selectedForMap.longitude] : null}
        onSave={handleUpdateLocation}
      />
    </div>
  );
};

export default ChecklistsPage;
