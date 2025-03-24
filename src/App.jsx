import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import {ProtectedRoute} from './components/ProtectedRoute';
import {Login} from './pages/Login';
import {AdminDashboard} from './pages/AdminDashboard';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login/>}/>
                    <Route element={<ProtectedRoute/>}>
                        <Route path="/admin-dashboard" element={<AdminDashboard/>}/>
                        {/* Add other protected routes inside this block */}
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;