const API = 'http://localhost:3000';

const authHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
});

export const getDriversData = async () => {
    const response = await fetch(`${API}/api/admins/get-drivers`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Failed to fetch drivers');
    return response.json();
};

export const sendTestEmail = async (recipientEmail, emailType) => {
    const response = await fetch(`${API}/api/admins/test-email`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ recipientEmail, emailType }),
    });
    if (!response.ok) throw new Error('Failed to send test email');
    return response.json();
};