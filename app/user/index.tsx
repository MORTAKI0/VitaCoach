// app/user/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button }        from 'react-native';
import { getCurrentUser, logout }     from '../../services/appwrite';
import { useRouter }                   from 'expo-router';

export default function UserDashboard() {
    const [user, setUser] = useState<{ name: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        getCurrentUser()
            .then(u => setUser(u))
            .catch(() => router.replace('/login'));
    }, []);

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <View className="flex-1 items-center justify-center bg-white px-4">
            <Text className="text-2xl font-bold mb-4">User Dashboard</Text>
            {user && <Text>Welcome, {user.name}!</Text>}
            <Button title="Logout" onPress={handleLogout} />
        </View>
    );
}
