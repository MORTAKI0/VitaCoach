
import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import { getCurrentUser, logout } from "../../services/appwrite";
import { router } from "expo-router";

export default function CoachDashboard() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        getCurrentUser().then(setUser);
    }, []);

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    return (
        <View className="flex-1 items-center justify-center bg-white px-4">
            <Text className="text-2xl font-bold mb-4">Coach Dashboard</Text>
            {user && <Text>Welcome, Coach {user.name}!</Text>}
            <Button title="Logout" onPress={handleLogout} />
        </View>
    );
}
