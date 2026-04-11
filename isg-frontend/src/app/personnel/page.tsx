"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Phone, 
  Award, 
  Loader2, 
  History, 
  Calendar, 
  Edit2, 
  Edit3, 
  Trash2, 
  Save, 
  UserX 
} from 'lucide-react';
import { personnelApi } from '@/lib/api';
import { Modal } from '@/components/Modal';

const PersonnelPage = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [historyDate, setHistoryDate] = useState('');
  const [isHistoryMode, setIsHistoryMode] = useState(false);

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

  const fetchPersonnel = async (date?: string) => {
    setLoading(true);
    try {
      const res = date 
        ? await personnelApi.getHistory(new Date(date).toISOString())
        : await personnelApi.getAll();
      
      // Filter out resigned/inactive personnel in CURRENT mode
      // But show everything in HISTORY mode
      let filtered = res.data;
      if (!date) {
        filtered = res.data.filter((p: any) => {
          if (!p.active) return false;
          if (p.validTo && new Date(p.validTo) <= new Date()) return false;
          return true;
        });
      }
      
      setStaff(filtered);
      setIsHistoryMode(!!date);
    } catch (err) {
      console.error('Personel çekme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

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
      const payload = {
        ...formData,
        validTo: formData.resignationDate ? `${formData.resignationDate}T23:59:59` : null
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

  const handleSearchHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (historyDate) {
      fetchPersonnel(historyDate);
    }
  };

  const resetToCurrent = () => {
    setHistoryDate('');
    fetchPersonnel();
  };

  return (
    <div className="space-y-8 animate-fade pb-10">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            {isHistoryMode ? 'Geçmiş Personel Kaydı' : 'Aktif Personel Listesi'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isHistoryMode 
              ? `${new Date(historyDate).toLocaleDateString('tr-TR')} tarihindeki kadro durumu.`
              : 'Şu an sahada görevli olan aktif ekip.'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchHistory} className="flex items-center gap-2 bg-white border border-border p-1 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 px-3 text-muted-foreground">
              <Calendar size={18} />
              <input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} className="bg-transparent border-none outline-none text-sm font-semibold text-primary py-2" />
            </div>
            <button type="submit" className="bg-slate-100 hover:bg-slate-200 text-primary p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold">
              <History size={16} /> GEÇMİŞE GİT
            </button>
            {isHistoryMode && (
              <button type="button" onClick={resetToCurrent} className="text-xs font-bold text-red-500 px-3 hover:underline">GÜNCEL DURUM</button>
            )}
          </form>

          <button onClick={handleOpenAdd} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg">
            <Plus size={20} /> Yeni Ekle
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((person) => {
             const isResigned = person.validTo && new Date(person.validTo) <= new Date();
             return (
              <div key={person.id} className={`card-premium group relative ${isResigned ? 'opacity-60 bg-slate-50' : ''}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${isResigned ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-primary'}`}>
                      {person.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`font-bold ${isResigned ? 'text-slate-500' : 'text-primary'}`}>{person.fullName}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{person.role}</p>
                    </div>
                  </div>
                  {isResigned && <UserX size={20} className="text-red-400" />}
                </div>

                <div className="space-y-3 mb-6 font-medium text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-slate-300" />
                    <span>{person.phone || '-'}</span>
                  </div>
                   {person.validTo && (
                    <div className="flex items-center gap-3 text-red-500">
                      <Calendar size={14} />
                      <span>Ayrılma: {new Date(person.validTo).toLocaleDateString('tr-TR')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isResigned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {isResigned ? 'AYRILDI' : 'AKTİF'}
                  </span>
                   {!isHistoryMode && (
                    <div className="flex items-center gap-3">
                      <Link href={`/personnel/${person.id}`} className="text-xs font-bold text-primary hover:underline">DETAYLAR</Link>
                      <button onClick={() => handleOpenEdit(person)} className="text-xs font-bold text-slate-400 hover:text-primary transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(person.id)} className="text-xs font-bold text-red-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Personel Bilgilerini Düzenle">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Ad Soyad</label>
              <input required className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})}/>
            </div>
             <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Görev</label>
              <input required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})}/>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Telefon</label>
            <input className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})}/>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-300">İşten Ayrılma Tarihi (Girilirse Pasife Düşer)</label>
            <input type="date" className="w-full p-3 bg-slate-100 border rounded-xl" value={formData.resignationDate} onChange={e=>setFormData({...formData, resignationDate: e.target.value})}/>
          </div>
          <button type="submit" disabled={formLoading} className="w-full py-4 bg-primary text-white rounded-xl font-black mt-4">
            {formLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="inline mr-2" />}
            BİLGİLERİ GÜNCELLE
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default PersonnelPage;
