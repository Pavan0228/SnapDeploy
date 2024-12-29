import React, { useState } from "react";
import {
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Home,
    Server,
    Users,
    Search,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Layout = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        { icon: Home, label: "Dashboard", path: "/dashboard" },
        { icon: Server, label: "Hosting", path: "/hosting" },
        { icon: Users, label: "Project", path: "/project" },
        { icon: Users, label: "Profile", path: "/profile" },
    ];

    const handleLogout = () => {
        toast.success("Logging out...",
            { duration: 1000, position: "top-right" }
        );
        setTimeout(() => {
            Cookies.remove("accessToken");
            navigate("/auth");
        }, 1000)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100">
            {/* Top Navbar */}
            <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 fixed w-full z-10 shadow-lg shadow-purple-500/5">
                <div className="px-4 lg:px-6 py-3 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        {/* Left Section */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-1.5 border border-slate-200 rounded-lg"
                            >
                                {isMobileMenuOpen ? (
                                    <X size={20} className="text-slate-600" />
                                ) : (
                                    <Menu size={20} className="text-slate-600" />
                                )}
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30 flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">B</span>
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    HostingPro
                                </span>
                            </div>
                        </div>

                        {/* Right Section - Updated for better responsiveness */}
                        <div className="flex items-center gap-2 sm:gap-3">                            
                            {/* Auth Buttons - Responsive Layout */}
                            <div className="flex items-center">
                                <button
                                    className="px-3 py-2 text-sm sm:text-base text-slate-600 hover:text-slate-900 transition-colors duration-300 font-medium"
                                    onClick={handleLogout}
                                >
                                        Logout
                                </button>
                                <Link 
                                    to="/signup"
                                    className="ml-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm sm:text-base rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 font-medium"
                                >
                                        Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar - Responsive */}
                <div className={`px-4 py-3 border-t border-slate-200/50 ${isSearchOpen ? 'block' : 'hidden'}`}>
                    <div className="relative w-full max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full px-4 py-2 pl-10 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-300"
                        />
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                    </div>
                </div>
            </nav>

            <div className="flex pt-16">
                {/* Rest of the layout remains the same */}
                <aside
                    className={`fixed left-0 top-0 mt-16 h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-xl border-r border-slate-200/50 transition-all duration-300 ease-in-out shadow-lg shadow-purple-500/5 z-20
                    ${isExpanded ? "w-64" : "w-20"} 
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
                >
                    <div className="flex flex-col h-full">
                        <div className="p-4 flex justify-end">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-slate-500 hover:text-slate-900 hidden lg:block transition-colors duration-300"
                            >
                                {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                            </button>
                        </div>
                        <nav className="flex-1 relative">
                            {menuItems.map((item, index) => (
                                <NavLink
                                    key={index}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        group w-full flex items-center px-6 py-4 relative transition-all duration-300
                                        ${isActive 
                                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border-r-4 border-indigo-600' 
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }
                                    `}
                                >
                                    <div className={`relative transition-transform duration-300 group-hover:scale-110`}>
                                        <item.icon size={20} />
                                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                    </div>
                                    {isExpanded ? (
                                        <span className="ml-4 font-medium">{item.label}</span>
                                    ) : (
                                        <div className="absolute left-full ml-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 text-sm rounded-lg shadow-xl whitespace-nowrap">
                                                {item.label}
                                            </span>
                                        </div>
                                    )}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-10 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main
                    className={`flex-1 transition-all duration-300 px-4 lg:px-8 mt-5
                    ${isExpanded ? "lg:ml-64" : "lg:ml-20"} 
                    relative max-w-7xl mx-auto w-full`}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;