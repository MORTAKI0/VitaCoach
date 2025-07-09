// app/signup.tsx

import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { signUpWithEmail } from '../services/appwrite';

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [result, setResult] = useState<string | null>(null);

    const handleSignup = async () => {
        try {
            const res = await signUpWithEmail(email, password, name);
            setResult('Signup Success! User ID: ' + res.$id);
        } catch (e: any) {
            setResult('Signup Failed: ' + e.message);
        }
    };

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
            <Button title="Sign Up" onPress={handleSignup} />
            {result && <Text className="mt-4">{result}</Text>}
        </View>
    );
}
