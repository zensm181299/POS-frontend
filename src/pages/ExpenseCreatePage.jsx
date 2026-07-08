// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../api/axiosInstance';
// import { ArrowLeft, Save, Plus, Trash, Loader2 } from 'lucide-react';

// function ExpenseCreatePage() {
//   const navigate = useNavigate();
//   const [submitting, setSubmitting] = useState(false);
  
//   // Master data untuk dropdown pilihan input
//   const [products, setProducts] = useState([]);
//   const [wallets, setWallets] = useState([]);

//   // Form State Transaksi Pengeluaran
//   const [type, setType] = useState('RESTOCK');
//   const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
//   const [walletId, setWalletId] = useState('');
//   const [notes, setNotes] = useState('');
  
//   // State Dinamis Array Item Detail
//   const [details, setDetails] = useState([
//     { product_id: '', quantity: 1, cost_price_per_item: 0, sub_total: 0 }
//   ]);

//   // Fetch Wallets dan Products untuk Dropdown Pilihan
//   useEffect(() => {
//     const fetchMasterData = async () => {
//       try {
//         const [resProducts, resWallets] = await Promise.all([
//           api.get('/products'), // Sesuaikan endpoint master data produk Anda
//           api.get('/wallets')   // Sesuaikan endpoint master data wallet akun dana Anda
//         ]);
        
//         if (resProducts.data.status === 'success') setProducts(resProducts.data.data);
//         if (resWallets.data.status === 'success') {
//           setWallets(resWallets.data.data);
//           if (resWallets.data.data.length > 0) setWalletId(resWallets.data.data[0].id);
//         }
//       } catch (err) {
//         console.error('Gagal mengambil master data pendukung dropdown', err);
//       }
//     };
//     fetchMasterData();
//   }, []);

//   // Handler update baris item pengeluaran
//   const handleItemChange = (index, field, value) => {
//     const updatedDetails = [...details];
    
//     if (field === 'product_id') {
//       updatedDetails[index].product_id = value;
//       // Auto-fill harga beli awal jika ada snapshot harga dari data produk backend
//       const selectedProd = products.find(p => p.id === value);
//       if (selectedProd && selectedProd.cost_price) {
//         updatedDetails[index].cost_price_per_item = selectedProd.cost_price;
//       }
//     } else {
//       updatedDetails[index][field] = Number(value) || 0;
//     }

//     // Hitung ulang subtotal per baris item
//     updatedDetails[index].sub_total = updatedDetails[index].quantity * updatedDetails[index].cost_price_per_item;
//     setDetails(updatedDetails);
//   };

//   const handleAddItemRow = () => {
//     setDetails([...details, { product_id: '', quantity: 1, cost_price_per_item: 0, sub_total: 0 }]);
//   };

//   const handleRemoveItemRow = (index) => {
//     if (details.length === 1) return;
//     setDetails(details.filter((_, i) => i !== index));
//   };

//   // Hitung akumulasi total pengeluaran
//   const calculateTotalExpense = () => {
//     return details.reduce((sum, item) => sum + item.sub_total, 0);
//   };

//   // Submit Simpan Data POST /api/expense
//   const handleSubmitExpense = async (e) => {
//     e.preventDefault();
//     if (!walletId) return alert('Please select the payment wallet or cash account first.');
    
//     // Validasi baris item produk kosong
//     const isInvalid = details.some(item => !item.product_id || item.quantity <= 0 || item.cost_price_per_item <= 0);
//     if (isInvalid) return alert('Please correctly enter the product, quantity, and purchase price of the item in the detail line.');

//     setSubmitting(true);
//     try {
//       const payload = {
//         type,
//         expense_date: expenseDate,
//         wallet_id: walletId,
//         notes,
//         total_expense: calculateTotalExpense(),
//         details: details
//       };

//       const response = await api.post('/expense', payload);
//       if (response.data.status === 'success') {
//         alert('The expense transaction was successfully saved!');
//         navigate('/admin/expense');
//       }
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || 'A system error occurred while saving the expense.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-6 mx-auto">
//       {/* HEADER NAVIGASI */}
//       <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
//         <button 
//           onClick={() => navigate('/admin/expense')}
//           className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
//         >
//           <ArrowLeft size={18} />
//         </button>
//         <div>
//           <h2 className="text-lg font-extrabold text-slate-800">Create Operational Expense</h2>
//           <p className="text-xs text-slate-400">Ensure the entered amount matches the physical receipt or invoice for the vendor's goods procuremen.</p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmitExpense} className="space-y-6">
//         {/* FIELD INDUK UTAMA */}
//         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-5">
//           <div>
//             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Withdrawal Category</label>
//             <select
//               value={type}
//               onChange={(e) => setType(e.target.value)}
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-amber-500 focus:outline-none"
//             >
//               <option value="RESTOCK">Restock</option>
//               <option value="OPERATIONAL">Operational</option>
//               <option value="BILL">Bill</option>
//               <option value="OTHER">Other</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Source of funds (Wallet Kas)</label>
//             <select
//               value={walletId}
//               onChange={(e) => setWalletId(e.target.value)}
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-amber-500 focus:outline-none"
//             >
//               {wallets.length === 0 ? <option value="">Loading Wallet...</option> : 
//                 wallets.map(w => <option key={w.id} value={w.id}>{w.name} (Rp {w.balance?.toLocaleString('id-ID') || 0})</option>)
//               }
//             </select>
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expense Date</label>
//             <input
//               type="date"
//               value={expenseDate}
//               onChange={(e) => setExpenseDate(e.target.value)}
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-amber-500 focus:outline-none"
//             />
//           </div>

//           <div className="md:col-span-3">
//             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Additional Notes</label>
//             <textarea
//               rows="2"
//               placeholder="Example: Purchase of 10 kg of Arabica coffee beans from supplier Mr. Jono..."
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:border-amber-500 focus:outline-none"
//             ></textarea>
//           </div>
//         </div>

//         {/* INPUT DINAMIS ITEM DETAIL */}
//         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
//           <div className="flex items-center justify-between border-b border-slate-100 pb-3">
//             <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Breakdown of Item Purchase Components</h3>
//             <button
//               type="button"
//               onClick={handleAddItemRow}
//               className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-xl transition cursor-pointer"
//             >
//               <Plus size={14} /> Add Row Item
//             </button>
//           </div>

//           <div className="space-y-3">
//             {details.map((item, idx) => (
//               <div key={idx} className="flex flex-col md:flex-row items-end md:items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                
//                 {/* Pilih Produk */}
//                 <div className="flex-1 w-full">
//                   <label className="block md:hidden text-[10px] font-bold text-slate-400 mb-1">PRODUK</label>
//                   <select
//                     value={item.product_id}
//                     onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
//                     className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:border-amber-500 focus:outline-none"
//                   >
//                     <option value="">-- Pilih Produk Terkait --</option>
//                     {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
//                   </select>
//                 </div>

//                 {/* Kuantitas */}
//                 <div className="w-full md:w-20">
//                   <label className="block md:hidden text-[10px] font-bold text-slate-400 mb-1">QTY</label>
//                   <input
//                     type="number"
//                     min="1"
//                     placeholder="Qty"
//                     value={item.quantity}
//                     onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
//                     className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-center text-slate-700 focus:border-amber-500 focus:outline-none"
//                   />
//                 </div>

//                 {/* Harga Modal Per Item */}
//                 <div className="w-full md:w-40">
//                   <label className="block md:hidden text-[10px] font-bold text-slate-400 mb-1">HARGA SATUAN (Rp)</label>
//                   <input
//                     type="number"
//                     min="0"
//                     placeholder="Harga Satuan"
//                     value={item.cost_price_per_item || ''}
//                     onChange={(e) => handleItemChange(idx, 'cost_price_per_item', e.target.value)}
//                     className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:border-amber-500 focus:outline-none"
//                   />
//                 </div>

//                 {/* Sub Total */}
//                 <div className="w-full md:w-44 text-right px-2 font-extrabold text-sm text-slate-800">
//                   <label className="block md:hidden text-left text-[10px] font-bold text-slate-400 mb-1">SUBTOTAL</label>
//                   Rp {item.sub_total.toLocaleString('id-ID')}
//                 </div>

//                 {/* Hapus Row */}
//                 <button
//                   type="button"
//                   onClick={() => handleRemoveItemRow(idx)}
//                   disabled={details.length === 1}
//                   className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition disabled:opacity-30 cursor-pointer"
//                 >
//                   <Trash size={16} />
//                 </button>

//               </div>
//             ))}
//           </div>

//           {/* AKUMULASI RINGKASAN HARGA */}
//           <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4">
//             <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Automatic Calculation</span>
//             <div className="text-right flex items-center gap-3">
//               <span className="text-sm font-bold text-slate-600">Grand Total of Expenses:</span>
//               <span className="text-2xl font-black text-red-600">Rp {calculateTotalExpense().toLocaleString('id-ID')}</span>
//             </div>
//           </div>
//         </div>

//         {/* CONTROLLER AKSI SUBMIT */}
//         <div className="flex justify-end gap-3">
//           <button
//             type="button"
//             onClick={() => navigate('/admin/expense')}
//             disabled={submitting}
//             className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-xl transition cursor-pointer disabled:opacity-50"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={submitting}
//             className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-5 py-3 rounded-xl transition shadow-md cursor-pointer text-sm"
//           >
//             {submitting ? (
//               <>
//                 <Loader2 size={16} className="animate-spin" />
//                 <span>Saving...</span>
//               </>
//             ) : (
//               <>
//                 <Save size={16} />
//                 <span>Save Transaction</span>
//               </>
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default ExpenseCreatePage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { ArrowLeft, Save, Plus, Trash, Loader2 } from 'lucide-react';

function ExpenseCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  // Master data untuk dropdown pilihan input
  const [products, setProducts] = useState([]);
  const [wallets, setWallets] = useState([]);

  // Form State Transaksi Pengeluaran
  const [type, setType] = useState('RESTOCK');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [walletId, setWalletId] = useState('');
  const [notes, setNotes] = useState('');
  
  // 🔍 State Tambahan Khusus Pengeluaran Non-Restock (Manual)
  const [manualTotalExpense, setManualTotalExpense] = useState(0);
  
  // State Dinamis Array Item Detail (Hanya Terpakai jika type === 'RESTOCK')
  const [details, setDetails] = useState([
    { product_id: '', quantity: 1, cost_price_per_item: 0, sub_total: 0 }
  ]);

  // Fetch Wallets dan Products untuk Dropdown Pilihan
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [resProducts, resWallets] = await Promise.all([
          api.get('/products'), 
          api.get('/wallets')   
        ]);
        
        if (resProducts.data.status === 'success') setProducts(resProducts.data.data);
        if (resWallets.data.status === 'success') {
          setWallets(resWallets.data.data);
          if (resWallets.data.data.length > 0) setWalletId(resWallets.data.data[0].id);
        }
      } catch (err) {
        console.error('Gagal mengambil master data pendukung dropdown', err);
      }
    };
    fetchMasterData();
  }, []);

  // Handler update baris item pengeluaran
  const handleItemChange = (index, field, value) => {
    const updatedDetails = [...details];
    
    if (field === 'product_id') {
      updatedDetails[index].product_id = value;
      const selectedProd = products.find(p => p.id === value);
      if (selectedProd && selectedProd.cost_price) {
        updatedDetails[index].cost_price_per_item = selectedProd.cost_price;
      }
    } else {
      updatedDetails[index][field] = Number(value) || 0;
    }

    updatedDetails[index].sub_total = updatedDetails[index].quantity * updatedDetails[index].cost_price_per_item;
    setDetails(updatedDetails);
  };

  const handleAddItemRow = () => {
    setDetails([...details, { product_id: '', quantity: 1, cost_price_per_item: 0, sub_total: 0 }]);
  };

  const handleRemoveItemRow = (index) => {
    if (details.length === 1) return;
    setDetails(details.filter((_, i) => i !== index));
  };

  // 🔍 Modifikasi Hitung Akumulasi Total Pengeluaran
  const calculateTotalExpense = () => {
    if (type !== 'RESTOCK') {
      return manualTotalExpense;
    }
    return details.reduce((sum, item) => sum + item.sub_total, 0);
  };

  // Submit Simpan Data POST /api/expenses
  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!walletId) return alert('Please select the payment wallet or cash account first.');
    
    // 🔍 Kondisional Validasi berdasarkan Tipe Pengeluaran
    if (type === 'RESTOCK') {
      const isInvalid = details.some(item => !item.product_id || item.quantity <= 0 || item.cost_price_per_item <= 0);
      if (isInvalid) return alert('Please correctly enter the product, quantity, and purchase price of the item in the detail line.');
    } else {
      if (manualTotalExpense <= 0) return alert('Please enter a total expense greater than 0.');
    }

    setSubmitting(true);
    try {
      // 🔍 Sesuaikan payload yang dikirim ke backend controller Anda
      const payload = {
        type,
        expense_date: expenseDate,
        wallet_id: walletId,
        notes,
        // Backend menghitung total atau menangkap manual_total_expense
        manual_total_expense: type !== 'RESTOCK' ? manualTotalExpense : undefined,
        items: type === 'RESTOCK' ? details : []
      };

      // Catatan: Endpoint disesuaikan dengan plural '/expenses' sesuai halaman list sebelumnya
      const response = await api.post('/expenses', payload);
      if (response.data.status === 'success') {
        alert('The expense transaction was successfully saved!');
        navigate('/admin/expense');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'A system error occurred while saving the expense.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mx-auto">
      {/* HEADER NAVIGASI */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button 
          type="button"
          onClick={() => navigate('/admin/expenses')}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-extrabold text-slate-800">Create Operational Expense</h2>
          <p className="text-xs text-slate-400">Ensure the entered amount matches the physical receipt or invoice.</p>
        </div>
      </div>

      <form onSubmit={handleSubmitExpense} className="space-y-6">
        {/* FIELD INDUK UTAMA */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Withdrawal Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-amber-500 focus:outline-none"
            >
              <option value="RESTOCK">Restock</option>
              <option value="OPERATIONAL">Operational</option>
              <option value="BILL">Bill</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Source of funds (Wallet Kas)</label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-amber-500 focus:outline-none"
            >
              {wallets.length === 0 ? <option value="">Loading Wallet...</option> : 
                wallets.map(w => <option key={w.id} value={w.id}>{w.name} (Rp {w.balance?.toLocaleString('id-ID') || 0})</option>)
              }
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expense Date</label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Additional Notes</label>
            <textarea
              rows="2"
              placeholder="Example: Monthly electricity and internet bills, office desk repair costs, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:border-amber-500 focus:outline-none"
            ></textarea>
          </div>
        </div>

        {/* 🔍 KONDISIONAL TAMPILAN DETAIL ITEM (Hanya Muncul jika RESTOCK) */}
        {type === 'RESTOCK' ? (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Breakdown of Item Purchase Components</h3>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-xl transition cursor-pointer"
              >
                <Plus size={14} /> Add Row Item
              </button>
            </div>

            <div className="space-y-3">
              {details.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-end md:items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex-1 w-full">
                    <label className="block md:hidden text-[10px] font-bold text-slate-400 mb-1">PRODUK</label>
                    <select
                      value={item.product_id}
                      onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">-- Pilih Produk Terkait --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  <div className="w-full md:w-20">
                    <label className="block md:hidden text-[10px] font-bold text-slate-400 mb-1">QTY</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-center text-slate-700 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="w-full md:w-40">
                    <label className="block md:hidden text-[10px] font-bold text-slate-400 mb-1">HARGA SATUAN (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Harga Satuan"
                      value={item.cost_price_per_item || ''}
                      onChange={(e) => handleItemChange(idx, 'cost_price_per_item', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="w-full md:w-44 text-right px-2 font-extrabold text-sm text-slate-800">
                    <label className="block md:hidden text-left text-[10px] font-bold text-slate-400 mb-1">SUBTOTAL</label>
                    Rp {item.sub_total.toLocaleString('id-ID')}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItemRow(idx)}
                    disabled={details.length === 1}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition disabled:opacity-30 cursor-pointer"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4">
              <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Automatic Calculation</span>
              <div className="text-right flex items-center gap-3">
                <span className="text-sm font-bold text-slate-600">Grand Total of Expenses:</span>
                <span className="text-2xl font-black text-red-600">Rp {calculateTotalExpense().toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        ) : (
          /* 🔍 TAMPILAN ALTERNATIF JIKA BUKAN RESTOCK (OPERATIONAL / BILL / OTHER) */
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">
                Total Nominal Expenditure
              </h3>
              <div className="max-w-md">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Total Amount Spent (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-sm font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter aggregate total amount..."
                    value={manualTotalExpense || ''}
                    onChange={(e) => setManualTotalExpense(Number(e.target.value) || 0)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-extrabold text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                  *Untuk pengeluaran umum/operasional, tidak diperlukan rincian item produk secara mendetail.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4">
              <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Summary</span>
              <div className="text-right flex items-center gap-3">
                <span className="text-sm font-bold text-slate-600">Grand Total of Expenses:</span>
                <span className="text-2xl font-black text-red-600">Rp {calculateTotalExpense().toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        )}

        {/* CONTROLLER AKSI SUBMIT */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/expense')}
            disabled={submitting}
            className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-5 py-3 rounded-xl transition shadow-md cursor-pointer text-sm"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Transaction</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ExpenseCreatePage;