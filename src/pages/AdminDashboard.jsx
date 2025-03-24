import {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../context/AuthContext';
import {getDriversData, verifyDriver} from "../api/backend.js";

export function AdminDashboard() {
    const {user, logout} = useContext(AuthContext);
    const [selectedTab, setSelectedTab] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [verificationResult, setVerificationResult] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [drivers, setDrivers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const driversData = await getDriversData();
                setDrivers(driversData);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    const filteredDrivers = drivers.filter(driver =>
        (selectedTab === 'all' ||
            (selectedTab === 'pending' && driver.is_pending === 1) ||
            (selectedTab === 'verified' && driver.is_verified === 1) ||
            (selectedTab === 'rejected' && driver.verification_status === 'rejected')) &&
        (driver.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const runAiVerification = (driver) => {
        setProcessing(true);

        // Simulate AI processing
        setTimeout(() => {
            setVerificationResult({
                faceMatch: true,
                ocrLicense: {
                    success: true,
                    number: driver.license_number,
                    name: driver.full_name,
                    expiry: "2025-06-30" // Placeholder since API doesn't provide this
                },
                ocrNic: {
                    success: true,
                    number: driver.nic_number,
                    name: driver.full_name
                },
                overallScore: 95
            });
            setProcessing(false);
        }, 2000);
    };

    const approveDriver = async () => {
        try {
            setProcessing(true);
            await verifyDriver(selectedDriver.id);
            // Refresh driver data after approval
            const updatedDrivers = await getDriversData();
            setDrivers(updatedDrivers);
            setSelectedDriver(null);
            setVerificationResult(null);
            setProcessing(false);
        } catch (error) {
            console.error(error);
            setProcessing(false);
        }
    };

    const rejectDriver = () => {
        // Handle driver rejection (implement the reject API call)
        alert('Driver rejected');
        setSelectedDriver(null);
        setVerificationResult(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top navigation */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-[#475A99] font-bold text-xl">Edu<span
                                className="text-gray-700">Ride</span></span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div
                                className="h-8 w-8 rounded-full bg-[#475A99] text-white flex items-center justify-center">
                                {user?.username?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="text-sm">
                                <div className="font-medium text-gray-700">{user?.name || 'Admin'}</div>
                                <div className="text-xs text-gray-500">Administrator</div>
                            </div>
                            <button onClick={logout} className="text-gray-500 hover:text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Driver Verification Dashboard</h1>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search drivers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#475A99] focus:border-[#475A99] focus:outline-none"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg">
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => setSelectedTab('all')}
                                className={`px-6 py-3 font-medium text-sm ${selectedTab === 'all' ? 'text-[#475A99] border-b-2 border-[#475A99]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                All Drivers
                            </button>
                            <button
                                onClick={() => setSelectedTab('pending')}
                                className={`px-6 py-3 font-medium text-sm ${selectedTab === 'pending' ? 'text-[#475A99] border-b-2 border-[#475A99]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setSelectedTab('verified')}
                                className={`px-6 py-3 font-medium text-sm ${selectedTab === 'verified' ? 'text-[#475A99] border-b-2 border-[#475A99]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Verified
                            </button>
                            <button
                                onClick={() => setSelectedTab('rejected')}
                                className={`px-6 py-3 font-medium text-sm ${selectedTab === 'rejected' ? 'text-[#475A99] border-b-2 border-[#475A99]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Rejected
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions
                                </th>
                            </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDrivers.length > 0 ? (
                                filteredDrivers.map(driver => (
                                    <tr key={driver.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-[#475A99] text-white flex items-center justify-center font-semibold">
                                                    {driver.full_name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{driver.full_name}</div>
                                                    <div className="text-xs text-gray-500">ID: {driver.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{driver.address}</div>
                                            <div className="text-xs text-gray-500">{driver.phone_num}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                    ${driver.is_pending === 1 ? 'bg-yellow-100 text-yellow-800' :
                                    driver.is_verified === 1 ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'}`}>
                                    {driver.verification_status.charAt(0).toUpperCase() + driver.verification_status.slice(1)}
                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(driver.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedDriver(driver)}
                                                className="text-[#475A99] hover:text-[#364573] mr-3">
                                                Verify
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        No drivers found matching your criteria
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
}