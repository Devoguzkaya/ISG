"use client";

import { Notebook, Search, Filter, Calendar, MessageSquare, Tag } from 'lucide-react';

const NotesPage = () => {
  const notes = [
    { 
      id: 1, 
      date: '11.04.2026', 
      title: 'Hava Muhalefeti ve Vinç Güvenliği', 
      content: 'Bugün beklenen aşırı rüzgar nedeniyle vinç operatörlerine bom yüksekliği konusunda uyarı yapıldı. Rüzgar hızı 45 km/s üzerine çıkarsa çalışma durdurulacak.',
      category: 'Önemli',
      author: 'Oğuzhan Kaya'
    },
    { 
      id: 2, 
      date: '10.04.2026', 
      title: 'KKD Kontrolü Hakkında', 
      content: 'Saha denetiminde personelin yüksekte çalışırken emniyet kemeri bağlantılarını tam yaptığı gözlemlendi. Kanca kontrolü rutin hale getirilmeli.',
      category: 'Denetim',
      author: 'Oğuzhan Kaya'
    },
  ];

  return (
    <div className="space-y-8 animate-fade">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">Açıklamalı Notlar</h1>
          <p className="text-muted-foreground mt-1">Günlük saha gözlemleri ve İSG notları.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Notlarda ara..." 
              className="pl-10 pr-4 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent w-64"
            />
          </div>
          <button className="p-2 border border-border rounded-xl text-primary hover:bg-slate-50">
            <Filter size={18} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {notes.map((note) => (
          <div key={note.id} className="card-premium border-l-4 border-l-accent">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-slate-50 text-accent-foreground rounded-lg">
                  <Tag size={16} />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {note.category}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Calendar size={14} />
                {note.date}
              </div>
            </div>

            <h3 className="text-xl font-bold text-primary mb-3">{note.title}</h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              {note.content}
            </p>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {note.author.charAt(0)}
                </div>
                <span className="font-semibold text-primary">{note.author}</span>
              </div>
              <button className="flex items-center gap-1.5 text-primary hover:underline font-bold">
                <MessageSquare size={14} /> 2 Yorum
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesPage;
