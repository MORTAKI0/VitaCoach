import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
// --- LOGIC FIX: We need more Appwrite functions for the check ---
import { Models } from 'appwrite';
import { LinearGradient } from 'expo-linear-gradient';
import { DATABASE_ID, databases, getCurrentUser, login, USERS_COLLECTION_ID } from '../services/appwrite';

// --- Color Palette (Slightly refined) ---
const COLORS = {
    primary: '#6366F1', // A modern indigo
    primaryLight: '#A5B4FC',
    white: '#FFFFFF',
    lightGray: '#F3F4F6',
    gray: '#9CA3AF',
    darkGray: '#1F2937',
    bg: '#F8FAFC',
};

// --- LOGIC FIX: Helper function to check profile completeness ---
const isProfileComplete = (profile: Models.Document) => {
    if (!profile.name) return false;
    if (profile.role === 'coach') {
        // Coaches must have certifications and a price
        return !!profile.certifications && profile.hourlyPrice > 0;
    }
    if (profile.role === 'user') {
        // Users must have set their goals
        return !!profile.goals;
    }
    return false; // Default to incomplete if role is unknown
};

export default function LoginScreen() {
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
            // Step 1: Log the user in
            await login(email, pwd);
            
            // Step 2: Get the user's account details
            const user = await getCurrentUser();
            if (!user) throw new Error('Login succeeded but failed to fetch user data.');

            // --- LOGIC FIX: Fetch the full profile document ---
            const profile = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, user.$id);
            
            // Step 3: Check if the profile is complete
            if (isProfileComplete(profile)) {
                // If complete, redirect to the appropriate dashboard
                router.replace(profile.role === 'coach' ? '/coach' : '/user');
            } else {
                // If incomplete, force the user to the setup screen
                Alert.alert("Complete Your Profile", "Please complete your profile setup to continue.");
                router.replace('/profile-setup');
            }

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
            <LinearGradient
                colors={[COLORS.bg, '#EEF2FF']}
                style={styles.gradientBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.cardWrapper}>
                    <View style={styles.card}>
                        <View style={styles.logoContainer}>
                            <MaterialCommunityIcons name="dumbbell" size={54} color={COLORS.primary} style={styles.logoIcon} />
                        </View>
                        <Text style={styles.title}>Welcome Back!</Text>
                        <Text style={styles.subtitle}>Log in to continue your journey.</Text>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="email-outline" size={22} color={COLORS.gray} style={styles.inputIcon} />
                            <TextInput
                                placeholder="Email"
                                placeholderTextColor={COLORS.gray}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                returnKeyType="next"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="lock-outline" size={22} color={COLORS.gray} style={styles.inputIcon} />
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor={COLORS.gray}
                                secureTextEntry
                                style={styles.input}
                                value={pwd}
                                onChangeText={setPwd}
                                returnKeyType="done"
                            />
                        </View>
                        <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, (busy || !email || !pwd) && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={busy || !email || !pwd}
                            activeOpacity={0.85}
                        >
                            {busy ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.buttonText}>Log In</Text>}
                        </TouchableOpacity>
                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.divider} />
                        </View>
                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Don't have an account?</Text>
                            <TouchableOpacity onPress={() => router.push('/signup')} activeOpacity={0.7}>
                                <Text style={styles.signupLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    gradientBg: { flex: 1, justifyContent: 'center' },
    cardWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: COLORS.white,
        borderRadius: 32,
        paddingVertical: 40,
        paddingHorizontal: 32,
        alignSelf: 'center',
        shadowColor: 'rgba(0,0,0,0.10)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 30,
        elevation: 10,
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 24,
        alignSelf: 'center',
        width: 72, height: 72,
        borderRadius: 36,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
    },
    logoIcon: { alignSelf: 'center' },
    title: { fontSize: 30, fontWeight: 'bold', color: COLORS.darkGray, textAlign: 'center', marginBottom: 8, letterSpacing: 0.5 },
    subtitle: { fontSize: 16, color: COLORS.gray, textAlign: 'center', marginBottom: 32 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: 16,
        paddingHorizontal: 18,
        marginBottom: 18,
        width: '100%',
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    inputIcon: { marginRight: 10 },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: COLORS.darkGray,
    },
    forgotPasswordText: {
        textAlign: 'right',
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: 24,
        fontSize: 15,
        width: '100%',
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 22,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonDisabled: { backgroundColor: COLORS.primaryLight },
    buttonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 10,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.lightGray,
    },
    dividerText: {
        marginHorizontal: 10,
        color: COLORS.gray,
        fontSize: 14,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 18,
        paddingTop: 18,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        width: '100%',
    },
    signupText: { fontSize: 15, color: COLORS.gray },
    signupLink: { fontSize: 15, color: COLORS.primary, fontWeight: 'bold', marginLeft: 6, textDecorationLine: 'underline' },
});