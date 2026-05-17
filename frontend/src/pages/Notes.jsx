import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import api from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Plus, Sparkles, Share2, Archive, Star, Trash2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Notes = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('Saved');
  const debouncedContent = useDebounce(localContent, 2000);
  const debouncedTitle = useDebounce(localTitle, 1500);

  // Fetch Notes
  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', debouncedSearch],
    queryFn: async () => {
      const res = await api.get('/notes', { params: { search: debouncedSearch } });
      return res.data;
    },
  });

  const activeNote = notes?.find(n => n._id === activeNoteId);

  // TipTap Editor Setup
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      setLocalContent(editor.getHTML());
      setSaveStatus('Saving...');
    },
  });

  // Sync editor content when switching notes
  useEffect(() => {
    if (activeNote) {
      setLocalTitle(activeNote.title);
      setLocalContent(activeNote.content);
      if (editor && editor.getHTML() !== activeNote.content) {
        editor.commands.setContent(activeNote.content);
      }
      setSaveStatus('Saved');
    } else {
      if (editor) editor.commands.setContent('');
      setLocalTitle('');
      setLocalContent('');
    }
  }, [activeNoteId, editor]);

  // Mutations
  const createNote = useMutation({
    mutationFn: () => api.post('/notes', { title: 'Untitled Note', content: '' }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['notes']);
      setActiveNoteId(res.data._id);
    },
  });

  const updateNote = useMutation({
    mutationFn: (data) => api.patch(`/notes/${activeNoteId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      setSaveStatus('Saved');
    },
  });

  const deleteNote = useMutation({
    mutationFn: (id) => api.delete(`/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      if (activeNoteId === id) setActiveNoteId(null);
    },
  });

  const toggleShare = useMutation({
    mutationFn: (id) => api.post(`/share/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
    }
  });

  const generateAI = useMutation({
    mutationFn: async (endpoint) => {
      setSaveStatus('Generating AI...');
      const res = await api.post(`/ai/${endpoint}`, { 
        content: localContent, 
        noteId: activeNoteId 
      });
      return { endpoint, data: res.data };
    },
    onSuccess: ({ endpoint, data }) => {
      if (endpoint === 'summarize') {
         updateNote.mutate({ summary: data.summary });
         const html = `<blockquote><strong>AI Summary:</strong><br/>${data.summary}</blockquote><p></p>`;
         editor.commands.insertContentAt(0, html);
         toast.success('Summary generated and added to note!');
      } else if (endpoint === 'action-items') {
         const itemsHTML = data.actionItems.map(item => `<li>${item}</li>`).join('');
         const html = `<blockquote><strong>AI Action Items:</strong><ul>${itemsHTML}</ul></blockquote><p></p>`;
         editor.commands.insertContent(html);
         toast.success('Action items generated and added to note!');
      } else if (endpoint === 'suggest-title') {
         setLocalTitle(data.title);
         updateNote.mutate({ title: data.title });
         toast.success('Title updated by AI!');
      }
      setSaveStatus('Saved');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'AI request failed. Did you configure the API key?');
      setSaveStatus('Saved');
    }
  });

  // Auto-save logic
  useEffect(() => {
    if (activeNoteId && (debouncedContent !== activeNote?.content || debouncedTitle !== activeNote?.title)) {
      if (activeNote) {
        updateNote.mutate({ title: debouncedTitle, content: debouncedContent });
      }
    }
  }, [debouncedContent, debouncedTitle]);


  return (
    <div className="flex h-[calc(100vh-64px)] gap-6">
      {/* Sidebar: Notes List */}
      <div className="w-80 flex flex-col bg-background border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">My Notes</h2>
            <Button size="icon" variant="ghost" onClick={() => createNote.mutate()} disabled={createNote.isPending}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search notes..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <p className="text-sm text-center text-muted-foreground mt-4">Loading...</p>
          ) : notes?.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground mt-4">No notes found.</p>
          ) : (
            notes?.map(note => (
              <div 
                key={note._id}
                onClick={() => setActiveNoteId(note._id)}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  activeNoteId === note._id ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-muted'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm truncate pr-2">{note.title}</h3>
                  {note.isPublic && <Share2 className="h-3 w-3 text-primary flex-shrink-0 mt-1" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {note.content.replace(/<[^>]*>?/gm, '') || 'Empty note...'}
                </p>
                <div className="text-[10px] text-muted-foreground mt-2">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col bg-background border border-border rounded-lg overflow-hidden shadow-sm relative">
        {activeNoteId ? (
          <>
            {/* Editor Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <input
                type="text"
                className="text-2xl font-bold bg-transparent outline-none flex-1 placeholder:text-muted-foreground"
                placeholder="Note Title..."
                value={localTitle}
                onChange={(e) => {
                  setLocalTitle(e.target.value);
                  setSaveStatus('Saving...');
                }}
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-2">{saveStatus}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleShare.mutate(activeNoteId)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {activeNote?.isPublic ? 'Shared' : 'Share'}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteNote.mutate(activeNoteId)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>

            {/* AI Tools Bar */}
            <div className="px-4 py-2 bg-primary/5 border-b border-border flex gap-2 overflow-x-auto">
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => generateAI.mutate('suggest-title')} disabled={generateAI.isPending}>
                <Sparkles className="h-3 w-3 mr-1 text-purple-500" /> Suggest Title
              </Button>
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => generateAI.mutate('summarize')} disabled={generateAI.isPending}>
                <Sparkles className="h-3 w-3 mr-1 text-purple-500" /> Summarize
              </Button>
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => generateAI.mutate('action-items')} disabled={generateAI.isPending}>
                <Sparkles className="h-3 w-3 mr-1 text-purple-500" /> Action Items
              </Button>
            </div>

            {/* TipTap Editor */}
            <div className="flex-1 overflow-y-auto p-8 prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
              <EditorContent editor={editor} />
            </div>

            {/* Share Link Overlay */}
            {activeNote?.isPublic && (
              <div className="absolute bottom-4 left-4 bg-background border border-primary/20 p-3 rounded-lg shadow-lg flex items-center gap-3">
                <div className="text-xs">
                  <p className="font-semibold">Public Link Active</p>
                  <a href={`/share/${activeNote.shareId}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {window.location.origin}/share/{activeNote.shareId}
                  </a>
                </div>
                <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/share/${activeNote.shareId}`)}>
                  Copy
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="h-16 w-16 mb-4 opacity-20" />
            <p>Select a note or create a new one</p>
            <Button className="mt-4" onClick={() => createNote.mutate()} disabled={createNote.isPending}>
              Create Note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
