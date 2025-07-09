import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { BASE_API_SERVER_URL } from "../constant/url";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const GitHubCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(false);
    const hasProcessedRef = useRef(false);

    useEffect(() => {
        if (isProcessing || hasProcessedRef.current) return; // Prevent double execution

        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
            hasProcessedRef.current = true;
            // Send error to parent window if opened as popup
            if (window.opener) {
                window.opener.postMessage(
                    {
                        type: "GITHUB_AUTH_ERROR",
                        error: error,
                    },
                    window.location.origin
                );
                window.close();
            } else {
                toast.error("GitHub authentication failed");
                navigate("/auth");
            }
            return;
        }

        if (code) {
            hasProcessedRef.current = true;
            setIsProcessing(true); // Mark as processing to prevent double execution

            // Check if this is opened as a popup (for repository selection)
            if (window.opener) {
                // Repository selection - send to parent window
                window.opener.postMessage(
                    {
                        type: "GITHUB_AUTH_SUCCESS",
                        code: code,
                    },
                    window.location.origin
                );
                window.close();
            } else {
                // Direct navigation (for login) - handle the login
                handleGithubLogin(code);
            }
        } else {
            // No code, redirect to auth
            navigate("/auth");
        }
    }, [searchParams, navigate, isProcessing]);

    const handleGithubLogin = async (code) => {
        const loadingToast = toast.loading("Signing in with GitHub...");

        try {
            const response = await axios.post(
                `${BASE_API_SERVER_URL}/auth/github-login`,
                { code },
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
            }

            toast.success("Welcome to SnapDeploy!", {
                id: loadingToast,
            });

            setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 500);
        } catch (err) {
            toast.error(err.response?.data?.message || "GitHub login failed", {
                id: loadingToast,
            });
            navigate("/auth");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Processing GitHub authentication...
                </p>
            </div>
        </div>
    );
};

export default GitHubCallback;
