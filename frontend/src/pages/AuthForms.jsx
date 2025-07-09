import React, { useState, useEffect } from "react";
import {
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    ArrowRight,
    Moon,
    Sun,
    Zap,
    Github,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import axios from "axios";
import { BASE_API_SERVER_URL } from "../constant/url";
import { useTheme } from "../contexts/ThemeContext";

const AuthForms = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);

    useEffect(() => {
        if (Cookies.get("accessToken")) {
            setIsAuthenticated && setIsAuthenticated(true);
            navigate("/dashboard");
        }
    }, [navigate, setIsAuthenticated]);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        username: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.email || !formData.password) {
            toast.error("Please fill in all required fields");
            setLoading(false);
            return;
        }

        if (!isLogin && (!formData.fullName || !formData.username)) {
            toast.error("Please fill in all required fields");
            setLoading(false);
            return;
        }

        const loadingToast = toast.loading(
            isLogin ? "Signing in..." : "Creating account..."
        );

        try {
            const url = isLogin
                ? `${BASE_API_SERVER_URL}/auth/login`
                : `${BASE_API_SERVER_URL}/auth/signup`;

            const response = await axios.post(
                url,
                isLogin
                    ? {
                          email: formData.email,
                          password: formData.password,
                      }
                    : formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = response.data;

            if (data.accessToken) {
                Cookies.set("accessToken", data.accessToken, { expires: 1 });
                localStorage.setItem("userId", data.user._id);
                setIsAuthenticated && setIsAuthenticated(true);
            }

            toast.success(
                isLogin ? "Welcome back!" : "Account created successfully!",
                {
                    id: loadingToast,
                }
            );

            setFormData({
                fullName: "",
                email: "",
                password: "",
                username: "",
            });
            setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 500);
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong", {
                id: loadingToast,
            });
            setLoading(false);
        }
    };

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setShowPassword(false);
        setFormData({ fullName: "", email: "", password: "", username: "" });
    };

    const handleGithubLogin = async () => {
        setGithubLoading(true);

        try {
            // Get the GitHub auth URL from our backend
            const response = await axios.get(
                `${BASE_API_SERVER_URL}/github/auth-url`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const { authURL } = response.data;

            if (!authURL) {
                toast.error("Failed to get GitHub authentication URL");
                setGithubLoading(false);
                return;
            }

            // Redirect to the GitHub OAuth URL directly (not in popup)
            window.location.href = authURL;
        } catch (error) {
            console.error("GitHub login error:", error);
            toast.error("Failed to initiate GitHub login");
            setGithubLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "2s" }}
                ></div>
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "4s" }}
                ></div>
            </div>

            <div className="relative w-full max-w-md z-10">
                {/* Theme Toggle */}
                <div className="absolute top-0 right-0 -mt-4">
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                    >
                        {theme === "light" ? (
                            <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 transition-colors" />
                        ) : (
                            <Sun className="h-5 w-5 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
                        )}
                    </button>
                </div>

                {/* Logo with enhanced animation */}
                <div className="flex items-center justify-center gap-3 mb-12">
                    <div className="relative group">
                        <div className="h-16 w-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl shadow-indigo-500/30 flex items-center justify-center animate-bounce-gentle group-hover:scale-105 transition-transform duration-300">
                            <Zap className="h-9 w-9 text-white animate-pulse" />
                        </div>
                        <div className="absolute -top-2 -right-2 h-5 w-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                    </div>
                    <div className="text-center">
                        <span className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            SnapDeploy
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                            Deploy at the speed of thought ⚡
                        </p>
                    </div>
                </div>

                {/* Enhanced Form Container */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-8 relative overflow-hidden">
                    {/* Glassmorphism effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-700/20 pointer-events-none rounded-3xl"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                {isLogin
                                    ? "Welcome Back! 👋"
                                    : "Join SnapDeploy 🚀"}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {isLogin
                                    ? "Sign in to continue your deployment journey"
                                    : "Create your account and start deploying in seconds"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {!isLogin && (
                                <>
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <User className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder="Full Name"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                placeholder="Username"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-4">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email Address"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" />
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Password"
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-4 top-4 text-gray-400 hover:text-indigo-500 transition-colors duration-300"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {isLogin && (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors duration-300 font-medium"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || githubLoading}
                                className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none group"
                            >
                                <span className="flex items-center justify-center">
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                            Please wait...
                                        </>
                                    ) : (
                                        <>
                                            {isLogin
                                                ? "Sign In to SnapDeploy"
                                                : "Create My Account"}
                                            <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Enhanced GitHub Login */}
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGithubLogin}
                                disabled={loading || githubLoading}
                                className="mt-6 w-full flex items-center justify-center px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group transform hover:scale-[1.02]"
                            >
                                <Github className="h-5 w-5 mr-3 text-gray-900 dark:text-white" />
                                <span className="font-medium">
                                    {githubLoading
                                        ? "Connecting to GitHub..."
                                        : `${
                                              isLogin ? "Sign in" : "Sign up"
                                          } with GitHub`}
                                </span>
                                {githubLoading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent ml-2"></div>
                                )}
                            </button>
                        </div>

                        {/* Toggle Form */}
                        <div className="mt-10 text-center">
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                                {isLogin
                                    ? "New to SnapDeploy?"
                                    : "Already have an account?"}
                            </p>
                            <button
                                type="button"
                                onClick={toggleForm}
                                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-300 text-lg"
                            >
                                {isLogin ? "Create Account" : "Sign In"}
                            </button>
                        </div>

                        {/* Enhanced Features highlight for new users */}
                        {!isLogin && (
                            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/50">
                                <div className="text-center">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
                                        ✨ What you'll get with SnapDeploy
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            30s deployments
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            Zero config
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                            Global CDN
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                            Free SSL
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForms;
