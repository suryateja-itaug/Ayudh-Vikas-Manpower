import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, Tag, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { EmployeePersonalNote } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const PersonalNotesPage: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<EmployeePersonalNote[]>([]);
  const [loading, setLoading] = useState(true);

  // New Note State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('amber');
  const [saving, setSaving] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.getPersonalNotes();
      setNotes(res.notes);
    } catch (err) {
      console.error('Failed to load personal notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setSaving(true);
      const res = await api.createPersonalNote({ title, content, color });
      setNotes(prev => [res.note, ...prev]);
      setTitle('');
      setContent('');
    } catch (err: any) {
      alert(err.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await api.deletePersonalNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete note');
    }
  };

  const getColorClasses = (c: string) => {
    switch (c) {
      case 'amber':
        return 'bg-amber-50/80 border-amber-200 text-amber-950';
      case 'blue':
        return 'bg-blue-50/80 border-blue-200 text-blue-950';
      case 'emerald':
        return 'bg-emerald-50/80 border-emerald-200 text-emerald-950';
      case 'purple':
        return 'bg-purple-50/80 border-purple-200 text-purple-950';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <BookOpen className="w-7 h-7 text-amber-500" />
          <span>Personal Notes & Scratchpad</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Private duty notes, shift handovers, reminders, and personal memo log.
        </p>
      </div>

      {/* Add Note Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Create Private Note</h3>
        <form onSubmit={handleAddNote} className="space-y-3 text-xs">
          <input
            type="text"
            required
            placeholder="Note title (e.g. Gate 3 intercom replacement update)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
          />

          <textarea
            rows={3}
            required
            placeholder="Write note content..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
          />

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400 font-medium">Color:</span>
              {(['amber', 'blue', 'emerald', 'purple'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : ''
                  } ${
                    c === 'amber' ? 'bg-amber-400 border-amber-600' :
                    c === 'blue' ? 'bg-blue-400 border-blue-600' :
                    c === 'emerald' ? 'bg-emerald-400 border-emerald-600' :
                    'bg-purple-400 border-purple-600'
                  }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Add Note'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notes Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Saved Notes ({notes.length})</h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-28 bg-slate-100 rounded-2xl animate-pulse"></div>
            <div className="h-28 bg-slate-100 rounded-2xl animate-pulse"></div>
          </div>
        ) : notes.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-8 text-center bg-white rounded-3xl border border-slate-200">
            No notes added yet. Use the composer above to write your first note.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notes.map(note => (
              <div
                key={note.id}
                className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between space-y-3 ${getColorClasses(note.color)}`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{note.title}</h4>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center space-x-1 pt-2 border-t border-slate-200/40">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
