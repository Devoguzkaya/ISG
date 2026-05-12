"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Save, X } from 'lucide-react';
import { Modal } from './Modal';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
);

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPos: [number, number] | null;
  onSave: (pos: [number, number]) => void;
  title?: string;
}

const LocationPicker = ({ onSelect, position }: { onSelect: (pos: [number, number]) => void, position: [number, number] | null }) => {
  // @ts-ignore - useMapEvents is dynamic
  useMapEvents({
    click(e: any) {
      onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? (
    // @ts-ignore - Marker is dynamic
    <Marker position={position} />
  ) : null;
};

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
            // @ts-ignore - MapContainer is dynamic
            <MapContainer 
              center={selectedPos || [41.015137, 28.979530]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                // @ts-ignore
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationPicker onSelect={setSelectedPos} position={selectedPos} />
            </MapContainer>
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
