import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity } from 'react-native';
import { signUpWithEmail, databases } from '../services/appwrite';

// Use env for safety
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'user' | 'coach'>('user'); // NEW
    const [result, setResult] = useState<string | null>(null);

    const handleSignup = async () => {
        if (!DATABASE_ID || !COLLECTION_ID) {
            setResult("Configuration error: Check Appwrite DB or Collection ID.");
            return;
        }
        try {
            // 1. Create user in Appwrite Auth
            const user = await signUpWithEmail(email, password, name);

            // 2. Add user doc to DB, ONLY fields that exist in your collection!
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                user.$id, // Use Auth user ID as doc ID
                {
                    userId: user.$id,
                    email,
                    role, // <-- role from state!
                }
            );

            setResult('Signup Success! User ID: ' + user.$id);
        } catch (e: any) {
            setResult('Signup Failed: ' + (e.message ?? JSON.stringify(e)));
        }
    };

    // Role toggle UI: simple, mobile-friendly
    return (
        <View className="flex-1 justify-center items-center px-4">
            <Text className="text-xl font-bold mb-4">Sign Up Test</Text>
            <TextInput
                className="border p-2 w-full mb-2 rounded"
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />
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

            {/* --- Role Picker (User / Coach) --- */}
            <View className="flex-row mb-2">
                <TouchableOpacity
                    style={{
                        backgroundColor: role === 'user' ? '#3b82f6' : '#e5e7eb',
                        padding: 10,
                        borderRadius: 8,
                        marginRight: 8,
                    }}
                    onPress={() => setRole('user')}
                >
                    <Text style={{ color: role === 'user' ? '#fff' : '#000' }}>User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        backgroundColor: role === 'coach' ? '#3b82f6' : '#e5e7eb',
                        padding: 10,
                        borderRadius: 8,
                    }}
                    onPress={() => setRole('coach')}
                >
                    <Text style={{ color: role === 'coach' ? '#fff' : '#000' }}>Coach</Text>
                </TouchableOpacity>
            </View>

            <Button title="Sign Up" onPress={handleSignup} />
            {result && <Text className="mt-4">{result}</Text>}
        </View>
    );
}
