import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Alert,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { login, getCurrentUser, getRole } from '../services/appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Make sure you have this package

// --- Color Palette ---
const COLORS = {
    primary: '#007AFF', // A vibrant blue for interactive elements
    white: '#FFFFFF',
    lightGray: '#F0F0F0', // A light background for inputs
    gray: '#A9A9A9', // For placeholder text and borders
    darkGray: '#333333', // For main text
    danger: '#FF3B30', // For error states
};

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [pwd, setPwd]     = useState('');
    const [busy, setBusy]   = useState(false);

    const handleLogin = async () => {
        if (!email || !pwd) {
            Alert.alert('Missing Fields', 'Please enter both email and password.');
            return;
        }
        setBusy(true);
        try {
            await login(email, pwd);
            const user = await getCurrentUser();
            if (!user) {
                throw new Error('Login succeeded but failed to fetch user data.');
            }
            const role = await getRole(user.$id);
            router.replace(role === 'coach' ? '/coach' : '/user');
        } catch (err: any) {
            let errorMessage = err.message;
            if (err.type === 'user_invalid_credentials') {
                errorMessage = 'Invalid email or password. Please try again.';
            }
            Alert.alert('Login Failed', errorMessage);
        } finally {
            setBusy(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.subtitle}>Log in to continue your journey.</Text>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="email-outline" size={22} color={COLORS.gray} style={styles.icon} />
                    <TextInput
                        placeholder="Email"
                        placeholderTextColor={COLORS.gray}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock-outline" size={22} color={COLORS.gray} style={styles.icon} />
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor={COLORS.gray}
                        secureTextEntry
                        style={styles.input}
                        value={pwd}
                        onChangeText={setPwd}
                    />
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity onPress={() => {/* Implement forgot password logic */}}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                    style={[styles.button, (busy || !email || !pwd) && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={busy || !email || !pwd}
                >
                    {busy ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                        <Text style={styles.buttonText}>Log In</Text>
                    )}
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/signup')}>
                        <Text style={[styles.signupText, styles.signupLink]}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// --- Stylesheet for a cleaner and more organized approach ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.darkGray,
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 40,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: COLORS.darkGray,
    },
    forgotPasswordText: {
        textAlign: 'right',
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: 30,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#AECBFA', // A lighter, disabled version of the primary color
        elevation: 0,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
    },
    signupText: {
        fontSize: 14,
        color: COLORS.gray,
    },
    signupLink: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});