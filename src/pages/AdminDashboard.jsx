import {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../context/AuthContext';
import {getDriversData} from "../api/backend.js";

export function AdminDashboard() {
    const {user, logout} = useContext(AuthContext);
    const [selectedTab, setSelectedTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const driversData = await getDriversData();
                console.log(driversData);
                setDrivers(driversData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredDrivers = drivers.filter(driver =>
        (selectedTab === 'all' ||
            (selectedTab === 'pending' && driver.is_pending === 1) ||
            (selectedTab === 'verified' && driver.is_verified === 1) ||
            (selectedTab === 'rejected' && driver.verification_status === 'not_verified')) &&
        (driver.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const confirmAction = (action, driverId) => {
        setConfirmationAction(action);
        setShowConfirmation(true);
    };

    const executeAction = async () => {
        if (confirmationAction === 'approve') {
            await approveDriver(selectedDriver.user_id);
        } else if (confirmationAction === 'reject') {
            await rejectDriver(selectedDriver.user_id);
        } else if (confirmationAction === 'delete') {
            await deleteDriver(selectedDriver.user_id);
        }
        setShowConfirmation(false);
    };

    const approveDriver = async (userId) => {
        try {
            setActionType('approve');
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/admins/verify-driver/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({status: 'verified'})
            });

            if (!response.ok) {
                throw new Error('Failed to approve driver');
            }

            // Refresh driver data
            const driversData = await getDriversData();
            setDrivers(driversData);
            setSelectedDriver(null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setActionType(null);
        }
    };

    const deleteDriver = async (userId) => {
        try {
            setActionType('delete');
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/admins/delete-driver/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete driver');
            }

            const driversData = await getDriversData();
            setDrivers(driversData);
            setSelectedDriver(null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setActionType(null);
        }
    };

    const rejectDriver = async (userId) => {
        try {
            setActionType('reject');
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/admins/reject-driver/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({status: 'rejected'})
            });

            if (!response.ok) {
                throw new Error('Failed to reject driver');
            }

            // Refresh driver data
            const driversData = await getDriversData();
            setDrivers(driversData);
            setSelectedDriver(null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setActionType(null);
        }
    };

    const handleImageClick = (imageSrc, alt) => {
        setZoomedImage({src: imageSrc, alt});
    };

    const isPending = selectedDriver?.is_pending === 1;
    const canTakeAction = isPending && !loading;

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
                        {loading && !selectedDriver ? (
                            <div className="flex justify-center items-center py-12">
                                <div
                                    className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#475A99]"></div>
                                <span className="ml-3 text-sm text-gray-500">Loading drivers...</span>
                            </div>
                        ) : (
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
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {driver.selfie_url ? (
                                                            <img className="h-10 w-10 rounded-full object-cover"
                                                                 src={`http://localhost:3000/${driver.selfie_url}`}
                                                                 alt={driver.full_name}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                                {driver.full_name?.charAt(0).toUpperCase() || '?'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div
                                                            className="text-sm font-medium text-gray-900">{driver.full_name}</div>
                                                        <div className="text-sm text-gray-500">{driver.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{driver.phone_num}</div>
                                                <div className="text-sm text-gray-500">{driver.address}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
    <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            driver.verification_status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : driver.verification_status === 'auto_approved'
                    ? 'bg-blue-100 text-blue-800'
                    : driver.verification_status === 'auto_disapproved'
                        ? 'bg-orange-100 text-orange-800'
                        : driver.verification_status === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
        }`}
    >
        {driver.verification_status === 'pending'
            ? 'Pending'
            : driver.verification_status === 'auto_approved'
                ? 'Auto Approved'
                : driver.verification_status === 'auto_disapproved'
                    ? 'Auto Disapproved'
                    : driver.verification_status === 'verified'
                        ? 'Verified'
                        : 'Rejected'}
    </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(driver.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => setSelectedDriver(driver)}
                                                    className="text-[#475A99] hover:text-[#364573] mr-3"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                            No drivers found.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Verification Modal */}
            {selectedDriver && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">Driver Verification</h3>
                                <button
                                    onClick={() => !loading && setSelectedDriver(null)}
                                    className={`text-gray-400 hover:text-gray-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={loading}
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-4">
                            <div className="mb-6">
                                <h4 className="text-base font-medium text-gray-700 mb-2">Driver Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-500">Full Name:</span>
                                        <p className="text-sm font-medium">{selectedDriver.full_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Email:</span>
                                        <p className="text-sm font-medium">{selectedDriver.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Phone Number:</span>
                                        <p className="text-sm font-medium">{selectedDriver.phone_num}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Date of Birth:</span>
                                        <p className="text-sm font-medium">
                                            {selectedDriver.date_of_birth
                                                ? new Date(selectedDriver.date_of_birth).toLocaleDateString()
                                                : 'Not available'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Address:</span>
                                        <p className="text-sm font-medium">{selectedDriver.address}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Registered At:</span>
                                        <p className="text-sm font-medium">
                                            {selectedDriver.registered_at
                                                ? new Date(selectedDriver.registered_at).toLocaleString()
                                                : 'Not available'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Current Status:</span>
                                        <p className={`text-sm font-medium ${
                                            selectedDriver.verification_status === 'pending'
                                                ? 'text-yellow-800'
                                                : selectedDriver.verification_status === 'auto_approved'
                                                    ? 'text-blue-800'
                                                    : selectedDriver.verification_status === 'auto_disapproved'
                                                        ? 'text-orange-800'
                                                        : selectedDriver.verification_status === 'verified'
                                                            ? 'text-green-800'
                                                            : 'text-red-800'
                                        }`}>
                                            {selectedDriver.verification_status === 'pending'
                                                ? 'Pending'
                                                : selectedDriver.verification_status === 'auto_approved'
                                                    ? 'Auto Approved'
                                                    : selectedDriver.verification_status === 'auto_disapproved'
                                                        ? 'Auto Disapproved'
                                                        : selectedDriver.verification_status === 'verified'
                                                            ? 'Verified'
                                                            : 'Rejected'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 border-b">
                                        <h4 className="font-medium text-gray-700">Driver's License</h4>
                                    </div>
                                    <div className="p-4">
                                        <img
                                            src={`http://localhost:3000/${selectedDriver.license_image_url}`}
                                            alt="Driver's License"
                                            className="w-full h-52 object-cover object-center rounded cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => handleImageClick(`http://localhost:3000/${selectedDriver.license_image_url}`, "Driver's License")}
                                        />
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">License Number:</span>
                                                <span
                                                    className="text-sm font-medium">{selectedDriver.license_number}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Expiry Date:</span>
                                                <span className="text-sm font-medium">
                                                    {selectedDriver.license_expiry
                                                        ? new Date(selectedDriver.license_expiry).toLocaleDateString()
                                                        : 'Not available'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 border-b">
                                        <h4 className="font-medium text-gray-700">National ID Card</h4>
                                    </div>
                                    <div className="p-4">
                                        <img
                                            src={`http://localhost:3000/${selectedDriver.nic_image_url}`}
                                            alt="National ID Card"
                                            className="w-full h-52 object-cover object-center rounded cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => handleImageClick(`http://localhost:3000/${selectedDriver.nic_image_url}`, "National ID Card")}
                                        />
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">NIC Number:</span>
                                                <span className="text-sm font-medium">{selectedDriver.nic_number}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Date of Birth:</span>
                                                <span className="text-sm font-medium">
                                                    {selectedDriver.date_of_birth
                                                        ? new Date(selectedDriver.date_of_birth).toLocaleDateString()
                                                        : 'Not available'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 border-b">
                                        <h4 className="font-medium text-gray-700">Selfie</h4>
                                    </div>
                                    <div className="p-4">
                                        <img
                                            src={`http://localhost:3000/${selectedDriver.selfie_url}`}
                                            alt="Selfie"
                                            className="w-full h-52 object-cover object-center rounded cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => handleImageClick(`http://localhost:3000/${selectedDriver.selfie_url}`, "Selfie")}
                                        />
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Uploaded On:</span>
                                                <span className="text-sm font-medium">
                                                    {new Date(selectedDriver.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status message for already verified/rejected drivers */}
                            {!isPending && (
                                <div className={`mb-4 p-3 rounded-md ${
                                    selectedDriver.is_verified === 1
                                        ? 'bg-green-50 text-green-800 border border-green-200'
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                }`}>
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            {selectedDriver.is_verified === 1 ? (
                                                <svg className="h-5 w-5 text-green-400"
                                                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                     fill="currentColor">
                                                    <path fillRule="evenodd"
                                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                          clipRule="evenodd"/>
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg"
                                                     viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd"
                                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                          clipRule="evenodd"/>
                                                </svg>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium">
                                                {selectedDriver.is_verified === 1
                                                    ? 'This driver has already been verified'
                                                    : 'This driver has been rejected'}
                                            </h3>
                                            <div className="mt-2 text-sm">
                                                <p>
                                                    {selectedDriver.is_verified === 1
                                                        ? 'The driver has been approved and can now provide transportation services.'
                                                        : 'The driver verification has been rejected and cannot provide transportation services.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Verification actions */}
                            <div className="flex justify-end mt-6 gap-4">
                                <button
                                    onClick={() => !loading && setSelectedDriver(null)}
                                    disabled={loading}
                                    className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#475A99] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Close
                                </button>

                                {/* Delete button — always available */}
                                <button
                                    onClick={() => confirmAction('delete', selectedDriver.user_id)}
                                    disabled={loading}
                                    className={`px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 flex items-center justify-center min-w-[5rem] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading && actionType === 'delete' ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                 xmlns="http://www.w3.org/2000/svg" fill="none"
                                                 viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor"
                                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : 'Delete Account'}
                                </button>

                                {/* Only show approve/reject buttons for pending drivers */}
                                {canTakeAction && (
                                    <>
                                        <button
                                            onClick={() => confirmAction('reject', selectedDriver.id)}
                                            disabled={loading}
                                            className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center min-w-[5rem] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {loading && actionType === 'reject' ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                         xmlns="http://www.w3.org/2000/svg" fill="none"
                                                         viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                                                stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor"
                                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Rejecting...
                                                </>
                                            ) : 'Reject'}
                                        </button>
                                        <button
                                            onClick={() => confirmAction('approve', selectedDriver.id)}
                                            disabled={loading}
                                            className={`px-4 py-2 bg-[#475A99] text-white rounded-md hover:bg-[#364573] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#475A99] flex items-center justify-center min-w-[5rem] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {loading && actionType === 'approve' ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                         xmlns="http://www.w3.org/2000/svg" fill="none"
                                                         viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                                                stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor"
                                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Approving...
                                                </>
                                            ) : 'Approve'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="sm:flex sm:items-start">
                            <div
                                className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                                    confirmationAction === 'approve' ? 'bg-green-100' : confirmationAction === 'delete' ? 'bg-red-200' : 'bg-red-100'
                                } sm:mx-0 sm:h-10 sm:w-10`}>
                                {confirmationAction === 'approve' ? (
                                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg"
                                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M5 13l4 4L19 7"/>
                                    </svg>
                                ) : confirmationAction === 'delete' ? (
                                    <svg className="h-6 w-6 text-red-700" xmlns="http://www.w3.org/2000/svg"
                                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                )}
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {confirmationAction === 'approve' ? 'Approve Driver' : confirmationAction === 'delete' ? 'Delete Account' : 'Reject Driver'}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {confirmationAction === 'approve'
                                            ? `Are you sure you want to approve ${selectedDriver?.full_name}? This will grant them access to accept ride requests.`
                                            : confirmationAction === 'delete'
                                                ? `Are you sure you want to permanently delete ${selectedDriver?.full_name}'s account? This cannot be undone and will remove all associated data.`
                                                : `Are you sure you want to reject ${selectedDriver?.full_name}? They will need to resubmit their documents.`
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                onClick={executeAction}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                                    confirmationAction === 'approve'
                                        ? 'bg-[#475A99] hover:bg-[#364573] focus:ring-[#475A99]'
                                        : confirmationAction === 'delete'
                                            ? 'bg-red-700 hover:bg-red-800 focus:ring-red-700'
                                            : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
                            >
                                {confirmationAction === 'approve' ? 'Approve' : confirmationAction === 'delete' ? 'Delete' : 'Reject'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(false)}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#475A99] sm:mt-0 sm:w-auto sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Zoom Modal */}
            {zoomedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
                     onClick={() => setZoomedImage(null)}>
                    <div className="relative max-w-4xl w-full">
                        <button
                            className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                setZoomedImage(null);
                            }}
                        >
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                        <img
                            src={zoomedImage.src}
                            alt={zoomedImage.alt}
                            className="max-h-[80vh] max-w-full mx-auto object-contain rounded shadow-lg"
                        />
                        <div className="mt-4 text-center text-white text-sm">{zoomedImage.alt}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
