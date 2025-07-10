import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import AvatarPicker from "../../components/AvatarPicker";
import { databases } from "../../services/appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

export default function ProfileForm({ user, profile }: any) {
    const [name, setName] = useState(profile.name ?? "");
    const [avatar, setAvatar] = useState(profile.avatar ?? "");
    const [goals, setGoals] = useState(profile.goals ?? "");

    const handleSave = async () => {
        await databases.updateDocument(DATABASE_ID, COLLECTION_ID, user.$id, {
            name,
            avatar,
            ...(profile.role === "user" ? { goals } : {}),
        });
        // Feedback etc.
    };

    return (
        <View className="mb-4 w-full">
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
            <Button title="Save Profile" onPress={handleSave} />
        </View>
    );
}
