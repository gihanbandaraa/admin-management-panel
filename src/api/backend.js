export const getDriversData = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/admins/get-drivers', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

    export const verifyDriver = async (driverId) => {
        try {
            const response = await fetch(`http://localhost:3001/drivers/verify/${driverId}`, {
                method: 'PUT'
            });
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err);
        }
    }