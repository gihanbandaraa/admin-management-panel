import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

export function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/admins/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.accessToken); // Store the token in local storage
                const decodedUser = jwtDecode(data.accessToken);
                login(decodedUser); // Update the context with the user info
                console.log(decodedUser)
                navigate('/admin-dashboard'); // Redirect to the dashboard
            } else {
                const errorData = await response.json();
                setError(errorData.message);
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen">
            {/* Left panel with illustration/brand */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-[#242B4D] to-[#364573] flex-col justify-center items-center px-8 text-white">
                <div className="w-20 h-20 rounded-full bg-[#475A99] mb-6 flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold mb-3">Admin Dashboard</h1>
                <p className="text-center text-gray-300 max-w-xs">
                    Secure login for authorized administrative personnel only.
                </p>
                <div className="mt-12 w-4/5 h-64 bg-[#364573]/50 rounded-xl shadow-lg flex items-center justify-center backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                </div>
                <div className="absolute bottom-8 text-sm text-white/60">
                    &copy; EduRide Transport Management System
                </div>
            </div>

            {/* Right panel with login form */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="w-full max-w-md p-8">
                    <div className="text-center mb-8">
                        <div className="md:hidden w-20 h-20 rounded-full bg-[#242B4D] flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-[#242B4D]">Administrator Access</h1>
                        <p className="mt-2 text-gray-600">Enter your credentials to continue</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-6">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#475A99] focus:border-[#475A99] focus:outline-none transition-colors bg-white shadow-sm"
                                        placeholder="Admin username"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <a href="#" className="text-sm text-[#475A99] hover:text-[#364573] transition-colors">
                                        Reset password
                                    </a>
                                </div>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#475A99] focus:border-[#475A99] focus:outline-none transition-colors bg-white shadow-sm"
                                        placeholder="Admin password"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-[#475A99] border-gray-300 rounded focus:ring-[#475A99]"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Keep me signed in for 30 days
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group w-full flex justify-center items-center px-4 py-3 text-white bg-[#475A99] rounded-lg hover:bg-[#364573] focus:outline-none focus:ring-2 focus:ring-[#242B4D] focus:ring-offset-2 transition-colors shadow-md ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            )}
                            {isLoading ? 'Authenticating...' : 'Sign in to Dashboard'}
                        </button>
                    </form>

                    <div className="border-t border-gray-200 pt-6 mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            This is a secure system and unauthorized access is prohibited.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}