import React, { useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BASE_API_SERVER_URL } from "../constant/url";

const AuthForms = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (Cookies.get("accessToken")) {
            navigate("/dashboard");
        }
    }, [navigate]);

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">B</span>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        HostingPro
                    </span>
                </div>

                {/* Form Container */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-purple-500/10 p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                        {isLogin ? "Welcome Back!" : "Create Account"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 outline-none"
                                    />
                                </div>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Username"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 outline-none"
                                    />
                                </div>
                            </>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 outline-none"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors duration-300"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>

                        {isLogin && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="text-sm text-indigo-600 hover:text-purple-600 transition-colors duration-300"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-purple-500/25 transform hover:scale-[1.02] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className="font-medium">
                                {loading
                                    ? "Please wait..."
                                    : isLogin
                                    ? "Sign In"
                                    : "Create Account"}
                            </span>
                            {!loading && (
                                <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                            )}
                        </button>
                    </form>

                    {/* Toggle Form */}
                    <p className="mt-6 text-center text-slate-600">
                        {isLogin
                            ? "Don't have an account?"
                            : "Already have an account?"}
                        <button
                            type="button"
                            onClick={toggleForm}
                            className="ml-2 font-medium text-indigo-600 hover:text-purple-600 transition-colors duration-300"
                        >
                            {isLogin ? "Sign Up" : "Sign In"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthForms;
