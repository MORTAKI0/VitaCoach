import React, { useState } from "react";
import { View, TextInput, Button, Text, Pressable } from "react-native";
import { account, databases } from "../services/appwrite";
import { OAuthProvider } from "appwrite";
import { router } from "expo-router";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [result, setResult] = useState<string | null>(null);

    // Ensure no active session before login
    const ensureLoggedOut = async () => {
        try {
            await account.deleteSession("current");
        } catch {
            // Ignore errors if already logged out
        }
    };

    const handleLogin = async () => {
        setResult(null);
        await ensureLoggedOut();
        try {
            // 1. Log in
            await account.createEmailPasswordSession(email, password);

            // 2. Get user info and doc
            const user = await account.get();
            const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, user.$id);

            // 3. Profile completeness checks (customize as needed)
            const isCoach = doc.role === "coach";
            const isUser = doc.role === "user";

            // Required fields for profile completion
            const profileComplete =
                !!doc.name && !!doc.avatar && (
                    (isCoach && !!doc.certifications && !!doc.hourlyPrice) ||
                    (isUser && !!doc.goals)
                );

            if (!profileComplete) {
                setResult("Login Success! Please complete your profile.");
                setTimeout(() => router.replace("/profile-setup"), 600);
            } else if (isCoach) {
                setResult("Login Success! Redirecting to coach dashboard...");
                setTimeout(() => router.replace("/coach"), 600);
            } else {
                setResult("Login Success! Redirecting to user dashboard...");
                setTimeout(() => router.replace("/user"), 600);
            }
        } catch (e: any) {
            setResult("Login Failed: " + e.message);
        }
    };

    const handleGoogleLogin = async () => {
        await ensureLoggedOut();
        account.createOAuth2Session(
            OAuthProvider.Google,
            window.location.origin + "/success",
            window.location.origin + "/login?error=oauth"
        );
    };

    return (
        <View className="flex-1 items-center justify-center bg-white px-4">
            <Text className="text-xl font-bold text-blue-600 mb-4">Login Page</Text>
            <TextInput
                className="border p-2 w-full mb-2 rounded"
                placeholder="Email"
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
            />
            <TextInput
                className="border p-2 w-full mb-2 rounded"
                placeholder="Password"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
            />
            <Button title="Log In" onPress={handleLogin} />
            <Pressable
                onPress={handleGoogleLogin}
                style={{
                    marginTop: 20,
                    padding: 12,
                    backgroundColor: "#4285F4",
                    borderRadius: 8,
                    width: "100%",
                    maxWidth: 300,
                }}
            >
                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                    Sign In with Google
                </Text>
            </Pressable>
            {result && <Text className="mt-4">{result}</Text>}
        </View>
    );
}
