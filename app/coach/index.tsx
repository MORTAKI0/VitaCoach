// app/coach/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter }   from 'expo-router';
import { getCurrentUser, logout } from '../../services/appwrite';

export default function CoachDashboard() {
    const [user, setUser] = useState<{ name: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        getCurrentUser()
            .then(u => {
                if (!u) throw new Error('Not logged in');
                setUser(u);
            })
            .catch(() => router.replace('/login'));
    }, []);

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <View className="flex-1 items-center justify-center bg-white px-4">
            <Text className="text-2xl font-bold mb-4">Coach Dashboard</Text>
            {user && <Text>Welcome, Coach {user.name}!</Text>}
            <Button title="Logout" onPress={handleLogout} />
        </View>
    );
}
