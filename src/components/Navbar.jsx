import { useState } from 'react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [showConfirm, setShowConfirm] = useState(false);
  // 1. Tambahkan state untuk mengontrol buka/tutup dropdown profil
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Bersihkan semua data sesi
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');

    // Alihkan ke login
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm">
        {/* Indikator Menu */}
        <div className="font-bold text-slate-800 text-lg tracking-tight">
          Overview Dashboard
        </div>

        {/* 2. Menu Profil & Dropdown Wrapper */}
        {/* relative diperlukan agar dropdown absolute memosisikan diri terhadap kontainer ini */}
        <div className="relative">
          {/* Tombol pemicu dropdown (Area Profil) */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 p-1.5 px-3 rounded-2xl transition cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
              <User size={18} />
            </div>
            <span>Admin Kasir</span>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* KOTAK DROPDOWN */}
          {showDropdown && (
            <>
              {/* Overlay transparan di latar belakang agar ketika user klik di luar dropdown, dropdown-nya otomatis menutup */}
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Label Menu */}
                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  My Account
                </div>

                {/* TOMBOL PROFILE (TAMBAHAN BARU) */}
                <button
                  onClick={() => {
                    navigate('/admin/profile'); // Sesuaikan dengan path halaman profil Anda
                    setShowDropdown(false); // Tutup dropdown setelah berpindah halaman
                  }}
                  className="w-full flex items-center gap-2 text-sm font-bold text-slate-700 hover:bg-slate-50 p-2.5 px-3 rounded-xl transition cursor-pointer text-left mb-0.5"
                >
                  <User size={16} className="text-slate-400" />
                  <span>Profile Saya</span>
                </button>

                {/* Tombol Logout di dalam dropdown */}
                <button
                  onClick={() => {
                    setShowConfirm(true);
                    setShowDropdown(false); // Tutup dropdown saat modal muncul
                  }}
                  className="w-full flex items-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 p-2.5 px-3 rounded-xl transition cursor-pointer text-left"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* MODAL CONFIRMATION - Tetap sama, menggunakan tema melengkung persis kartu login */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">
              Confirm Logout
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Are you sure you want to log out of this POS system? You will need to log in again to access the data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 shadow-md shadow-red-100 transition cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;