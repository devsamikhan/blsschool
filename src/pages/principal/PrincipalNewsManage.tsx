import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { NewsItem } from '@/types';
import { getAllNews, createNews, updateNews, deleteNews } from '@/lib/api';
import { EVENTS, useEventListener } from '@/lib/events';
import { toast } from 'sonner';
import { Newspaper, Plus, Trash2, Edit2, Image as ImageIcon, EyeOff, Eye, Sparkles, Send, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export function PrincipalNewsManage() {
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NewsItem['category']>('announcement');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllNews();
      setNews(data.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
    } catch {
      toast.error('Failed to load news articles.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  useEventListener(EVENTS.NEWS_CHANGE, fetchData);

  const handleOpenDialog = (item?: NewsItem) => {
    if (item) {
      setEditingId(item.id);
      setTitle(item.title);
      setContent(item.content);
      setCategory(item.category);
      setImageUrl(item.imageUrl);
      setIsActive(item.isActive);
    } else {
      setEditingId(null);
      setTitle('');
      setContent('');
      setCategory('announcement');
      setImageUrl('');
      setIsActive(true);
    }
    setIsDialogOpen(true);
  };

  const handleToggleVisibility = async (item: NewsItem) => {
    try {
      await updateNews(item.id, { isActive: !item.isActive });
      toast.success(item.isActive ? 'News hidden from public' : 'News published publicly');
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news article?')) return;
    try {
      await deleteNews(id);
      toast.success('News article deleted');
    } catch {
      toast.error('Failed to delete news');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { toast.error('Title and content are required'); return; }

    setIsSubmitting(true);
    try {
      const payload: Partial<NewsItem> = {
        title: title.trim(),
        content: content.trim(),
        category,
        imageUrl: imageUrl.trim(),
        isActive
      };

      if (editingId) {
        await updateNews(editingId, payload);
        toast.success('News updated successfully');
      } else {
        await createNews({
          ...payload as Omit<NewsItem, 'id' | 'publishedAt' | 'author'>,
          author: user?.name || 'Institutional Admin',
          publishedAt: new Date().toISOString()
        });
        toast.success('News published successfully');
      }
      setIsDialogOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to save news article');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="lms-page-title">Institutional Media</h1>
          <p className="lms-body mt-1">Manage official school news, articles, and public press releases.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2 rounded-xl h-11 px-6 shadow-lg shadow-blue-500/10">
          <Plus className="h-4 w-4" /> Create Article
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.length === 0 ? (
          <div className="col-span-full py-20 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center">
            <Newspaper className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Empty Registry</h3>
            <p className="lms-meta max-w-xs mt-2">No news articles found in the institutional records.</p>
          </div>
        ) : (
          news.map(item => (
            <Card key={item.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-all">
              {item.imageUrl && (
                <div className="aspect-[16/9] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative shrink-0">
                   <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
              )}
              <div className="flex flex-col flex-1 p-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight mb-2 uppercase tracking-tight">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">{item.content}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center text-[10px] font-bold text-slate-400 font-mono uppercase">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="p-5 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex justify-between items-center">
                <span className={cn(
                  "lms-badge text-[10px]",
                  item.category === 'announcement' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                  item.category === 'event' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  'bg-amber-50 text-amber-700 border-amber-100'
                )}>
                  {item.category.toUpperCase()}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(item)} className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Article' : 'New Publication'}</DialogTitle>
              <p className="text-sm text-slate-500 mt-1">Compose news or announcements for the portal.</p>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Article Title</label>
                <input 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Official Headline..."
                  className="form-input text-lg font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Classification</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value as NewsItem['category'])}
                  className="form-select"
                >
                  <option value="announcement">Announcement</option>
                  <option value="event">Campus Event</option>
                  <option value="achievement">Achievement</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Internal Media URL</label>
                <input 
                  value={imageUrl} 
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="form-input"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Article Content</label>
                <textarea 
                  required 
                  value={content} 
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                  placeholder="Draft your content here..."
                  className="form-input resize-none py-4 leading-relaxed"
                />
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-slate-50 dark:border-slate-800 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl px-8 h-12 font-bold text-slate-400">Cancel</Button>
              <Button disabled={isSubmitting} type="submit" className="rounded-xl px-10 h-12 bg-slate-900 text-white font-bold shadow-lg shadow-slate-900/20 flex items-center gap-2">
                 {isSubmitting ? 'Processing...' : (editingId ? 'Update Publication' : 'Release Article')}
                 {!isSubmitting && <Send className="h-4 w-4" />}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
