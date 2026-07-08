import { useState } from 'react';
import { LayoutDashboard, Folder, ShoppingCart, FileText, ChevronDown, ChevronUp, Wallet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const [openMenus, setOpenMenus] = useState({ master: true, transaction: true });
  const location = useLocation();

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Fungsi pembantu untuk mengecek apakah menu sedang aktif/dibuka
  const isActive = (path) => location.pathname === path;

  // Variabel style untuk menu utama yang aktif (menggunakan gradasi biru seperti tombol login)
  const activeMenuClass = "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-100 font-bold";
  const inactiveMenuClass = "text-slate-600 hover:bg-slate-100 font-semibold";

  return (
    <div className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col shadow-sm">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 font-extrabold text-xl tracking-tight text-slate-800 flex items-center justify-center">
        POS <span className="text-blue-600 ml-1">SYSTEM</span>
      </div>

      {/* Menu List */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto text-sm">
        {/* Dashboard */}
        <Link
          to="/admin/dashboard"
          className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${isActive('/admin/dashboard') ? activeMenuClass : inactiveMenuClass}`}
        >
          <LayoutDashboard size={18} /> Dashboard
        </Link>

        {/* Master (With Submenu) */}
        <div>
          <button
            onClick={() => toggleMenu('master')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${inactiveMenuClass}`}
          >
            <div className="flex items-center gap-3">
              <Folder size={18} className="text-slate-500" /> <span>Master</span>
            </div>
            {openMenus.master ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openMenus.master && (
            <div className="ml-6 mt-1 space-y-1 border-l-2 border-slate-100 pl-4 text-slate-500">
              <Link to="/admin/category" className={`block p-2 rounded-lg transition-all ${isActive('/admin/category') ? 'text-blue-600 font-bold' : 'hover:text-slate-800'}`}>Category</Link>
              <Link to="/admin/product" className={`block p-2 rounded-lg transition-all ${isActive('/admin/product') ? 'text-blue-600 font-bold' : 'hover:text-slate-800'}`}>Product</Link>
            </div>
          )}
        </div>

        {/* Transaction (With Submenu) */}
        <div>
          <button
            onClick={() => toggleMenu('transaction')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${inactiveMenuClass}`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={18} className="text-slate-500" /> <span>Transaction</span>
            </div>
            {openMenus.transaction ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openMenus.transaction && (
            <div className="ml-6 mt-1 space-y-1 border-l-2 border-slate-100 pl-4 text-slate-500">
              <Link to="/admin/sales-order" className={`block p-2 rounded-lg transition-all ${isActive('/admin/sales-order') ? 'text-blue-600 font-bold' : 'hover:text-slate-800'}`}>Sales Order</Link>
              <Link to="/admin/expense" className={`block p-2 rounded-lg transition-all ${isActive('/admin/expense') ? 'text-blue-600 font-bold' : 'hover:text-slate-800'}`}>Expense Transactions</Link>
            </div>
          )}
        </div>

        {/* 2. MENU WALLET (Ditempatkan di atas menu report) */}
        <Link
          to="/admin/wallet"
          className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${isActive('/admin/wallet') ? activeMenuClass : inactiveMenuClass}`}
        >
          <Wallet size={18} /> Wallet
        </Link>

        {/* Report */}
        <Link
          to="/admin/report"
          className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${isActive('/admin/report') ? activeMenuClass : inactiveMenuClass}`}
        >
          <FileText size={18} /> Report
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;