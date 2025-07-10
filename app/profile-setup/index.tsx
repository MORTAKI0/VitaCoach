// /app/profile-setup/index.tsx

import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator, ScrollView, Platform, Alert } from "react-native";
import AvatarPicker from "../../components/AvatarPicker";
import { getCurrentUser, databases } from "../../services/appwrite";
import { router } from "expo-router";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

export default function ProfileSetupScreen() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Shared fields
    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState("");
    const [bio, setBio] = useState("");
    // User only
    const [goals, setGoals] = useState("");
    // Coach only
    const [certifications, setCertifications] = useState("");
    const [hourlyPrice, setHourlyPrice] = useState("");

    useEffect(() => {
        (async () => {
            setLoading(true);
            const u = await getCurrentUser();
            setUser(u);
            if (u) {
                const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, u.$id);
                setProfile(doc);
                setName(doc.name ?? "");
                setAvatar(doc.avatar ?? "");
                setBio(doc.bio ?? "");
                setGoals(doc.goals ?? "");
                setCertifications(doc.certifications ?? "");
                setHourlyPrice(doc.hourlyPrice?.toString() ?? "");
            }
            setLoading(false);
        })();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            let data: any = {
                name,
                avatar,
                bio,
            };
            if (profile.role === "user") {
                data.goals = goals;
            }
            if (profile.role === "coach") {
                data.certifications = certifications;
                data.hourlyPrice = parseFloat(hourlyPrice);
            }
            await databases.updateDocument(DATABASE_ID, COLLECTION_ID, user.$id, data);

            // --- Redirect immediately after save (NO setTimeout, NO Alert for navigation) ---
            if (profile.role === "coach") {
                router.replace("/coach");
            } else {
                router.replace("/user");
            }
        } catch (e: any) {
            // Only show Alert for error, not for success
            Alert.alert("Save Error", e.message || JSON.stringify(e));
        } finally {
            setSaving(false);
        }
    };

    if (loading || !user || !profile) return <ActivityIndicator />;

    return (
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
            <Text className="text-2xl font-bold mb-2 text-center">Complete Your Profile</Text>
            <Text className="mb-1 w-full">Avatar (emoji for now):</Text>
            <AvatarPicker avatar={avatar} onChange={setAvatar} />

            <TextInput
                className="border p-2 w-full mb-2 rounded"
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />

            {profile.role === "user" && (
                <TextInput
                    className="border p-2 w-full mb-2 rounded"
                    placeholder="Your Goals (e.g., lose weight)"
                    value={goals}
                    onChangeText={setGoals}
                />
            )}

            {profile.role === "coach" && (
                <>
                    <TextInput
                        className="border p-2 w-full mb-2 rounded"
                        placeholder="Certifications (comma separated)"
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
                </>
            )}

            <TextInput
                className="border p-2 w-full mb-2 rounded"
                placeholder="Bio (optional, share about you)"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
            />

            <Button
                title={saving ? "Saving..." : "Save Profile"}
                onPress={handleSave}
                disabled={saving}
            />
        </ScrollView>
    );
}
