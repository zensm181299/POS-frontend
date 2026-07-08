// import React, { useState, useEffect } from 'react';
// import api from '../api/axiosInstance'; // Sesuaikan dengan path instance axios kamu
// import { Loader2, Plus, Pencil, Trash2, Wallet, X, ArrowUpCircle, History, ArrowDownCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

// export default function WalletPage() {
//     const [wallets, setWallets] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // State untuk Modal (Create & Update)
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
//     const [selectedId, setSelectedId] = useState(null);
//     const [formData, setFormData] = useState({
//         name: '',
//         balance: '',
//         description: ''
//     });

//     // ─── STATE BARU UNTUK FITUR TOP UP / MUTASI & HISTORY ───
//     const [isTxModalOpen, setIsTxModalOpen] = useState(false);
//     const [activeTab, setActiveTab] = useState('transaksi'); // 'transaksi' | 'history'
//     const [selectedWallet, setSelectedWallet] = useState(null);
//     const [txHistory, setTxHistory] = useState([]);
//     const [loadingHistory, setLoadingHistory] = useState(false);
//     const [txFormData, setTxFormData] = useState({
//         type: 'INCOME', // 'INCOME' = pemasukan, 'EXPENSE' = pengeluaran
//         amount: '',
//         date: new Date().toISOString().split('T')[0], // Default tanggal hari ini
//         notes: ''
//     });

//     // Fetch data saat halaman pertama dimuat
//     useEffect(() => {
//         fetchWallets();
//     }, []);

//     const fetchWallets = async () => {
//         try {
//             setLoading(true);
//             const response = await api.get('/wallets');
//             // Menangani jika response langsung array atau dibungkus dalam properti data
//             const resultData = response.data.data || response.data;
//             setWallets(Array.isArray(resultData) ? resultData : []);
//         } catch (err) {
//             console.error("Error fetching wallets:", err);
//             setError("Gagal memuat daftar dompet.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fetch history transaksi untuk wallet tertentu
//     const fetchWalletHistory = async (walletId) => {
//         try {
//             setLoadingHistory(true);
//             // Sesuaikan endpoint ini dengan struktur API backend Anda
//             const response = await api.get(`/wallets/${walletId}/transactions`);
//             const resultData = response.data.data || response.data;
//             setTxHistory(Array.isArray(resultData) ? resultData : []);
//         } catch (err) {
//             console.error("Error fetching wallet history:", err);
//             setTxHistory([]);
//         } finally {
//             setLoadingHistory(false);
//         }
//     };

//     // Membuka modal untuk Tambah Data
//     const openCreateModal = () => {
//         setModalMode('create');
//         setFormData({ name: '', balance: '', description: '' });
//         setIsModalOpen(true);
//     };

//     // Membuka modal untuk Edit Data
//     const openEditModal = (wallet) => {
//         setModalMode('edit');
//         setSelectedId(wallet.id);
//         setFormData({
//             name: wallet.name,
//             balance: wallet.balance,
//             description: wallet.description || ''
//         });
//         setIsModalOpen(true);
//     };

//     // Membuka modal Top Up / Transaksi
//     const openTxModal = (wallet) => {
//         setSelectedWallet(wallet);
//         setActiveTab('transaksi');
//         setTxFormData({
//             type: 'INCOME',
//             amount: '',
//             date: new Date().toISOString().split('T')[0],
//             notes: ''
//         });
//         setIsTxModalOpen(true);
//         fetchWalletHistory(wallet.id);
//     };

//     // Menangani aksi Submit Form (Create & Update)
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const payload = {
//                 name: formData.name,
//                 balance: Number(formData.balance),
//                 description: formData.description
//             };

//             if (modalMode === 'create') {
//                 await api.post('/wallets', payload);
//             } else {
//                 await api.put(`/wallets/${selectedId}`, payload);
//             }

//             setIsModalOpen(false);
//             fetchWallets(); // Refresh data terbaru
//         } catch (err) {
//             console.error("Error saving wallet:", err);
//             alert(err.response?.data?.message || "Gagal menyimpan data dompet.");
//         }
//     };

//     // Menangani aksi Submit Transaksi (Pemasukan / Pengeluaran)
//     const handleTxSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const payload = {
//                 type: txFormData.type,
//                 amount: Number(txFormData.amount),
//                 date: txFormData.date,
//                 notes: txFormData.notes,
//                 wallet_id: selectedWallet.id
//             };

//             // Sesuaikan endpoint backend untuk mencatat transaksi/mutasi wallet Anda
//             await api.post(`/wallets/${selectedWallet.id}/transactions`, payload);

//             setIsTxModalOpen(false);
//             fetchWallets(); // Refresh saldo wallet di tabel utama
//         } catch (err) {
//             console.error("Error saving transaction:", err);
//             alert(err.response?.data?.message || "Gagal menyimpan transaksi.");
//         }
//     };

//     // Menangani aksi Hapus Data
//     const handleDelete = async (id, name) => {
//         if (window.confirm(`Apakah Anda yakin ingin menghapus dompet "${name}"?`)) {
//             try {
//                 await api.delete(`/wallets/${id}`);
//                 fetchWallets();
//             } catch (err) {
//                 console.error("Error deleting wallet:", err);
//                 alert(err.response?.data?.message || "Gagal menghapus dompet.");
//             }
//         }
//     };

//     if (loading) {
//         return (
//             <div className="h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
//                 <Loader2 size={32} className="animate-spin text-blue-600" />
//                 <span className="font-semibold text-sm">Menyelaraskan data wallet...</span>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             {/* HEADER SECTION */}
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
//                 <div>
//                     <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
//                         <Wallet size={22} className="text-blue-600" />
//                         Wallet Management
//                     </h1>
//                     <p className="text-slate-400 text-xs mt-0.5">Kelola akun keuangan, kas fisik laci, dan saldo kasir toko Anda.</p>
//                 </div>

//                 <button
//                     onClick={openCreateModal}
//                     className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer"
//                 >
//                     <Plus size={16} />
//                     Tambah Wallet
//                 </button>
//             </div>

//             {/* ERROR ALERTS */}
//             {error && (
//                 <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl font-semibold text-center">
//                     {error}
//                 </div>
//             )}

//             {/* LIST WALLET TABLE */}
//             <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left text-sm">
//                         <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
//                             <tr>
//                                 <th className="p-4 pl-6 font-semibold">Nama Wallet</th>
//                                 <th className="p-4 font-semibold">Deskripsi</th>
//                                 <th className="p-4 font-semibold text-right">Saldo (Balance)</th>
//                                 <th className="p-4 pr-6 font-semibold text-center w-36">Aksi</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
//                             {wallets.length > 0 ? (
//                                 wallets.map((wallet) => (
//                                     <tr key={wallet.id} className="hover:bg-slate-50/40 transition-all">
//                                         <td className="p-4 pl-6 font-bold text-slate-800">{wallet.name}</td>
//                                         <td className="p-4 text-slate-500 max-w-xs truncate">{wallet.description || '-'}</td>
//                                         <td className="p-4 text-right font-black text-slate-900">
//                                             Rp {Number(wallet.balance).toLocaleString('id-ID')}
//                                         </td>
//                                         <td className="p-4 pr-6 text-center">
//                                             <div className="flex justify-center items-center gap-1">
//                                                 {/* ICON TOP UP / ADJUSTMENT */}
//                                                 <button
//                                                     onClick={() => openTxModal(wallet)}
//                                                     className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
//                                                     title="Top Up / Mutasi Saldo"
//                                                 >
//                                                     <ArrowUpCircle size={16} />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => openEditModal(wallet)}
//                                                     className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
//                                                     title="Ubah Wallet"
//                                                 >
//                                                     <Pencil size={15} />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleDelete(wallet.id, wallet.name)}
//                                                     className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
//                                                     title="Hapus Wallet"
//                                                 >
//                                                     <Trash2 size={15} />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td colSpan="4" className="p-8 text-center text-slate-400 font-semibold">
//                                         Belum ada data wallet yang terdaftar.
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* POPUP MODAL (CREATE & EDIT) */}
//             {isModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//                     <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 relative transform scale-100 transition-all animate-in zoom-in-95 duration-200">
//                         <div className="flex justify-between items-center mb-6">
//                             <h2 className="text-base font-extrabold text-slate-800 tracking-tight">
//                                 {modalMode === 'create' ? 'Tambah Wallet Baru' : 'Perbarui Data Wallet'}
//                             </h2>
//                             <button
//                                 onClick={() => setIsModalOpen(false)}
//                                 className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
//                             >
//                                 <X size={18} />
//                             </button>
//                         </div>

//                         <form onSubmit={handleSubmit} className="space-y-4">
//                             <div className="flex flex-col gap-1.5">
//                                 <label className="text-xs font-bold text-slate-600 ml-1">Nama Wallet *</label>
//                                 <input
//                                     type="text"
//                                     required
//                                     placeholder="Contoh: Kasir Utama (Cash)"
//                                     value={formData.name}
//                                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                                     className="rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
//                                 />
//                             </div>

//                             <div className="flex flex-col gap-1.5">
//                                 <label className="text-xs font-bold text-slate-600 ml-1">Saldo Awal (Balance) *</label>
//                                 <input
//                                     type="number"
//                                     required
//                                     min="0"
//                                     placeholder="Contoh: 500000"
//                                     value={formData.balance}
//                                     onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
//                                     className="rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
//                                 />
//                             </div>

//                             <div className="flex flex-col gap-1.5">
//                                 <label className="text-xs font-bold text-slate-600 ml-1">Deskripsi / Catatan</label>
//                                 <textarea
//                                     rows="3"
//                                     placeholder="Uang tunai fisik siap pakai di laci kasir toko..."
//                                     value={formData.description}
//                                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                                     className="rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
//                                 />
//                             </div>

//                             <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
//                                 <button
//                                     type="button"
//                                     onClick={() => setIsModalOpen(false)}
//                                     className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition"
//                                 >
//                                     Batal
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
//                                 >
//                                     Simpan Data
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* MODAL TRANSACTION & HISTORY (2 TABS) */}
//             {isTxModalOpen && selectedWallet && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//                     <div className="bg-white w-full max-w-xl rounded-3xl p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] relative transform scale-100 transition-all duration-200">

//                         {/* Modal Header */}
//                         <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-5">
//                             <div>
//                                 <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
//                                     <Wallet size={22} className="text-emerald-600" />
//                                     Mutasi Saldo: {selectedWallet.name}
//                                 </h2>
//                                 <p className="text-sm text-slate-400 mt-1">
//                                     Saldo Saat Ini: <span className="font-bold text-slate-700">Rp {Number(selectedWallet.balance).toLocaleString('id-ID')}</span>
//                                 </p>
//                             </div>
//                             <button
//                                 onClick={() => setIsTxModalOpen(false)}
//                                 className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
//                             >
//                                 <X size={22} />
//                             </button>
//                         </div>

//                         {/* Navigation Tabs */}
//                         <div className="flex border-b border-slate-100 gap-4 mb-5">
//                             <button
//                                 type="button"
//                                 onClick={() => setActiveTab('transaksi')}
//                                 className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold transition border-b-2 cursor-pointer ${activeTab === 'transaksi'
//                                     ? 'border-blue-600 text-blue-600'
//                                     : 'border-transparent text-slate-400 hover:text-slate-600'
//                                     }`}
//                             >
//                                 <Plus size={16} />
//                                 Transaksi
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={() => setActiveTab('history')}
//                                 className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold transition border-b-2 cursor-pointer ${activeTab === 'history'
//                                     ? 'border-blue-600 text-blue-600'
//                                     : 'border-transparent text-slate-400 hover:text-slate-600'
//                                     }`}
//                             >
//                                 <History size={16} />
//                                 History
//                             </button>
//                         </div>

//                         {/* Scrollable Content */}
//                         <div className="flex-1 overflow-y-auto pr-1">
//                             {activeTab === 'transaksi' ? (
//                                 <form onSubmit={handleTxSubmit} className="space-y-5">
//                                     {/* Tipe Transaksi */}
//                                     <div className="flex flex-col gap-2">
//                                         <label className="text-sm font-bold text-slate-600 ml-1">Tipe Transaksi *</label>
//                                         <div className="grid grid-cols-2 gap-4">
//                                             <button
//                                                 type="button"
//                                                 onClick={() => setTxFormData({ ...txFormData, type: 'INCOME' })}
//                                                 className={`p-3.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${txFormData.type === 'INCOME'
//                                                     ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
//                                                     : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
//                                                     }`}
//                                             >
//                                                 <ArrowDownLeft size={16} /> Pemasukan
//                                             </button>
//                                             <button
//                                                 type="button"
//                                                 onClick={() => setTxFormData({ ...txFormData, type: 'EXPENSE' })}
//                                                 className={`p-3.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${txFormData.type === 'EXPENSE'
//                                                     ? 'bg-rose-50 border-rose-500 text-rose-700'
//                                                     : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
//                                                     }`}
//                                             >
//                                                 <ArrowUpRight size={16} /> Pengeluaran
//                                             </button>
//                                         </div>
//                                     </div>

//                                     {/* Nominal */}
//                                     <div className="flex flex-col gap-2">
//                                         <label className="text-sm font-bold text-slate-600 ml-1">Nominal *</label>
//                                         <input
//                                             type="number"
//                                             required
//                                             min="1"
//                                             placeholder="Contoh: 50000"
//                                             value={txFormData.amount}
//                                             onChange={(e) => setTxFormData({ ...txFormData, amount: e.target.value })}
//                                             className="rounded-xl border border-slate-300 p-3.5 text-base text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
//                                         />
//                                     </div>

//                                     {/* Tanggal */}
//                                     <div className="flex flex-col gap-2">
//                                         <label className="text-sm font-bold text-slate-600 ml-1">Tanggal *</label>
//                                         <input
//                                             type="date"
//                                             required
//                                             value={txFormData.date}
//                                             onChange={(e) => setTxFormData({ ...txFormData, date: e.target.value })}
//                                             className="rounded-xl border border-slate-300 p-3.5 text-base text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
//                                         />
//                                     </div>

//                                     {/* Note */}
//                                     <div className="flex flex-col gap-2">
//                                         <label className="text-sm font-bold text-slate-600 ml-1">Note / Catatan</label>
//                                         <textarea
//                                             rows="2"
//                                             placeholder="Catatan transaksi..."
//                                             value={txFormData.notes}
//                                             onChange={(e) => setTxFormData({ ...txFormData, notes: e.target.value })}
//                                             className="rounded-xl border border-slate-300 p-3.5 text-base text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
//                                         />
//                                     </div>

//                                     {/* Tombol Aksi */}
//                                     <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
//                                         <button
//                                             type="button"
//                                             onClick={() => setIsTxModalOpen(false)}
//                                             className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition cursor-pointer"
//                                         >
//                                             Batal
//                                         </button>
//                                         <button
//                                             type="submit"
//                                             className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer"
//                                         >
//                                             Simpan Transaksi
//                                         </button>
//                                     </div>
//                                 </form>
//                             ) : (
//                                 /* List Riwayat Transaksi */
//                                 <div className="space-y-3">
//                                     {loadingHistory ? (
//                                         <div className="flex justify-center items-center py-12 text-slate-400 gap-2">
//                                             <Loader2 size={20} className="animate-spin text-blue-600" />
//                                             <span className="text-sm">Memuat data transaksi...</span>
//                                         </div>
//                                     ) : txHistory.length > 0 ? (
//                                         txHistory.map((item, index) => (
//                                             <div key={index} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm">
//                                                 <div className="flex items-center gap-3">
//                                                     {item.type === 'INCOME' ? (
//                                                         <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
//                                                             <ArrowDownLeft size={16} />
//                                                         </div>
//                                                     ) : (
//                                                         <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
//                                                             <ArrowUpRight size={16} />
//                                                         </div>
//                                                     )}
//                                                     <div>
//                                                         <p className="font-bold text-slate-800">{item.notes || (item.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran')}</p>
//                                                         <p className="text-xs text-slate-400 mt-0.5">
//                                                             {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                                 <span className={`font-black tracking-wide text-base ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
//                                                     {item.type === 'INCOME' ? '+' : '-'} Rp {Number(item.amount).toLocaleString('id-ID')}
//                                                 </span>
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <div className="text-center py-12 text-slate-400 font-semibold text-sm">
//                                             Belum ada riwayat transaksi pada wallet ini.
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }
import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance'; // Sesuaikan dengan path instance axios kamu
import { Loader2, Plus, Pencil, Trash2, Wallet, X, ArrowUpCircle, History, ArrowDownCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function WalletPage() {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State untuk Modal (Create & Update)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        balance: '',
        description: ''
    });

    // ─── STATE BARU UNTUK FITUR TOP UP / MUTASI & HISTORY ───
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('transaksi'); // 'transaksi' | 'history'
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [txHistory, setTxHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [txFormData, setTxFormData] = useState({
        type: 'INCOME', // 'INCOME' = pemasukan, 'EXPENSE' = pengeluaran
        amount: '',
        date: new Date().toISOString().split('T')[0], // Default tanggal hari ini
        notes: ''
    });

    // Fetch data saat halaman pertama dimuat
    useEffect(() => {
        fetchWallets();
    }, []);

    const fetchWallets = async () => {
        try {
            setLoading(true);
            const response = await api.get('/wallets');
            // Menangani jika response langsung array atau dibungkus dalam properti data
            const resultData = response.data.data || response.data;
            setWallets(Array.isArray(resultData) ? resultData : []);
        } catch (err) {
            console.error("Error fetching wallets:", err);
            setError("Gagal memuat daftar dompet.");
        } finally {
            setLoading(false);
        }
    };

    // BARU: Menghitung Akumulasi Total Saldo dari seluruh wallet
    const totalBalance = wallets.reduce((acc, wallet) => acc + Number(wallet.balance || 0), 0);

    // Fetch history transaksi untuk wallet tertentu
    const fetchWalletHistory = async (walletId) => {
        try {
            setLoadingHistory(true);
            // Sesuaikan endpoint ini dengan struktur API backend Anda
            const response = await api.get(`/wallets/${walletId}/transactions`);
            const resultData = response.data.data || response.data;
            setTxHistory(Array.isArray(resultData) ? resultData : []);
        } catch (err) {
            console.error("Error fetching wallet history:", err);
            setTxHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Membuka modal untuk Tambah Data
    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', balance: '', description: '' });
        setIsModalOpen(true);
    };

    // Membuka modal untuk Edit Data
    const openEditModal = (wallet) => {
        setModalMode('edit');
        setSelectedId(wallet.id);
        setFormData({
            name: wallet.name,
            balance: wallet.balance,
            description: wallet.description || ''
        });
        setIsModalOpen(true);
    };

    // Membuka modal Top Up / Transaksi
    const openTxModal = (wallet) => {
        setSelectedWallet(wallet);
        setActiveTab('transaksi');
        setTxFormData({
            type: 'INCOME',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            notes: ''
        });
        setIsTxModalOpen(true);
        fetchWalletHistory(wallet.id);
    };

    // Menangani aksi Submit Form (Create & Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                balance: Number(formData.balance),
                description: formData.description
            };

            if (modalMode === 'create') {
                await api.post('/wallets', payload);
            } else {
                await api.put(`/wallets/${selectedId}`, payload);
            }

            setIsModalOpen(false);
            fetchWallets(); // Refresh data terbaru
        } catch (err) {
            console.error("Error saving wallet:", err);
            alert(err.response?.data?.message || "Gagal menyimpan data dompet.");
        }
    };

    // Menangani aksi Submit Transaksi (Pemasukan / Pengeluaran)
    const handleTxSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                type: txFormData.type,
                amount: Number(txFormData.amount),
                date: txFormData.date,
                notes: txFormData.notes,
                wallet_id: selectedWallet.id
            };

            // Sesuaikan endpoint backend untuk mencatat transaksi/mutasi wallet Anda
            await api.post(`/wallets/${selectedWallet.id}/transactions`, payload);

            setIsTxModalOpen(false);
            fetchWallets(); // Refresh saldo wallet di tabel utama
        } catch (err) {
            console.error("Error saving transaction:", err);
            alert(err.response?.data?.message || "Gagal menyimpan transaksi.");
        }
    };

    // Menangani aksi Hapus Data
    const handleDelete = async (id, name) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus dompet "${name}"?`)) {
            try {
                await api.delete(`/wallets/${id}`);
                fetchWallets();
            } catch (err) {
                console.error("Error deleting wallet:", err);
                alert(err.response?.data?.message || "Gagal menghapus dompet.");
            }
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <span className="font-semibold text-sm">Menyelaraskan data wallet...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* HEADER SECTION */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <Wallet size={22} className="text-blue-600" />
                        Wallet Management
                    </h1>
                    <p className="text-slate-400 text-xs mt-0.5">Kelola akun keuangan, kas fisik laci, dan saldo kasir toko Anda.</p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                >
                    <Plus size={16} />
                    Tambah Wallet
                </button>
            </div>

            {/* BARU: TOTAL BALANCE STATISTIC CARD */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-md border border-blue-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Total Combined Balance</p>
                    <h2 className="text-3xl font-black tracking-tight mt-1">
                        Rp {totalBalance.toLocaleString('id-ID')}
                    </h2>
                </div>
                <div className="text-xs font-semibold text-blue-100 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    Aktif Terdata: <span className="font-black text-white">{wallets.length} Akun Wallet</span>
                </div>
            </div>

            {/* ERROR ALERTS */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl font-semibold text-center">
                    {error}
                </div>
            )}

            {/* LIST WALLET TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
                            <tr>
                                <th className="p-4 pl-6 font-semibold">Nama Wallet</th>
                                <th className="p-4 font-semibold">Deskripsi</th>
                                <th className="p-4 font-semibold text-right">Saldo (Balance)</th>
                                <th className="p-4 pr-6 font-semibold text-center w-36">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {wallets.length > 0 ? (
                                wallets.map((wallet) => (
                                    <tr key={wallet.id} className="hover:bg-slate-50/40 transition-all">
                                        <td className="p-4 pl-6 font-bold text-slate-800">{wallet.name}</td>
                                        <td className="p-4 text-slate-500 max-w-xs truncate">{wallet.description || '-'}</td>
                                        <td className="p-4 text-right font-black text-slate-900">
                                            Rp {Number(wallet.balance).toLocaleString('id-ID')}
                                        </td>
                                        <td className="p-4 pr-6 text-center">
                                            <div className="flex justify-center items-center gap-1">
                                                {/* ICON TOP UP / ADJUSTMENT */}
                                                <button
                                                    onClick={() => openTxModal(wallet)}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                                    title="Top Up / Mutasi Saldo"
                                                >
                                                    <ArrowUpCircle size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(wallet)}
                                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Ubah Wallet"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(wallet.id, wallet.name)}
                                                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                    title="Hapus Wallet"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400 font-semibold">
                                        Belum ada data wallet yang terdaftar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* POPUP MODAL (CREATE & EDIT) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 relative transform scale-100 transition-all animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-base font-extrabold text-slate-800 tracking-tight">
                                {modalMode === 'create' ? 'Tambah Wallet Baru' : 'Perbarui Data Wallet'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Nama Wallet *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Kasir Utama (Cash)"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Saldo Awal (Balance) *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    placeholder="Contoh: 500000"
                                    value={formData.balance}
                                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                                    className="rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Deskripsi / Catatan</label>
                                <textarea
                                    rows="3"
                                    placeholder="Uang tunai fisik siap pakai di laci kasir toko..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                                >
                                    Simpan Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL TRANSACTION & HISTORY (2 TABS) */}
            {isTxModalOpen && selectedWallet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-xl rounded-3xl p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] relative transform scale-100 transition-all duration-200">

                        {/* Modal Header */}
                        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-5">
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                                    <Wallet size={22} className="text-emerald-600" />
                                    Mutasi Saldo: {selectedWallet.name}
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    Saldo Saat Ini: <span className="font-bold text-slate-700">Rp {Number(selectedWallet.balance).toLocaleString('id-ID')}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setIsTxModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex border-b border-slate-100 gap-4 mb-5">
                            <button
                                type="button"
                                onClick={() => setActiveTab('transaksi')}
                                className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold transition border-b-2 cursor-pointer ${activeTab === 'transaksi'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Plus size={16} />
                                Transaksi
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('history')}
                                className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold transition border-b-2 cursor-pointer ${activeTab === 'history'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <History size={16} />
                                History
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto pr-1">
                            {activeTab === 'transaksi' ? (
                                <form onSubmit={handleTxSubmit} className="space-y-5">
                                    {/* Tipe Transaksi */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-slate-600 ml-1">Tipe Transaksi *</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setTxFormData({ ...txFormData, type: 'INCOME' })}
                                                className={`p-3.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${txFormData.type === 'INCOME'
                                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <ArrowDownLeft size={16} /> Pemasukan
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTxFormData({ ...txFormData, type: 'EXPENSE' })}
                                                className={`p-3.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${txFormData.type === 'EXPENSE'
                                                    ? 'bg-rose-50 border-rose-500 text-rose-700'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <ArrowUpRight size={16} /> Pengeluaran
                                            </button>
                                        </div>
                                    </div>

                                    {/* Nominal */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-slate-600 ml-1">Nominal *</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            placeholder="Contoh: 50000"
                                            value={txFormData.amount}
                                            onChange={(e) => setTxFormData({ ...txFormData, amount: e.target.value })}
                                            className="rounded-xl border border-slate-300 p-3.5 text-base text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    {/* Tanggal */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-slate-600 ml-1">Tanggal *</label>
                                        <input
                                            type="date"
                                            required
                                            value={txFormData.date}
                                            onChange={(e) => setTxFormData({ ...txFormData, date: e.target.value })}
                                            className="rounded-xl border border-slate-300 p-3.5 text-base text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    {/* Note */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-slate-600 ml-1">Note / Catatan</label>
                                        <textarea
                                            rows="2"
                                            placeholder="Catatan transaksi..."
                                            value={txFormData.notes}
                                            onChange={(e) => setTxFormData({ ...txFormData, notes: e.target.value })}
                                            className="rounded-xl border border-slate-300 p-3.5 text-base text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                                        />
                                    </div>

                                    {/* Tombol Aksi */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setIsTxModalOpen(false)}
                                            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition cursor-pointer"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer"
                                        >
                                            Simpan Transaksi
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* List Riwayat Transaksi */
                                <div className="space-y-3">
                                    {loadingHistory ? (
                                        <div className="flex justify-center items-center py-12 text-slate-400 gap-2">
                                            <Loader2 size={20} className="animate-spin text-blue-600" />
                                            <span className="text-sm">Memuat data transaksi...</span>
                                        </div>
                                    ) : txHistory.length > 0 ? (
                                        txHistory.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm">
                                                <div className="flex items-center gap-3">
                                                    {item.type === 'INCOME' ? (
                                                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                                                            <ArrowDownLeft size={16} />
                                                        </div>
                                                    ) : (
                                                        <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                                                            <ArrowUpRight size={16} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-slate-800">{item.notes || (item.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran')}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`font-black tracking-wide text-base ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {item.type === 'INCOME' ? '+' : '-'} Rp {Number(item.amount).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                                            Belum ada riwayat transaksi pada wallet ini.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}