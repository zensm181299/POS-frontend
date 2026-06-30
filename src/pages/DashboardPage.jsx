import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axiosInstance'; // Sesuaikan dengan path instance axios kamu
import { 
    Loader2, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Briefcase,
    Receipt,
    Calendar
} from 'lucide-react';

export default function DashboardPage() {
    // Helper untuk mendapatkan string tanggal lokal YYYY-MM-DD
    const getLocalYYYYMMDD = (date) => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    // Default state: Hari ini (Start & End Date langsung bernilai sama sejak awal)
    const [startDate, setStartDate] = useState(getLocalYYYYMMDD(new Date()));
    const [endDate, setEndDate] = useState(getLocalYYYYMMDD(new Date()));
    
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Trigger fetch otomatis setiap kali tanggal start_date atau end_date diubah oleh pengguna
    useEffect(() => {
        fetchDashboardData(startDate, endDate);
    }, [startDate, endDate]);

    const fetchDashboardData = async (start, end) => {
        try {
            setLoading(true);
            setError(null);
            // Mengirimkan range tanggal lewat query parameters ke backend
            const response = await api.get(`/dashboard/summary?start_date=${start}&end_date=${end}`);
            if (response.data.status === 'success') {
                setSummaryData(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Gagal memuat data ringkasan dashboard untuk periode ini.");
        } finally {
            setLoading(false);
        }
    };

    // Mengakumulasi total finansial secara dinamis berdasarkan data transaksi yang dikembalikan backend
    const financial = useMemo(() => {
        const transactions = summaryData?.recent_transactions || [];
        
        return transactions.reduce((acc, tx) => {
            return {
                pemasukan: acc.pemasukan + (tx.total_omset || 0),
                pengeluaran: acc.pengeluaran + (tx.total_hpp || 0),
                laba: acc.laba + (tx.total_net_profit || 0)
            };
        }, { pemasukan: 0, pengeluaran: 0, laba: 0 });
    }, [summaryData]);

    const recentTx = summaryData?.recent_transactions || [];

    return (
        <div className="space-y-6">
            
            {/* HEADER & DATE RANGE FILTER CONTAINER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Financial Dashboard</h1>
                    <p className="text-slate-400 text-xs mt-0.5">Pantau real-time performa finansial berdasarkan rentang tanggal.</p>
                </div>
                
                {/* FILTER CONTROLS */}
                <div className="flex items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    {/* Custom Date Range Picker Input */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-700 font-semibold text-xs w-full lg:w-auto justify-between sm:justify-start">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            <input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-700" 
                            />
                        </div>
                        <span className="text-slate-400 px-1 text-center">s/d</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-700" 
                        />
                    </div>
                </div>
            </div>

            {/* STATE LOADING / ERROR */}
            {loading ? (
                <div className="h-[40vh] flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 size={28} className="animate-spin text-blue-600" />
                    <span className="text-xs font-bold">Sinkronisasi data periode...</span>
                </div>
            ) : error ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl font-semibold text-center">
                    {error}
                </div>
            ) : (
                <>
                    {/* GRID SUMMARY CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        
                        {/* CARD 1: PEMASUKAN */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Pemasukan</p>
                                <h3 className="text-2xl font-black text-slate-800">
                                    Rp {financial.pemasukan.toLocaleString('id-ID')}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <ArrowUpRight size={22} />
                            </div>
                        </div>

                        {/* CARD 2: PENGELUARAN */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Pengeluaran (HPP)</p>
                                <h3 className="text-2xl font-black text-slate-800">
                                    Rp {financial.pengeluaran.toLocaleString('id-ID')}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                <ArrowDownLeft size={22} />
                            </div>
                        </div>

                        {/* CARD 3: LABA BERSIH */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-3xl text-white shadow-lg shadow-blue-500/10 relative overflow-hidden flex items-center justify-between">
                            <div className="space-y-1 z-10">
                                <p className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider">Laba Bersih (Net Profit)</p>
                                <h3 className="text-2xl font-black">
                                    Rp {financial.laba.toLocaleString('id-ID')}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center z-10">
                                <Briefcase size={20} />
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                        </div>

                    </div>

                    {/* RECENT TRANSACTIONS TABLE */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                            <Receipt size={18} className="text-blue-600" />
                            <h2 className="text-base font-extrabold text-slate-800 tracking-tight">Transactions In Selected Range</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
                                    <tr>
                                        <th className="p-4 pl-6 font-semibold">Invoice No</th>
                                        <th className="p-4 font-semibold">Tanggal</th>
                                        <th className="p-4 font-semibold">Produk</th>
                                        <th className="p-4 font-semibold text-center">Metode</th>
                                        <th className="p-4 font-semibold text-right">Omset</th>
                                        <th className="p-4 pr-6 font-semibold text-right">Laba Bersih</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                    {recentTx.length > 0 ? (
                                        recentTx.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-slate-50/40 transition-all">
                                                <td className="p-4 pl-6 font-bold text-slate-800">{tx.invoice_number}</td>
                                                <td className="p-4 text-slate-500 whitespace-nowrap">
                                                    {new Date(tx.transaction_date).toLocaleString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="p-4 text-slate-600 max-w-[200px] truncate">
                                                    {tx.details?.map(d => `${d.product_name_snapshot} (x${d.quantity})`).join(', ') || '-'}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border ${
                                                        tx.payment_method === 'CASH' 
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                            : 'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                        {tx.payment_method}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-bold text-slate-800">
                                                    Rp {tx.total_omset.toLocaleString('id-ID')}
                                                </td>
                                                <td className="p-4 pr-6 text-right font-bold text-emerald-600 bg-emerald-50/20">
                                                    Rp {tx.total_net_profit.toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-slate-400 font-semibold">
                                                Tidak ada transaksi ditemukan pada rentang tanggal ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}