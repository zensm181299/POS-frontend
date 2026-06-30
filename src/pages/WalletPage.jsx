import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance'; // Sesuaikan dengan path instance axios kamu
import { Loader2, Plus, Pencil, Trash2, Wallet, X } from 'lucide-react';

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

    // Fetch data saat halaman pertama dimuat
    useEffect(() => {
        fetchWallets();
    }, []);

    const fetchWallets = async () => {
        try {
            setLoading(true);
            const response = await api.get('/wallet');
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
                await api.post('/wallet', payload);
            } else {
                await api.put(`/wallet/${selectedId}`, payload);
            }

            setIsModalOpen(false);
            fetchWallets(); // Refresh data terbaru
        } catch (err) {
            console.error("Error saving wallet:", err);
            alert(err.response?.data?.message || "Gagal menyimpan data dompet.");
        }
    };

    // Menangani aksi Hapus Data
    const handleDelete = async (id, name) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus dompet "${name}"?`)) {
            try {
                await api.delete(`/wallet/${id}`);
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
                                <th className="p-4 pr-6 font-semibold text-center w-28">Aksi</th>
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
                                            <div className="flex justify-center items-center gap-1.5">
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
                        
                        {/* Header Modal */}
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

                        {/* Form Body */}
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

                            {/* Action Buttons */}
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
        </div>
    );
}