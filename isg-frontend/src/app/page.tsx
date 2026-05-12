"use client";

import { useEffect, useState } from 'react';
import { 
  Truck, 
  Users, 
  ClipboardCheck, 
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { vehiclesApi, personnelApi, checklistsApi, complianceApi } from '@/lib/api';

export default function Home() {
  const [stats, setStats] = useState({
    vehicles: 0,
    personnel: 0,
    checklists: 0,
    issues: 0
  });
  const [expiringDocs, setExpiringDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [v, p, c, certs, docs] = await Promise.all([
          vehiclesApi.getAll(),
          personnelApi.getAll(),
          checklistsApi.getAll(),
          complianceApi.getExpiringCertificates(30),
          complianceApi.getExpiringVehicleDocuments(30)
        ]);
        
        setStats({
          vehicles: v.data.length,
          personnel: p.data.length,
          checklists: c.data.length,
          issues: certs.data.length + docs.data.length
        });

        setExpiringDocs([
          ...certs.data.map((i: any) => ({ ...i, category: 'PERSONNEL' })),
          ...docs.data.map((i: any) => ({ ...i, category: 'VEHICLE' }))
        ]);
      } catch (err) {
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Aktif Vinçler', value: `${stats.vehicles} / ${stats.vehicles}`, icon: Truck, color: 'text-blue-600' },
    { label: 'Saha Personeli', value: stats.personnel.toString(), icon: Users, color: 'text-indigo-600' },
    { label: 'Toplam Kontrol', value: stats.checklists.toString(), icon: ClipboardCheck, color: 'text-orange-600' },
    { label: 'Kritik Uyarı', value: stats.issues.toString(), icon: AlertTriangle, color: stats.issues > 0 ? 'text-red-500' : 'text-green-600' },
  ];

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">Genel Durum Paneli</h1>
        <p className="text-[10px] sm:text-xs text-muted-foreground font-black uppercase tracking-widest leading-relaxed">
          Sinop LED Dönüşüm Projesi | Öz Çeliker Elektrik
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="card-premium h-28 animate-pulse bg-slate-100"></div>
          ))
        ) : (
          statCards.map((stat: any) => (
            <div key={stat.label} className="card-premium flex items-center gap-4 sm:gap-5 p-5">
              <div className={`p-3 sm:p-4 rounded-xl flex-shrink-0 bg-slate-50 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none">{stat.label}</p>
                <h3 className="text-xl sm:text-2xl font-black text-primary leading-none">{stat.value}</h3>
              </div>
            </div>
          ))
        )}
      </div>

      <section className="space-y-6">
        <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link 
            href="/checklists/new?type=SITE_AUDIT"
            className="flex items-center justify-between p-5 bg-primary text-white rounded-2xl hover:bg-slate-800 transition-all group shadow-xl shadow-primary/10 active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Plus size={20} className="text-accent" />
              </div>
              <span className="font-black text-sm uppercase tracking-tight">Yeni Saha Denetimi</span>
            </div>
            <ArrowUpRight size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
          </Link>
          
          <Link 
            href="/notes"
            className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-4 text-primary">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Plus size={20} className="text-slate-400" />
              </div>
              <span className="font-black text-sm uppercase tracking-tight">Not Ekle</span>
            </div>
            <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-40 transition-opacity" />
          </Link>

          <Link 
            href="/calendar"
            className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-4 text-primary">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Plus size={20} className="text-slate-400" />
              </div>
              <span className="font-black text-sm uppercase tracking-tight">Rapor Görüntüle</span>
            </div>
            <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-40 transition-opacity" />
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
          İSG Uyumluluk Uyarıları
        </h2>
        <div className="card-premium border-l-4 border-l-red-500 p-0 overflow-hidden bg-white shadow-xl">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-wider text-center sm:text-left">Kritik Evrak Takibi (30 Gün)</h3>
            <span className={`px-2 py-1 text-[10px] font-black rounded uppercase ${stats.issues > 0 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>
              {stats.issues} Aksiyon Bekliyor
            </span>
          </div>
          
          <div className="p-5">
            {expiringDocs.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {expiringDocs.map((doc, idx) => (
                  <div key={idx} className="py-4 flex items-center justify-between group first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${doc.category === 'PERSONNEL' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                        {doc.category === 'PERSONNEL' ? <Users size={18} /> : <Truck size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 text-sm sm:text-base leading-tight truncate max-w-[150px] sm:max-w-none">{doc.type}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                          {doc.category === 'PERSONNEL' ? doc.personnel?.fullName : `Plaka: ${doc.vehicle?.plate}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4 flex-shrink-0">
                      <div className="hidden sm:block">
                        <p className="text-[10px] font-black text-red-600 uppercase">Son Tarih</p>
                        <p className="text-sm font-mono font-bold text-slate-700">{doc.expiryDate}</p>
                      </div>
                      <Link 
                        href={doc.category === 'PERSONNEL' ? `/personnel/${doc.personnel?.id}` : `/vehicles/${doc.vehicle?.id}`}
                        className="p-3 text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100"
                      >
                        <ArrowUpRight size={20} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="inline-flex p-3 bg-green-50 text-green-600 rounded-full">
                  <ClipboardCheck size={24} />
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Tüm evraklar günceldir.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
