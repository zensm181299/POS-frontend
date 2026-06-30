import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance'; // Sesuaikan dengan path instance axios Anda
import { Loader2, LogIn, UserPlus } from 'lucide-react';

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
      setLoading(true); // Diperbaiki dari false ke true agar indikator loading berjalan

      const response = await api.post('/auth/login', {
        username: loginUsername,
        password: loginPassword
      });

      if (response.data.status === 'success') {
        const { token, role, name } = response.data.data;

        // Simpan data autentikasi ke dalam localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('name', name);

        // Arahkan pengguna ke halaman dashboard utama admin
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
        // Reset form register
        setRegName('');
        setRegUsername('');
        setRegPassword('');
        setRegConfirmPassword('');
        // Pindahkan otomatis ke tab login setelah delay singkat atau biarkan user klik sendiri
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans">
      
      <div className="w-full max-w-lg rounded-3xl bg-white bg-gradient-to-br from-white to-slate-50 p-8 sm:p-12 shadow-xl border border-slate-100">
        
        <h2 className="mb-2 text-center text-3xl font-extrabold text-slate-800 tracking-tight">
          POS System
        </h2>
        <p className="mb-8 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Kelola transaksi ritel toko Anda dengan mudah
        </p>

        {/* CONTROLLER TAB LOGIN / REGISTER */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl mb-8 border border-slate-200/40">
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LogIn size={14} />
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserPlus size={14} />
            Daftar (Register)
          </button>
        </div>
        
        {/* ALERT NOTIFIKASI ERROR / SUKSES */}
        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-xl text-center text-sm text-red-500 font-bold animate-in fade-in duration-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-sm text-emerald-600 font-bold animate-in fade-in duration-200">
            {success}
          </div>
        )}

        {/* CONTAINER FORM CONDITIONAL */}
        {activeTab === 'login' ? (
          /* FORM LOGIN */
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">Username</label>
              <input 
                type="text" 
                placeholder="Masukkan username Anda" 
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 shadow-inner 
                           placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="Masukkan password Anda" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 shadow-inner 
                           placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-3.5 
                         font-extrabold text-white shadow-md transition hover:from-blue-700 hover:to-blue-800 
                         active:scale-95 disabled:opacity-50 cursor-pointer text-sm tracking-wide flex items-center justify-center gap-2"
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
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">Nama Lengkap</label>
              <input 
                type="text" 
                placeholder="Contoh: Zaenal Muttaqin" 
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 shadow-inner 
                           placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">Username Baru</label>
              <input 
                type="text" 
                placeholder="Buat nama pengguna unik" 
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 shadow-inner 
                           placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="Buat password aman" 
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 shadow-inner 
                           placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 ml-1">Konfirmasi Password</label>
              <input 
                type="password" 
                placeholder="Ulangi password di atas" 
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 shadow-inner 
                           placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-3.5 
                         font-extrabold text-white shadow-md transition hover:from-blue-700 hover:to-blue-800 
                         active:scale-95 disabled:opacity-50 cursor-pointer text-sm tracking-wide flex items-center justify-center gap-2"
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
  );
}

export default LoginPage;