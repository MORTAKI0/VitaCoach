// app/signup.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { registerUserAndProfile } from '../services/appwrite';
import { useRouter } from 'expo-router';

export default function SignUp() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'user'|'coach'>('user');
    const [busy, setBusy] = useState(false);

    const handleSignUp = async () => {
        setBusy(true);
        try {
            await registerUserAndProfile(email, password, name, role);
            Alert.alert('Signed up!', 'Please log in.');
            router.replace('/login');
        } catch (err: any) {
            Alert.alert('Error', err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, marginBottom: 12 }}>Sign Up</Text>
            <TextInput
                placeholder="Name"
                style={{ borderWidth:1,borderColor:'#ccc',padding:8,marginBottom:8 }}
                value={name}
                onChangeText={setName}
            />
            <TextInput
                placeholder="Email"
                keyboardType="email-address"
                style={{ borderWidth:1,borderColor:'#ccc',padding:8,marginBottom:8 }}
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                style={{ borderWidth:1,borderColor:'#ccc',padding:8,marginBottom:8 }}
                value={password}
                onChangeText={setPassword}
            />
            <Text>Role:</Text>
            <View style={{ flexDirection:'row', marginBottom:12 }}>
                {['user','coach'].map(r => (
                    <Button
                        key={r}
                        title={r.charAt(0).toUpperCase()+r.slice(1)}
                        onPress={()=>setRole(r as any)}
                        color={role===r ? '#4F46E5' : '#999'}
                    />
                ))}
            </View>
            <Button
                title={busy ? 'Signing up…' : 'Sign Up'}
                onPress={handleSignUp}
                disabled={busy}
            />
        </View>
    );
}
