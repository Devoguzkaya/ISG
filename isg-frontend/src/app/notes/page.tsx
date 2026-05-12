"use client";

import { useEffect, useState } from 'react';
import { 
  Notebook, 
  Search, 
  Filter, 
  Calendar, 
  MessageSquare, 
  Tag, 
  Plus, 
  Send, 
  Loader2,
  ChevronDown,
  ChevronUp,
  User
} from 'lucide-react';
import { notesApi } from '@/lib/api';
import { Modal } from '@/components/Modal';

const NotesPage = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Genel',
    author: 'Oğuzhan Kaya'
  });

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await notesApi.getAll();
      setNotes(res.data);
    } catch (err) {
      console.error('Notlar çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await notesApi.create(formData);
      setIsModalOpen(false);
      setFormData({ title: '', content: '', category: 'Genel', author: 'Oğuzhan Kaya' });
      fetchNotes();
    } catch (err) {
      console.error('Not kaydedilemedi:', err);
    }
  };

  const handleAddComment = async (noteId: number) => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const res = await notesApi.addComment(noteId, {
        author: 'Oğuzhan Kaya',
        content: newComment
      });
      // Update the specific note in the list with the new data (including comments)
      setNotes(prev => prev.map(n => n.id === noteId ? res.data : n));
      setNewComment("");
    } catch (err) {
      console.error('Yorum eklenemedi:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="max-w-[1550px] mx-auto space-y-8 animate-fade pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary flex items-center gap-3">
            <Notebook className="text-accent" />
            Saha Gözlem Notları
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Günlük operasyonel notlar ve teknik gözlemler.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 shadow-xl transition-all active:scale-95"
          >
            <Plus size={18} /> Yeni Not Ekle
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Notlar yükleniyor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {notes.length === 0 ? (
            <div className="card-premium py-20 text-center opacity-50">
              <Notebook className="mx-auto mb-4 text-slate-300" size={48} />
              <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Henüz bir not paylaşılmamış.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="card-premium border-l-4 border-l-accent overflow-hidden transition-all hover:shadow-2xl">
                <div className="p-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-slate-50 text-accent-foreground rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100">
                        {note.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      <Calendar size={14} className="text-slate-300" />
                      {new Date(note.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-primary mb-3 leading-tight">{note.title}</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed mb-6 whitespace-pre-wrap">
                    {note.content}
                  </p>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs shadow-lg">
                        {note.author.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-primary uppercase tracking-tight">{note.author}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">İSG Sorumlusu</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-black text-[10px] uppercase tracking-widest ${
                        expandedNoteId === note.id 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-slate-400 hover:text-primary hover:bg-slate-50 border border-transparent hover:border-slate-100'
                      }`}
                    >
                      <MessageSquare size={14} /> 
                      {note.comments?.length || 0} Yorum
                      {expandedNoteId === note.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedNoteId === note.id && (
                  <div className="mt-6 bg-secondary/20 -mx-6 -mb-6 p-6 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4 mb-6">
                      {note.comments && note.comments.length > 0 ? (
                        note.comments.map((comment: any) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                              <User size={12} className="text-slate-500 dark:text-slate-300" />
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black text-primary uppercase">{comment.author}</span>
                                <span className="text-[8px] font-bold text-slate-400">
                                  {new Date(comment.createdAt).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground font-medium leading-relaxed bg-background p-3 rounded-xl border border-border shadow-sm">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">Henüz yorum yapılmamış.</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Yorumunuzu buraya yazın..."
                        className="flex-grow p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(note.id)}
                      />
                      <button 
                        onClick={() => handleAddComment(note.id)}
                        disabled={commentLoading || !newComment.trim()}
                        className="p-3 bg-primary text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {commentLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* New Note Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Saha Notu Oluştur">
        <form onSubmit={handleCreateNote} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Başlık</label>
            <input 
              required 
              placeholder="Örn: X Bölgesindeki Tehlike Hakkında"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-primary focus:ring-2 focus:ring-primary/10 outline-none"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Kategori</label>
              <select 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="Genel">Genel</option>
                <option value="Önemli">Önemli</option>
                <option value="Tehlike">Tehlike</option>
                <option value="Denetim">Denetim</option>
                <option value="Bilgi">Bilgi</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Yazar</label>
              <input 
                disabled
                className="w-full p-4 bg-slate-100 border border-slate-200 rounded-xl font-black text-slate-400"
                value={formData.author}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Not İçeriği</label>
            <textarea 
              required
              rows={5}
              placeholder="Saha gözlemlerinizi detaylıca buraya yazın..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-primary/10 outline-none"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-5 bg-primary text-white rounded-xl font-black shadow-xl shadow-primary/20 hover:bg-slate-800 transition-all active:scale-[0.98] mt-4 uppercase tracking-widest text-xs"
          >
            NOTU PAYLAŞ
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default NotesPage;
