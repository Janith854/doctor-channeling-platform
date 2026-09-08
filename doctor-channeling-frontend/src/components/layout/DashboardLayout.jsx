import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col">
      {/* Full-width Sticky Top Header */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Main Container below Header */}
      <div className="flex-1 flex">
        {/* Role-based Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
