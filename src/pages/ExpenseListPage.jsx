import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Plus, Search, RotateCcw, FileSpreadsheet, Loader2, Eye, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

function ExpenseListPage() {
  const navigate = useNavigate();

  // Helper filter tanggal awal-akhir bulan
  const getInitialDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const formatDate = (date) => {
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      return `${date.getFullYear()}-${m}-${d}`;
    };
    return { start: formatDate(firstDay), end: formatDate(lastDay) };
  };

  const initialDates = getInitialDates();

  // State Utama
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({ totalData: 0, totalPages: 1, perPage: 10 });

  // Modal Detail Control
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch API List Pengeluaran
  const fetchExpenses = useCallback(async (page = 1, search = '', start = '', end = '') => {
    setLoading(true);
    setError('');
    try {
      const params = { page, perPage: 10, search };
      if (start && end) {
        params.expense_date = `${start},${end}`;
      } else if (start) {
        params.expense_date = `${start},${start}`;
      }

      // 🔍 PERBAIKAN 1: Sesuaikan endpoint ke format jamak '/expenses'
      const response = await api.get('/expenses', { params });
      if (response.data.status === 'success') {
        setExpenses(response.data.data);
        setPaginationInfo(response.data.pagination);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil daftar pengeluaran operasional.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses(currentPage, searchQuery, startDate, endDate);
  }, [currentPage, fetchExpenses]);

  // View Detail Row
  const handleOpenDetail = async (id) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      // 🔍 PERBAIKAN 2: Sesuaikan endpoint ke format jamak '/expenses/:id'
      const response = await api.get(`/expenses/${id}`);
      if (response.data.status === 'success') {
        setSelectedExpense(response.data.data);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil rincian data pengeluaran.');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchExpenses(1, searchQuery, startDate, endDate);
  };

  const handleResetSearch = () => {
    const dates = getInitialDates();
    setSearchQuery('');
    setStartDate(dates.start);
    setEndDate(dates.end);
    setCurrentPage(1);
    fetchExpenses(1, '', dates.start, dates.end);
  };

  const formatDateId = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Expense Transactions</h1>
          <p className="text-slate-500 text-sm">Catat pengeluaran operasional toko, pembelian pasokan, serta restock produk gudang.</p>
        </div>
        <button
          onClick={() => navigate('/admin/expense/create')}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-5 py-3 rounded-xl transition shadow-md cursor-pointer text-sm"
        >
          <Plus size={18} />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="flex flex-col xl:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by expense number or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-semibold text-xs w-full xl:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-700 p-1"
            />
            <span className="text-slate-400 px-1">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-700 p-1"
            />
          </div>

          <div className="flex gap-2 w-full xl:w-auto">
            <button type="submit" className="flex-1 xl:flex-none px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl transition cursor-pointer">
              Search
            </button>
            <button type="button" onClick={handleResetSearch} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer">
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </form>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {error && <div className="p-6 bg-red-50 text-red-600 font-semibold text-sm border-b border-red-100">{error}</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
              <tr>
                <th className="p-4 pl-6">Expense Number</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Jenis/Kategori</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4 text-red-600">Total Pengeluaran</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin text-amber-500" />
                      <span>Loading expense transaction history...</span>
                    </div>
                  </td>
                </tr>
              ) : expenses.length > 0 ? (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-2">
                      <FileSpreadsheet size={16} className="text-amber-500" />
                      {exp.expense_number}
                    </td>
                    <td className="p-4 font-bold text-slate-800">{formatDateId(exp.expense_date)}</td>
                    <td className="p-4">
                      <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold uppercase border border-amber-100">
                        {exp.type || 'Umum'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">{exp.notes || '-'}</td>
                    <td className="p-4 font-bold text-red-600">
                      {/* 🔍 PERBAIKAN 3: Perbaiki typo exp.total_expens menjadi exp.total_expense */}
                      Rp {(exp.total_expense || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleOpenDetail(exp.id)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Lihat Rincian Item"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-semibold">
                    Tidak ditemukan riwayat transaksi pengeluaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && expenses.length > 0 && (
          <div className="p-4 px-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-semibold text-slate-600">
            <div>Showing {expenses.length} dari {paginationInfo.totalData} Pengeluaran</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-50 cursor-pointer"><ChevronLeft size={16} /></button>
              <div className="text-xs text-slate-500 px-2">Page <span className="font-bold text-slate-800">{currentPage}</span> from {paginationInfo.totalPages}</div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationInfo.totalPages))} disabled={currentPage === paginationInfo.totalPages} className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-50 cursor-pointer"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* POP-UP MODAL DETAIL VIEW */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-extrabold text-slate-800">Expense Transaction Details</h3>
              <button onClick={() => { setShowDetailModal(false); setSelectedExpense(null); }} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>

            {loadingDetail || !selectedExpense ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin text-amber-500" />
                <span>Loading detail...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs font-semibold text-slate-600">
                  <div>
                    <p className="text-slate-400">EXPENSE NUMBER</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">{selectedExpense.expense_number}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">KATEGORI & SUMBER KAS</p>
                    <p className="text-base font-bold text-amber-600 mt-0.5 uppercase">
                      {selectedExpense.type || 'Umum'} ({selectedExpense.wallet?.name || 'Kas'})
                    </p>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/60 pt-2 flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    <span>Tanggal Transaksi: <strong className="font-bold text-slate-800">{formatDateId(selectedExpense.expense_date)}</strong></span>
                  </div>
                </div>

                {selectedExpense.details && selectedExpense.details.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Daftar Pengadaan Item</h4>
                    <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs font-semibold">
                        <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-400">
                          <tr>
                            <th className="p-3 pl-4">Nama Produk</th>
                            <th className="p-3 text-center">Qty</th>
                            <th className="p-3">Harga Beli</th>
                            <th className="p-3 text-right pr-4">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {selectedExpense.details.map((item, idx) => (
                            <tr key={item.id || idx}>
                              <td className="p-3 pl-4 font-bold text-slate-800">{item.product?.name || 'Produk Kustom'}</td>
                              <td className="p-3 text-center bg-slate-50/40">{item.quantity}</td>
                              <td className="p-3">Rp {(item.cost_price_per_item || 0).toLocaleString('id-ID')}</td>
                              <td className="p-3 text-right pr-4 font-bold text-red-600">Rp {(item.sub_total || 0).toLocaleString('id-ID')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 p-3.5 rounded-xl text-xs font-medium text-slate-600">
                  <span className="text-slate-400 block font-bold mb-1">CATATAN / NOTES</span>
                  {selectedExpense.notes || 'Tidak ada catatan opsional.'}
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-slate-800 text-base font-bold">
                  <span>TOTAL PENGELUARAN</span>
                  {/* 🔍 PERBAIKAN 4: Perbaiki typo di modal detail menjadi total_expense */}
                  <span className="text-red-600 text-lg">Rp {(selectedExpense.total_expense || 0).toLocaleString('id-ID')}</span>
                </div>

                <button
                  onClick={() => { setShowDetailModal(false); setSelectedExpense(null); }}
                  className="w-full py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
                >
                  Tutup Rincian
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseListPage;