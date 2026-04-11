import { useState, useEffect, useCallback } from 'react';
import { 
  Package, Plus, Search, Filter, Edit2, Trash2, MapPin, 
  Calendar, X, ShieldCheck
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { InventoryItem } from '../../types';
import { getAllInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../../lib/api';

export function InventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    category: 'furniture',
    quantity: 1,
    condition: 'new',
    location: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    cost: 0,
    lastChecked: new Date().toISOString().split('T')[0],
    status: 'in-use'
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllInventory();
      setItems(data);
    } catch {
      toast.error('Failed to sync asset registry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        condition: item.condition,
        location: item.location,
        purchaseDate: item.purchaseDate,
        cost: item.cost,
        lastChecked: item.lastChecked,
        status: item.status,
        assignedTo: item.assignedTo
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'furniture',
        quantity: 1,
        condition: 'new',
        location: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        cost: 0,
        lastChecked: new Date().toISOString().split('T')[0],
        status: 'in-use'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, formData);
        toast.success('Asset record updated successfully.');
      } else {
        await createInventoryItem(formData);
        toast.success('New asset added to registry.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to save asset record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset record?')) return;
    try {
      await deleteInventoryItem(id);
      toast.success('Asset removed from registry.');
      fetchData();
    } catch {
      toast.error('Failed to remove asset.');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="lms-page-title">Institutional Assets</h1>
          <p className="lms-body mt-1">Manage physical resources, technological infrastructure, and campus equipment.</p>
        </div>
        <Button onClick={() => openModal()} className="h-12 px-8 rounded-xl font-bold bg-slate-900 text-white shadow-soft hover:scale-[1.02] transition-all flex items-center gap-2">
          <Plus className="h-4.5 w-4.5" /> Add Asset
        </Button>
      </div>

      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-soft flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search assets, locations, or serial tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-12 h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="form-select h-12 md:w-64 bg-white dark:bg-slate-950 font-bold text-xs uppercase tracking-widest"
        >
          <option value="all">Institutional: All Categories</option>
          <option value="furniture">Furniture</option>
          <option value="electronics">IT / Electronics</option>
          <option value="books">Library Collection</option>
          <option value="sports">Athletic Equipment</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-[2rem] shadow-soft border border-slate-100/50 overflow-hidden hover:shadow-premium transition-all duration-300 dark:bg-slate-900 dark:border-slate-800/50 group">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "p-4 rounded-2xl shadow-sm transition-transform group-hover:scale-110",
                  item.category === 'electronics' ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" :
                  item.category === 'furniture' ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
                  "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}>
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <Button variant="outline" size="sm" onClick={() => openModal(item)} className="h-9 w-9 p-0 rounded-lg border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} className="h-9 w-9 p-0 rounded-lg border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-5">{item.name}</h3>
              
              <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-xs font-bold mb-8">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">Location</p>
                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-300 uppercase leading-none">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> {item.location}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">Asset Volume</p>
                  <p className="text-slate-900 dark:text-slate-300 uppercase leading-none">{item.quantity} Units</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">Registry Date</p>
                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-300 leading-none">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> {item.purchaseDate}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">Valuation</p>
                  <p className="text-emerald-600 dark:text-emerald-400 uppercase leading-none">Rs {item.cost.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800/50">
                <span className={cn(
                  "lms-badge",
                  item.status === 'in-use' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30' : 
                  item.status === 'repair' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30' :
                  'bg-slate-50 text-slate-500 dark:bg-slate-800'
                )}>
                  {item.status}
                </span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  item.condition === 'new' ? 'text-indigo-600' : 
                  item.condition === 'good' ? 'text-emerald-600' :
                  'text-amber-600'
                )}>
                  {item.condition}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium w-full max-w-lg overflow-hidden border border-slate-200/50 dark:border-slate-800/50 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl shadow-sm"><Package className="h-5 w-5" /></div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{editingItem ? 'Edit Asset Record' : 'Initialize Asset Entry'}</h2>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Asset Nomenclature</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Smart Projector UHD" className="form-input" />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Classification</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as InventoryItem['category']})} className="form-select font-bold text-xs uppercase tracking-widest h-12">
                      <option value="furniture">Furniture</option>
                      <option value="electronics">Electronics</option>
                      <option value="books">Library Collection</option>
                      <option value="sports">Athletic Equipment</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Operational State</label>
                    <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value as InventoryItem['condition']})} className="form-select font-bold text-xs uppercase tracking-widest h-12">
                      <option value="new">Pristine (New)</option>
                      <option value="good">Standard (Good)</option>
                      <option value="fair">Degraded (Fair)</option>
                      <option value="poor">Critial (Poor)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Physical Location</label>
                    <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Main Laboratory" className="form-input" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Unit Volume</label>
                    <input required type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} className="form-input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Acquisition Val (Rs)</label>
                    <input required type="number" value={formData.cost} onChange={e => setFormData({...formData, cost: parseFloat(e.target.value) || 0})} className="form-input" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Current Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as InventoryItem['status']})} className="form-select font-bold text-xs uppercase tracking-widest h-12">
                      <option value="in-use">In-Deployment</option>
                      <option value="stored">In-Storage</option>
                      <option value="repair">In-Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-3 border-t border-slate-50 dark:border-slate-800">
                <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em]" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-bold uppercase text-[10px] tracking-[0.2em] shadow-soft active:scale-95 transition-all">
                  {isSubmitting ? 'Syncing...' : (editingItem ? 'Update Asset' : 'Commit Entry')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
