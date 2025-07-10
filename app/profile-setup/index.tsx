import React, { useEffect, useState } from "react";
import ProfileForm from "./ProfileForm";
import CoachExtrasForm from "./CoachExtrasForm";
import { getCurrentUser, databases } from "../../services/appwrite";
import { View, Text, ActivityIndicator } from "react-native";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

export default function ProfileSetupScreen() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        getCurrentUser().then(async (u) => {
            setUser(u);
            // Fetch the user's profile doc
            if (u) {
                const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, u.$id);
                setProfile(doc);
            }
        });
    }, []);

    if (!user || !profile) return <ActivityIndicator />;

    return (
        <View className="flex-1 justify-center items-center px-4">
            <Text className="text-2xl font-bold mb-2">Complete Your Profile</Text>
            <ProfileForm user={user} profile={profile} />
            {profile.role === "coach" && <CoachExtrasForm user={user} profile={profile} />}
        </View>
    );
}
