import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getDriversData, sendTestEmail } from "../api/backend.js";

const API = "http://localhost:3000";

const STATUS_MAP = {
    pending:          { label: "Pending",         cls: "bg-amber-100 text-amber-800"   },
    auto_approved:    { label: "Auto Approved",   cls: "bg-blue-100 text-blue-800"     },
    auto_disapproved: { label: "Auto Disapproved",cls: "bg-orange-100 text-orange-800" },
    verified:         { label: "Verified",        cls: "bg-green-100 text-green-800"   },
    not_verified:     { label: "Rejected",        cls: "bg-red-100 text-red-800"       },
};

const EMAIL_TYPES = [
    { value: "welcome",          label: "Welcome / Account Created" },
    { value: "pickup",           label: "Student Picked Up"         },
    { value: "dropoff",          label: "Student Dropped Off"       },
    { value: "absence",          label: "Student Absence"           },
    { value: "payment_reminder", label: "Payment Reminder"          },
    { value: "driver_approved",  label: "Driver Approved"           },
    { value: "driver_rejected",  label: "Driver Rejected"           },
    { value: "account_removed",  label: "Account Removed"           },
];

function Spinner({ small }) {
    return (
        <svg className={`animate-spin ${small ? "h-4 w-4" : "h-5 w-5"} text-white`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );
}

function StatusBadge({ status }) {
    const s = STATUS_MAP[status] || { label: status, cls: "bg-gray-100 text-gray-700" };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

function Avatar({ url, name, size = 10 }) {
    const px = size * 4;
    const style = { width: px, height: px, minWidth: px, minHeight: px };
    return url ? (
        <img className="rounded-full object-cover flex-shrink-0" style={style} src={`${API}/${url}`} alt={name} />
    ) : (
        <div className="rounded-full bg-[#eef0f9] text-[#1a2340] flex items-center justify-center text-sm font-semibold flex-shrink-0" style={style}>
            {name?.charAt(0).toUpperCase() || "?"}
        </div>
    );
}

export function AdminDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [activePage, setActivePage] = useState("drivers");
    const [selectedTab, setSelectedTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Email tester state
    const [testEmail, setTestEmail] = useState("");
    const [testEmailType, setTestEmailType] = useState("welcome");
    const [testEmailLoading, setTestEmailLoading] = useState(false);
    const [testEmailResult, setTestEmailResult] = useState(null);

    useEffect(() => {
        (async () => {
            try { setLoading(true); setDrivers(await getDriversData()); }
            catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const filtered = drivers.filter(d =>
        (selectedTab === "all" ||
         (selectedTab === "pending"  && d.is_pending === 1) ||
         (selectedTab === "verified" && d.is_verified === 1 && d.is_pending === 0) ||
         (selectedTab === "rejected" && d.verification_status === "not_verified")) &&
        d.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total:    drivers.length,
        pending:  drivers.filter(d => d.is_pending === 1).length,
        verified: drivers.filter(d => d.is_verified === 1 && d.is_pending === 0).length,
        rejected: drivers.filter(d => d.verification_status === "not_verified").length,
    };

    const runAction = async (action) => {
        const userId = selectedDriver.user_id;
        setLoading(true); setActionType(action);
        try {
            const token = localStorage.getItem("token");
            const opts = { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } };
            if (action === "approve") await fetch(`${API}/api/admins/verify-driver/${userId}`, { method: "PUT", ...opts, body: JSON.stringify({status:"verified"}) });
            else if (action === "reject") await fetch(`${API}/api/admins/reject-driver/${userId}`, { method: "PUT", ...opts, body: JSON.stringify({status:"rejected"}) });
            else if (action === "delete") await fetch(`${API}/api/admins/delete-driver/${userId}`, { method: "DELETE", ...opts });
            setDrivers(await getDriversData());
            setSelectedDriver(null);
        } catch (e) { console.error(e); }
        finally { setLoading(false); setActionType(null); setConfirmAction(null); }
    };

    const handleTestEmail = async (e) => {
        e.preventDefault();
        if (!testEmail) return;
        setTestEmailLoading(true);
        setTestEmailResult(null);
        try {
            await sendTestEmail(testEmail, testEmailType);
            setTestEmailResult({ success: true, msg: `Test email sent to ${testEmail}` });
        } catch {
            setTestEmailResult({ success: false, msg: "Failed to send test email. Check server logs." });
        } finally {
            setTestEmailLoading(false);
        }
    };

    const isPending = selectedDriver?.is_pending === 1;

    const NAV = [
        { id: "drivers", label: "Drivers",      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        { id: "emails",  label: "Email Tester", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    ];

    return (
        <div className="flex h-screen bg-[#f4f6f9] overflow-hidden">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? "w-60" : "w-16"} flex-shrink-0 bg-[#1a2340] flex flex-col transition-all duration-200`}>
                <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                    <div className="w-8 h-8 flex-shrink-0 bg-white rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1a2340]" viewBox="0 0 24 24" fill="currentColor"><path d="M8 16c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V8H8v8zm2-6h4v5h-4v-5zm6-7H8l-1 2H4c-1.1 0-2 .9-2 2v1c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3l-1-2z"/></svg>
                    </div>
                    {sidebarOpen && <span className="text-white font-bold text-base">EduRide</span>}
                </div>
                <nav className="flex-1 py-4 px-2 space-y-1">
                    {NAV.map(n => (
                        <button key={n.id} onClick={() => setActivePage(n.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activePage === n.id ? "bg-white/10 text-white" : "text-[#8a9bb8] hover:text-white hover:bg-white/5"}`}>
                            <span className="flex-shrink-0">{n.icon}</span>
                            {sidebarOpen && <span>{n.label}</span>}
                        </button>
                    ))}
                </nav>
                <div className="p-3 border-t border-white/10">
                    <button onClick={logout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#8a9bb8] hover:text-red-400 hover:bg-white/5 transition-colors`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        {sidebarOpen && <span>Sign out</span>}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h1 className="text-base font-semibold text-gray-800">
                            {activePage === "drivers" ? "Driver Management" : "Email Tester"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-800">{user?.name || "Admin"}</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-[#1a2340] text-white flex items-center justify-center text-sm font-semibold">
                            {user?.username?.charAt(0).toUpperCase() || "A"}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {/*  DRIVERS PAGE  */}
                    {activePage === "drivers" && (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {[
                                    { label: "Total Drivers",  value: stats.total,    color: "text-[#1a2340]" },
                                    { label: "Pending Review", value: stats.pending,  color: "text-amber-600" },
                                    { label: "Verified",       value: stats.verified, color: "text-green-600" },
                                    { label: "Rejected",       value: stats.rejected, color: "text-red-600"   },
                                ].map(s => (
                                    <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
                                        <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Table card */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                                {/* Filters + search */}
                                <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex gap-1">
                                        {["all","pending","verified","rejected"].map(tab => (
                                            <button key={tab} onClick={() => setSelectedTab(tab)}
                                                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${selectedTab === tab ? "bg-[#1a2340] text-white" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"}`}>
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2340] focus:border-transparent w-56"
                                            placeholder="Search drivers..." />
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    {loading && drivers.length === 0 ? (
                                        <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                                            <span className="text-sm">Loading drivers...</span>
                                        </div>
                                    ) : (
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    {["Driver","Contact","Status","Joined",""].map(h => (
                                                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filtered.length > 0 ? filtered.map(d => (
                                                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar url={d.selfie_url} name={d.full_name} />
                                                                <div>
                                                                    <p className="text-sm font-semibold text-gray-900">{d.full_name}</p>
                                                                    <p className="text-xs text-gray-500">{d.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-800">{d.phone_num}</p>
                                                            <p className="text-xs text-gray-500 max-w-[200px] truncate">{d.address}</p>
                                                        </td>
                                                        <td className="px-6 py-4"><StatusBadge status={d.verification_status} /></td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(d.created_at).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={() => setSelectedDriver(d)} className="text-sm font-medium text-[#1a2340] hover:underline">Review</button>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-400">No drivers found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/*  EMAIL TESTER PAGE  */}
                    {activePage === "emails" && (
                        <div className="max-w-2xl">
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold text-[#1a2340]">Send Test Email</h2>
                                    <p className="text-sm text-gray-500 mt-1">Send a sample email to verify templates and delivery are working correctly.</p>
                                </div>
                                <form onSubmit={handleTestEmail} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Recipient Email Address</label>
                                        <input type="email" required value={testEmail} onChange={e => setTestEmail(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2340] focus:border-transparent placeholder-gray-400"
                                            placeholder="test@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Template</label>
                                        <select value={testEmailType} onChange={e => setTestEmailType(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2340] focus:border-transparent bg-white">
                                            {EMAIL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </div>

                                    {/* Template preview info */}
                                    <div className="bg-[#f8fafc] rounded-lg p-4 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Template Preview</p>
                                        <p className="text-sm text-gray-700 font-medium">{EMAIL_TYPES.find(t => t.value === testEmailType)?.label}</p>
                                        <p className="text-xs text-gray-400 mt-1">A sample email using placeholder data will be sent to the address above.</p>
                                    </div>

                                    <button type="submit" disabled={testEmailLoading}
                                        className="w-full py-3 px-4 bg-[#1a2340] hover:bg-[#242b4d] text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        {testEmailLoading ? <><Spinner small /> Sending...</> : "Send Test Email"}
                                    </button>
                                </form>

                                {testEmailResult && (
                                    <div className={`mt-5 flex items-start gap-3 rounded-lg p-4 border ${testEmailResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                                        {testEmailResult.success ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                        )}
                                        <p className={`text-sm font-medium ${testEmailResult.success ? "text-green-800" : "text-red-700"}`}>{testEmailResult.msg}</p>
                                    </div>
                                )}
                            </div>

                            {/* Email type reference */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-4 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h3 className="text-sm font-semibold text-[#1a2340]">Available Email Templates</h3>
                                </div>
                                <table className="w-full">
                                    <thead><tr className="border-b border-gray-50"><th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Template</th><th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Trigger</th></tr></thead>
                                    <tbody className="divide-y divide-gray-50 text-sm">
                                        {[
                                            ["Welcome / Account Created", "New parent account registered"],
                                            ["Student Picked Up",         "Driver marks student as picked up"],
                                            ["Student Dropped Off",       "Driver marks student as dropped off"],
                                            ["Student Absence",           "Driver marks student absent"],
                                            ["Payment Reminder",          "Scheduled cron job on due date"],
                                            ["Driver Approved",           "Admin approves driver verification"],
                                            ["Driver Rejected",           "Admin rejects driver verification"],
                                            ["Account Removed",           "Admin deletes a driver account"],
                                        ].map(([t, d]) => (
                                            <tr key={t} className="hover:bg-gray-50">
                                                <td className="px-6 py-3 font-medium text-gray-800">{t}</td>
                                                <td className="px-6 py-3 text-gray-500">{d}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/*  DRIVER DETAIL MODAL  */}
            {selectedDriver && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto">
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <Avatar url={selectedDriver.selfie_url} name={selectedDriver.full_name} size={12} />
                                <div>
                                    <h3 className="text-lg font-bold text-[#1a2340]">{selectedDriver.full_name}</h3>
                                    <p className="text-sm text-gray-500">{selectedDriver.email}</p>
                                </div>
                                <StatusBadge status={selectedDriver.verification_status} />
                            </div>
                            <button onClick={() => !loading && setSelectedDriver(null)} disabled={loading}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="px-8 py-6">
                            {/* Info grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {[
                                    ["Phone",       selectedDriver.phone_num],
                                    ["Address",     selectedDriver.address],
                                    ["Date of Birth", selectedDriver.date_of_birth ? new Date(selectedDriver.date_of_birth).toLocaleDateString() : "N/A"],
                                    ["Registered",  selectedDriver.registered_at ? new Date(selectedDriver.registered_at).toLocaleDateString() : "N/A"],
                                ].map(([l, v]) => (
                                    <div key={l} className="bg-[#f8fafc] rounded-xl p-4">
                                        <p className="text-xs text-gray-400 font-medium mb-1">{l}</p>
                                        <p className="text-sm font-semibold text-[#1a2340] break-words">{v}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Documents */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                                {[
                                    { title: "Driver's License", url: selectedDriver.license_image_url, details: [["License No.", selectedDriver.license_number], ["Expiry", selectedDriver.license_expiry ? new Date(selectedDriver.license_expiry).toLocaleDateString() : "N/A"]] },
                                    { title: "National ID Card",  url: selectedDriver.nic_image_url,     details: [["NIC Number", selectedDriver.nic_number], ["Date of Birth", selectedDriver.date_of_birth ? new Date(selectedDriver.date_of_birth).toLocaleDateString() : "N/A"]] },
                                    { title: "Selfie Photo",      url: selectedDriver.selfie_url,        details: [["Uploaded", new Date(selectedDriver.created_at).toLocaleDateString()]] },
                                ].map(doc => (
                                    <div key={doc.title} className="border border-gray-100 rounded-xl overflow-hidden">
                                        <div className="bg-[#f8fafc] px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-[#1a2340]">{doc.title}</p>
                                        </div>
                                        <div className="p-4">
                                            <img src={`${API}/${doc.url}`} alt={doc.title}
                                                className="w-full h-44 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => setZoomedImage({ src: `${API}/${doc.url}`, alt: doc.title })} />
                                            <div className="mt-3 space-y-1.5">
                                                {doc.details.map(([l, v]) => (
                                                    <div key={l} className="flex justify-between text-sm">
                                                        <span className="text-gray-400">{l}</span>
                                                        <span className="font-medium text-gray-800">{v}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Status banner for non-pending */}
                            {!isPending && (
                                <div className={`mb-6 rounded-xl p-4 flex items-start gap-3 ${selectedDriver.is_verified ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                                    <svg className={`h-5 w-5 flex-shrink-0 mt-0.5 ${selectedDriver.is_verified ? "text-green-500" : "text-red-500"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        {selectedDriver.is_verified ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />}
                                    </svg>
                                    <p className={`text-sm font-medium ${selectedDriver.is_verified ? "text-green-800" : "text-red-700"}`}>
                                        {selectedDriver.is_verified ? "This driver is verified and active on the platform." : "This driver has been rejected and cannot provide transportation services."}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3">
                                <button onClick={() => !loading && setSelectedDriver(null)} disabled={loading}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Close</button>
                                <button onClick={() => setConfirmAction("delete")} disabled={loading}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 disabled:opacity-50 flex items-center gap-2">
                                    {loading && actionType === "delete" ? <><Spinner small />Deleting...</> : "Delete Account"}
                                </button>
                                {isPending && (
                                    <>
                                        <button onClick={() => setConfirmAction("reject")} disabled={loading}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2">
                                            {loading && actionType === "reject" ? <><Spinner small />Rejecting...</> : "Reject"}
                                        </button>
                                        <button onClick={() => setConfirmAction("approve")} disabled={loading}
                                            className="px-5 py-2.5 text-sm font-medium text-white bg-[#1a2340] rounded-lg hover:bg-[#242b4d] disabled:opacity-50 flex items-center gap-2">
                                            {loading && actionType === "approve" ? <><Spinner small />Approving...</> : "Approve"}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/*  CONFIRM MODAL  */}
            {confirmAction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmAction === "approve" ? "bg-green-100" : "bg-red-100"}`}>
                            {confirmAction === "approve" ? (
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z" /></svg>
                            )}
                        </div>
                        <h3 className="text-base font-bold text-[#1a2340] mb-2 capitalize">{confirmAction} {confirmAction === "delete" ? "Account" : "Driver"}</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {confirmAction === "approve" ? `Approve ${selectedDriver?.full_name}? They will gain full platform access.`
                             : confirmAction === "delete" ? `Permanently delete ${selectedDriver?.full_name}'s account? This cannot be undone.`
                             : `Reject ${selectedDriver?.full_name}? They will need to resubmit documents.`}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmAction(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={() => runAction(confirmAction)}
                                className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg flex items-center justify-center gap-2 ${confirmAction === "approve" ? "bg-[#1a2340] hover:bg-[#242b4d]" : "bg-red-600 hover:bg-red-700"}`}>
                                <span className="capitalize">{confirmAction}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/*  IMAGE ZOOM  */}
            {zoomedImage && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50" onClick={() => setZoomedImage(null)}>
                    <button className="absolute top-5 right-5 text-white hover:text-gray-300" onClick={e => { e.stopPropagation(); setZoomedImage(null); }}>
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <img src={zoomedImage.src} alt={zoomedImage.alt} className="max-h-[85vh] max-w-full rounded-xl shadow-2xl object-contain" />
                    <p className="absolute bottom-6 text-white/70 text-sm">{zoomedImage.alt}</p>
                </div>
            )}
        </div>
    );
}
