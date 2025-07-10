import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { login, getCurrentUser, getRole } from '../services/appwrite';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [pwd, setPwd]     = useState('');
    const [busy, setBusy]   = useState(false);

    const handleLogin = async () => {
        setBusy(true);
        try {
            await login(email, pwd);
            const user = await getCurrentUser();
            if (!user) throw new Error('No user fetched');
            const role = await getRole(user.$id);
            router.replace(role === 'coach' ? '/coach' : '/user');
        } catch (err: any) {
            Alert.alert('Login Failed', err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, marginBottom: 12 }}>Login</Text>
            <TextInput
                placeholder="Email"
                autoCapitalize="none"
                style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                style={{ borderWidth: 1, padding: 8, marginBottom: 16 }}
                value={pwd}
                onChangeText={setPwd}
            />
            <Button
                title={busy ? '…' : 'Log in'}
                onPress={handleLogin}
                disabled={busy || !email || !pwd}
            />
        </View>
    );
}
