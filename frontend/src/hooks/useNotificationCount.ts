import { useState, useEffect } from 'react';

export const useNotificationCount = () => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await fetch('/api/v1/notifications/count', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setCount(data.data?.count || 0);
                }
            } catch (error) {
                console.error('Error fetching notification count:', error);
                setCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchCount();
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    return { count, loading };
};
