import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
    User,
    Camera,
    Edit3,
    Save,
    X,
    Mail,
    Github,
    Calendar,
    Loader,
    Check,
    AlertCircle,
    Globe,
    Shield,
} from "lucide-react";
import { BASE_API_SERVER_URL } from "../constant/url";

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [editForm, setEditForm] = useState({
        fullName: "",
        username: "",
        email: "",
    });

    // Fetch current user data
    const fetchUserData = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("accessToken");

            const response = await axios.get(`${BASE_API_SERVER_URL}/auth/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json, text/plain, */*",
                },
            });

            setUser(response.data);
            setEditForm({
                fullName: response.data.fullName || "",
                username: response.data.username || "",
                email: response.data.email || "",
            });
        } catch (err) {
            setError("Failed to fetch user data");
        } finally {
            setLoading(false);
        }
    };

    // Handle profile photo upload
    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file");
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB");
            return;
        }

        try {
            setUploading(true);
            setError(null);

            const token = Cookies.get("accessToken");
            const formData = new FormData();
            formData.append("profilePhoto", file);

            const response = await axios.patch(
                `${BASE_API_SERVER_URL}/auth/update-profile-photo`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setUser(response.data.user);
            setSuccess("Profile photo updated successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload photo");
        } finally {
            setUploading(false);
        }
    };

    // Handle profile details update
    const handleUpdateDetails = async () => {
        try {
            setUpdating(true);
            setError(null);

            const token = Cookies.get("accessToken");

            // Only send fields that have changed
            const updates = {};
            if (editForm.fullName !== user.fullName)
                updates.fullName = editForm.fullName;
            if (editForm.username !== user.username)
                updates.username = editForm.username;
            if (editForm.email !== user.email) updates.email = editForm.email;

            if (Object.keys(updates).length === 0) {
                setIsEditing(false);
                return;
            }

            const response = await axios.patch(
                `${BASE_API_SERVER_URL}/auth/update`,
                updates,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            setUser(response.data.user);
            setIsEditing(false);
            setSuccess("Profile updated successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleEditCancel = () => {
        setEditForm({
            fullName: user.fullName || "",
            username: user.username || "",
            email: user.email || "",
        });
        setIsEditing(false);
        setError(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full mx-auto mb-4 animate-pulse"></div>
                        <Loader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Loading your profile
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please wait while we fetch your information...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Failed to load profile
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        We couldn't fetch your profile information
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* Success/Error Messages */}
                {success && (
                    <div className="fixed top-4 right-4 z-50 max-w-md">
                        <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-right">
                            <Check className="h-5 w-5 flex-shrink-0" />
                            <p className="font-medium">{success}</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="fixed top-4 right-4 z-50 max-w-md">
                        <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-right">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="font-medium">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="ml-2 hover:bg-red-600 rounded p-1"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
                    <div className="text-center">
                        {/* Profile Photo */}
                        <div className="relative inline-block mb-6">
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-full border-4 border-gray-200 dark:border-gray-600 shadow-xl overflow-hidden bg-white dark:bg-gray-800 relative mx-auto">
                                    {user.profilePhoto ? (
                                        <img
                                            src={user.profilePhoto}
                                            alt={user.fullName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                                e.target.nextSibling.style.display =
                                                    "flex";
                                            }}
                                        />
                                    ) : null}

                                    {/* Fallback avatar */}
                                    <div
                                        className={`w-full h-full ${
                                            user.profilePhoto
                                                ? "hidden"
                                                : "flex"
                                        } items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600`}
                                        style={{
                                            display: user.profilePhoto
                                                ? "none"
                                                : "flex",
                                        }}
                                    >
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                user.fullName
                                            )}&size=200&background=6366f1&color=ffffff&bold=true`}
                                            alt={user.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {uploading && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                            <Loader className="animate-spin h-10 w-10 text-white" />
                                        </div>
                                    )}

                                    {/* Hover overlay for photo upload */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="text-white text-center">
                                            <Camera className="h-8 w-8 mx-auto mb-2" />
                                            <span className="text-sm font-medium">
                                                Update Photo
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Camera Button */}
                                <label className="absolute bottom-3 right-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110">
                                    <Camera className="h-5 w-5" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>

                                {/* Click overlay for better UX */}
                                <label className="absolute inset-0 cursor-pointer rounded-full">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    {user.fullName}
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                                    @{user.username}
                                </p>
                            </div>

                            {/* Status Badges */}
                            <div className="flex items-center justify-center gap-6 flex-wrap">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-full">
                                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        Joined {formatDate(user.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full">
                                    <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                                        Verified Account
                                    </span>
                                </div>
                                {user.isGithubConnected && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                                        <Github className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                                            GitHub Connected
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Account Status Card */}
                    <div className="xl:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 h-fit">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary-600" />
                                Account Status
                            </h3>
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                        {user.isGithubConnected ? (
                                            <Github className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                                        ) : (
                                            <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                GitHub
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {user.isGithubConnected ? (
                                                    <>
                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                        <span className="text-green-600 dark:text-green-400 font-medium text-sm">
                                                            Connected
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                            Not connected
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Profile
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-green-600 dark:text-green-400 font-medium text-sm">
                                                    Complete
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400 block">
                                                Member since
                                            </span>
                                            <p className="text-gray-900 dark:text-white font-medium">
                                                {formatDate(user.createdAt)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400 block">
                                                Last updated
                                            </span>
                                            <p className="text-gray-900 dark:text-white font-medium">
                                                {formatDate(user.updatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="xl:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                        <User className="h-6 w-6 text-primary-600" />
                                        Personal Information
                                    </h3>

                                    {/* Edit Button */}
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleUpdateDetails}
                                                disabled={updating}
                                                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 shadow-lg font-medium"
                                            >
                                                {updating ? (
                                                    <Loader className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Save className="h-4 w-4" />
                                                )}
                                                Save Changes
                                            </button>
                                            <button
                                                onClick={handleEditCancel}
                                                disabled={updating}
                                                className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 shadow-lg font-medium"
                                            >
                                                <X className="h-4 w-4" />
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Full Name */}
                                    <div className="group">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                            <User className="h-4 w-4 text-primary-600" />
                                            Full Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.fullName}
                                                onChange={(e) =>
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        fullName:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                                                placeholder="Enter your full name"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 group-hover:bg-gray-100 dark:group-hover:bg-gray-800/50 transition-colors">
                                                <span className="text-gray-900 dark:text-white font-medium">
                                                    {user.fullName}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Username */}
                                    <div className="group">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                            <User className="h-4 w-4 text-primary-600" />
                                            Username
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.username}
                                                onChange={(e) =>
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        username:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                                                placeholder="Enter your username"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 group-hover:bg-gray-100 dark:group-hover:bg-gray-800/50 transition-colors">
                                                <span className="text-gray-900 dark:text-white font-medium">
                                                    @{user.username}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="group md:col-span-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-primary-600" />
                                            Email Address
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) =>
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        email: e.target.value,
                                                    }))
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                                                placeholder="Enter your email"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 group-hover:bg-gray-100 dark:group-hover:bg-gray-800/50 transition-colors">
                                                <span className="text-gray-900 dark:text-white font-medium">
                                                    {user.email}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* GitHub Integration */}
                                    <div className="group md:col-span-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                            <Github className="h-4 w-4 text-primary-600" />
                                            GitHub Integration
                                        </label>
                                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 group-hover:bg-gray-100 dark:group-hover:bg-gray-800/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {user.isGithubConnected ? (
                                                        <>
                                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                            <span className="text-green-700 dark:text-green-400 font-semibold">
                                                                Connected to
                                                                GitHub
                                                            </span>
                                                            {user.githubUsername && (
                                                                <span className="text-gray-600 dark:text-gray-400 text-sm">
                                                                    (@
                                                                    {
                                                                        user.githubUsername
                                                                    }
                                                                    )
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                                                                Not connected
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                {!user.isGithubConnected && (
                                                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors px-3 py-1 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 rounded-lg">
                                                        Connect
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
