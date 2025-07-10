// /app/profile-setup/CoachExtrasForm.tsx

import React, { useState } from "react";
import { View, TextInput, Button } from "react-native";
import { databases } from "../../services/appwrite";
import { router } from "expo-router";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

export default function CoachExtrasForm({ user, profile }: any) {
    const [certifications, setCertifications] = useState(profile.certifications ?? "");
    const [hourlyPrice, setHourlyPrice] = useState(profile.hourlyPrice ?? "");
    const [bio, setBio] = useState(profile.bio ?? "");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await databases.updateDocument(DATABASE_ID, COLLECTION_ID, user.$id, {
            certifications,
            hourlyPrice: parseFloat(hourlyPrice),
            bio,
        });
        router.replace("/coach");
    };

    return (
        <View className="mb-4 w-full">
            <TextInput
                className="border p-2 w-full mb-2 rounded"
                placeholder="Certifications (comma separated, or upload in future)"
                value={certifications}
                onChangeText={setCertifications}
            />
            <TextInput
                className="border p-2 w-full mb-2 rounded"
                placeholder="Hourly Price (USD)"
                value={hourlyPrice}
                keyboardType="numeric"
                onChangeText={setHourlyPrice}
            />
            <TextInput
                className="border p-2 w-full mb-2 rounded"
                placeholder="Bio (Tell users about you!)"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
            />
            <Button title={saving ? "Saving..." : "Save Coach Info"} onPress={handleSave} disabled={saving} />
        </View>
    );
}
