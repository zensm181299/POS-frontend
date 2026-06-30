import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';
import { Plus, Search, RotateCcw, Trash2, Edit, ChevronLeft, ChevronRight, Loader2, Package } from 'lucide-react';

function ProductPage() {
    // 1. State Utama Data API Produk
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // Untuk menampung daftar pilihan kategori di form
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 2. State untuk Pencarian & Navigasi Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({ totalData: 0, totalPages: 1, perPage: 10 });

    // 3. State Kontrol Pop-up Modal ADD
    const [showAddModal, setShowAddModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCategoryId, setNewCategoryId] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newStock, setNewStock] = useState('');
    const [newDesc, setNewDesc] = useState('');
    // Tambahkan ini di jajaran state bagian atas komponen ProductPage
    const [newIsNeedStock, setNewIsNeedStock] = useState(true);
    const [editIsNeedStock, setEditIsNeedStock] = useState(true);

    // 4. State Kontrol Pop-up Modal EDIT
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editName, setEditName] = useState('');
    const [editCategoryId, setEditCategoryId] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editStock, setEditStock] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editStatus, setEditStatus] = useState('active');

    // 5. State Kontrol Pop-up Modal DELETE
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    // Fungsi Ambil Data Produk (GET /api/products)
    const fetchProducts = useCallback(async (page = 1, search = '') => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/products', {
                params: {
                    page: page,
                    perPage: 10,
                    search: search
                }
            });
            if (response.data.status === 'success') {
                setProducts(response.data.data);
                setPaginationInfo(response.data.pagination);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
            setError('Gagal memuat data produk dari server backend.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fungsi Ambil Data Kategori untuk Dropdown Pilihan
    const fetchCategoriesForDropdown = useCallback(async () => {
        try {
            const response = await api.get('/categories', { params: { perPage: 100 } });
            if (response.data.status === 'success') {
                setCategories(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching categories for dropdown:", err);
        }
    }, []);

    useEffect(() => {
        fetchProducts(currentPage, searchQuery);
    }, [currentPage, fetchProducts]);

    useEffect(() => {
        fetchCategoriesForDropdown();
    }, [fetchCategoriesForDropdown]);

    // Handler Search & Reset
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchProducts(1, searchQuery);
    };

    const handleResetSearch = () => {
        setSearchQuery('');
        setCurrentPage(1);
        fetchProducts(1, '');
    };

    // Handler Submit ADD Product (POST /api/products)
    const handleAddProduct = async (e) => {
        e.preventDefault();
        // Validasi input: Jika is_need_stock aktif, newStock wajib diisi. Jika tidak aktif, newStock diabaikan.
        if (!newName || !newCategoryId || !newPrice || (newIsNeedStock && !newStock)) return;

        try {
            await api.post('/products', {
                name: newName,
                category_id: newCategoryId,
                price: Number(newPrice),
                stock: newIsNeedStock ? Number(newStock) : 0, // Set 0 jika tidak butuh stok
                description: newDesc,
                status: 'active',
                is_need_stock: newIsNeedStock // <-- Payload baru bertipe Boolean
            });

            // Reset form & close
            setNewName('');
            setNewCategoryId('');
            setNewPrice('');
            setNewStock('');
            setNewDesc('');
            setNewIsNeedStock(true); // Reset state checkbox ke default true
            setShowAddModal(false);

            setCurrentPage(1);
            fetchProducts(1, searchQuery);
        } catch (err) {
            console.error("Error saving product:", err);
            alert('Gagal menyimpan produk baru.');
        }
    };

    // Handler membuka Modal Edit
    const openEditModal = (product) => {
        setSelectedProduct(product);
        setEditName(product.name);
        setEditCategoryId(product.category_id);
        setEditPrice(product.price);
        setEditStock(product.stock);
        setEditDesc(product.description || '');
        setEditStatus(product.status || 'active');
        // Set state checkbox dari data produk database (jika undefined, default ke true)
        setEditIsNeedStock(product.is_need_stock !== undefined ? product.is_need_stock : true);
        setShowEditModal(true);
    };

    // Handler Submit EDIT Product (PUT /api/products/:id)
    const handleEditProduct = async (e) => {
        e.preventDefault();
        // Validasi input: Jika editIsNeedStock aktif, editStock wajib diisi.
        if (!editName || !editCategoryId || !editPrice || (editIsNeedStock && !editStock) || !selectedProduct) return;

        try {
            await api.put(`/products/${selectedProduct.id}`, {
                name: editName,
                category_id: editCategoryId,
                price: Number(editPrice),
                stock: editIsNeedStock ? Number(editStock) : 0, // Set 0 jika tidak butuh stok fisik
                description: editDesc,
                status: editStatus,
                is_need_stock: editIsNeedStock // <-- Payload baru bertipe Boolean
            });

            setShowEditModal(false);
            setSelectedProduct(null);
            fetchProducts(currentPage, searchQuery);
        } catch (err) {
            console.error("Error updating product:", err);
            alert('Gagal memperbarui data produk.');
        }
    };

    // Handler Delete Product
    const openDeleteModal = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;
        try {
            await api.delete(`/products/${productToDelete.id}`);
            setShowDeleteModal(false);
            setProductToDelete(null);

            const isCurrentPageEmpty = products.length === 1 && currentPage > 1;
            const targetPage = isCurrentPageEmpty ? currentPage - 1 : currentPage;

            setCurrentPage(targetPage);
            fetchProducts(targetPage, searchQuery);
        } catch (err) {
            console.error("Error deleting product:", err);
            alert('Gagal menghapus produk.');
        }
    };

    return (
        <div className="space-y-6">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Master Product</h1>
                    <p className="text-slate-500 text-sm">Kelola daftar item barang, harga, dan ketersediaan stok kasir POS.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-5 py-3 rounded-xl transition shadow-md shadow-blue-100 cursor-pointer text-sm"
                >
                    <Plus size={18} />
                    <span>Add New Product</span>
                </button>
            </div>

            {/* FILTER & SEARCH SECTION */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama produk..."
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

            {/* DATA TABLE SECTION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {error && <div className="p-6 bg-red-50 text-red-600 font-semibold text-sm border-b border-red-100">{error}</div>}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
                            <tr>
                                <th className="p-4 pl-6 font-semibold">Product Name</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold">Price</th>
                                <th className="p-4 font-semibold text-center">Stock Management</th>
                                <th className="p-4 font-semibold text-center">Stock</th>
                                <th className="p-4 font-semibold text-center">Status</th>
                                <th className="p-4 pr-6 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 size={20} className="animate-spin text-blue-600" />
                                            <span>Menarik data produk...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : products.length > 0 ? (
                                products.map((prod) => (
                                    <tr key={prod.id} className="hover:bg-slate-50/50 transition-all">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                                                    <Package size={16} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{prod.name}</p>
                                                    {/* <p className="text-[11px] font-mono text-slate-400 max-w-[100px] truncate" title={prod.id}>{prod.id}</p> */}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                                                {prod.category?.name || 'No Category'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-slate-800">
                                            Rp {Number(prod.price).toLocaleString('id-ID')}
                                        </td>

                                        {/* STATUS FIELD IS_NEED_STOCK */}
                                        <td className="p-4 text-center">
                                            {prod.is_need_stock ? (
                                                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-extrabold border border-blue-100">
                                                    ON
                                                </span>
                                            ) : (
                                                <span className="bg-slate-100 text-slate-400 px-2.5 py-1 rounded-lg text-xs font-extrabold border border-slate-200">
                                                    OFF
                                                </span>
                                            )}
                                        </td>

                                        {/* MENYESUAIKAN KOLOM STOK BERDASARKAN IS_NEED_STOCK */}
                                        <td className="p-4 text-center font-bold">
                                            {prod.is_need_stock ? (
                                                <span className={prod.stock <= 5 ? "text-red-500" : "text-slate-700"}>
                                                    {prod.stock}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 font-normal" title="Tidak membutuhkan stok fisik">∞</span>
                                            )}
                                        </td>

                                        <td className="p-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${prod.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                {prod.status}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEditModal(prod)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => openDeleteModal(prod)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-400 font-semibold">
                                        Tidak ada data produk ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION PANEL */}
                {!loading && products.length > 0 && (
                    <div className="p-4 px-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-semibold text-slate-600">
                        <div>
                            Menampilkan <span className="text-slate-800">{products.length}</span> dari <span className="text-slate-800">{paginationInfo.totalData}</span> produk
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="text-xs text-slate-500 px-2">
                                Halaman <span className="font-bold text-slate-800">{currentPage}</span> dari <span className="font-bold text-slate-800">{paginationInfo.totalPages}</span>
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationInfo.totalPages))}
                                disabled={currentPage === paginationInfo.totalPages}
                                className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL: ADD PRODUCT */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                        <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">Add New Product</h3>
                        <p className="text-slate-500 text-sm mb-6">Tambahkan produk dagang baru ke etalase kasir.</p>

                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Product Name</label>
                                <input type="text" placeholder="Nama Produk" value={newName} onChange={(e) => setNewName(e.target.value)} className="rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none" required />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Category</label>
                                <select value={newCategoryId} onChange={(e) => setNewCategoryId(e.target.value)} className="rounded-xl border border-slate-300 p-3 text-sm bg-white focus:border-blue-500 focus:outline-none cursor-pointer" required>
                                    <option value="">-- Pilih Kategori --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* TOGGLE MANAGEMENT STOK (ADD) */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Manajemen Stok</label>
                                <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                    <input
                                        type="checkbox"
                                        id="new_is_need_stock"
                                        checked={newIsNeedStock}
                                        onChange={(e) => setNewIsNeedStock(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                    />
                                    <label htmlFor="new_is_need_stock" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                                        {newIsNeedStock ? (
                                            <span className="text-blue-600 font-extrabold">ON (Butuh Stok Fisik — Retail/Barang)</span>
                                        ) : (
                                            <span className="text-slate-400 font-extrabold">OFF (Tanpa Stok Fisik — Pulsa/Jasa)</span>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Price (Rp)</label>
                                    <input type="number" placeholder="10000" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none" required />
                                </div>

                                {/* INPUT STOCK (ADD): Hanya tampil jika ON */}
                                <div className={`flex flex-col gap-1.5 transition-all duration-200 ${newIsNeedStock ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'}`}>
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Stock</label>
                                    <input
                                        type="number"
                                        placeholder={newIsNeedStock ? "10" : "0"}
                                        value={newIsNeedStock ? newStock : ''}
                                        onChange={(e) => setNewStock(e.target.value)}
                                        className="rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
                                        disabled={!newIsNeedStock}
                                        required={newIsNeedStock}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description</label>
                                <textarea placeholder="Keterangan opsional..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows="3" className="rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none resize-none" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition cursor-pointer">Batal</button>
                                <button type="submit" className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition cursor-pointer">Simpan Produk</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: EDIT PRODUCT */}
            {showEditModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                        <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">Edit Product</h3>
                        <p className="text-slate-500 text-sm mb-6">Ubah detail rincian produk terpilih.</p>

                        <form onSubmit={handleEditProduct} className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Product Name</label>
                                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none" required />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Category</label>
                                <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} className="rounded-xl border border-slate-300 p-3 text-sm bg-white focus:border-blue-500 focus:outline-none cursor-pointer" required>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* TOGGLE MANAGEMENT STOK (EDIT) */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Manajemen Stok</label>
                                <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                    <input
                                        type="checkbox"
                                        id="edit_is_need_stock"
                                        checked={editIsNeedStock}
                                        onChange={(e) => setEditIsNeedStock(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                    />
                                    <label htmlFor="edit_is_need_stock" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                                        {editIsNeedStock ? (
                                            <span className="text-blue-600 font-extrabold">ON (Butuh Stok Fisik — Retail/Barang)</span>
                                        ) : (
                                            <span className="text-slate-400 font-extrabold">OFF (Tanpa Stok Fisik — Pulsa/Jasa)</span>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Price (Rp)</label>
                                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none" required />
                                </div>

                                {/* INPUT STOCK (EDIT): Hanya aktif jika ON */}
                                <div className={`flex flex-col gap-1.5 transition-all duration-200 ${editIsNeedStock ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'}`}>
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Stock</label>
                                    <input
                                        type="number"
                                        value={editIsNeedStock ? editStock : ''}
                                        onChange={(e) => setEditStock(e.target.value)}
                                        className="rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
                                        disabled={!editIsNeedStock}
                                        required={editIsNeedStock}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status</label>
                                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="rounded-xl border border-slate-300 p-3 text-sm bg-white focus:border-blue-500 focus:outline-none cursor-pointer">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description</label>
                                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows="3" className="rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none resize-none" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition cursor-pointer">Batal</button>
                                <button type="submit" className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition cursor-pointer">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* MODAL: CONFIRM DELETE */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                        <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">Hapus Produk?</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Hapus produk <span className="font-bold text-slate-800">"{productToDelete?.name}"</span>? Tindakan ini permanen.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition cursor-pointer">Batal</button>
                            <button onClick={handleDeleteProduct} className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 transition cursor-pointer">Ya, Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductPage;