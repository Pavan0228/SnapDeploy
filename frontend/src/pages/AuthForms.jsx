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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 bg-pattern p-4 transition-all duration-500">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-400/20 to-secondary-400/20 dark:from-primary-600/10 dark:to-secondary-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent-400/20 to-primary-400/20 dark:from-accent-600/10 dark:to-primary-600/10 rounded-full blur-3xl animate-pulse-gentle"></div>
            </div>

            <div className="relative w-full max-w-md z-10">
                {/* Theme Toggle */}
                <div className="absolute top-0 right-0 -mt-4">
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                    >
                        {theme === "light" ? (
                            <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        ) : (
                            <Sun className="h-5 w-5 text-yellow-500" />
                        )}
                    </button>
                </div>

                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="relative">
                        <div className="h-14 w-14 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl shadow-lg shadow-primary-500/30 flex items-center justify-center animate-glow">
                            <Zap className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-accent-400 to-accent-600 rounded-full animate-bounce-gentle"></div>
                    </div>
                    <div className="text-center">
                        <span className="text-3xl font-bold gradient-text">
                            SnapDeploy
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Deploy at the speed of thought
                        </p>
                    </div>
                </div>

                {/* Form Container */}
                <div className="card p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {isLogin ? "Welcome Back!" : "Join SnapDeploy"}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
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
                                        <User className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-300" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Full Name"
                                            className="input-field pl-12"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-300" />
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            placeholder="Username"
                                            className="input-field pl-12"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-300" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email Address"
                                    className="input-field pl-12"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-300" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className="input-field pl-12 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-4 top-4 text-gray-400 hover:text-primary-500 transition-colors duration-300"
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
                                    className="text-sm text-primary-600 hover:text-secondary-600 transition-colors duration-300 font-medium"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-base group disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <span className="font-semibold">
                                {loading
                                    ? "Please wait..."
                                    : isLogin
                                    ? "Sign In to SnapDeploy"
                                    : "Create My Account"}
                            </span>
                            {!loading && (
                                <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                            )}
                        </button>
                    </form>

                    {/* Toggle Form */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            {isLogin
                                ? "New to SnapDeploy?"
                                : "Already have an account?"}
                        </p>
                        <button
                            type="button"
                            onClick={toggleForm}
                            className="mt-2 font-semibold text-primary-600 hover:text-secondary-600 transition-colors duration-300 text-lg"
                        >
                            {isLogin ? "Create Account" : "Sign In"}
                        </button>
                    </div>

                    {/* Features highlight for new users */}
                    {!isLogin && (
                        <div className="mt-8 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-200/50 dark:border-primary-700/50">
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                🚀 <strong>Deploy in seconds</strong> • 🔧{" "}
                                <strong>Zero configuration</strong> • 📊{" "}
                                <strong>Real-time monitoring</strong>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthForms;
