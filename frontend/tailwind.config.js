/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Purple color palette for SnapDeploy
                primary: {
                    50: "#f5f3ff",
                    100: "#ede9fe",
                    200: "#ddd6fe",
                    300: "#c4b5fd",
                    400: "#a78bfa",
                    500: "#8b5cf6",
                    600: "#7c3aed",
                    700: "#6d28d9",
                    800: "#5b21b6",
                    900: "#4c1d95",
                },
                secondary: {
                    50: "#faf5ff",
                    100: "#f3e8ff",
                    200: "#e9d5ff",
                    300: "#d8b4fe",
                    400: "#c084fc",
                    500: "#a855f7",
                    600: "#9333ea",
                    700: "#7e22ce",
                    800: "#6b21a8",
                    900: "#581c87",
                },
                accent: {
                    50: "#eef2ff",
                    100: "#e0e7ff",
                    200: "#c7d2fe",
                    300: "#a5b4fc",
                    400: "#818cf8",
                    500: "#6366f1",
                    600: "#4f46e5",
                    700: "#4338ca",
                    800: "#3730a3",
                    900: "#312e81",
                },
                success: {
                    50: "#f0fdf4",
                    500: "#22c55e",
                    600: "#16a34a",
                },
                warning: {
                    50: "#fffbeb",
                    500: "#f59e0b",
                    600: "#d97706",
                },
                error: {
                    50: "#fef2f2",
                    500: "#ef4444",
                    600: "#dc2626",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            animation: {
                "bounce-gentle": "bounce-gentle 2s infinite",
                "pulse-gentle": "pulse-gentle 2s infinite",
                glow: "glow 2s ease-in-out infinite alternate",
            },
            keyframes: {
                "bounce-gentle": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                "pulse-gentle": {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.7" },
                },
                glow: {
                    "0%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" },
                    "100%": { boxShadow: "0 0 30px rgba(139, 92, 246, 0.6)" },
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
