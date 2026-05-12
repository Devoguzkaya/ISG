"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Save, X } from 'lucide-react';
import { Modal } from './Modal';

// Dynamically import the MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(
  () => import('./MapComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-secondary">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }
);

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPos: [number, number] | null;
  onSave: (pos: [number, number]) => void;
  title?: string;
}

export const MapModal = ({ isOpen, onClose, initialPos, onSave, title = "Konum Seç / Güncelle" }: MapModalProps) => {
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(initialPos);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setSelectedPos(initialPos);
  }, [initialPos, isOpen]);

  const handleSave = () => {
    if (selectedPos) {
      onSave(selectedPos);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-xs font-bold text-slate-400 italic">
          Harita üzerinde denetimin yapıldığı yere tıklayınız. İşaretçi ilgili konuma yerleştirilecektir.
        </p>
        
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 relative">
          {!isClient ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            <MapComponent 
              selectedPos={selectedPos} 
              onSelect={setSelectedPos} 
            />
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
          >
            İPTAL
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedPos}
            className="flex-[2] py-3 bg-primary text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <Save size={18} /> KONUMU KAYDET
          </button>
        </div>
      </div>
    </Modal>
  );
};
