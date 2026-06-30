import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token');

    if (!token) return <Navigate to="/login" replace />;

    try {
        // Membedah part tengah (payload) JWT secara manual tanpa library
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const decoded = JSON.parse(jsonPayload);
        const currentTime = Date.now() / 1000;

        // Cek kedaluwarsa token
        if (decoded.exp && decoded.exp < currentTime) {
            console.warn("Token expired!");
            localStorage.clear();
            return <Navigate to="/login" replace />;
        }
    } catch (error) {
        // Jika token palsu/rusak struktur string-nya, otomatis ke-clear di sini
        console.error("Token tidak valid:", error);
        localStorage.clear();
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;