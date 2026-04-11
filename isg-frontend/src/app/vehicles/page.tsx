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
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">Vinçler ve Araçlar</h1>
          <p className="text-muted-foreground mt-1">Saha operasyonlarında kullanılan aktif ve iade edilen araçlar.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="btn btn-primary bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((vehicle) => {
            const isPassive = !vehicle.active || (vehicle.deactivationDate && new Date(vehicle.deactivationDate) <= new Date());
            
            return (
              <div key={vehicle.id} className={`card-premium relative transition-all ${isPassive ? 'opacity-70 bg-slate-50 grayscale-[0.5]' : ''}`}>
                <div className="flex items-start gap-5">
                  <div className={`p-4 rounded-2xl ${isPassive ? 'bg-slate-200 text-slate-400' : 'bg-slate-50 text-blue-600'}`}>
                    <Truck size={32} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${isPassive ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {isPassive ? 'Kiralama Bitti / İade Edildi' : 'AKTİF'}
                      </span>
                      {vehicle.deactivationDate && !isPassive && (
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 uppercase">
                          <Calendar size={10} /> İade: {new Date(vehicle.deactivationDate).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xl font-black ${isPassive ? 'text-slate-500' : 'text-primary'}`}>{vehicle.plate}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{vehicle.brandModel}</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-semibold text-muted-foreground">{vehicle.type}</div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleOpenEdit(vehicle)} className="text-xs font-bold text-primary hover:underline">DÜZENLE</button>
                    <button onClick={() => handleDelete(vehicle.id)} className="text-xs font-bold text-red-400 hover:text-red-600">SİL</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Araç Bilgilerini Düzenle">
        <form onSubmit={handleSubmit} className="space-y-5">
           <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Plaka</label>
              <input required className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={formData.plate} onChange={e=>setFormData({...formData, plate: e.target.value})}/>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Durum</label>
              <select className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={formData.active + ""} onChange={e=>setFormData({...formData, active: e.target.value === 'true'})}>
                <option value="true">Aktif</option>
                <option value="false">Kiralama Bitti / İade</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">Marka / Model</label>
            <input required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.brandModel} onChange={e=>setFormData({...formData, brandModel: e.target.value})}/>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400">İade / Pasif Tarihi (Opsiyonel)</label>
            <input type="date" className="w-full p-3 bg-slate-50 border rounded-xl text-sm" value={formData.deactivationDate} onChange={e=>setFormData({...formData, deactivationDate: e.target.value})}/>
          </div>
          <button type="submit" disabled={formLoading} className="w-full py-4 bg-primary text-white rounded-xl font-black flex items-center justify-center gap-2">
            {formLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            BİLGİLERİ KAYDET
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default VehiclesPage;
