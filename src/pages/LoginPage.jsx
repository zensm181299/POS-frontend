import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance'; // Sesuaikan dengan path instance axios Anda
import { Loader2 } from 'lucide-react'; // Opsional, untuk indikator loading

function LoginPage() {
  const [username, setUsername] = useState(''); // Diubah dari email ke username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Username dan Password wajib diisi!');
      return;
    }

    try {
      setError('');
      setLoading(false);

      // Hitung endpoint /api/auth/login dengan payload baru
      const response = await api.post('/auth/login', {
        username: username,
        password: password
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
      // Menampilkan pesan error dari backend jika ada, jika tidak pakai default pesan gagal
      setError(err.response?.data?.message || 'Username atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100 font-sans">
      
      <div className="w-full max-w-lg rounded-3xl bg-white bg-gradient-to-br from-white to-slate-50 p-12 shadow-xl border border-slate-100">
        
        <h2 className="mb-2 text-center text-3xl font-extrabold text-slate-800 tracking-tight">
          POS System
        </h2>
        <p className="mb-10 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Silakan masuk ke akun admin Anda
        </p>
        
        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-xl text-center text-sm text-red-500 font-bold animate-in fade-in duration-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* FIELD USERNAME */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
            <input 
              type="text" 
              placeholder="Masukkan username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 shadow-inner 
                         placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          {/* FIELD PASSWORD */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="Masukkan password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 shadow-inner 
                         placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          {/* BUTTON SUBMIT */}
          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-3.5 
                       font-bold text-white shadow-md transition hover:from-blue-700 hover:to-blue-800 
                       active:scale-95 disabled:opacity-50 cursor-pointer text-lg tracking-wide flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Memvalidasi...</span>
              </>
            ) : (
              <span>Masuk Ke Sistem</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;