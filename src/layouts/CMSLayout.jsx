import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

function CMSLayout() {
  return (
    // Menggunakan bg-slate-100 agar senada dengan warna dasar halaman login
    <div className="flex bg-slate-100 min-h-screen font-sans antialiased text-slate-800">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}

export default CMSLayout;