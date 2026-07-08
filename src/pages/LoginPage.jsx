import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance'; // Sesuaikan dengan path instance axios Anda
import { Loader2, LogIn, UserPlus, User, Lock } from 'lucide-react';

function LoginPage() {
  const navigate = useNavigate();
  
  // State untuk mengontrol Tab yang aktif ('login' atau 'register')
  const [activeTab, setActiveTab] = useState('login');

  // State Bersama
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // State Form Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // State Form Register
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Handler Ganti Tab (sekaligus bersihkan pesan error/sukses)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };

  // Submit Handler untuk Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginUsername || !loginPassword) {
      setError('Username dan Password wajib diisi!');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const response = await api.post('/auth/login', {
        username: loginUsername,
        password: loginPassword
      });

      if (response.data.status === 'success') {
        const { token, role, name } = response.data.data;

        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('name', name);

        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || 'Username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler untuk Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!regName || !regUsername || !regPassword || !regConfirmPassword) {
      setError('Semua field pendaftaran wajib diisi!');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Konfirmasi password tidak cocok!');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const response = await api.post('/auth/register', {
        name: regName,
        username: regUsername,
        password: regPassword
      });

      if (response.data.status === 'success') {
        setSuccess('Pendaftaran berhasil! Silakan masuk menggunakan tab Login.');
        setRegName('');
        setRegUsername('');
        setRegPassword('');
        setRegConfirmPassword('');
        setTimeout(() => {
          setActiveTab('login');
        }, 2000);
      }
    } catch (err) {
      console.error("Register error:", err);
      setError(err.response?.data?.message || 'Gagal melakukan pendaftaran akun baru.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* SISI KIRI: HERO / BRANDING SECTION (Hanya muncul di desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 items-center justify-center p-12 overflow-hidden">
        {/* Dekorasi Background Bulatan */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-2xl" />
        
        <div className="max-w-md w-full text-white relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-6 border border-white/20 shadow-inner">
            <span className="font-black text-xl tracking-wider text-white">POS</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-tight mb-4">
            Kelola Bisnis Ritel Anda Lebih Cerdas & Efisien.
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed font-medium opacity-90">
            Pantau stok barang otomatis, kelola kasir, pencatatan transaksi pengeluaran, hingga laporan penjualan berkala dalam satu dashboard terintegrasi.
          </p>
        </div>
      </div>

      {/* SISI KANAN: FORM SECTION */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">
              Selamat Datang Kembali
            </h2>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Silakan masuk atau daftar akun baru
            </p>
          </div>

          {/* CONTROLLER TAB LOGIN / REGISTER */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200/30">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LogIn size={14} />
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <UserPlus size={14} />
              Daftar (Register)
            </button>
          </div>
          
          {/* ALERT NOTIFIKASI */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-red-600 font-bold tracking-wide">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold tracking-wide">
              {success}
            </div>
          )}

          {/* CONTAINER FORM CONDITIONAL */}
          {activeTab === 'login' ? (
            /* FORM LOGIN */
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Masukkan username Anda" 
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm text-slate-900 transition focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none placeholder:text-slate-400"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password" 
                    placeholder="Masukkan password Anda" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm text-slate-900 transition focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none placeholder:text-slate-400"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-600/20 transition duration-200 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] disabled:opacity-50 cursor-pointer text-sm tracking-wide flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Memvalidasi...</span>
                  </>
                ) : (
                  <span>Masuk Ke Sistem</span>
                )}
              </button>
            </form>
          ) : (
            /* FORM REGISTER */
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Zaenal Muttaqin" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 transition focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none placeholder:text-slate-400"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Username Baru</label>
                <input 
                  type="text" 
                  placeholder="Buat nama pengguna unik" 
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 transition focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none placeholder:text-slate-400"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <input 
                  type="password" 
                  placeholder="Buat password aman" 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 transition focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none placeholder:text-slate-400"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Konfirmasi Password</label>
                <input 
                  type="password" 
                  placeholder="Ulangi password di atas" 
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 transition focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none placeholder:text-slate-400"
                  required
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-600/20 transition duration-200 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] disabled:opacity-50 cursor-pointer text-sm tracking-wide flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Mendaftarkan Akun...</span>
                  </>
                ) : (
                  <span>Daftar Akun Baru</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}

export default LoginPage;