import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { loginWithEmail, account, getRole } from '../services/appwrite';
import { useRouter } from 'expo-router';

export default function Login() {
    const router              = useRouter();
    const [email, setEmail]   = useState('');
    const [pw, setPw]         = useState('');
    const [busy, setBusy]     = useState(false);

    async function handleLogin() {
        setBusy(true);
        try {
            await loginWithEmail(email.trim(), pw);

            const me   = await account.get();
            const role = await getRole(me.$id);

            router.replace(role === 'coach' ? '/coach' : '/user');
        } catch (err: any) {
            Alert.alert('Login failed', err.message ?? 'Unknown error');
        } finally {
            setBusy(false);
        }
    }

    return (
        <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, marginBottom: 12 }}>Login</Text>

            <TextInput
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8 }}
            />

            <TextInput
                placeholder="Password"
                secureTextEntry
                value={pw}
                onChangeText={setPw}
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12 }}
            />

            <Button title={busy ? 'Logging in…' : 'Login'}
                    disabled={busy || !email || !pw}
                    onPress={handleLogin} />
        </View>
    );
}
