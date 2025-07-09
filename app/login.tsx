import React, { useState } from "react";
import { View, TextInput, Button, Text, Pressable } from "react-native";
import { account } from "../services/appwrite";
import { OAuthProvider } from "appwrite";
import { router } from "expo-router"; // import router!

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [result, setResult] = useState<string | null>(null);

    // Helper to ensure no active session before login
    const ensureLoggedOut = async () => {
        try {
            await account.deleteSession("current");
        } catch {
            // no session? fine, ignore error
        }
    };

    const handleLogin = async () => {
        setResult(null);
        await ensureLoggedOut(); // always logout first
        try {
            await account.createEmailPasswordSession(email, password);
            setResult("Login Success!");
            // REDIRECT to user dashboard
            setTimeout(() => {
                router.replace("/user"); // Use .replace so back button doesn't go to login
            }, 500); // Give a short delay for UI feedback, optional
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
