import axios from 'axios';

// Membuat instance axios dengan konfigurasi global yang reusable
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api', // Base URL Backend
  timeout: 10000, // Batas waktu tunggu request (10 detik)
  headers: {
    'Content-Type': 'application/json',
  }
});

// 1. REQUEST INTERCEPTOR: Otomatis menyisipkan JWT Token di setiap request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Menyisipkan token ke dalam header Authorization menggunakan format Bearer
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. RESPONSE INTERCEPTOR: Mendeteksi jika token kedaluwarsa (401) atau server error
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error Interceptor:', error.response || error.message);
    
    // Jika backend mengirimkan status 401 (Unauthorized), artinya token tidak valid atau expired
    if (error.response && error.response.status === 401) {
      // Hapus data sesi yang usang dari localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      
      // Tendang paksa pengguna kembali ke halaman login jika mereka tidak sedang di halaman login
      if (window.location.pathname !== '/login') {
        alert('Sesi Anda telah berakhir, silakan masuk kembali.');
        window.location.href = '/login'; 
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;