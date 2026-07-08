import { useState, useEffect } from 'react';
// Menggunakan instance axios global yang reusable
import api from '../api/axiosInstance'; 
import { Plus, Search, RotateCcw, Trash2, Edit, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

function CategoryPage() {
  // 1. State Utama Data API Backend
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 2. State untuk Pencarian & Navigasi Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    totalData: 0,
    totalPages: 1,
    perPage: 10
  });

  // 3. State Kontrol Pop-up Modal ADD
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // 4. State Kontrol Pop-up Modal EDIT
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [editCatStatus, setEditCatStatus] = useState('active');

  // 5. State Kontrol Pop-up Modal DELETE (Konfirmasi)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // 6. Fungsi Utama Mengambil Data dari Backend (GET /api/categories)
  const fetchCategories = async (page = 1, search = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/categories', {
        params: {
          page: page,
          perPage: 10,
          search: search 
        }
      });

      if (response.data.status === 'success') {
        setCategories(response.data.data);
        setPaginationInfo(response.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError('Gagal memuat data dari server backend.');
    } finally {
      setLoading(false);
    }
  };

  // Tunggal: Trigger fetch hanya bergantung pada perubahan currentPage
  useEffect(() => {
    fetchCategories(currentPage, searchQuery);
  }, [currentPage]);

  // Handler Kirim Form Pencarian
  const handleSearch = (e) => {
    e.preventDefault();
    if (currentPage === 1) {
      // Jika sudah di page 1, ubah state tidak memicu useEffect, panggil manual
      fetchCategories(1, searchQuery);
    } else {
      // Jika di page > 1, ubah ke 1 otomatis memicu useEffect
      setCurrentPage(1); 
    }
  };

  // Handler Bersihkan/Reset Pencarian
  const handleResetSearch = () => {
    setSearchQuery('');
    if (currentPage === 1) {
      // Jika sudah di page 1, ubah state tidak memicu useEffect, panggil manual dengan string kosong
      fetchCategories(1, '');
    } else {
      // Jika di page > 1, ubah ke 1 otomatis memicu useEffect dengan searchQuery terbaru (kosong)
      setCurrentPage(1);
    }
  };

  // Handler Submit Menyimpan Kategori Baru (POST /api/categories)
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      await api.post('/categories', {
        name: newCatName,
        description: newCatDesc,
        status: 'active'
      });

      setNewCatName('');
      setNewCatDesc('');
      setShowAddModal(false);

      // Kembalikan ke halaman 1 setelah tambah data
      if (currentPage === 1) {
        fetchCategories(1, searchQuery);
      } else {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Error saving new category:", err);
      alert('Gagal menyimpan kategori baru.');
    }
  };

  // Handler membuka Modal Edit dan mengisi form dengan data lama
  const openEditModal = (category) => {
    setSelectedCategory(category);
    setEditCatName(category.name);
    setEditCatDesc(category.description || '');
    setEditCatStatus(category.status || 'active');
    setShowEditModal(true);
  };

  // Handler Submit Update Data Kategori (PUT /api/categories/:id)
  const handleEditCategory = async (e) => {
    e.preventDefault();
    if (!editCatName || !selectedCategory) return;

    try {
      await api.put(`/categories/${selectedCategory.id}`, {
        name: editCatName,
        description: editCatDesc,
        status: editCatStatus
      });

      setShowEditModal(false);
      setSelectedCategory(null);
      
      // Refresh halaman aktif saat ini secara langsung karena urutan page tidak berubah
      fetchCategories(currentPage, searchQuery);
    } catch (err) {
      console.error("Error updating category:", err);
      alert('Gagal memperbarui data kategori.');
    }
  };

  // Handler membuka Modal Konfirmasi Hapus
  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  // Handler Aksi Eksekusi Hapus Data (DELETE /api/categories/:id)
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await api.delete(`/categories/${categoryToDelete.id}`);
      
      setShowDeleteModal(false);
      setCategoryToDelete(null);

      // Logika penentuan target page pasca-delete
      const isCurrentPageEmpty = categories.length === 1 && currentPage > 1;
      const targetPage = isCurrentPageEmpty ? currentPage - 1 : currentPage;
      
      if (currentPage === targetPage) {
        fetchCategories(targetPage, searchQuery);
      } else {
        setCurrentPage(targetPage); // Memicu useEffect secara otomatis
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      alert('Gagal menghapus kategori.');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Master Category</h1>
          <p className="text-slate-500 text-sm">Manage your product categories effectively.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-5 py-3 rounded-xl transition shadow-md shadow-blue-100 cursor-pointer text-sm"
        >
          <Plus size={18} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* FILTER & SEARCH SECTION */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Type a category search keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl transition cursor-pointer">
              Search
            </button>
            <button type="button" onClick={handleResetSearch} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition flex items-center gap-2 cursor-pointer">
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </form>
      </div>

      {/* DATA TABLE & PAGINATION SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {error && <div className="p-6 bg-red-50 text-red-600 font-semibold text-sm border-b border-red-100">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
              <tr>
                <th className="p-4 font-semibold">Category Name</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 pr-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin text-blue-600" />
                      <span>Connecting to the server...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="p-4 font-bold text-slate-800">{cat.name}</td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">{cat.description || '-'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        cat.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(cat)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(cat)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400 font-semibold">
                    No category data found in the backend.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROL PANEL PAGINATION */}
        {!loading && categories.length > 0 && (
          <div className="p-4 px-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-semibold text-slate-600">
            <div>
              Show <span className="text-slate-800">{categories.length}</span> from <span className="text-slate-800">{paginationInfo.totalData}</span> category data
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="text-xs text-slate-500 px-2">
                Page <span className="font-bold text-slate-800">{currentPage}</span> from <span className="font-bold text-slate-800">{paginationInfo.totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationInfo.totalPages))}
                disabled={currentPage === paginationInfo.totalPages}
                className="p-2 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD CATEGORY */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">Add New Category</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">Create a new category for your products.</p>
            
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Category Name</label>
                <input 
                  type="text"
                  placeholder="Example: phone, test, etc."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="rounded-xl border border-slate-300 p-3 text-sm text-slate-900 shadow-inner focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Description</label>
                <textarea 
                  placeholder="Short description..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  rows="3"
                  className="rounded-xl border border-slate-300 p-3 text-sm text-slate-900 shadow-inner focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowAddModal(false); setNewCatName(''); setNewCatDesc(''); }}
                  className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-100 transition cursor-pointer">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CATEGORY */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">Edit Category</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">Change category information.</p>
            
            <form onSubmit={handleEditCategory} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Category Name</label>
                <input 
                  type="text"
                  placeholder="Category name..."
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="rounded-xl border border-slate-300 p-3 text-sm text-slate-900 shadow-inner focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Description</label>
                <textarea 
                  placeholder="Short description..."
                  value={editCatDesc}
                  onChange={(e) => setEditCatDesc(e.target.value)}
                  rows="3"
                  className="rounded-xl border border-slate-300 p-3 text-sm text-slate-900 shadow-inner focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Status</label>
                <select
                  value={editCatStatus}
                  onChange={(e) => setEditCatStatus(e.target.value)}
                  className="rounded-xl border border-slate-300 p-3 text-sm bg-white text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowEditModal(false); setSelectedCategory(null); }}
                  className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-100 transition cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">Delete Category?</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Delete category <span className="font-bold text-slate-800">"{categoryToDelete?.name}"</span>? This action is permanent.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => { setShowDeleteModal(false); setCategoryToDelete(null); }}
                className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteCategory}
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 shadow-md shadow-red-100 transition cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryPage;