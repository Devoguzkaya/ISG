"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Phone, 
  Loader2, 
  Calendar, 
  Edit3, 
  Trash2, 
  Save, 
  UserX,
  Search
} from 'lucide-react';
import { personnelApi } from '@/lib/api';
import { Modal } from '@/components/Modal';

const PersonnelPage = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'LEFT'>('ACTIVE');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    role: '',
    phone: '',
    tcNo: '',
    active: true,
    resignationDate: ''
  });

  const fetchPersonnel = async () => {
    setLoading(true);
    try {
      const res = await personnelApi.getAll();
      setStaff(res.data);
    } catch (err) {
      console.error('Personel çekme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const filteredStaff = staff.filter((p: any) => {
    const isActuallyResigned = !p.active || (p.validTo && new Date(p.validTo) <= new Date());
    return viewMode === 'ACTIVE' ? !isActuallyResigned : isActuallyResigned;
  });

  const handleOpenAdd = () => {
    setEditingPerson(null);
    setFormData({ fullName: '', role: '', phone: '', tcNo: '', active: true, resignationDate: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (person: any) => {
    setEditingPerson(person);
    setFormData({ 
      fullName: person.fullName, 
      role: person.role, 
      phone: person.phone || '', 
      tcNo: person.tcNo || '',
      active: person.active,
      resignationDate: person.validTo ? person.validTo.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu personeli TAMAMEN silmek istediğine emin misin kanka?')) return;
    try {
      await personnelApi.delete(id);
      setStaff(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Silme hatası:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const { resignationDate, ...rest } = formData;
      const payload = {
        ...rest,
        validTo: resignationDate ? `${resignationDate}T23:59:59` : null
      };

      if (editingPerson) {
        await personnelApi.update(editingPerson.id, payload);
      } else {
        await personnelApi.create(payload);
      }
      setIsModalOpen(false);
      fetchPersonnel();
    } catch (err) {
      console.error('Kaydetme hatası:', err);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade pb-10">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
            {viewMode === 'ACTIVE' ? 'Aktif Personel Listesi' : 'İşten Ayrılanlar'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {viewMode === 'ACTIVE' 
              ? 'Şu an sahada görevli olan aktif ekip.'
              : 'Daha önce projede görev almış, şu an pasif olan personeller.'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex bg-white border border-border p-1 rounded-xl shadow-sm">
            <button 
              onClick={() => setViewMode('ACTIVE')}
              className={`px-6 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${viewMode === 'ACTIVE' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:bg-slate-50'}`}
            >
              AKTİF KADRO
            </button>
            <button 
              onClick={() => setViewMode('LEFT')}
              className={`px-6 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${viewMode === 'LEFT' ? 'bg-red-500 text-white shadow-md' : 'text-muted-foreground hover:bg-slate-50'}`}
            >
              AYRILANLAR
            </button>
          </div>

          <button onClick={handleOpenAdd} className="bg-primary text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 shadow-lg active:scale-95 transition-all">
            <Plus size={20} /> Yeni Ekle
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredStaff.map((person) => {
             const isResigned = !person.active || (person.validTo && new Date(person.validTo) <= new Date());
             return (
              <div key={person.id} className={`card-premium group relative p-5 ${isResigned ? 'opacity-60 bg-slate-50' : ''}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0 ${isResigned ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-primary'}`}>
                      {person.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`font-black tracking-tight ${isResigned ? 'text-slate-500' : 'text-primary'}`}>{person.fullName}</h3>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{person.role}</p>
                    </div>
                  </div>
                  {isResigned && <UserX size={20} className="text-red-400" />}
                </div>

                <div className="space-y-3 mb-6 font-medium text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                      <Phone size={14} />
                    </div>
                    <span className="font-bold">{person.phone || '-'}</span>
                  </div>
                   {person.validTo && (
                    <div className="flex items-center gap-3 text-red-500 bg-red-50 p-2 rounded-lg">
                      <Calendar size={14} />
                      <span className="text-xs font-bold uppercase tracking-tighter">Ayrılma: {new Date(person.validTo).toLocaleDateString('tr-TR')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-4">
                   <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${isResigned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {isResigned ? 'AYRILDI' : 'AKTİF'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/personnel/${person.id}`} 
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-primary hover:bg-white transition-all shadow-sm"
                      title="Dosyayı Gör"
                    >
                      <Save size={16} />
                    </Link>
                    <button 
                      onClick={() => handleOpenEdit(person)} 
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-all shadow-sm"
                      title="Düzenle"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(person.id)} 
                      className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-red-300 hover:text-red-500 transition-all shadow-sm"
                      title="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Personel Bilgileri">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ad Soyad</label>
              <input required className="w-full p-4 bg-slate-50 border rounded-xl font-bold" value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})}/>
            </div>
             <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Görev</label>
              <input required className="w-full p-4 bg-slate-50 border rounded-xl" value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})}/>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Telefon</label>
            <input className="w-full p-4 bg-slate-50 border rounded-xl font-bold" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})}/>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Çalışma Durumu</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => setFormData({...formData, active: true})}
                className={`p-4 rounded-xl font-bold text-sm transition-all ${formData.active ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-slate-50 text-slate-400 border border-transparent'}`}
              >
                ÇALIŞIYOR
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, active: false})}
                className={`p-4 rounded-xl font-bold text-sm transition-all ${!formData.active ? 'bg-red-100 text-red-700 border-2 border-red-500' : 'bg-slate-50 text-slate-400 border border-transparent'}`}
              >
                İŞTEN AYRILDI
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ayrılma Tarihi (Opsiyonel)</label>
            <input type="date" className="w-full p-4 bg-slate-100 border rounded-xl" value={formData.resignationDate} onChange={e=>setFormData({...formData, resignationDate: e.target.value})}/>
            {!formData.active && !formData.resignationDate && (
              <p className="text-[10px] text-amber-600 font-bold mt-1 italic">* Tarih girilmediği için sistem personeli pasife çeker ancak tarih göstermez.</p>
            )}
          </div>
          <button type="submit" disabled={formLoading} className="w-full py-5 bg-primary text-white rounded-xl font-black mt-4 shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            {formLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            BİLGİLERİ KAYDET
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default PersonnelPage;
