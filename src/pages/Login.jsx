import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

export function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!username || !password) { setError("Please enter both username and password"); return; }
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:3000/api/admins/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.accessToken);
                const decodedUser = jwtDecode(data.accessToken);
                login(decodedUser);
                navigate("/admin-dashboard");
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Invalid credentials. Please try again.");
            }
        } catch {
            setError("Unable to connect to the server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#f4f6f9]">
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-[45%] bg-[#1a2340] flex-col justify-between p-12">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1a2340]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 16c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V8H8v8zm2-6h4v5h-4v-5zm6-7H8l-1 2H4c-1.1 0-2 .9-2 2v1c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3l-1-2z"/>
                            </svg>
                        </div>
                        <span className="text-white font-bold text-xl">EduRide</span>
                    </div>
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                        Admin<br />Management<br />Portal
                    </h1>
                    <p className="text-[#8a9bb8] text-base leading-relaxed max-w-xs">
                        Manage driver verifications, monitor transportation activity, and oversee platform operations.
                    </p>
                    <div className="mt-10 grid grid-cols-3 gap-4">
                        {[["Drivers", "Manage & verify"], ["Emails", "Test & monitor"], ["Platform", "Full access"]].map(([t, s]) => (
                            <div key={t} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-white font-semibold text-sm">{t}</p>
                                <p className="text-[#8a9bb8] text-xs mt-1">{s}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-[#8a9bb8] text-xs">&copy; {new Date().getFullYear()} EduRide. All rights reserved.</p>
            </div>

            {/* Right login form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
                        <div className="w-8 h-8 bg-[#1a2340] rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 16c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V8H8v8zm2-6h4v5h-4v-5zm6-7H8l-1 2H4c-1.1 0-2 .9-2 2v1c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3l-1-2z"/>
                            </svg>
                        </div>
                        <span className="text-[#1a2340] font-bold text-xl">EduRide</span>
                    </div>
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#1a2340]">Sign in</h2>
                        <p className="text-sm text-gray-500 mt-1">Enter your administrator credentials</p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2340] focus:border-transparent placeholder-gray-400"
                                placeholder="Enter your username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2340] focus:border-transparent placeholder-gray-400"
                                    placeholder="Enter your password"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading}
                            className="w-full py-3 px-4 bg-[#1a2340] hover:bg-[#242b4d] text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a2340] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : "Sign in"}
                        </button>
                    </form>
                    <p className="mt-8 text-center text-xs text-gray-400">
                        Restricted access &mdash; authorized personnel only
                    </p>
                </div>
            </div>
        </div>
    );
}
