import React, { useState } from "react";
import {
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    PlusCircle,
    UserCircle,
    LifeBuoy,
    FolderGit2,
    Zap,
    Moon,
    Sun,
    LogOut,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";

const Layout = ({ setIsAuthenticated }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: PlusCircle, label: "New Project", path: "/create-project" },
        { icon: FolderGit2, label: "My Projects", path: "/projects" },
        { icon: UserCircle, label: "Account", path: "/profile" },
        { icon: LifeBuoy, label: "Support", path: "/help-support" },
    ];

    const handleLogout = () => {
        toast.success("Logging out...", {
            duration: 1000,
            position: "top-right",
        });
        setTimeout(() => {
            Cookies.remove("accessToken");
            localStorage.removeItem("userId");
            setIsAuthenticated && setIsAuthenticated(false);
            navigate("/auth");
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-pattern transition-all duration-500">
            {/* Top Navbar */}
            <nav className="card fixed w-full z-10 shadow-lg shadow-primary-500/10 dark:shadow-primary-500/5 border-0 border-b border-gray-200/50 dark:border-gray-700/50 rounded-none">
                <div className="px-4 lg:px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        {/* Left Section */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() =>
                                    setIsMobileMenuOpen(!isMobileMenuOpen)
                                }
                                className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                            >
                                {isMobileMenuOpen ? (
                                    <X
                                        size={20}
                                        className="text-gray-600 dark:text-gray-400"
                                    />
                                ) : (
                                    <Menu
                                        size={20}
                                        className="text-gray-600 dark:text-gray-400"
                                    />
                                )}
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl shadow-lg shadow-primary-500/30 flex items-center justify-center animate-glow">
                                        <Zap className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <span className="text-xl font-bold gradient-text">
                                    SnapDeploy
                                </span>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-3">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-105"
                            >
                                {theme === "light" ? (
                                    <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                ) : (
                                    <Sun className="h-5 w-5 text-yellow-500" />
                                )}
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="btn-secondary p-2.5"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="hidden sm:inline-block ml-2">
                                    Logout
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex pt-20">
                {/* Sidebar */}
                <aside
                    className={`fixed left-0 top-0 mt-20 h-[calc(100vh-5rem)] card border-0 border-r border-gray-200/50 dark:border-gray-700/50 rounded-none transition-all duration-300 ease-in-out z-20
                    ${isExpanded ? "w-64" : "w-20"} 
                    ${
                        isMobileMenuOpen
                            ? "translate-x-0"
                            : "-translate-x-full lg:translate-x-0"
                    }`}
                >
                    <div className="flex flex-col h-full">
                        <div className="p-4 flex justify-end">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hidden lg:block transition-all duration-300 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                {isExpanded ? (
                                    <ChevronLeft size={20} />
                                ) : (
                                    <ChevronRight size={20} />
                                )}
                            </button>
                        </div>
                        <nav className="flex-1 px-4 pb-4">
                            {menuItems.map((item, index) => (
                                <NavLink
                                    key={index}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        group w-full flex items-center px-4 py-4 mb-2 relative transition-all duration-300 rounded-xl
                                        ${
                                            isActive
                                                ? "bg-gradient-to-r from-primary-500/10 to-secondary-500/10 text-primary-600 dark:text-primary-400 border-l-4 border-primary-600"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                                        }
                                    `}
                                >
                                    <div
                                        className={`relative transition-transform duration-300 group-hover:scale-110`}
                                    >
                                        <item.icon size={20} />
                                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                    </div>
                                    {isExpanded ? (
                                        <span className="ml-4 font-medium">
                                            {item.label}
                                        </span>
                                    ) : (
                                        <div className="absolute left-full ml-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-3 py-2 text-sm rounded-xl shadow-xl whitespace-nowrap">
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
                        className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-10 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main
                    className={`flex-1 transition-all duration-300 px-4 lg:px-6 py-6
                    ${isExpanded ? "lg:ml-64" : "lg:ml-20"} 
                    relative w-full min-h-screen`}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
