import React, { useState } from "react";
import {
    Search,
    BookOpen,
    MessageCircle,
    Mail,
    Phone,
    ExternalLink,
    ChevronDown,
    ChevronRight,
    Zap,
    Globe,
    Shield,
    Code,
    Database,
    Settings,
    GitBranch,
    Rocket,
    HelpCircle,
    Users,
    Clock,
    Star,
    Download,
    Play,
    FileText,
    Bug,
    Lightbulb,
    AlertCircle,
} from "lucide-react";

const HelpSupport = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [expandedFaq, setExpandedFaq] = useState(null);

    const categories = [
        { id: "all", label: "All Topics", icon: BookOpen },
        { id: "getting-started", label: "Getting Started", icon: Rocket },
        { id: "deployment", label: "Deployment", icon: Zap },
        { id: "github", label: "GitHub Integration", icon: GitBranch },
        { id: "domains", label: "Custom Domains", icon: Globe },
        { id: "troubleshooting", label: "Troubleshooting", icon: Bug },
        { id: "account", label: "Account & Billing", icon: Settings },
    ];

    const faqs = [
        {
            id: 1,
            category: "getting-started",
            question: "How do I deploy my first project?",
            answer: "To deploy your first project: 1) Connect your GitHub account, 2) Select a repository, 3) Configure build settings (optional), 4) Click 'Deploy'. Your project will be live in seconds!",
        },
        {
            id: 2,
            category: "getting-started",
            question: "What types of projects can I deploy?",
            answer: "BuildSphere supports static sites, React, Vue, Angular, Next.js, Nuxt.js, Gatsby, and many other frontend frameworks. We also support Node.js backends and serverless functions.",
        },
        {
            id: 3,
            category: "deployment",
            question: "How long does deployment take?",
            answer: "Most deployments complete in 30-60 seconds. Complex builds may take up to 5 minutes. You can monitor progress in real-time through our deployment dashboard.",
        },
        {
            id: 4,
            category: "deployment",
            question: "Can I rollback to a previous deployment?",
            answer: "Yes! You can rollback to any previous deployment with one click. Go to your project dashboard, select 'Deployments', and click 'Rollback' next to any previous version.",
        },
        {
            id: 5,
            category: "github",
            question: "Why can't I see my repositories?",
            answer: "Make sure you've granted BuildSphere access to your repositories during GitHub authentication. You can update permissions in your GitHub settings under 'Applications'.",
        },
        {
            id: 6,
            category: "github",
            question: "Do you support private repositories?",
            answer: "Yes! BuildSphere supports both public and private GitHub repositories. Your code remains secure and is never stored on our servers.",
        },
        {
            id: 7,
            category: "domains",
            question: "How do I add a custom domain?",
            answer: "Go to your project settings, click 'Domains', enter your domain name, and follow the DNS configuration instructions. SSL certificates are automatically provisioned.",
        },
        {
            id: 8,
            category: "domains",
            question: "Is SSL/HTTPS included?",
            answer: "Yes! All deployments automatically include free SSL certificates. Your sites are served over HTTPS by default with our global CDN.",
        },
        {
            id: 9,
            category: "troubleshooting",
            question: "My build is failing. What should I do?",
            answer: "Check the build logs in your deployment dashboard. Common issues include missing dependencies, build script errors, or environment variables. Our documentation has detailed troubleshooting guides.",
        },
        {
            id: 10,
            category: "account",
            question: "How do I update my account information?",
            answer: "Go to your Profile page and click 'Edit Profile'. You can update your name, email, username, and profile photo. Changes are saved automatically.",
        },
    ];

    const quickLinks = [
        {
            title: "Getting Started Guide",
            description: "Complete walkthrough for new users",
            icon: Rocket,
            link: "#getting-started",
            color: "primary",
        },
        {
            title: "API Documentation",
            description: "REST API reference and examples",
            icon: Code,
            link: "#api-docs",
            color: "secondary",
        },
        {
            title: "GitHub Integration",
            description: "Connect and deploy from GitHub",
            icon: GitBranch,
            link: "#github-setup",
            color: "accent",
        },
        {
            title: "Custom Domains",
            description: "Set up your own domain",
            icon: Globe,
            link: "#custom-domains",
            color: "success",
        },
    ];

    const supportOptions = [
        {
            title: "Email Support",
            description: "Get help via email within 24 hours",
            icon: Mail,
            action: "support@buildsphere.com",
            type: "email",
            availability: "24/7",
        },
        {
            title: "Live Chat",
            description: "Chat with our support team",
            icon: MessageCircle,
            action: "Start Chat",
            type: "chat",
            availability: "Mon-Fri 9AM-6PM",
        },
        {
            title: "Community Forum",
            description: "Connect with other developers",
            icon: Users,
            action: "Visit Forum",
            type: "link",
            availability: "Always active",
        },
        {
            title: "Status Page",
            description: "Check service status and incidents",
            icon: AlertCircle,
            action: "View Status",
            type: "link",
            availability: "Real-time",
        },
    ];

    const filteredFaqs = faqs.filter((faq) => {
        const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
        const matchesSearch = 
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const toggleFaq = (faqId) => {
        setExpandedFaq(expandedFaq === faqId ? null : faqId);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl shadow-lg">
                            <HelpCircle className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                                Help & Support
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                                Get the help you need to succeed with BuildSphere
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search help articles, guides, and FAQs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Quick Start Guides
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickLinks.map((link, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                            >
                                <div className={`p-3 bg-${link.color}-100 dark:bg-${link.color}-900/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                    <link.icon className={`h-6 w-6 text-${link.color}-600 dark:text-${link.color}-400`} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {link.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                    {link.description}
                                </p>
                                <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors">
                                    Learn more
                                    <ExternalLink className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FAQs Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Frequently Asked Questions
                            </h2>

                            {/* Category Filter */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setActiveCategory(category.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            activeCategory === category.id
                                                ? "bg-primary-600 text-white shadow-lg"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                    >
                                        <category.icon className="h-4 w-4" />
                                        {category.label}
                                    </button>
                                ))}
                            </div>

                            {/* FAQ List */}
                            <div className="space-y-4">
                                {filteredFaqs.length > 0 ? (
                                    filteredFaqs.map((faq) => (
                                        <div
                                            key={faq.id}
                                            className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                                        >
                                            <button
                                                onClick={() => toggleFaq(faq.id)}
                                                className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                                            >
                                                <span className="text-gray-900 dark:text-white font-medium">
                                                    {faq.question}
                                                </span>
                                                {expandedFaq === faq.id ? (
                                                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                )}
                                            </button>
                                            {expandedFaq === faq.id && (
                                                <div className="px-6 py-4 bg-white dark:bg-gray-800">
                                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            No FAQs found for your search.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Support Options Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Contact Support */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                Get Support
                            </h3>
                            <div className="space-y-4">
                                {supportOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-900/40 transition-colors">
                                                <option.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                    {option.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    {option.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {option.availability}
                                                    </span>
                                                    <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                                                        {option.action}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resource Links */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                Resources
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { icon: FileText, label: "Documentation", desc: "Complete guides" },
                                    { icon: Play, label: "Video Tutorials", desc: "Step-by-step videos" },
                                    { icon: Download, label: "Examples", desc: "Sample projects" },
                                    { icon: Lightbulb, label: "Best Practices", desc: "Tips & tricks" },
                                ].map((resource, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer group"
                                    >
                                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-900/20 transition-colors">
                                            <resource.icon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {resource.label}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {resource.desc}
                                            </p>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default HelpSupport;
