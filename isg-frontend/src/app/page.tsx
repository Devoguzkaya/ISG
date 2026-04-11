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
    <div className="space-y-10 animate-fade">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">Genel Durum Paneli</h1>
        <p className="text-muted-foreground">Sinop LED Dönüşüm Projesi | Hüseyin Çelik (Öz Çeliker Elektrik)</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="card-premium h-32 animate-pulse bg-slate-100"></div>
          ))
        ) : (
          statCards.map((stat: any) => (
            <div key={stat.label} className="card-premium flex items-center gap-5">
              <div className={`p-4 rounded-xl bg-slate-50 ${stat.color}`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-primary">{stat.value}</h3>
              </div>
            </div>
          ))
        )}
      </div>

      <section className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="flex items-center justify-between p-4 bg-primary text-white rounded-xl hover:bg-slate-800 transition-all group">
            <div className="flex items-center gap-3">
              <Plus size={20} className="text-accent" />
              <span className="font-semibold">Yeni Günlük Kontrol</span>
            </div>
            <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <button className="flex items-center justify-between p-4 bg-white border border-border rounded-xl hover:bg-slate-50 transition-all group">
            <div className="flex items-center gap-3 text-primary">
              <Plus size={20} className="text-primary/40" />
              <span className="font-semibold">Not Ekle</span>
            </div>
            <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button className="flex items-center justify-between p-4 bg-white border border-border rounded-xl hover:bg-slate-50 transition-all group">
            <div className="flex items-center gap-3 text-primary">
              <Plus size={20} className="text-primary/40" />
              <span className="font-semibold">Haftalık Rapor</span>
            </div>
            <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          İSG Uyumluluk Uyarıları
        </h2>
        <div className="card-premium border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Kritik Evrak Takibi (Son 30 Gün)</h3>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase">
              {stats.issues} Aksiyon Bekliyor
            </span>
          </div>
          
          {expiringDocs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {expiringDocs.map((doc, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${doc.category === 'PERSONNEL' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                      {doc.category === 'PERSONNEL' ? <Users size={18} /> : <Truck size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{doc.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.category === 'PERSONNEL' ? doc.personnel?.fullName : `Plaka: ${doc.vehicle?.plate}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="hidden sm:block">
                      <p className="text-xs font-bold text-red-600 uppercase">Son Tarih</p>
                      <p className="text-sm font-mono font-bold text-slate-700">{doc.expiryDate}</p>
                    </div>
                    <Link 
                      href={doc.category === 'PERSONNEL' ? `/personnel/${doc.personnel?.id}` : `/vehicles/${doc.vehicle?.id}`}
                      className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 rounded-lg"
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
              <p className="text-muted-foreground text-sm font-medium">Tüm evraklar güncel görünüyor kanka. Her şey kontrol altında!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
