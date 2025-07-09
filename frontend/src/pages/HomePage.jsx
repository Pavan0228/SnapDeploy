import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Zap,
    Rocket,
    Shield,
    Code,
    Github,
    Globe,
    ArrowRight,
    CheckCircle,
    Clock,
    Users,
    Star,
    Moon,
    Sun,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import Cookies from "js-cookie";

const HomePage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const isAuthenticated = !!Cookies.get("accessToken");

    const features = [
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Lightning Fast Deployment",
            description:
                "Deploy your apps in seconds, not hours. From code to live in under 30 seconds.",
            color: "from-yellow-400 to-orange-500",
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Enterprise Security",
            description:
                "Bank-grade security with automatic SSL, DDoS protection, and secure environments.",
            color: "from-green-400 to-emerald-500",
        },
        {
            icon: <Code className="w-8 h-8" />,
            title: "Zero Configuration",
            description:
                "No complex setup required. Just connect your repo and we'll handle the rest automatically.",
            color: "from-blue-400 to-cyan-500",
        },
        {
            icon: <Github className="w-8 h-8" />,
            title: "GitHub Integration",
            description:
                "Seamless integration with GitHub. Deploy directly from your repositories with one click.",
            color: "from-purple-400 to-pink-500",
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Global CDN",
            description:
                "Your apps served from edge locations worldwide for maximum performance.",
            color: "from-indigo-400 to-blue-500",
        },
        {
            icon: <Rocket className="w-8 h-8" />,
            title: "Auto Scaling",
            description:
                "Automatically scales based on traffic. Handle millions of users effortlessly.",
            color: "from-red-400 to-pink-500",
        },
    ];

    const stats = [
        { number: "1M+", label: "Deployments" },
        { number: "50K+", label: "Developers" },
        { number: "99.9%", label: "Uptime" },
        { number: "30s", label: "Avg Deploy Time" },
    ];

    const testimonials = [
        {
            name: "Sarah Chen",
            role: "Frontend Developer",
            company: "TechCorp",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
            quote: "SnapDeploy has revolutionized our deployment process. What used to take hours now takes seconds!",
        },
        {
            name: "Mike Johnson",
            role: "Full Stack Engineer",
            company: "StartupXYZ",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            quote: "The GitHub integration is seamless. I can deploy directly from my commits without any hassle.",
        },
        {
            name: "Emily Rodriguez",
            role: "DevOps Lead",
            company: "InnovateLab",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            quote: "Finally, a deployment platform that just works. Zero configuration, maximum performance.",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-900 dark:via-slate-800/90 dark:to-gray-900">
            {/* Navigation */}
            <nav className="relative z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl shadow-lg flex items-center justify-center">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold gradient-text">
                                SnapDeploy
                            </span>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                {theme === "light" ? (
                                    <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                ) : (
                                    <Sun className="h-5 w-5 text-yellow-500" />
                                )}
                            </button>

                            {isAuthenticated ? (
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="btn-primary px-6 py-2"
                                >
                                    Dashboard
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate("/auth")}
                                        className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => navigate("/auth")}
                                        className="btn-primary px-6 py-2"
                                    >
                                        Get Started
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0">
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-400/10 to-secondary-400/10 rounded-full blur-3xl animate-pulse-gentle"></div>
                    <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent-400/10 to-primary-400/10 rounded-full blur-3xl animate-pulse-gentle"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            Deploy at the
                            <span className="gradient-text block">
                                Speed of Thought
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Transform your development workflow with
                            lightning-fast deployments. From code to production
                            in under 30 seconds.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                            <button
                                onClick={() => navigate("/auth")}
                                className="btn-primary px-8 py-4 text-lg font-semibold group"
                            >
                                Start Deploying Free
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="btn-secondary px-8 py-4 text-lg font-semibold">
                                Watch Demo
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400 font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section
                id="features"
                className="py-24 bg-white/50 dark:bg-gray-800/50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            Everything you need to
                            <span className="gradient-text">
                                {" "}
                                deploy faster
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Powerful features designed to streamline your
                            deployment process and boost your productivity.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="card p-8 hover:shadow-xl transition-all duration-300 group"
                            >
                                <div
                                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <div className="text-white">
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            Deploy in{" "}
                            <span className="gradient-text">
                                3 simple steps
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Github className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                1. Connect Repository
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Connect your GitHub repository with one click.
                                We support both public and private repos.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Code className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                2. Configure & Build
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                We automatically detect your framework and
                                configure the optimal build settings.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Rocket className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                3. Deploy & Go Live
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Your app is deployed globally with SSL, CDN, and
                                monitoring included automatically.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section
                id="testimonials"
                className="py-24 bg-white/50 dark:bg-gray-800/50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            Loved by{" "}
                            <span className="gradient-text">
                                developers worldwide
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="card p-8">
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="w-5 h-5 text-yellow-400 fill-current"
                                        />
                                    ))}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                                    "{testimonial.quote}"
                                </p>
                                <div className="flex items-center">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full mr-4"
                                    />
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">
                                            {testimonial.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {testimonial.role} at{" "}
                                            {testimonial.company}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Ready to{" "}
                        <span className="gradient-text">deploy faster?</span>
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
                        Join thousands of developers who have already
                        transformed their deployment workflow.
                    </p>
                    <button
                        onClick={() => navigate("/auth")}
                        className="btn-primary px-12 py-4 text-xl font-semibold group"
                    >
                        Start Your Free Trial
                        <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 dark:bg-black text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                                    <Zap className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold">
                                    SnapDeploy
                                </span>
                            </div>
                            <p className="text-gray-400 mb-6 max-w-md">
                                The fastest way to deploy your applications.
                                Built for developers who want to focus on code,
                                not infrastructure.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold mb-4">Product</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Pricing
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        API
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 SnapDeploy. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
