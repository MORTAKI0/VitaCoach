// app/profile-setup/index.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Models } from "appwrite";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { DATABASE_ID, databases, getCurrentUser, USERS_COLLECTION_ID } from "../../services/appwrite";

export default function ProfileSetupScreen() {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // --- FORM FIELDS: Perfectly aligned with your Appwrite schema ---
    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState("");
    const [bio, setBio] = useState("");
    const [goals, setGoals] = useState(""); // For users
    const [certifications, setCertifications] = useState(""); // For coaches
    const [hourlyPrice, setHourlyPrice] = useState(""); // For coaches

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const u = await getCurrentUser();
                if (!u) return router.replace('/login');
                setUser(u);

                const doc = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, u.$id);
                setProfile(doc);

                // Populate form state from the fetched document
                setName(doc.name ?? "");
                setAvatar(doc.avatar ?? "");
                setBio(doc.bio ?? "");
                if (doc.role === 'user') {
                    setGoals(doc.goals ?? "");
                }
                if (doc.role === 'coach') {
                    setCertifications(doc.certifications ?? "");
                    setHourlyPrice(doc.hourlyPrice?.toString() ?? "");
                }
            } catch (error: any) {
                Alert.alert("Error Loading Profile", error.message);
                router.replace('/');
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleSave = async () => {
        if (!user || !name) {
            return Alert.alert("Missing Name", "Your name is a required field.");
        }
        setSaving(true);
        try {
            // --- SAVE LOGIC: Perfectly aligned with your schema ---
            const data: any = { name, avatar, bio };
            if (profile.role === "user") {
                data.goals = goals;
            }
            if (profile.role === "coach") {
                data.certifications = certifications;
                const price = parseFloat(hourlyPrice);
                // Ensure a valid number is saved, defaulting to 0 if input is invalid
                data.hourlyPrice = isNaN(price) ? 0 : price;
            }

            await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, user.$id, data);

            // Automatic redirect on success
            router.replace(profile.role === 'coach' ? '/coach' : '/user');

        } catch (e: any) {
            Alert.alert("Save Error", e.message || "An unknown error occurred.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !profile) {
        return <View style={styles.loader}><ActivityIndicator size="large" color="#4F46E5" /></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.kav}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.header}>
                        <MaterialCommunityIcons name="account-details-outline" size={40} color="#4F46E5" />
                        <Text style={styles.title}>Your Profile</Text>
                        <Text style={styles.subtitle}>This information will be visible to others.</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput style={styles.input} placeholder="Enter your full name" value={name} onChangeText={setName} />

                        <Text style={styles.label}>Avatar URL</Text>
                        <TextInput style={styles.input} placeholder="https://example.com/avatar.png" value={avatar} onChangeText={setAvatar} autoCapitalize="none" />
                        
                        {profile.role === "user" && (
                            <>
                                <Text style={styles.label}>Your Fitness Goals</Text>
                                <TextInput style={[styles.input, styles.multiline]} placeholder="e.g., Lose 10kg, run a 5k, improve flexibility" value={goals} onChangeText={setGoals} multiline />
                            </>
                        )}

                        {profile.role === "coach" && (
                            <>
                                <Text style={styles.label}>Your Certifications</Text>
                                <TextInput style={styles.input} placeholder="e.g., NASM, ACE, Yoga Alliance" value={certifications} onChangeText={setCertifications} />
                                <Text style={styles.label}>Hourly Price (USD)</Text>
                                <TextInput style={styles.input} placeholder="e.g., 50" value={hourlyPrice} keyboardType="numeric" onChangeText={setHourlyPrice} />
                            </>
                        )}
                        
                        <Text style={styles.label}>Biography</Text>
                        <TextInput style={[styles.input, styles.multiline]} placeholder="Tell everyone a little about yourself, your experience, and your coaching style." value={bio} onChangeText={setBio} multiline />

                        <Pressable
                            style={({ pressed }) => [styles.button, (saving) && styles.disabledButton, pressed && styles.pressedButton]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Save Changes</Text>}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
    kav: { flex: 1 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    header: { alignItems: 'center', marginBottom: 32 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginTop: 12 },
    subtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
    form: {
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: 'white',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 20,
        color: '#1F2937'
    },
    multiline: { height: 120, textAlignVertical: 'top' },
    button: {
        backgroundColor: '#4F46E5',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#A5B4FC' },
    pressedButton: { opacity: 0.85 },
});