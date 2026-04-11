"use client";

import { useEffect, useState } from 'react';
import { Truck, Plus, MoreVertical, Edit2, Trash2, Loader2, Save, Calendar } from 'lucide-react';
import { vehiclesApi } from '@/lib/api';
import { Modal } from '@/components/Modal';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [formData, setFormData] = useState({
    plate: '',
    brandModel: '',
    type: 'Sepetli Vinç',
    active: true,
    deactivationDate: ''
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehiclesApi.getAll();
      setVehicles(res.data);
    } catch (err) {
      console.error('Araç çekme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({ plate: '', brandModel: '', type: 'Sepetli Vinç', active: true, deactivationDate: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setFormData({ 
      plate: vehicle.plate, 
      brandModel: vehicle.brandModel, 
      type: vehicle.type,
      active: vehicle.active,
      deactivationDate: vehicle.deactivationDate ? vehicle.deactivationDate.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu aracı kalıcı olarak silmek istediğine emin misin kanka?')) return;
    try {
      await vehiclesApi.delete(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      console.error('Silme hatası:', err);
      alert('Araç silinirken bir hata oluştu.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        deactivationDate: formData.deactivationDate ? `${formData.deactivationDate}T00:00:00` : null
      };

      if (editingVehicle) {
        await vehiclesApi.update(editingVehicle.id, payload);
      } else {
        await vehiclesApi.create(payload);
      }
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err) {
      console.error('Kaydetme hatası:', err);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">Vinçler ve Araçlar</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Saha operasyonlarında kullanılan aktif ve iade edilen araçlar.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 shadow-xl active:scale-[0.98] transition-all"
        >
          <Plus size={20} />
          Yeni Araç Ekle
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {vehicles.map((vehicle) => {
            const isPassive = !vehicle.active || (vehicle.deactivationDate && new Date(vehicle.deactivationDate) <= new Date());
            
            return (
              <div key={vehicle.id} className={`card-premium relative p-4 sm:p-6 transition-all ${isPassive ? 'opacity-70 bg-slate-50 grayscale-[0.5]' : ''}`}>
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className={`p-3 sm:p-4 rounded-2xl flex-shrink-0 ${isPassive ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-blue-600'}`}>
                    <Truck size={28} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${isPassive ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {isPassive ? 'İADE EDİLDİ' : 'AKTİF'}
                      </span>
                      {vehicle.deactivationDate && !isPassive && (
                        <span className="text-[10px] font-black text-amber-600 flex items-center gap-1 uppercase tracking-tighter">
                          <Calendar size={10} /> İade: {new Date(vehicle.deactivationDate).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-lg sm:text-xl font-black truncate ${isPassive ? 'text-slate-500' : 'text-primary'}`}>{vehicle.plate}</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{vehicle.brandModel}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{vehicle.type}</div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleOpenEdit(vehicle)} className="text-xs font-black text-primary hover:underline tracking-tight">DÜZENLE</button>
                    <button onClick={() => handleDelete(vehicle.id)} className="text-xs font-black text-red-300 hover:text-red-500 tracking-tight">SİL</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Araç Bilgilerini Düzenle">
        <form onSubmit={handleSubmit} className="space-y-4">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Plaka</label>
              <input required className="w-full p-4 bg-slate-50 border rounded-xl font-bold" value={formData.plate} onChange={e=>setFormData({...formData, plate: e.target.value})}/>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Durum</label>
              <select className="w-full p-4 bg-slate-50 border rounded-xl font-bold" value={formData.active + ""} onChange={e=>setFormData({...formData, active: e.target.value === 'true'})}>
                <option value="true">Aktif</option>
                <option value="false">Kiralama Bitti / İade</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Marka / Model</label>
            <input required className="w-full p-4 bg-slate-50 border rounded-xl" value={formData.brandModel} onChange={e=>setFormData({...formData, brandModel: e.target.value})}/>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">İade / Pasif Tarihi</label>
            <input type="date" className="w-full p-4 bg-slate-50 border rounded-xl text-sm" value={formData.deactivationDate} onChange={e=>setFormData({...formData, deactivationDate: e.target.value})}/>
          </div>
          <button type="submit" disabled={formLoading} className="w-full py-5 bg-primary text-white rounded-xl font-black flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all">
            {formLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            BİLGİLERİ KAYDET
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default VehiclesPage;
