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
      <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href={dateParam ? "/calendar" : "/checklists"} className="p-2 sm:p-2.5 bg-white border border-slate-100 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary leading-tight">Yeni İSG Formu</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">
              {dateParam ? `${new Date(dateParam).toLocaleDateString('tr-TR')} Tarihli Kayıt` : 'Sahada Hızlı Denetim Formu'}
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="card-premium">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Form Tipi Seçiniz</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(CHECKLIST_TYPES).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTypeChange(key)}
                className={`p-4 rounded-2xl text-left border-2 transition-all active:scale-[0.98] ${
                  formData.type === key 
                  ? 'border-primary bg-primary/5 shadow-inner' 
                  : 'border-transparent bg-white hover:border-slate-100 shadow-sm'
                }`}
              >
                <p className={`text-[9px] font-black uppercase tracking-widest ${formData.type === key ? 'text-primary' : 'text-slate-300'}`}>
                  {key}
                </p>
                <p className={`text-xs font-black ${formData.type === key ? 'text-primary' : 'text-slate-600'}`}>
                  {label}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="card-premium grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 shadow-xl">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Truck size={14} /> Araç (Ana)
            </label>
            <select 
              disabled={formData.type === 'SITE_AUDIT'}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold disabled:opacity-50 appearance-none"
              value={formData.vehicleId}
              onChange={e => setFormData({...formData, vehicleId: e.target.value})}
            >
              <option value="">Seçiniz...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.plate} - {v.brandModel}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <User size={14} /> Denetçi
            </label>
            <select 
              required
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold appearance-none"
              value={formData.personnelId}
              onChange={e => setFormData({...formData, personnelId: e.target.value})}
            >
              <option value="">Seçiniz...</option>
              {staff.map(p => (
                <option key={p.id} value={p.id}>{p.fullName} ({p.role})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <MapPin size={14} /> Mevki
            </label>
            <input 
              required
              type="text"
              placeholder="Örn: Sinop OSB"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
              value={formData.site}
              onChange={e => setFormData({...formData, site: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Konum
            </label>
            <button
              type="button"
              onClick={handleCaptureLocation}
              className={`w-full p-4 rounded-xl border flex items-center justify-center gap-2 font-black text-[10px] tracking-widest transition-all shadow-sm ${
                formData.latitude 
                ? 'bg-green-600 border-green-600 text-white' 
                : 'bg-white border-slate-200 text-slate-400 hover:border-primary/30 active:scale-95'
              }`}
            >
              <MapPin size={14} />
              {formData.latitude ? 'KONUM DOĞRULANDI' : 'KONUMU KAYDET'}
            </button>
          </div>
        </div>

        {formData.type === 'SITE_AUDIT' && (
          <div className="space-y-6">
            <div className="card-premium space-y-4 shadow-xl">
              <h3 className="text-[10px] font-black uppercase text-primary tracking-widest border-b border-slate-50 pb-3">Denetlenen Ekip ve Araçlar</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                {/* Personnel Multi-select */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Personel Seçimi</label>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {staff.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => toggleAuditPersonnel(p)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${
                          formData.personnelAudits.some(a => a.id === p.id) ? 'bg-primary border border-primary text-white shadow-md shadow-primary/20' : 'bg-slate-50 border border-transparent hover:border-slate-100'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          formData.personnelAudits.some(a => a.id === p.id) ? 'bg-white border-white' : 'bg-white border-slate-300'
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Araç/Ekipman Seçimi</label>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {vehicles.map(v => (
                      <div 
                        key={v.id} 
                        onClick={() => toggleInvolvedVehicle(v.id.toString())}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${
                          formData.involvedVehicles.includes(v.id.toString()) ? 'bg-blue-600 border border-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-50 border border-transparent hover:border-slate-100'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          formData.involvedVehicles.includes(v.id.toString()) ? 'bg-white border-white' : 'bg-white border-slate-300'
                        }`}>
                          {formData.involvedVehicles.includes(v.id.toString()) && <CheckCircle className="text-blue-600" size={12} />}
                        </div>
                        <span className="text-xs font-bold font-mono leading-none">{v.plate}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${formData.involvedVehicles.includes(v.id.toString()) ? 'text-blue-100' : 'text-slate-400'}`}>{v.brandModel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {formData.personnelAudits.length > 0 && (
              <div className="card-premium space-y-4 shadow-xl">
                <h3 className="text-[10px] font-black uppercase text-primary tracking-widest border-b border-slate-50 pb-3">Ekip Denetim Durumu</h3>
                <div className="divide-y divide-slate-100">
                  {formData.personnelAudits.map(person => (
                    <div key={person.id} className="py-5 space-y-4 first:pt-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <span className="font-black text-primary tracking-tight">{person.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateAuditStatus(person.id, true)}
                            className={`flex-1 sm:flex-none px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border shadow-sm ${
                              person.isCompliant 
                              ? 'bg-green-600 border-green-600 text-white' 
                              : 'bg-white border-slate-100 text-slate-300'
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
                              : 'bg-white border-slate-100 text-slate-300'
                            }`}
                          >
                            <AlertTriangle size={16} /> <span className="sm:hidden">KUSURLU</span> <span className="hidden sm:inline">KUSURLU BULUNDU</span>
                          </button>
                        </div>
                      </div>
                      <textarea
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold placeholder:italic placeholder:font-normal placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-inner"
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

        {currentQuestions.map((section) => (
          <div key={section.section} className="space-y-4">
            <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-2">{section.section}</h2>
            <div className="space-y-3">
              {section.items.map((q) => (
                <div key={q.id} className="card-premium py-5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border-slate-100 hover:border-primary/10 transition-colors">
                  <div className="flex gap-4 min-w-0">
                    <span className="font-black text-primary text-sm flex-shrink-0 bg-slate-50 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-100">{q.id}</span>
                    <p className="text-sm font-bold text-slate-700 leading-snug">{q.text}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleResultChange(q.id, true)}
                      className={`flex-1 md:flex-none px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                        formData.results[q.id] === true 
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-white border-slate-100 text-slate-300 hover:border-primary/20 shadow-sm'
                      }`}
                    >
                      <CheckCircle size={18} /> EVET
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResultChange(q.id, false)}
                      className={`flex-1 md:flex-none px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                        formData.results[q.id] === false 
                          ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200' 
                          : 'bg-white border-slate-100 text-slate-300 hover:border-red-200 shadow-sm'
                      }`}
                    >
                      <XCircle size={18} /> HAYIR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="card-premium space-y-4 shadow-xl">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block tracking-[0.1em]">Resmi Evrak Takibi</label>
          <div 
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.99] ${
              formData.physicalDocumentReady ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-200' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-green-200'
            }`} 
            onClick={() => setFormData({...formData, physicalDocumentReady: !formData.physicalDocumentReady})}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${formData.physicalDocumentReady ? 'bg-white border-white text-green-600' : 'bg-white border-slate-200'}`}>
              {formData.physicalDocumentReady && <CheckCircle size={18} />}
            </div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-tight">Islak İmzalı Evrak Hazırlandı ve Arşivlendi</span>
          </div>
        </div>

        <div className="card-premium space-y-4 shadow-xl">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block tracking-[0.1em]">Denetim Notları (Opsiyonel)</label>
          <textarea 
            className="w-full h-32 p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none text-sm font-bold shadow-inner"
            placeholder="Eklemek istediğin saha detayı var mı kanka? (Hava durumu, özel riskler vb.)"
            value={formData.remarks}
            onChange={e => setFormData({...formData, remarks: e.target.value})}
          ></textarea>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 hover:bg-slate-800 shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
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
