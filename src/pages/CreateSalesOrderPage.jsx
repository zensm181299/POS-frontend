import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { ShoppingCart, ArrowLeft, Loader2, Search, Plus, Minus, CreditCard, Wallet } from 'lucide-react';

function CreateSalesOrderPage() {
    const navigate = useNavigate();

    // State Produk Kasir & Loading
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchProd, setSearchProd] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [submitting, setSubmitting] = useState(false);
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

    // Tambahan State untuk Fitur Opsi Wallet
    const [wallets, setWallets] = useState([]);
    const [selectedWalletId, setSelectedWalletId] = useState('');

    // State Keranjang Belanja (Cart)
    const [cart, setCart] = useState([]);

    // Fetch Produk aktif (GET /api/products)
    const fetchProductsForCashier = useCallback(async (search = '') => {
        setLoading(true);
        try {
            const response = await api.get('/products', { params: { perPage: 100, search } });
            if (response.data.status === 'success') {
                const activeProds = response.data.data.filter(p => p.status === 'active');
                setProducts(activeProds);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch Daftar Wallet aktif untuk Opsi Pembayaran Kasir
    const fetchWalletsForCashier = useCallback(async () => {
        try {
            const response = await api.get('/wallet');
            const resultData = response.data.data || response.data;
            setWallets(Array.isArray(resultData) ? resultData : []);
        } catch (err) {
            console.error("Gagal memuat data opsi wallet:", err);
        }
    }, []);

    useEffect(() => {
        fetchProductsForCashier();
        fetchWalletsForCashier();
    }, [fetchProductsForCashier, fetchWalletsForCashier]);

    // Handler Cari Produk
    const handleSearchProduct = (e) => {
        e.preventDefault();
        fetchProductsForCashier(searchProd);
    };

    const addToCart = (product) => {
        // VALIDASI STOK AWAL: Jika butuh stok fisik dan stok di database kosong/0
        if (product.is_need_stock && product.stock < 1) {
            alert(`Stok produk "${product.name}" sudah habis!`);
            return;
        }

        // Selalu masukkan produk sebagai baris baru dengan identifier unik 'cart_item_id'
        setCart([...cart, {
            cart_item_id: `${product.id}-${Date.now()}`, 
            product_id: product.id,
            product_name_snapshot: product.name,
            quantity: 1,
            actual_cost_price: product.cost_price || 0,
            actual_selling_price: product.price,
            is_need_stock: product.is_need_stock,
            maxStock: product.stock 
        }]);
    };

    const updateQty = (cartItemId, amount) => {
        const target = cart.find(item => item.cart_item_id === cartItemId);
        if (!target) return;

        const nextQty = target.quantity + amount;

        if (nextQty <= 0) {
            setCart(cart.filter(item => item.cart_item_id !== cartItemId));
        } else {
            if (amount > 0 && target.is_need_stock && nextQty > target.maxStock) {
                alert('Jumlah kuantitas melebihi batas stok fisik yang tersedia!');
                return;
            }

            setCart(cart.map(item =>
                item.cart_item_id === cartItemId
                    ? { ...item, quantity: nextQty }
                    : item
            ));
        }
    };

    const handlePriceChange = (cartItemId, field, value) => {
        setCart(cart.map(item => {
            if (item.cart_item_id === cartItemId) {
                return {
                    ...item,
                    [field]: value === '' ? 0 : Number(value)
                };
            }
            return item;
        }));
    };

    // Kalkulasi Total Omset berdasarkan actual_selling_price yang dinamis
    const totalOmset = cart.reduce((sum, item) => sum + (item.quantity * item.actual_selling_price), 0);

    // Submit Simpan Transaksi Ke Backend (POST /api/sales-order)
    const handleSubmitCheckout = async () => {
        if (cart.length === 0) {
            alert('Keranjang belanja masih kosong!');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                payment_method: paymentMethod,
                transaction_date: transactionDate,
                items: cart.map(item => ({
                    product_id: item.product_id,
                    product_name_snapshot: item.product_name_snapshot,
                    quantity: item.quantity,
                    actual_cost_price: item.actual_cost_price,
                    actual_selling_price: item.actual_selling_price
                }))
            };

            // Kondisional: Hanya kirim wallet_id jika user memilih salah satu wallet di dropdown
            if (selectedWalletId !== '') {
                payload.wallet_id = selectedWalletId;
            }

            const response = await api.post('/sales-order', payload);
            if (response.data.status === 'success') {
                alert('Transaksi Berhasil Disimpan!');
                navigate('/admin/sales-order');
            }
        } catch (err) {
            console.error(err);
            alert('Gagal memproses checkout penjualan.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-120px)] overflow-hidden">

            {/* SEKTOR KIRI: ETALASE PILIHAN PRODUK */}
            <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-200 flex flex-col min-h-0">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => navigate('/admin/sales-order')} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-800">Add sales transaction</h1>
                        <p className="text-slate-400 text-xs">Select product items to add to the checkout cart.</p>
                    </div>
                </div>

                {/* Pencarian Item */}
                <form onSubmit={handleSearchProduct} className="mb-4 relative">
                    <input
                        type="text"
                        placeholder="Enter the product name..."
                        value={searchProd}
                        onChange={(e) => setSearchProd(e.target.value)}
                        className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button type="submit" className="absolute right-2 top-2 p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition">
                        <Search size={14} />
                    </button>
                </form>

                {/* Grid List Produk */}
                <div className="flex-1 overflow-y-auto pr-1">
                    {loading ? (
                        <div className="h-full flex items-center justify-center gap-2 text-slate-400"><Loader2 size={20} className="animate-spin text-blue-600" /> Load product...</div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {products.map(prod => (
                                <div
                                    key={prod.id}
                                    onClick={() => addToCart(prod)}
                                    className="p-4 border border-slate-200 hover:border-blue-500 rounded-2xl cursor-pointer hover:bg-blue-50/10 transition group text-left"
                                >
                                    <p className="font-bold text-slate-800 group-hover:text-blue-600 transition truncate">{prod.name}</p>
                                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">{prod.category?.name || 'Item'}</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="font-extrabold text-slate-900 text-sm">Rp {prod.price.toLocaleString('id-ID')}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${prod.stock <= 3 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>Stok: {prod.stock}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 font-semibold">No active products.</div>
                    )}
                </div>
            </div>

            {/* SEKTOR KANAN: PANEL STRUK & CHECKOUT */}
            <div className="w-full xl:w-[450px] bg-slate-900 text-white p-6 rounded-3xl flex flex-col min-h-0 shadow-xl">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-4">
                    <ShoppingCart size={18} className="text-blue-400" />
                    <h2 className="text-base font-bold tracking-tight">Shopping Cart ({cart.length})</h2>
                </div>

                {/* List di dalam Keranjang + Input Dinamis */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
                    {cart.length > 0 ? (
                        cart.map(item => (
                            <div key={item.cart_item_id} className="bg-slate-800/60 p-4 rounded-2xl space-y-3 border border-slate-800">

                                {/* Info Baris Atas */}
                                <div className="flex items-start justify-between gap-2 text-sm">
                                    <div className="min-w-0">
                                        <p className="font-bold truncate text-slate-200">{item.product_name_snapshot}</p>
                                        <p className="text-xs text-slate-400">Subtotal: <span className="text-emerald-400 font-bold">Rp {(item.quantity * item.actual_selling_price).toLocaleString('id-ID')}</span></p>
                                    </div>
                                    {/* Pengatur Qty */}
                                    <div className="flex items-center gap-2 bg-slate-700/50 p-1 rounded-lg">
                                        <button onClick={() => updateQty(item.cart_item_id, -1)} className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded-md flex items-center justify-center cursor-pointer text-xs font-bold">
                                            <Minus size={12} />
                                        </button>
                                        <span className="font-bold w-4 text-center text-xs">{item.quantity}</span>
                                        <button onClick={() => updateQty(item.cart_item_id, 1)} className="w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded-md flex items-center justify-center cursor-pointer text-xs font-bold">
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </div>

                                {/* Form Input Dinamis Harga Modal & Harga Jual */}
                                <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-2.5">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Capital Price (HPP)</label>
                                        <input
                                            type="number"
                                            value={item.actual_cost_price}
                                            onChange={(e) => handlePriceChange(item.cart_item_id, 'actual_cost_price', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-orange-400 focus:outline-none focus:border-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Sell Price (Riil)</label>
                                        <input
                                            type="number"
                                            value={item.actual_selling_price}
                                            onChange={(e) => handlePriceChange(item.cart_item_id, 'actual_selling_price', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm font-semibold py-12">Cart is empty</div>
                    )}
                </div>

                {/* Konfigurasi Pembayaran, Tanggal, Wallet & Submit */}
                <div className="border-t border-slate-800 pt-4 mt-4 space-y-4">

                    {/* INPUT TRANSACTION DATE */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Transaction Date</label>
                        <input
                            type="date"
                            value={transactionDate}
                            onChange={(e) => setTransactionDate(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                            required
                        />
                    </div>

                    {/* METODE PEMBAYARAN */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Payment Method</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['CASH', 'TRANSFER'].map(method => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setPaymentMethod(method)}
                                    className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border transition ${paymentMethod === method
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    <CreditCard size={14} />
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PILIHAN WALLET (OPSIONAL) */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                            <Wallet size={12} className="text-blue-400" />
                            Select Fund Flow / Wallet <span className="text-[10px] text-slate-500 font-normal lowercase">(opsional)</span>
                        </label>
                        <select
                            value={selectedWalletId}
                            onChange={(e) => setSelectedWalletId(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="">-- Without Connecting a Wallet (Opsional) --</option>
                            {wallets.map(w => (
                                <option key={w.id} value={w.id}>
                                    {w.name} (Sisa Saldo: Rp {Number(w.balance).toLocaleString('id-ID')})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl font-bold">
                        <span className="text-slate-400 text-xs">TOTAL SPENDING</span>
                        <span className="text-lg text-emerald-400">Rp {totalOmset.toLocaleString('id-ID')}</span>
                    </div>

                    <button
                        onClick={handleSubmitCheckout}
                        disabled={submitting || cart.length === 0}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-extrabold text-sm py-3.5 rounded-xl tracking-wide disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Processing Transactions...</span>
                            </>
                        ) : (
                            <span>Pay & Save Process</span>
                        )}
                    </button>
                </div>

            </div>

        </div>
    );
}

export default CreateSalesOrderPage;