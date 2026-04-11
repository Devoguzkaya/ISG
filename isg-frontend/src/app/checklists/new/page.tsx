"use client";

import { useState, useEffect, Suspense } from 'react';
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
  Calendar
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
    results: {} as Record<string, boolean | null>
  });

  const currentQuestions = ALL_QUESTIONS[formData.type] || [];

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcın konum özelliğini desteklemiyor kanka.");
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
        alert("Konum alınamadı. İzin verdiğinden emin ol kanka.");
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
        
        // Filter active vehicles (active flag AND not past deactivation date)
        const activeVehicles = vExp.data.filter((v: any) => {
          if (!v.active) return false;
          if (v.deactivationDate && new Date(v.deactivationDate) <= new Date()) return false;
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
      personnelAudits: [],
      involvedVehicles: []
    }));
  };

  const handleResultChange = (id: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      results: { ...prev.results, [id]: value }
    }));
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
        // If dateParam is present, we send it as createdAt to preserve historical intent
        createdAt: dateParam ? new Date(dateParam).toISOString() : new Date().toISOString(),
        items: Object.entries(formData.results).map(([id, res]) => ({
          questionCode: id,
          questionText: currentQuestions.flatMap(s => s.items).find(i => i.id === id)?.text || '',
          result: res
        }))
      };

      await checklistsApi.create(payload);
      alert('Form başarıyla kaydedildi kanka!');
      router.push('/checklists');
    } catch (err) {
      console.error('Kaydetme hatası:', err);
      alert('Kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={dateParam ? "/calendar" : "/checklists"} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary">Yeni İSG Formu</h1>
            <p className="text-muted-foreground">
              {dateParam ? `${new Date(dateParam).toLocaleDateString('tr-TR')} Tarihli Kayıt` : 'Lütfen ilgili alanları eksiksiz doldur kanka.'}
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card-premium">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">Form Tipi Seçiniz</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(CHECKLIST_TYPES).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTypeChange(key)}
                className={`p-3 rounded-xl text-left border-2 transition-all ${
                  formData.type === key 
                  ? 'border-primary bg-slate-50 shadow-sm' 
                  : 'border-transparent bg-white hover:border-slate-200'
                }`}
              >
                <p className={`text-[10px] font-black uppercase tracking-tighter ${formData.type === key ? 'text-primary' : 'text-slate-400'}`}>
                  {key}
                </p>
                <p className={`text-xs font-bold ${formData.type === key ? 'text-primary' : 'text-slate-600'}`}>
                  {label}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="card-premium grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Truck size={14} /> Araç (Ana)
            </label>
            <select 
              disabled={formData.type === 'SITE_AUDIT'}
              className="w-full p-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm disabled:opacity-50"
              value={formData.vehicleId}
              onChange={e => setFormData({...formData, vehicleId: e.target.value})}
            >
              <option value="">Seçiniz...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.plate} - {v.brandModel}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User size={14} /> Denetçi / Sorumlu
            </label>
            <select 
              required
              className="w-full p-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              value={formData.personnelId}
              onChange={e => setFormData({...formData, personnelId: e.target.value})}
            >
              <option value="">Seçiniz...</option>
              {staff.map(p => (
                <option key={p.id} value={p.id}>{p.fullName} ({p.role})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MapPin size={14} /> Şantiye / Mevki
            </label>
            <input 
              required
              type="text"
              placeholder="Örn: Boyabat Yol Ayrımı"
              className="w-full p-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              value={formData.site}
              onChange={e => setFormData({...formData, site: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              Konum Doğrulama
            </label>
            <button
              type="button"
              onClick={handleCaptureLocation}
              className={`w-full p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                formData.latitude 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-primary/30'
              }`}
            >
              <MapPin size={16} />
              {formData.latitude ? 'KONUM ALINDI' : 'KONUMU KAYDET'}
            </button>
          </div>
        </div>

        {formData.type === 'SITE_AUDIT' && (
          <div className="space-y-6">
            <div className="card-premium space-y-4">
              <h3 className="text-sm font-black uppercase text-primary tracking-widest border-b border-slate-100 pb-2">Denetlenen Ekip ve Araçlar</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personnel Multi-select */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Personel Seçimi</label>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
                    {staff.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => toggleAuditPersonnel(p)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          formData.personnelAudits.some(a => a.id === p.id) ? 'bg-primary/5 border-primary/10' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border transition-colors ${
                          formData.personnelAudits.some(a => a.id === p.id) ? 'bg-primary border-primary' : 'bg-white border-slate-300'
                        }`}>
                          {formData.personnelAudits.some(a => a.id === p.id) && <CheckCircle className="text-white" size={12} />}
                        </div>
                        <span className="text-xs font-bold text-slate-600">{p.fullName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle Multi-select */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Araç/Ekipman Seçimi</label>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
                    {vehicles.map(v => (
                      <div 
                        key={v.id} 
                        onClick={() => toggleInvolvedVehicle(v.id.toString())}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          formData.involvedVehicles.includes(v.id.toString()) ? 'bg-primary/5 border-primary/10' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border transition-colors ${
                          formData.involvedVehicles.includes(v.id.toString()) ? 'bg-primary border-primary' : 'bg-white border-slate-300'
                        }`}>
                          {formData.involvedVehicles.includes(v.id.toString()) && <CheckCircle className="text-white" size={12} />}
                        </div>
                        <span className="text-xs font-bold text-slate-600 font-mono">{v.plate}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{v.brandModel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {formData.personnelAudits.length > 0 && (
              <div className="card-premium space-y-4">
                <h3 className="text-sm font-black uppercase text-primary tracking-widest border-b border-slate-100 pb-2">Ekip Denetim Durumu</h3>
                <div className="divide-y divide-slate-50">
                  {formData.personnelAudits.map(person => (
                    <div key={person.id} className="py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">{person.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateAuditStatus(person.id, true)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 border ${
                              person.isCompliant 
                              ? 'bg-green-600 border-green-600 text-white' 
                              : 'bg-white border-slate-200 text-slate-400 hover:border-green-200'
                            }`}
                          >
                            <CheckCircle size={14} /> KURALLARA UYGUN
                          </button>
                          <button
                            type="button"
                            onClick={() => updateAuditStatus(person.id, false)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 border ${
                              !person.isCompliant 
                              ? 'bg-red-600 border-red-600 text-white' 
                              : 'bg-white border-slate-200 text-slate-400 hover:border-red-200'
                            }`}
                          >
                            <AlertTriangle size={14} /> KUSURLU
                          </button>
                        </div>
                      </div>
                      <textarea
                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs placeholder:italic outline-none focus:ring-1 focus:ring-primary/20"
                        placeholder={`${person.name} hakkında denetim notu...`}
                        value={person.remarks}
                        onChange={(e) => updateAuditRemarks(person.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentQuestions.map((section) => (
          <div key={section.section} className="space-y-4">
            <h2 className="text-lg font-bold text-primary px-2">{section.section}</h2>
            <div className="space-y-3">
              {section.items.map((q) => (
                <div key={q.id} className="card-premium py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <span className="font-bold text-accent shrink-0">{q.id}</span>
                    <p className="text-sm font-medium text-slate-700">{q.text}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleResultChange(q.id, true)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all ${
                        formData.results[q.id] === true 
                          ? 'bg-green-600 border-green-600 text-white shadow-md' 
                          : 'bg-white border-border text-slate-400 hover:border-green-300'
                      }`}
                    >
                      <CheckCircle size={14} /> Evet
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResultChange(q.id, false)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all ${
                        formData.results[q.id] === false 
                          ? 'bg-red-600 border-red-600 text-white shadow-md' 
                          : 'bg-white border-border text-slate-400 hover:border-red-300'
                      }`}
                    >
                      <XCircle size={14} /> Hayır
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="card-premium space-y-4">
          <label className="text-sm font-bold text-primary mb-2 block font-black uppercase tracking-tight">Islak İmzalı Evrak Takibi</label>
          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => setFormData({...formData, physicalDocumentReady: !formData.physicalDocumentReady})}>
            <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${formData.physicalDocumentReady ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200'}`}>
              {formData.physicalDocumentReady && <CheckCircle size={16} />}
            </div>
            <span className="text-sm font-bold text-slate-700">Islak İmzalı Evrak Hazırlandı ve Arşivlendi</span>
          </div>
        </div>

        <div className="card-premium space-y-4">
          <label className="text-sm font-bold text-primary mb-2 block">Düşünceler / Notlar</label>
          <textarea 
            className="w-full h-32 p-4 bg-slate-50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            placeholder="Eklemek istediğin detay var mı kanka?"
            value={formData.remarks}
            onChange={e => setFormData({...formData, remarks: e.target.value})}
          ></textarea>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-800 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <Save size={24} />
          )}
          {loading ? 'KAYDEDİLİYOR...' : 'FORMU GÖNDER VE KAYDET'}
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
