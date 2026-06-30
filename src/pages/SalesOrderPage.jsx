import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Plus, Search, RotateCcw, FileText, Printer, ChevronLeft, ChevronRight, Loader2, Eye, Calendar, Trash2 } from 'lucide-react';

function SalesOrderPage() {
  const navigate = useNavigate();

  // State Utama
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pencarian & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({ totalData: 0, totalPages: 1, perPage: 10 });

  // State Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // State Modal Delete Kontrol
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch List Transaksi (GET /api/sales-order)
  const fetchTransactions = useCallback(async (page = 1, search = '', start = '', end = '') => {
    setLoading(true);
    setError('');
    try {
      const params = { page, perPage: 10, search };

      // Jika user memilih rentang tanggal, gabungkan menjadi format "YYYY-MM-DD,YYYY-MM-DD"
      if (start && end) {
        params.transaction_date = `${start},${end}`;
      } else if (start) {
        params.transaction_date = `${start},${start}`; // jika hanya memilih start date saja
      }

      const response = await api.get('/sales-order', { params });
      if (response.data.status === 'success') {
        setTransactions(response.data.data);
        setPaginationInfo(response.data.pagination);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil daftar transaksi sales order.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(currentPage, searchQuery);
  }, [currentPage, fetchTransactions]);

  // Fetch Detail Transaksi (GET /api/sales-order/:id)
  const handleOpenDetail = async (id) => {
    setLoadingDetail(true);
    setShowDetailModal(true);
    try {
      const response = await api.get(`/sales-order/${id}`);
      if (response.data.status === 'success') {
        setSelectedTx(response.data.data);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil rincian detail transaksi.');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Fitur Menangani Aksi Buka Modal Delete
  const openDeleteModal = (tx) => {
    setTxToDelete(tx);
    setShowDeleteModal(true);
  };

  // Eksekusi Hapus Transaksi (DELETE /api/sales-order/:id)
  const handleDeleteTransaction = async () => {
    if (!txToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/sales-order/${txToDelete.id}`);
      setShowDeleteModal(false);
      setTxToDelete(null);

      // Koreksi halaman jika data terakhir di page tersebut habis setelah dihapus
      const isCurrentPageEmpty = transactions.length === 1 && currentPage > 1;
      const targetPage = isCurrentPageEmpty ? currentPage - 1 : currentPage;

      setCurrentPage(targetPage);
      fetchTransactions(targetPage, searchQuery);
    } catch (err) {
      console.error("Error deleting transaction:", err);
      alert('Gagal menghapus data transaksi.');
    } finally {
      setDeleting(false);
    }
  };

  // Fitur Print Struk Terpilih
  const handlePrintReceipt = (txData) => {
    if (!txData) return;

    const printWindow = window.open('', '_blank');
    const dateStr = new Date(txData.createdAt).toLocaleString('id-ID');

    let itemsHtml = '';
    txData.details.forEach(item => {
      itemsHtml += `
        <tr>
          <td style="padding: 4px 0;">${item.product_name_snapshot}<br>${item.quantity}x Rp${item.actual_selling_price.toLocaleString('id-ID')}</td>
          <td style="text-align: right; vertical-align: bottom;">Rp${(item.quantity * item.actual_selling_price).toLocaleString('id-ID')}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
      <head>
        <title>Print Struk - ${txData.invoice_number}</title>
        <style>
          @page { size: 58mm auto; margin: 0; }
          body { font-family: 'Courier New', Courier, monospace; width: 52mm; margin: 5mm; font-size: 11px; color: #000; }
          .text-center { text-align: center; }
          .line { border-top: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
        </style>
      </head>
      <body>
        <div class="text-center">
          <strong style="font-size: 14px;">ZENS CAFE & POS</strong><br>
          Bandung, West Java<br>
          ${dateStr}
        </div>
        <div class="line"></div>
        <div>No: ${txData.invoice_number}</div>
        <div>Metode: ${txData.payment_method}</div>
        <div class="line"></div>
        <table>
          ${itemsHtml}
        </table>
        <div class="line"></div>
        <table>
          <tr style="font-weight: bold;">
            <td>TOTAL</td>
            <td style="text-align: right;">Rp${txData.total_omset.toLocaleString('id-ID')}</td>
          </tr>
        </table>
        <div class="line"></div>
        <div class="text-center" style="margin-top: 15px;">Terima Kasih<br>Selamat Belanja Kembali</div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // Mengirimkan search query beserta parameter tanggal saat submit form
    fetchTransactions(1, searchQuery, startDate, endDate);
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    // Fetch ulang data bersih tanpa filter apapun
    fetchTransactions(1, '', '', '');
  };

  const formatDateId = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    // Mengambil komponen tanggal secara lokal
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    // Mengambil komponen waktu
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Sales Orders</h1>
          <p className="text-slate-500 text-sm">Monitor total sales revenue and net profit, and manage cashier invoices..</p>
        </div>
        <button
          onClick={() => navigate('/admin/sales-order/create')}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-5 py-3 rounded-xl transition shadow-md cursor-pointer text-sm"
        >
          <Plus size={18} />
          <span>Add New Transaction</span>
        </button>
      </div>

      {/* FILTER SEARCH */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="flex flex-col xl:flex-row gap-3">

          {/* Input Invoice Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by invoice number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all font-semibold"
            />
          </div>

          {/* Input Date Range Filter */}
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

          {/* Action Buttons */}
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

      {/* Tambahkan fungsi helper ini di atas atau di luar komponen utama Anda jika memungkinkan */}

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {error && <div className="p-6 bg-red-50 text-red-600 font-semibold text-sm border-b border-red-100">{error}</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
              <tr>
                <th className="p-4 pl-6">Invoice Number</th>
                <th className="p-4">Tanggal Transaksi</th>
                <th className="p-4 text-center">Payment</th>
                <th className="p-4">Total Omset</th>
                <th className="p-4 text-emerald-600">Net Profit</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin text-blue-600" />
                      <span>Loading transaction history...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-2">
                      <FileText size={16} className="text-slate-400" />
                      {tx.invoice_number}
                    </td>
                    {/* MODIFIKASI 1: Mengubah format tanggal tabel ke format Indonesia strip (-) & bold */}
                    <td className="p-4 font-bold text-slate-800">
                      {formatDateId(tx.transaction_date)}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                        {tx.payment_method}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      Rp {tx.total_omset.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 font-bold text-emerald-600">
                      +Rp {tx.total_net_profit.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenDetail(tx.id)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Cek Detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(tx)}
                          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="Print Struk"
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(tx)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Hapus Transaksi"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-semibold">
                    No sales transaction history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && transactions.length > 0 && (
          <div className="p-4 px-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-semibold text-slate-600">
            <div>Showing {transactions.length} dari {paginationInfo.totalData} Invoice</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-50 cursor-pointer"><ChevronLeft size={16} /></button>
              <div className="text-xs text-slate-500 px-2">Page <span className="font-bold text-slate-800">{currentPage}</span> from {paginationInfo.totalPages}</div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationInfo.totalPages))} disabled={currentPage === paginationInfo.totalPages} className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-50 cursor-pointer"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* POP-UP MODAL: CHECK DETAIL */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-extrabold text-slate-800">Sales Transaction Details</h3>
              <button onClick={() => { setShowDetailModal(false); setSelectedTx(null); }} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>

            {loadingDetail || !selectedTx ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin text-blue-600" />
                <span>Loading transaction details...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs font-semibold text-slate-600">
                  <div>
                    <p className="text-slate-400">INVOICE NUMBER</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">{selectedTx.invoice_number}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">PAYMENT METHOD</p>
                    <p className="text-base font-bold text-blue-600 mt-0.5">{selectedTx.payment_method}</p>
                  </div>
                  {/* MODIFIKASI 2: Mengubah format tanggal pop-up modal detail ke format Indonesia strip (-) & bold */}
                  <div className="col-span-2 border-t border-slate-200/60 pt-2 flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    <span>Completed on: <strong className="font-bold text-slate-800">{formatDateId(selectedTx.transaction_date)}</strong></span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">List of Purchased Items</h4>
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-400">
                        <tr>
                          <th className="p-3 pl-4">Product Snapshot</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3">Product</th>
                          <th className="p-3 text-right pr-4">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {selectedTx.details?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-3 pl-4 font-bold text-slate-800">{item.product_name_snapshot}</td>
                            <td className="p-3 text-center bg-slate-50/40">{item.quantity}</td>
                            <td className="p-3">Rp {item.actual_selling_price.toLocaleString('id-ID')}</td>
                            <td className="p-3 text-right pr-4 font-bold">Rp {(item.quantity * item.actual_selling_price).toLocaleString('id-ID')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2 text-sm font-semibold">
                  <div className="flex justify-between text-slate-500">
                    <span>Total Tree Load (HPP)</span>
                    <span>Rp {selectedTx.total_hpp.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-slate-800 text-base font-bold">
                    <span>Total Revenue (Omzet)</span>
                    <span>Rp {selectedTx.total_omset.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 bg-emerald-50 p-3 rounded-xl font-bold mt-2">
                    <span>Net Profit (Net Profit)</span>
                    <span>+ Rp {selectedTx.total_net_profit.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setShowDetailModal(false); setSelectedTx(null); }}
                    className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handlePrintReceipt(selectedTx)}
                    className="flex-1 py-3 text-sm font-bold text-white bg-slate-800 rounded-xl hover:bg-slate-900 flex items-center justify-center gap-2 transition"
                  >
                    <Printer size={16} />
                    <span>Print Struct</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POP-UP MODAL: CONFIRM DELETE TRANSACTION */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 text-left">
            <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">Hapus Invoice?</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus transaksi <span className="font-bold text-slate-800">"{txToDelete?.invoice_number}"</span>? Riwayat omset dan data penjualan ini akan terhapus permanen dari sistem.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setTxToDelete(null); }}
                disabled={deleting}
                className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteTransaction}
                disabled={deleting}
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 transition shadow-md shadow-red-100 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesOrderPage;