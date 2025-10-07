'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Trash2, Edit2, Save, X, Upload, Download, Search, LogOut, Clock, File, Home } from 'lucide-react';

type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type Document = {
  id: string;
  note_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadError, setUploadError] = useState('');

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  useEffect(() => {
    if (selectedNote) {
      fetchDocuments(selectedNote.id);
    } else {
      setDocuments([]);
    }
  }, [selectedNote]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
    } else {
      setUser(user);
    }
    setLoading(false);
  };

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (data) {
      setNotes(data);
    }
  };

  const fetchDocuments = async (noteId: string) => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('note_id', noteId)
      .order('created_at', { ascending: false });

    if (data) {
      setDocuments(data);
    }
  };

  const createNote = async () => {
    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          title: 'Untitled Note',
          content: '',
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (data) {
      setNotes([data, ...notes]);
      setSelectedNote(data);
      setIsEditing(true);
      setEditTitle(data.title);
      setEditContent(data.content || '');
    }
  };

  const updateNote = async () => {
    if (!selectedNote) return;

    const { data, error } = await supabase
      .from('notes')
      .update({
        title: editTitle,
        content: editContent,
      })
      .eq('id', selectedNote.id)
      .select()
      .single();

    if (data) {
      setNotes(notes.map((n) => (n.id === data.id ? data : n)));
      setSelectedNote(data);
      setIsEditing(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (!error) {
      setNotes(notes.filter((n) => n.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedNote || !e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setUploading(true);
    setUploadError('');

    try {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const { data, error: dbError } = await supabase
        .from('documents')
        .insert([
          {
            note_id: selectedNote.id,
            user_id: user.id,
            file_name: file.name,
            file_url: publicUrl,
            file_type: file.type || 'application/octet-stream',
            file_size: file.size,
          },
        ])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(dbError.message);
      }

      if (data) {
        setDocuments([data, ...documents]);
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadError(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const deleteDocument = async (doc: Document) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    const { error } = await supabase.from('documents').delete().eq('id', doc.id);

    if (!error) {
      const filePath = doc.file_url.split('/').slice(-2).join('/');
      await supabase.storage.from('documents').remove([filePath]);

      setDocuments(documents.filter((d) => d.id !== doc.id));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="font-serif text-xl text-gray-700">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-bold text-gray-900">Plain Theory</h1>
                  <p className="text-xs text-gray-500 font-serif">Private Workspace</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-serif text-sm"
                title="Back to articles"
              >
                <Home size={16} />
                <span className="hidden sm:inline">Articles</span>
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <span className="hidden md:block font-serif">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-serif text-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Notes List */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-200">
                <button
                  onClick={createNote}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-serif flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Plus size={20} />
                  New Note
                </button>

                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-serif text-sm"
                  />
                </div>
              </div>

              <div className="p-4 max-h-[calc(100vh-320px)] overflow-y-auto">
                <div className="space-y-2">
                  {filteredNotes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="mx-auto text-gray-300 mb-2" size={48} />
                      <p className="text-sm text-gray-500 font-serif">
                        {searchQuery ? 'No notes found' : 'No notes yet'}
                      </p>
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`group p-4 rounded-lg cursor-pointer transition-all ${
                          selectedNote?.id === note.id
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-sm'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                        onClick={() => {
                          setSelectedNote(note);
                          setIsEditing(false);
                        }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif font-bold text-sm truncate text-gray-900 mb-1">
                              {note.title}
                            </h3>
                            <p className="text-xs text-gray-500 font-serif line-clamp-2 mb-2">
                              {note.content || 'No content'}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock size={12} />
                              <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 font-serif text-center">
                  {notes.length} {notes.length === 1 ? 'note' : 'notes'} total
                </p>
              </div>
            </div>
          </div>

          {/* Main Content - Note Editor */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9">
            {selectedNote ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {isEditing ? (
                  <div className="p-8">
                    <div className="mb-6">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-4xl font-serif font-bold border-none focus:outline-none focus:ring-0 p-0 placeholder-gray-300"
                        placeholder="Note title..."
                      />
                    </div>
                    <div className="mb-6">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-[500px] font-serif text-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none p-6 resize-none rounded-lg"
                        placeholder="Start writing your thoughts..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={updateNote}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-serif flex items-center gap-2 hover:from-green-700 hover:to-emerald-700 rounded-lg transition-all shadow-md"
                      >
                        <Save size={18} />
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditTitle(selectedNote.title);
                          setEditContent(selectedNote.content || '');
                        }}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-serif flex items-center gap-2 rounded-lg transition-colors"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="p-8 border-b border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h2 className="text-4xl font-serif font-bold mb-3 text-gray-900">
                            {selectedNote.title}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-gray-500 font-serif">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>Updated {new Date(selectedNote.updated_at).toLocaleString()}</span>
                            </div>
                            <span>•</span>
                            <span>Created {new Date(selectedNote.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditTitle(selectedNote.title);
                            setEditContent(selectedNote.content || '');
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-serif flex items-center gap-2 rounded-lg transition-colors shadow-md"
                        >
                          <Edit2 size={18} />
                          Edit
                        </button>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="prose max-w-none mb-8">
                        <p className="font-serif text-lg leading-relaxed whitespace-pre-wrap text-gray-700">
                          {selectedNote.content || (
                            <span className="text-gray-400 italic">No content yet. Click Edit to add content.</span>
                          )}
                        </p>
                      </div>

                      {/* Documents Section */}
                      <div className="mt-12 pt-8 border-t-2 border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-gray-900">
                            <File size={24} />
                            Attached Documents
                            {documents.length > 0 && (
                              <span className="text-sm font-normal text-gray-500">({documents.length})</span>
                            )}
                          </h3>
                          <label className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-serif flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 cursor-pointer rounded-lg transition-all shadow-md">
                            <Upload size={18} />
                            {uploading ? 'Uploading...' : 'Upload File'}
                            <input
                              type="file"
                              onChange={handleFileUpload}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                        </div>

                        {uploadError && (
                          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-serif">
                            {uploadError}
                          </div>
                        )}

                        <div className="grid gap-3">
                          {documents.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                              <File className="mx-auto text-gray-300 mb-3" size={48} />
                              <p className="text-gray-500 font-serif text-sm">No documents attached yet</p>
                              <p className="text-gray-400 font-serif text-xs mt-1">Upload files to attach them to this note</p>
                            </div>
                          ) : (
                            documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-lg transition-all group"
                              >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText size={24} className="text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-serif font-semibold text-sm text-gray-900 truncate">{doc.file_name}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-serif mt-1">
                                      <span>{formatFileSize(doc.file_size)}</span>
                                      <span>•</span>
                                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <a
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Download"
                                  >
                                    <Download size={18} />
                                  </a>
                                  <button
                                    onClick={() => deleteDocument(doc)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText size={48} className="text-blue-600" />
                  </div>
                  <h2 className="font-serif text-3xl font-bold mb-3 text-gray-900">Welcome to Your Workspace</h2>
                  <p className="font-serif text-gray-600 mb-6">
                    Select a note from the sidebar to view and edit, or create a new note to get started.
                  </p>
                  <button
                    onClick={createNote}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-serif flex items-center gap-2 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all shadow-md mx-auto"
                  >
                    <Plus size={20} />
                    Create Your First Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
