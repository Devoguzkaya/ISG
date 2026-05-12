"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Truck,
  User,
  MapPin,
  Loader2,
  Calendar,
  ClipboardCheck
} from 'lucide-react';
import Link from 'next/link';
import { checklistsApi, vehiclesApi, personnelApi } from '@/lib/api';
import { ALL_QUESTIONS, CHECKLIST_TYPES } from '@/lib/templates';

const ChecklistForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const typeParam = searchParams.get('type') || 'DAILY_VEHICLE';
  const dateParam = searchParams.get('date') || '';

  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    type: typeParam,
    vehicleId: '',
    personnelId: '',
    site: '',
    remarks: '',
    physicalDocumentReady: false,
    latitude: null as number | null,
    longitude: null as number | null,
    involvedVehicles: [] as string[],
    personnelAudits: [] as { id: number, name: string, isCompliant: boolean, remarks: string }[],
    results: {} as Record<string, 'OK' | 'NOT_OK' | 'N/A'>,
    metadata: {} as Record<string, string>,
    remarks_map: {} as Record<string, string>
  });

  const template = ALL_QUESTIONS[formData.type];
  const currentSections = template?.sections || [];
  const customFields = template?.customFields || [];

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev, 
          latitude: pos.coords.latitude, 
          longitude: pos.coords.longitude 
        }));
        alert("Konum başarıyla alındı!");
      },
      (err) => {
        console.error(err);
        alert("Konum alınamadı. İzin verildiğinden emin olunuz.");
      }
    );
  };

  const toggleInvolvedVehicle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      involvedVehicles: prev.involvedVehicles.includes(id)
        ? prev.involvedVehicles.filter(v => v !== id)
        : [...prev.involvedVehicles, id]
    }));
  };

  const toggleAuditPersonnel = (p: any) => {
    setFormData(prev => {
      const exists = prev.personnelAudits.find(a => a.id === p.id);
      if (exists) {
        return { ...prev, personnelAudits: prev.personnelAudits.filter(a => a.id !== p.id) };
      } else {
        return { 
          ...prev, 
          personnelAudits: [...prev.personnelAudits, { id: p.id, name: p.fullName, isCompliant: true, remarks: '' }] 
        };
      }
    });
  };

  const updateAuditStatus = (id: number, isCompliant: boolean) => {
    setFormData(prev => ({
      ...prev,
      personnelAudits: prev.personnelAudits.map(a => a.id === id ? { ...a, isCompliant } : a)
    }));
  };

  const updateAuditRemarks = (id: number, remarks: string) => {
    setFormData(prev => ({
      ...prev,
      personnelAudits: prev.personnelAudits.map(a => a.id === id ? { ...a, remarks } : a)
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vExp, pExp] = await Promise.all([
          vehiclesApi.getAll(),
          personnelApi.getAll()
        ]);
        
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Bugünün başlangıcı

        // Aktif araçları filtrele (aktif flag'i VAR VE deactivasyon tarihi geçmemiş)
        const activeVehicles = vExp.data.filter((v: any) => {
          if (!v.active) return false;
          if (v.deactivationDate) {
            const deactiveDate = new Date(v.deactivationDate);
            // Deaktivasyon tarihi BUGÜN veya GEÇMİŞSE gösterme
            if (deactiveDate <= now) return false;
          }
          return true;
        });

        // Filter active personnel (active flag AND no past resignation date)
        const activeStaff = pExp.data.filter((p: any) => {
          if (!p.active) return false;
          if (p.validTo && new Date(p.validTo) <= new Date()) return false;
          return true;
        });

        setVehicles(activeVehicles);
        setStaff(activeStaff);
      } catch (err) {
        console.error('Veri çekme hatası:', err);
      }
    };
    fetchData();
  }, []);

  const handleTypeChange = (newType: string) => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      results: {},
      metadata: {},
      remarks_map: {},
      personnelAudits: [],
      involvedVehicles: []
    }));
  };

  const handleResultChange = (id: string, value: 'OK' | 'NOT_OK' | 'N/A') => {
    setFormData(prev => {
      const newResults = { ...prev.results };
      if (newResults[id] === value) {
        delete newResults[id];
      } else {
        newResults[id] = value;
      }
      return { ...prev, results: newResults };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        type: formData.type,
        siteLocation: formData.site,
        vehicle: formData.vehicleId ? { id: parseInt(formData.vehicleId) } : null,
        personnel: { id: parseInt(formData.personnelId) },
        generalRemarks: formData.remarks,
        physicalDocumentReady: formData.physicalDocumentReady,
        latitude: formData.latitude,
        longitude: formData.longitude,
        involvedVehicles: formData.involvedVehicles.map(id => ({ id: parseInt(id) })),
        personnelAudits: formData.personnelAudits.map(a => ({
          personnelId: a.id,
          personnelName: a.name,
          isCompliant: a.isCompliant,
          remarks: a.remarks
        })),
        metadataJson: JSON.stringify(formData.metadata),
        // If dateParam is present, we send it as createdAt to preserve historical intent
        createdAt: dateParam ? new Date(dateParam).toISOString() : new Date().toISOString(),
        items: Object.entries(formData.results).map(([id, res]) => ({
          questionCode: id,
          questionText: currentSections.flatMap(s => s.items).find(i => i.id === id)?.text || '',
          result: res
        }))
      };

      await checklistsApi.create(payload);
      alert('Form başarıyla kaydedildi!');
      router.push('/checklists');
    } catch (err) {
      console.error('Kaydetme hatası:', err);
      alert('Kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1550px] mx-auto pb-20 animate-fade">
      <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href={dateParam ? "/calendar" : "/checklists"} className="p-2 sm:p-2.5 bg-background border border-border hover:bg-secondary rounded-xl transition-all shadow-sm">
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">Yeni İSG Formu</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">
              {dateParam ? `${new Date(dateParam).toLocaleDateString('tr-TR')} Tarihli Kayıt` : 'Sahada Hızlı Denetim Formu'}
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="card-premium">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-4">Form Tipi Seçiniz</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(CHECKLIST_TYPES).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTypeChange(key)}
                className={`p-4 rounded-2xl text-left border-2 transition-all active:scale-[0.98] ${
                  formData.type === key 
                  ? 'border-primary bg-primary/5 shadow-inner' 
                  : 'border-transparent bg-background hover:border-border shadow-sm'
                }`}
              >
                <h3 className={`text-sm font-black mt-1 ${formData.type === key ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                  {label}
                </h3>
              </button>
            ))}
          </div>
        </div>

        {(formData.type !== 'RISK_ANALYSIS' && formData.type !== 'WORK_PERMIT' && formData.type !== 'CONTRACTOR_AUDIT') && (
          <div className="card-premium space-y-6 shadow-xl border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Tarih (Template'de varsa veya varsayılan) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Calendar size={14} /> Denetim Tarihi
                </label>
                <input 
                  type="date"
                  className="w-full p-4 bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                  value={formData.metadata['checkDate'] || new Date().toISOString().split('T')[0]}
                  onChange={e => setFormData({...formData, metadata: {...formData.metadata, checkDate: e.target.value}})}
                />
              </div>

              {/* 2. Denetçi */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User size={14} /> Denetçi
                </label>
                <select 
                  required
                  className="w-full p-4 bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold appearance-none"
                  value={formData.personnelId}
                  onChange={e => setFormData({...formData, personnelId: e.target.value})}
                >
                  <option value="">Seçiniz...</option>
                  {staff.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.role})</option>
                  ))}
                </select>
              </div>

              {/* 3. Araç (Ana) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Truck size={14} /> Araç (Ana)
                </label>
                <select 
                  disabled={formData.type === 'SITE_AUDIT'}
                  className="w-full p-4 bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold disabled:opacity-50 appearance-none"
                  value={formData.vehicleId}
                  onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                >
                  <option value="">Seçiniz...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plate} - {v.brandModel}</option>
                  ))}
                </select>
              </div>

              {/* 4. Mevki */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <MapPin size={14} /> Mevki
                </label>
                <input 
                  required
                  type="text"
                  placeholder="Örn: Sinop OSB"
                  className="w-full p-4 bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                  value={formData.site}
                  onChange={e => setFormData({...formData, site: e.target.value})}
                />
              </div>

              {/* 5. Yapılan İş */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ClipboardCheck size={14} /> Yapılan İş
                </label>
                <input 
                  type="text"
                  placeholder="Örn: Hat Bakımı"
                  className="w-full p-4 bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                  value={formData.metadata['workTitle'] || ''}
                  onChange={e => setFormData({...formData, metadata: {...formData.metadata, workTitle: e.target.value}})}
                />
              </div>

              {/* 6. Konum */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Konum Doğrulama
                </label>
                <button
                  type="button"
                  onClick={handleCaptureLocation}
                  className={`w-full p-4 rounded-xl border flex items-center justify-center gap-2 font-black text-[10px] tracking-widest transition-all shadow-sm ${
                    formData.latitude 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : 'bg-background border-border text-muted-foreground hover:border-primary/30 active:scale-95'
                  }`}
                >
                  <MapPin size={14} />
                  {formData.latitude ? 'KONUM DOĞRULANDI' : 'KONUMU KAYDET'}
                </button>
              </div>
            </div>

            {/* Harita Önizleme */}
            {formData.latitude && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-border h-48 w-full animate-in fade-in slide-in-from-top-4 duration-500">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0} 
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${formData.longitude!-0.005},${formData.latitude!-0.005},${formData.longitude!+0.005},${formData.latitude!+0.005}&layer=mapnik&marker=${formData.latitude},${formData.longitude}`}
                />
              </div>
            )}
          </div>
        )}

        {/* Contractor Control Specific Header (Boxy Table Style from Image) */}
        {formData.type === 'CONTRACTOR_AUDIT' && (
          <div className="card-premium !p-0 overflow-hidden shadow-xl border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border">
              {/* Sol Taraf (Denetlenen Bölümü) */}
              <div className="divide-y divide-border">
                <div className="flex items-stretch min-h-[45px]">
                  <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Yüklenici/Altyüklenici:</label>
                  </div>
                  <input 
                    type="text"
                    className="flex-1 px-4 text-xs font-bold outline-none focus:bg-primary/5 transition-all"
                    value={formData.metadata['contractorCompany'] || ''}
                    onChange={e => setFormData({...formData, metadata: {...formData.metadata, contractorCompany: e.target.value}})}
                  />
                </div>
                <div className="flex items-stretch min-h-[45px]">
                  <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Proje Adı:</label>
                  </div>
                  <input 
                    type="text"
                    className="flex-1 px-4 text-xs font-bold outline-none focus:bg-primary/5 transition-all"
                    value={formData.metadata['projectName'] || ''}
                    onChange={e => setFormData({...formData, metadata: {...formData.metadata, projectName: e.target.value}})}
                  />
                </div>
                <div className="flex items-stretch min-h-[45px]">
                  <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">İş/İşletmesi:</label>
                  </div>
                  <input 
                    type="text"
                    className="flex-1 px-4 text-xs font-bold outline-none focus:bg-primary/5 transition-all"
                    value={formData.metadata['workOperation'] || ''}
                    onChange={e => setFormData({...formData, metadata: {...formData.metadata, workOperation: e.target.value}})}
                  />
                </div>
              </div>

              {/* Sağ Taraf (Yetkili ve Zaman) */}
              <div className="divide-y divide-border">
                <div className="flex items-stretch min-h-[45px]">
                  <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Yetkili Adı Soyadı:</label>
                  </div>
                  <input 
                    type="text"
                    className="flex-1 px-4 text-xs font-bold outline-none focus:bg-primary/5 transition-all"
                    value={formData.metadata['authorizedPerson'] || ''}
                    onChange={e => setFormData({...formData, metadata: {...formData.metadata, authorizedPerson: e.target.value}})}
                  />
                </div>
                <div className="flex items-stretch min-h-[45px]">
                  <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">İmzası:</label>
                  </div>
                  <div className="flex-1 px-4 flex items-center">
                    <span className="text-[9px] italic text-muted-foreground font-bold uppercase">Dijital Onay Sistemi</span>
                  </div>
                </div>
                <div className="flex items-stretch min-h-[45px]">
                  <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tarih-Saat:</label>
                  </div>
                  <input 
                    type="datetime-local"
                    className="flex-1 px-4 text-xs font-bold outline-none focus:bg-primary/5 transition-all"
                    value={formData.metadata['checkDateTime'] || ''}
                    onChange={e => setFormData({...formData, metadata: {...formData.metadata, checkDateTime: e.target.value}})}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Work Permit Specific Header */}
        {formData.type === 'WORK_PERMIT' && (
          <div className="card-premium space-y-4 shadow-xl border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-slate-50 pb-2 sm:pb-0 sm:border-0">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap min-w-[140px]">İzin Başlama Tarihi:</label>
                <input 
                  type="date"
                  className="flex-1 bg-transparent border-b-2 border-border focus:border-primary outline-none py-1 text-sm font-bold transition-all"
                  value={formData.metadata['permitStartDate'] || ''}
                  onChange={e => setFormData({...formData, metadata: {...formData.metadata, permitStartDate: e.target.value}})}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-slate-50 pb-2 sm:pb-0 sm:border-0">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap min-w-[140px]">İzin Bitiş Tarihi:</label>
                <input 
                  type="date"
                  className="flex-1 bg-transparent border-b-2 border-border focus:border-primary outline-none py-1 text-sm font-bold transition-all"
                  value={formData.metadata['permitEndDate'] || ''}
                  onChange={e => setFormData({...formData, metadata: {...formData.metadata, permitEndDate: e.target.value}})}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-slate-50 pb-2 sm:pb-0 sm:border-0">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap min-w-[140px]">Yüklenici Firma Adı:</label>
                <input 
                  type="text"
                  className="flex-1 bg-transparent border-b-2 border-border focus:border-primary outline-none py-1 text-sm font-bold transition-all"
                  value={formData.metadata['contractorName'] || ''}
                  onChange={e => setFormData({...formData, metadata: {...formData.metadata, contractorName: e.target.value}})}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap min-w-[140px]">Çalışmanın Yapılacağı Lokasyon:</label>
                <input 
                  type="text"
                  className="flex-1 bg-transparent border-b-2 border-border focus:border-primary outline-none py-1 text-sm font-bold transition-all"
                  value={formData.metadata['workLocation'] || ''}
                  onChange={e => setFormData({...formData, metadata: {...formData.metadata, workLocation: e.target.value}})}
                />
              </div>
            </div>
          </div>
        )}

        {/* Risk Analysis Specific Header */}
        {formData.type === 'RISK_ANALYSIS' && (
          <div className="card-premium space-y-4 shadow-xl border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-slate-50 pb-2 sm:pb-0 sm:border-0">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap min-w-[140px]">YAPILACAK İŞİN TANIMI:</label>
                <input 
                  type="text"
                  className="flex-1 bg-transparent border-b-2 border-border focus:border-primary outline-none py-1 text-sm font-bold transition-all"
                  value={formData.metadata['workTitle'] || ''}
                  onChange={e => setFormData({...formData, metadata: {...formData.metadata, workTitle: e.target.value}})}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-slate-50 pb-2 sm:pb-0 sm:border-0">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap min-w-[180px]">İŞİN BAŞLAMA TARİHİ VE SAATİ:</label>
                <input 
                  type="datetime-local"
                  className="flex-1 bg-transparent border-b-2 border-border focus:border-primary outline-none py-1 text-sm font-bold transition-all"
                  value={formData.metadata['startTime'] || ''}
                  onChange={e => setFormData({...formData, metadata: {...formData.metadata, startTime: e.target.value}})}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-slate-50 pb-2 sm:pb-0 sm:border-0">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap min-w-[140px]">ÇALIŞMA YAPILACAK YER:</label>
                <input 
                  type="text"
                  className="flex-1 bg-transparent border-b-2 border-border focus:border-primary outline-none py-1 text-sm font-bold transition-all"
                  value={formData.metadata['location'] || ''}
                  onChange={e => setFormData({...formData, metadata: {...formData.metadata, location: e.target.value}})}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap min-w-[180px]">İŞİN SÜRESİ:</label>
                <input 
                  type="text"
                  className="flex-1 bg-transparent border-b-2 border-border focus:border-primary outline-none py-1 text-sm font-bold transition-all"
                  value={formData.metadata['duration'] || ''}
                  onChange={e => setFormData({...formData, metadata: {...formData.metadata, duration: e.target.value}})}
                />
              </div>
            </div>
          </div>
        )}

        {/* Saha Denetim Formu (F.567) Specific Header */}
        {formData.type === 'SITE_AUDIT' && (
          <div className="card-premium !p-0 overflow-hidden shadow-xl border-border">
            <div className="divide-y divide-border">
              {/* Row 1: Firma ve Zaman */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border">
                <div className="flex items-stretch min-h-[50px]">
                  <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Denetlenen Firma Adı:</label>
                  </div>
                  <div className="flex-1 px-4 flex items-center gap-4">
                    {['YEDAŞ', 'ÇAEHAŞ', 'CYK'].map(f => (
                      <label key={f} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="firmName" 
                          className="w-3 h-3 text-primary" 
                          checked={formData.metadata['firmName'] === f}
                          onChange={() => setFormData({...formData, metadata: {...formData.metadata, firmName: f}})}
                        />
                        <span className="text-[10px] font-bold text-muted-foreground">{f}</span>
                      </label>
                    ))}
                    <input 
                      type="text" 
                      placeholder="FİRMA ADI..." 
                      className="flex-1 bg-transparent border-b border-border text-[10px] font-bold outline-none focus:border-primary"
                      value={formData.metadata['firmNameOther'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, firmNameOther: e.target.value}})}
                    />
                  </div>
                </div>
                <div className="flex items-stretch min-h-[50px]">
                  <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Denetleme Tarihi / Saati:</label>
                  </div>
                  <div className="flex-1 px-4 flex items-center gap-2">
                    <input 
                      type="date" 
                      className="flex-1 bg-transparent text-xs font-bold outline-none"
                      value={formData.metadata['checkDate'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, checkDate: e.target.value}})}
                    />
                    <input 
                      type="time" 
                      className="w-20 bg-transparent text-xs font-bold outline-none"
                      value={formData.metadata['checkTime'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, checkTime: e.target.value}})}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Bölge ve Kesme Protokolü */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border">
                <div className="flex items-stretch min-h-[50px]">
                  <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Denetlenen Bölge:</label>
                  </div>
                  <div className="flex-1 px-4 flex items-center gap-3 overflow-x-auto custom-scrollbar">
                    {['AMASYA', 'ÇORUM', 'SİNOP', 'SAMSUN', 'ORDU'].map(r => (
                      <label key={r} className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                        <input 
                          type="radio" 
                          name="region" 
                          className="w-3 h-3 text-primary" 
                          checked={formData.metadata['region'] === r}
                          onChange={() => setFormData({...formData, metadata: {...formData.metadata, region: r}})}
                        />
                        <span className="text-[10px] font-bold text-muted-foreground">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-stretch min-h-[50px]">
                  <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kesme Verme Protokolü Varmı?</label>
                  </div>
                  <div className="flex-1 px-4 flex items-center gap-4">
                    {['E', 'H', 'G'].map(v => (
                      <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="radio" 
                          name="isolationProtocol" 
                          className="w-3 h-3 text-primary" 
                          checked={formData.metadata['isolationProtocol'] === v}
                          onChange={() => setFormData({...formData, metadata: {...formData.metadata, isolationProtocol: v}})}
                        />
                        <span className="text-[10px] font-bold text-muted-foreground">{v === 'E' ? 'EVET' : v === 'H' ? 'HAYIR' : 'G.DEĞİL'}</span>
                      </label>
                    ))}
                    <input 
                      type="text" 
                      placeholder="SAP NO..." 
                      className="flex-1 bg-transparent border-b border-border text-[10px] font-bold outline-none focus:border-primary"
                      value={formData.metadata['sapNo'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, sapNo: e.target.value}})}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: İşletme, Plaka ve Ekip Türü */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border">
                <div className="grid grid-cols-1 divide-y divide-border">
                  <div className="flex items-stretch min-h-[50px]">
                    <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">İşletme Adı:</label>
                    </div>
                    <input 
                      type="text"
                      className="flex-1 px-4 text-xs font-bold outline-none focus:bg-primary/5 transition-all"
                      value={formData.metadata['operationName'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, operationName: e.target.value}})}
                    />
                  </div>
                  <div className="flex items-stretch min-h-[50px]">
                    <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Araç Plakası:</label>
                    </div>
                    <input 
                      type="text"
                      className="flex-1 px-4 text-xs font-bold outline-none focus:bg-primary/5 transition-all"
                      value={formData.metadata['plateNumber'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, plateNumber: e.target.value}})}
                    />
                  </div>
                </div>
                <div className="flex items-stretch">
                  <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ekip Türü:</label>
                  </div>
                  <div className="flex-1 p-3 grid grid-cols-3 gap-2">
                    {['ARIZA', 'BAKIM', 'TESİS', 'KESME-AÇMA', 'OKUMA', 'KAÇAK', 'DAĞ. TEK', 'CBS', 'AĞAÇ KESME'].map(t => (
                      <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="radio" 
                          name="teamType" 
                          className="w-3 h-3 text-primary" 
                          checked={formData.metadata['teamType'] === t}
                          onChange={() => setFormData({...formData, metadata: {...formData.metadata, teamType: t}})}
                        />
                        <span className="text-[9px] font-bold text-muted-foreground">{t}</span>
                      </label>
                    ))}
                    <input 
                      type="text" 
                      placeholder="DİĞER..." 
                      className="col-span-3 bg-transparent border-b border-border text-[10px] font-bold outline-none focus:border-primary"
                      value={formData.metadata['teamTypeOther'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, teamTypeOther: e.target.value}})}
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Mevki, Yapılan İş ve Vardiya */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border">
                <div className="grid grid-cols-1 divide-y divide-border">
                  <div className="flex items-stretch min-h-[50px]">
                    <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Çalışma Yapılan Mevki:</label>
                    </div>
                    <input 
                      type="text"
                      className="flex-1 px-4 text-xs font-bold outline-none focus:bg-primary/5 transition-all"
                      value={formData.metadata['workLocation'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, workLocation: e.target.value}})}
                    />
                  </div>
                  <div className="flex items-stretch min-h-[50px]">
                    <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Yapılan İş:</label>
                    </div>
                    <input 
                      type="text"
                      className="flex-1 px-4 text-xs font-bold outline-none focus:bg-primary/5 transition-all"
                      value={formData.metadata['workDescription'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, workDescription: e.target.value}})}
                    />
                  </div>
                </div>
                <div className="flex items-stretch">
                  <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vardiya Çizelgesine Uyuluyor mu?</label>
                  </div>
                  <div className="flex-1 px-4 flex items-center gap-6">
                    {['E', 'H', 'G'].map(v => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="shiftCompliance" 
                          className="w-4 h-4 text-primary" 
                          checked={formData.metadata['shiftCompliance'] === v}
                          onChange={() => setFormData({...formData, metadata: {...formData.metadata, shiftCompliance: v}})}
                        />
                        <span className="text-[11px] font-bold text-muted-foreground">{v === 'E' ? 'EVET' : v === 'H' ? 'HAYIR' : 'G.DEĞİL'}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Personnel Slots */}
              <div className="grid grid-cols-1 divide-y divide-border">
                <div className="flex items-stretch min-h-[50px]">
                  <div className="w-[280px] bg-secondary p-3 flex items-center border-r border-border">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Denetlenen Ekip Şefi Adı Soyadı:</label>
                  </div>
                  <input 
                    type="text"
                    className="flex-1 px-4 text-xs font-bold outline-none focus:bg-primary/5 transition-all"
                    value={formData.metadata['teamLeader'] || ''}
                    onChange={e => setFormData({...formData, metadata: {...formData.metadata, teamLeader: e.target.value}})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border">
                  {[1, 2, 3, 4].map(num => (
                    <div key={num} className="flex items-stretch min-h-[50px] border-b border-border last:border-0">
                      <div className="w-[180px] bg-secondary p-3 flex items-center border-r border-border">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{num}- Personel Ad-Soyad:</label>
                      </div>
                      <input 
                        type="text"
                        className="flex-1 px-4 text-xs font-bold outline-none focus:bg-primary/5 transition-all"
                        value={formData.metadata[`teamMember_${num}`] || ''}
                        onChange={e => setFormData({...formData, metadata: {...formData.metadata, [`teamMember_${num}`]: e.target.value}})}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Remaining Custom Fields (Header'da olmayanlar) */}
        {customFields.filter(f => !['checkDate', 'workTitle', 'inspector', 'location', 'plate', 'startTime', 'duration', 'permitStartDate', 'permitEndDate', 'contractorName', 'workLocation', 'contractorCompany', 'projectName', 'workOperation', 'authorizedPerson', 'checkDateTime', 'firmName', 'region', 'operationName', 'plateNumber', 'checkTime', 'sapNo', 'teamLeader', 'teamType', 'workDescription'].includes(f.id)).length > 0 && (
          <div className="card-premium grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-xl border-border">
            {customFields.filter(f => !['checkDate', 'workTitle', 'inspector', 'location', 'plate', 'startTime', 'duration', 'permitStartDate', 'permitEndDate', 'contractorName', 'workLocation', 'contractorCompany', 'projectName', 'workOperation', 'authorizedPerson', 'checkDateTime', 'firmName', 'region', 'operationName', 'plateNumber', 'checkTime', 'sapNo', 'teamLeader', 'teamType', 'workDescription'].includes(f.id)).map(field => (
              <div key={field.id} className={`${field.type === 'textarea' ? 'sm:col-span-2' : ''} space-y-1`}>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                   {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="w-full p-4 bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold min-h-[100px]"
                    value={formData.metadata[field.id] || ''}
                    onChange={e => setFormData({...formData, metadata: {...formData.metadata, [field.id]: e.target.value}})}
                  />
                ) : (
                  <input
                    type={field.type}
                    className="w-full p-4 bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                    value={formData.metadata[field.id] || ''}
                    onChange={e => setFormData({...formData, metadata: {...formData.metadata, [field.id]: e.target.value}})}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {formData.type === 'SITE_AUDIT' && (
          <div className="space-y-6">
            <div className="card-premium space-y-4 shadow-xl">
              <h3 className="text-[10px] font-black uppercase text-accent tracking-widest border-b border-slate-50 pb-3">Denetlenen Ekip ve Araçlar</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                {/* Personnel Multi-select */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Personel Seçimi</label>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {staff.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => toggleAuditPersonnel(p)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${
                          formData.personnelAudits.some(a => a.id === p.id) ? 'bg-primary border border-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-secondary border border-transparent hover:border-border'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          formData.personnelAudits.some(a => a.id === p.id) ? 'bg-background border-white' : 'bg-background border-slate-300'
                        }`}>
                          {formData.personnelAudits.some(a => a.id === p.id) && <CheckCircle className="text-primary" size={12} />}
                        </div>
                        <span className="text-xs font-bold leading-none">{p.fullName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle Multi-select */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Araç/Ekipman Seçimi</label>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {vehicles.map(v => (
                      <div 
                        key={v.id} 
                        onClick={() => toggleInvolvedVehicle(v.id.toString())}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${
                          formData.involvedVehicles.includes(v.id.toString()) ? 'bg-blue-600 border border-blue-600 text-white shadow-md shadow-blue-200' : 'bg-secondary border border-transparent hover:border-border'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          formData.involvedVehicles.includes(v.id.toString()) ? 'bg-background border-white' : 'bg-background border-slate-300'
                        }`}>
                          {formData.involvedVehicles.includes(v.id.toString()) && <CheckCircle className="text-blue-600" size={12} />}
                        </div>
                        <span className="text-xs font-bold font-mono leading-none">{v.plate}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${formData.involvedVehicles.includes(v.id.toString()) ? 'text-blue-100' : 'text-muted-foreground'}`}>{v.brandModel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {formData.personnelAudits.length > 0 && (
              <div className="card-premium space-y-4 shadow-xl">
                <h3 className="text-[10px] font-black uppercase text-accent tracking-widest border-b border-border pb-3">Ekip Denetim Durumu</h3>
                <div className="divide-y divide-border">
                  {formData.personnelAudits.map(person => (
                    <div key={person.id} className="py-5 space-y-4 first:pt-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <span className="font-black text-foreground tracking-tight">{person.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateAuditStatus(person.id, true)}
                            className={`flex-1 sm:flex-none px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border shadow-sm ${
                              person.isCompliant 
                              ? 'bg-green-600 border-green-600 text-white' 
                              : 'bg-background border-border text-muted-foreground'
                            }`}
                          >
                            <CheckCircle size={16} /> <span className="sm:hidden">UYGUN</span> <span className="hidden sm:inline">KURALLARA UYGUN</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateAuditStatus(person.id, false)}
                            className={`flex-1 sm:flex-none px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border shadow-sm ${
                              !person.isCompliant 
                              ? 'bg-red-600 border-red-600 text-white' 
                              : 'bg-background border-border text-muted-foreground'
                            }`}
                          >
                            <AlertTriangle size={16} /> <span className="sm:hidden">KUSURLU</span> <span className="hidden sm:inline">KUSURLU BULUNDU</span>
                          </button>
                        </div>
                      </div>
                      <textarea
                        className="w-full p-4 bg-secondary border border-border rounded-2xl text-xs font-bold placeholder:italic placeholder:font-normal placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-inner"
                        placeholder={`${person.name} için denetim notu (kusur var ise belitiniz)...`}
                        value={person.remarks}
                        onChange={(e) => updateAuditRemarks(person.id, e.target.value)}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentSections.map((section) => (
          <div key={section.section} className="space-y-2">
            <h2 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] px-2">{section.section}</h2>
            
            {formData.type === 'SITE_AUDIT' ? (
              section.section === "EKİPSEL MALZEME KONTROLÜ" ? (
                <div className="card-premium overflow-hidden !p-0 shadow-xl border-border">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/80">
                        <tr>
                          <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">EKİPSEL MALZEME ADI</th>
                          <th className="py-3 px-1 text-[7px] font-black uppercase text-muted-foreground text-center border-l border-b border-border w-16">Mevcut?</th>
                          <th className="py-3 px-1 text-[7px] font-black uppercase text-muted-foreground text-center border-b border-border w-16">Gerekli?</th>
                          <th className="py-3 px-1 text-[7px] font-black uppercase text-muted-foreground text-center border-b border-border w-16">Kull.?</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {section.items.map((q) => (
                          <tr key={q.id} className="hover:bg-secondary/50 transition-colors">
                            <td className="py-3 px-4 text-[10px] font-bold text-foreground uppercase">{q.text}</td>
                            {['present', 'required', 'used'].map(type => {
                              const key = `${q.id}_${type}`;
                              const val = formData.results[key];
                              return (
                                <td key={type} className="py-1 px-1 border-l border-slate-50">
                                  <div className="flex flex-col gap-0.5">
                                    <button 
                                      type="button"
                                      onClick={() => setFormData(prev => ({...prev, results: {...prev.results, [key]: val === 'OK' ? undefined as any : 'OK'}}))}
                                      className={`w-full py-1 rounded text-[8px] font-black transition-all ${val === 'OK' ? 'bg-green-600 text-white shadow-sm' : 'bg-muted text-muted-foreground'}`}
                                    >E</button>
                                    <button 
                                      type="button"
                                      onClick={() => setFormData(prev => ({...prev, results: {...prev.results, [key]: val === 'NOT_OK' ? undefined as any : 'NOT_OK'}}))}
                                      className={`w-full py-1 rounded text-[8px] font-black transition-all ${val === 'NOT_OK' ? 'bg-red-600 text-white shadow-sm' : 'bg-muted text-muted-foreground'}`}
                                    >H</button>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : section.section === "KİŞİSEL MALZEME KONTROLÜ" ? (
                <div className="space-y-6">
                  <div className="card-premium overflow-hidden !p-0 shadow-xl border-border">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-secondary/80">
                          <tr>
                            <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">KİŞİSEL MALZEME ADI</th>
                            {[1, 2, 3, 4].map(num => (
                              <th key={num} colSpan={3} className="py-3 px-1 text-[7px] font-black uppercase text-muted-foreground text-center border-l border-b border-border bg-muted/50">
                                PERSONEL-{num}
                              </th>
                            ))}
                          </tr>
                          <tr className="bg-secondary/30">
                            <th className="border-b border-border"></th>
                            {[1, 2, 3, 4].map(num => (
                              <React.Fragment key={num}>
                                <th className="py-2 px-1 text-[6px] font-black uppercase text-muted-foreground text-center border-l border-b border-border w-10">Mev.</th>
                                <th className="py-2 px-1 text-[6px] font-black uppercase text-muted-foreground text-center border-b border-border w-10">Ger.</th>
                                <th className="py-2 px-1 text-[6px] font-black uppercase text-muted-foreground text-center border-b border-border w-10">Kul.</th>
                              </React.Fragment>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {section.items.map((q) => (
                            <tr key={q.id} className="hover:bg-secondary/50 transition-colors">
                              <td className="py-2 px-4 text-[10px] font-bold text-foreground uppercase">{q.text}</td>
                              {[1, 2, 3, 4].map(pNum => (
                                <React.Fragment key={pNum}>
                                  {['present', 'required', 'used'].map(type => {
                                    const key = `${q.id}_p${pNum}_${type}`;
                                    const val = formData.results[key];
                                    return (
                                      <td key={type} className="py-1 px-1 border-l border-slate-50">
                                        <div className="flex flex-col gap-0.5">
                                          <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({...prev, results: {...prev.results, [key]: val === 'OK' ? undefined as any : 'OK'}}))}
                                            className={`w-full py-0.5 rounded text-[7px] font-black transition-all ${val === 'OK' ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}
                                          >E</button>
                                          <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({...prev, results: {...prev.results, [key]: val === 'NOT_OK' ? undefined as any : 'NOT_OK'}}))}
                                            className={`w-full py-0.5 rounded text-[7px] font-black transition-all ${val === 'NOT_OK' ? 'bg-red-600 text-white' : 'bg-muted text-muted-foreground'}`}
                                          >H</button>
                                        </div>
                                      </td>
                                    );
                                  })}
                                </React.Fragment>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Site Audit Specific Status & Education Footer */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['ARAÇ DÜZENİ UYGUN MU?', 'İSG MALZEME DÜZENİ UYGUN MU?', 'MOBİL KAMERA ÇALIŞIYOR MU?'].map(label => (
                        <div key={label} className="card-premium flex items-center justify-between !p-4 border-border shadow-lg">
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
                          <div className="flex gap-2">
                            {['E', 'H'].map(v => (
                              <button 
                                key={v}
                                type="button"
                                onClick={() => setFormData(prev => ({...prev, metadata: {...prev.metadata, [label]: prev.metadata[label] === v ? undefined as any : v}}))}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black border transition-all ${formData.metadata[label] === v ? 'bg-primary border-primary text-primary-foreground shadow-md' : 'bg-secondary border-border text-muted-foreground'}`}
                              >{v}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="card-premium overflow-hidden !p-0 shadow-xl border-border">
                      <div className="bg-secondary p-2 text-center border-b border-border">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">EĞİTİM KONTROLLERİ</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                          <thead>
                            <tr className="bg-muted/30">
                              <th className="py-3 px-4 text-[9px] font-black text-muted-foreground">Eğitim Türü</th>
                              {[1, 2, 3, 4].map(n => <th key={n} className="py-3 px-4 text-[9px] font-black text-muted-foreground text-center border-l border-border">Personel-{n}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border bg-background">
                            {['İŞBAŞI VE YÜKSEKTE ÇALIŞMA EĞİTİMİ VAR MI?', 'MESLEKİ EĞİTİMİ VAR MI?', 'İSG EĞİTİMİ VAR MI?'].map(label => (
                              <tr key={label} className="hover:bg-secondary/30 transition-colors">
                                <td className="py-3 px-4 text-[9px] font-bold text-muted-foreground uppercase">{label}</td>
                                {[1, 2, 3, 4].map(n => (
                                  <td key={n} className="py-2 px-4 border-l border-slate-50">
                                    <div className="flex justify-center gap-1">
                                      {['E', 'H', 'G'].map(v => (
                                        <button 
                                          key={v}
                                          type="button"
                                          onClick={() => setFormData(prev => ({...prev, metadata: {...prev.metadata, [`${label}_p${n}`]: prev.metadata[`${label}_p${n}`] === v ? undefined as any : v}}))}
                                          className={`w-8 h-8 rounded-lg text-[9px] font-black border transition-all ${formData.metadata[`${label}_p${n}`] === v ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-secondary border-border text-muted-foreground'}`}
                                        >{v}</button>
                                      ))}
                                    </div>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center bg-secondary rounded-2xl border-2 border-dashed border-border">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Bu bölüm için veri bulunamadı.</p>
                </div>
              )
            ) : formData.type === 'CONTRACTOR_AUDIT' ? (
              <div className="card-premium overflow-hidden !p-0 shadow-xl border-border">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground w-12 text-center">No</th>
                        <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Kontrol Kriterleri</th>
                        <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground w-48 text-center">Mevcut Durum</th>
                        <th className="py-3 px-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground w-64">Açıklama</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {section.items.map((q, idx) => (
                        <tr key={q.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="py-4 px-4 text-xs font-bold text-muted-foreground text-center">{idx + 1}</td>
                          <td className="py-4 px-4">
                            <p className="text-xs font-bold text-foreground leading-relaxed">{q.text}</p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleResultChange(q.id, 'OK')}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
                                  formData.results[q.id] === 'OK' 
                                    ? 'bg-green-600 border-green-600 text-white shadow-md' 
                                    : 'bg-background border-border text-muted-foreground hover:border-green-200'
                                }`}
                              >
                                VAR
                              </button>
                              <button
                                type="button"
                                onClick={() => handleResultChange(q.id, 'NOT_OK')}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
                                  formData.results[q.id] === 'NOT_OK' 
                                    ? 'bg-red-600 border-red-600 text-white shadow-md' 
                                    : 'bg-background border-border text-muted-foreground hover:border-red-200'
                                }`}
                              >
                                YOK
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <input 
                              type="text"
                              placeholder="Not ekle..."
                              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-[11px] font-bold outline-none focus:border-primary transition-all shadow-inner"
                              value={formData.remarks_map?.[q.id] || ''}
                              onChange={e => {
                                const newRemarks = { ... (formData.remarks_map || {}), [q.id]: e.target.value };
                                setFormData({ ...formData, remarks_map: newRemarks });
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (section.section === "YAPILACAK İŞ" || section.section === "ÇALIŞMA ORTAMINDAKİ TEHLİKE veya RİSKLER") ? (
              <div className="card-premium space-y-4 shadow-xl border-border">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {section.items.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleResultChange(q.id, formData.results[q.id] === 'OK' ? undefined as any : 'OK')}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all active:scale-95 text-left ${
                        formData.results[q.id] === 'OK'
                          ? 'bg-primary border-primary text-primary-foreground shadow-md'
                          : 'bg-background border-slate-50 text-muted-foreground hover:border-border'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        formData.results[q.id] === 'OK' ? 'bg-background border-white text-primary' : 'bg-muted border-border'
                      }`}>
                        {formData.results[q.id] === 'OK' && <CheckCircle size={12} />}
                      </div>
                      <span className="text-[11px] font-bold leading-tight line-clamp-2">{q.text}</span>
                    </button>
                  ))}
                </div>

                {section.section === "ÇALIŞMA ORTAMINDAKİ TEHLİKE veya RİSKLER" && formData.type === 'RISK_ANALYSIS' && (
                  <div className="pt-4 border-t border-border space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block leading-tight">
                      ÇALIŞMA ORTAMINDAKİ DİĞER TEHLİKE/RİSKLER VE ÖNLEMLERİ:
                    </label>
                    <textarea
                      className="w-full h-24 p-4 bg-secondary border border-border rounded-xl outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none text-sm font-bold shadow-inner"
                      placeholder="Lütfen eklemek istediğiniz diğer tehlike, risk ve önlemleri detaylıca belirtiniz..."
                      value={formData.metadata['otherRisksAndMeasures'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, otherRisksAndMeasures: e.target.value}})}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="card-premium overflow-hidden !p-0 divide-y divide-border shadow-xl border-border">
                {section.items.map((q) => (
                  <div key={q.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-secondary/50 transition-colors group">
                    <div className="flex gap-4 min-w-0 flex-1">
                      <span className="font-black text-primary text-[10px] flex-shrink-0 bg-secondary w-6 h-6 rounded-md flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">{q.id.replace(/[^0-9]/g, '') || q.id}</span>
                      <p className="text-sm font-bold text-foreground leading-snug">{q.text}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleResultChange(q.id, 'OK')}
                        className={`flex-1 md:flex-none px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                          formData.results[q.id] === 'OK' 
                            ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20' 
                            : 'bg-background border-border text-muted-foreground hover:border-primary/20 shadow-sm'
                        }`}
                      >
                        <CheckCircle size={14} /> EVET
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResultChange(q.id, 'NOT_OK')}
                        className={`flex-1 md:flex-none px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                          formData.results[q.id] === 'NOT_OK' 
                            ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-200' 
                            : 'bg-background border-border text-muted-foreground hover:border-red-200 shadow-sm'
                        }`}
                      >
                        <XCircle size={14} /> HAYIR
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResultChange(q.id, 'N/A')}
                        className={`flex-1 md:flex-none px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                          formData.results[q.id] === 'N/A' 
                            ? 'bg-slate-500 border-border text-white shadow-md shadow-slate-200' 
                            : 'bg-background border-border text-muted-foreground hover:border-border shadow-sm'
                        }`}
                      >
                        <AlertTriangle size={14} /> G.D.
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section.section === "YAPILACAK İŞ" && formData.type === 'WORK_PERMIT' && (
              <div className="space-y-6 mt-6">
                <div className="card-premium space-y-3 shadow-xl border-border">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block leading-tight">
                    İşin Detaylı Tanımı ve Alınacak Önlemler 
                    <span className="block text-muted-foreground font-bold lowercase mt-0.5">(Bu iş izni kapsamında yapılacak iş adımları ve alınacak önlemler tanımlanacaktır)</span>
                  </label>
                  <textarea
                    className="w-full h-40 p-4 bg-secondary border border-border rounded-xl outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none text-sm font-bold shadow-inner"
                    placeholder="Lütfen iş adımlarını ve güvenlik önlemlerini detaylıca belirtiniz..."
                    value={formData.metadata['workDescriptionDetail'] || ''}
                    onChange={e => setFormData({...formData, metadata: {...formData.metadata, workDescriptionDetail: e.target.value}})}
                  />
                </div>

                <div className="card-premium space-y-4 shadow-xl border-border">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-slate-50 pb-2">İşi Yapacaklar</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Adı Soyadı</th>
                          <th className="py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Görevi</th>
                          <th className="py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">İmza</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <tr key={num}>
                            <td className="py-3 pr-4">
                              <input 
                                type="text"
                                placeholder="Adı Soyadı"
                                className="w-full bg-transparent border-b border-border focus:border-primary outline-none text-xs font-bold py-1"
                                value={formData.metadata[`workerName${num}`] || ''}
                                onChange={e => setFormData({...formData, metadata: {...formData.metadata, [`workerName${num}`]: e.target.value}})}
                              />
                            </td>
                            <td className="py-3 pr-4">
                              <input 
                                type="text"
                                placeholder="Görevi"
                                className="w-full bg-transparent border-b border-border focus:border-primary outline-none text-xs font-bold py-1"
                                value={formData.metadata[`workerDuty${num}`] || ''}
                                onChange={e => setFormData({...formData, metadata: {...formData.metadata, [`workerDuty${num}`]: e.target.value}})}
                              />
                            </td>
                            <td className="py-3 text-right">
                              <span className="text-[9px] italic text-muted-foreground uppercase font-black">Dijital Onay Bekleniyor</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 bg-secondary rounded-xl border border-border space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                    Not1: İsimlerde değişiklik olması halinde bu formda belirtilen kriterlere sahip olmak şartıyla İş Öncesi Risk Analiz formuna yeni isimler eklenebilir.<br/>
                    Not2: Çalışan sayısı yukarıdaki tablodan fazla olursa formun arka yüzü kullanılabilir.
                  </p>
                </div>

                <div className="card-premium space-y-6 shadow-xl border-border">
                  <div className="border-b border-border pb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-6">TALEP EDEN (YÜKLENİCİ)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground">Yüklenici Ekip İSG Sorumlusu</label>
                        <input type="text" placeholder="Adı Soyadı" className="w-full bg-transparent border-b-2 border-border focus:border-primary outline-none text-xs font-bold py-1" 
                          value={formData.metadata['wpContractorIsgResponsible'] || ''}
                          onChange={e => setFormData({...formData, metadata: {...formData.metadata, wpContractorIsgResponsible: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground">Yüklenici İş Güvenliği Uzmanı</label>
                        <input type="text" placeholder="Adı Soyadı" className="w-full bg-transparent border-b-2 border-border focus:border-primary outline-none text-xs font-bold py-1" 
                          value={formData.metadata['wpContractorIsgSpecialist'] || ''}
                          onChange={e => setFormData({...formData, metadata: {...formData.metadata, wpContractorIsgSpecialist: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground">Yüklenici İşveren / Vekili</label>
                        <input type="text" placeholder="Adı Soyadı" className="w-full bg-transparent border-b-2 border-border focus:border-primary outline-none text-xs font-bold py-1" 
                          value={formData.metadata['wpContractorManager'] || ''}
                          onChange={e => setFormData({...formData, metadata: {...formData.metadata, wpContractorManager: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-6">ONAYLAYAN (YEDAŞ)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground">Kontrolör</label>
                        <div className="h-10 border-b-2 border-slate-50 flex items-end">
                           <span className="text-[10px] italic text-muted-foreground font-bold mb-1">Elektronik Onay Sistemi</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground">İş Güvenliği Uzmanı</label>
                        <div className="h-10 border-b-2 border-slate-50 flex items-end">
                           <span className="text-[10px] italic text-muted-foreground font-bold mb-1">Elektronik Onay Sistemi</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground">Yatırım Birimi Yöneticisi/Şefi</label>
                        <div className="h-10 border-b-2 border-slate-50 flex items-end">
                           <span className="text-[10px] italic text-muted-foreground font-bold mb-1">Elektronik Onay Sistemi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


          </div>
        ))}

        {formData.type === 'CONTRACTOR_AUDIT' && (
          <>
            <div className="card-premium space-y-3 shadow-xl border-border">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block leading-tight">
                KONTROL SONUCU:
              </label>
              <textarea
                className="w-full h-32 p-4 bg-secondary border border-border rounded-xl outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none text-sm font-bold shadow-inner"
                placeholder="Genel denetim sonuçlarını ve varsa ek notlarınızı buraya yazınız..."
                value={formData.remarks}
                onChange={e => setFormData({...formData, remarks: e.target.value})}
              />
            </div>

            <div className="card-premium space-y-6 shadow-xl border-border">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent border-b border-slate-50 pb-2 text-center">KONTROL YAPAN</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground min-w-[80px]">Adı Soyadı:</label>
                    <input type="text" className="flex-1 bg-transparent border-b border-border focus:border-primary outline-none text-xs font-bold py-1" 
                      value={formData.metadata['inspectorName1'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, inspectorName1: e.target.value}})}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground min-w-[80px]">Unvanı:</label>
                    <input type="text" className="flex-1 bg-transparent border-b border-border focus:border-primary outline-none text-xs font-bold py-1" 
                      value={formData.metadata['inspectorTitle1'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, inspectorTitle1: e.target.value}})}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground min-w-[80px]">Tarih:</label>
                    <input type="date" className="flex-1 bg-transparent border-b border-border focus:border-primary outline-none text-xs font-bold py-1" 
                      value={formData.metadata['inspectorDate1'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, inspectorDate1: e.target.value}})}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground min-w-[80px]">İmzası:</label>
                    <div className="flex-1 h-8 border-b border-dashed border-border flex items-end">
                      <span className="text-[9px] italic text-muted-foreground">Elektronik Onay</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground min-w-[80px]">Adı Soyadı:</label>
                    <input type="text" className="flex-1 bg-transparent border-b border-border focus:border-primary outline-none text-xs font-bold py-1" 
                      value={formData.metadata['inspectorName2'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, inspectorName2: e.target.value}})}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground min-w-[80px]">Unvanı:</label>
                    <input type="text" className="flex-1 bg-transparent border-b border-border focus:border-primary outline-none text-xs font-bold py-1" 
                      value={formData.metadata['inspectorTitle2'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, inspectorTitle2: e.target.value}})}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground min-w-[80px]">Tarih:</label>
                    <input type="date" className="flex-1 bg-transparent border-b border-border focus:border-primary outline-none text-xs font-bold py-1" 
                      value={formData.metadata['inspectorDate2'] || ''}
                      onChange={e => setFormData({...formData, metadata: {...formData.metadata, inspectorDate2: e.target.value}})}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground min-w-[80px]">İmzası:</label>
                    <div className="flex-1 h-8 border-b border-dashed border-border flex items-end">
                      <span className="text-[9px] italic text-muted-foreground">Elektronik Onay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {formData.type === 'RISK_ANALYSIS' && (
          <div className="card-premium space-y-4 shadow-xl border-border">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Ekip Üyeleri (Risk Azaltma Konuşması Bilgilendirme Kaydı)</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={`${num}. Ekip Üyesi Adı Soyadı`}
                    className="w-full p-3 bg-secondary border border-border rounded-xl text-sm font-bold outline-none focus:border-primary transition-all"
                    value={formData.metadata[`teamMemberName${num}`] || ''}
                    onChange={e => setFormData({...formData, metadata: {...formData.metadata, [`teamMemberName${num}`]: e.target.value}})}
                  />
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl border border-dashed border-border">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Dijital İmza</span>
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[10px] italic text-muted-foreground">Bekleniyor</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ekip İSG Sorumlusu</label>
                <input
                  type="text"
                  placeholder="Adı Soyadı"
                  className="w-full p-3 bg-secondary border border-border rounded-xl text-sm font-bold outline-none focus:border-primary transition-all"
                  value={formData.metadata['isgResponsible'] || ''}
                  onChange={e => setFormData({...formData, metadata: {...formData.metadata, isgResponsible: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">İş Güvenliği Uzmanı</label>
                <input
                  type="text"
                  placeholder="Adı Soyadı"
                  className="w-full p-3 bg-secondary border border-border rounded-xl text-sm font-bold outline-none focus:border-primary transition-all"
                  value={formData.metadata['isgSpecialist'] || ''}
                  onChange={e => setFormData({...formData, metadata: {...formData.metadata, isgSpecialist: e.target.value}})}
                />
              </div>
            </div>
          </div>
        )}

        {formData.type === 'SITE_AUDIT' && (
          <div className="space-y-6">
            <div className="card-premium space-y-4 shadow-xl border-border">
              <h3 className="text-[10px] font-black uppercase text-accent tracking-widest border-b border-slate-50 pb-3">Denetim Sonucu</h3>
              <label className="flex items-start gap-3 p-4 bg-secondary rounded-xl cursor-pointer group hover:bg-primary/5 transition-all">
                <input 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 text-accent rounded"
                  checked={formData.metadata['auditResultCompliant'] === 'true'}
                  onChange={e => setFormData({...formData, metadata: {...formData.metadata, auditResultCompliant: e.target.checked.toString()}})}
                />
                <span className="text-xs font-bold text-foreground leading-relaxed group-hover:text-primary transition-colors">
                  Yapılan kontrollerde iş güvenliği açısından herhangi bir uygunsuz duruma rastlanılmamıştır.
                </span>
              </label>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AÇIKLAMA:</label>
                <textarea
                  className="w-full h-32 p-4 bg-background border border-border rounded-xl outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none text-sm font-bold shadow-inner"
                  placeholder="Denetimle ilgili ek açıklama ve notlarınızı buraya giriniz..."
                  value={formData.remarks}
                  onChange={e => setFormData({...formData, remarks: e.target.value})}
                />
              </div>
            </div>

            <div className="card-premium !p-0 overflow-hidden shadow-xl border-border">
              <div className="bg-secondary p-2 text-center border-b border-border">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">DENETLEYENLER</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border">
                {[1, 2].map(num => (
                  <div key={num} className="divide-y divide-border">
                    <div className="flex items-stretch min-h-[40px]">
                      <div className="w-32 bg-secondary p-2 flex items-center border-r border-border">
                        <label className="text-[9px] font-black uppercase text-muted-foreground">ADI-SOYADI:</label>
                      </div>
                      <input 
                        type="text"
                        className="flex-1 px-3 text-xs font-bold outline-none focus:bg-primary/5 transition-all"
                        value={formData.metadata[`inspectorName_${num}`] || ''}
                        onChange={e => setFormData({...formData, metadata: {...formData.metadata, [`inspectorName_${num}`]: e.target.value}})}
                      />
                    </div>
                    <div className="flex items-stretch min-h-[40px]">
                      <div className="w-32 bg-secondary p-2 flex items-center border-r border-border">
                        <label className="text-[9px] font-black uppercase text-muted-foreground">Sicil No:</label>
                      </div>
                      <input 
                        type="text"
                        className="flex-1 px-3 text-xs font-bold outline-none focus:bg-primary/5 transition-all"
                        value={formData.metadata[`inspectorSicil_${num}`] || ''}
                        onChange={e => setFormData({...formData, metadata: {...formData.metadata, [`inspectorSicil_${num}`]: e.target.value}})}
                      />
                    </div>
                    <div className="flex items-stretch min-h-[40px]">
                      <div className="w-32 bg-secondary p-2 flex items-center border-r border-border">
                        <label className="text-[9px] font-black uppercase text-muted-foreground">Unvanı:</label>
                      </div>
                      <input 
                        type="text"
                        className="flex-1 px-3 text-xs font-bold outline-none focus:bg-primary/5 transition-all"
                        value={formData.metadata[`inspectorTitle_${num}`] || ''}
                        onChange={e => setFormData({...formData, metadata: {...formData.metadata, [`inspectorTitle_${num}`]: e.target.value}})}
                      />
                    </div>
                    <div className="flex items-stretch min-h-[60px]">
                      <div className="w-32 bg-secondary p-2 flex items-center border-r border-border">
                        <label className="text-[9px] font-black uppercase text-muted-foreground">İmzası:</label>
                      </div>
                      <div className="flex-1 p-2 flex items-center justify-center">
                        <span className="text-[8px] italic text-muted-foreground uppercase font-black tracking-widest">DİJİTAL ONAY SİSTEMİ</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="card-premium space-y-4 shadow-xl">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block tracking-[0.1em]">Resmi Evrak Takibi</label>
          <div 
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.99] ${
              formData.physicalDocumentReady ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-200' : 'bg-secondary border-border text-muted-foreground hover:border-green-200'
            }`} 
            onClick={() => setFormData({...formData, physicalDocumentReady: !formData.physicalDocumentReady})}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${formData.physicalDocumentReady ? 'bg-background border-white text-green-600' : 'bg-background border-border'}`}>
              {formData.physicalDocumentReady && <CheckCircle size={18} />}
            </div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-tight">Islak İmzalı Evrak Hazırlandı ve Arşivlendi</span>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-accent-foreground py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 hover:brightness-95 shadow-2xl shadow-accent/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={28} />
          ) : (
            <Save size={28} />
          )}
          {loading ? 'KAYDEDİLİYOR...' : 'FORMU TAMAMLA VE KAYDET'}
        </button>
      </form>
    </div>
  );
};

const NewChecklistPage = () => {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
      <ChecklistForm />
    </Suspense>
  );
};

export default NewChecklistPage;
