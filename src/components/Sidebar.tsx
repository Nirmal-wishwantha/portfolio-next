import React, { useState } from 'react';
import {
    Home, Edit3, MessageCircle, Users, Bell, Users2,
    FileText, Gamepad2, Settings, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';

const menuItems = [
    { icon: <Home size={20} />, label: 'Home' },
    { icon: <Edit3 size={20} />, label: 'Post' },
    { icon: <MessageCircle size={20} />, label: 'Messages' },
    { icon: <Users size={20} />, label: 'Friends' },
    { icon: <Bell size={20} />, label: 'Notifications', hasNotification: true },
    { icon: <Users2 size={20} />, label: 'Group' },
    { icon: <FileText size={20} />, label: 'Pages' },
    { icon: <Gamepad2 size={20} />, label: 'Games' },
    { icon: <Settings size={20} />, label: 'Setting' },
    { icon: <LogOut size={20} />, label: 'Log Out' },
];

const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={`
        h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-800 text-white
        relative overflow-hidden flex flex-col
        transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-4 right-[-16px] z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.2)' }}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            {/* Sidebar Content */}
            <div className="flex-1 flex flex-col pt-8">
                {/* Profile Section */}
                <div className="flex flex-col items-center mb-6">
                    {/* Profile Image always visible */}
                    <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                    </div>
                    {/* Name and Account only when expanded */}
                    {!isCollapsed && (
                        <div className="flex flex-col items-center mt-2">
                            <div className="font-medium">JeniKhant.design</div>
                            <div className="text-sm opacity-75">My Account</div>
                        </div>
                    )}
                </div>
                {/* Logo/Title */}
                {!isCollapsed && (
                    <h1 className="text-2xl font-bold mb-6 text-center">Facenote</h1>
                )}
                {/* Menu */}
                <nav className="flex-1 space-y-2 px-2">
                    {menuItems.map((item, idx) => (
                        <div
                            key={idx}
                            className={`
                flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group relative
                ${isCollapsed ? 'justify-center' : ''}
              `}
                        >
                            <div className="flex-shrink-0">{item.icon}</div>
                            {!isCollapsed && <span className="flex-1">{item.label}</span>}
                            {item.hasNotification && (
                                <div className="w-2 h-2 bg-cyan-300 rounded-full absolute right-3 top-1/2 -translate-y-1/2"></div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;