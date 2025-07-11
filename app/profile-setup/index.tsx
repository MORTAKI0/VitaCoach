// app/profile-setup/index.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator, ScrollView, StyleSheet, Alert } from "react-native";
import { getCurrentUser, databases, DATABASE_ID, USERS_COLLECTION_ID } from "../../services/appwrite"; // CORRECTED: Import constants
import { router } from "expo-router";
import { Models } from "appwrite";
// Note: AvatarPicker component is assumed to exist from your code
// import AvatarPicker from "../../components/AvatarPicker";

export default function ProfileSetupScreen() {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState("");
    const [bio, setBio] = useState("");
    const [goals, setGoals] = useState("");
    const [certifications, setCertifications] = useState("");
    const [hourlyPrice, setHourlyPrice] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            try {
                const u = await getCurrentUser();
                if (!u) return router.replace('/login');
                setUser(u);

                // Use imported constants
                const doc = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, u.$id);
                setProfile(doc);

                // Populate form fields
                setName(doc.name ?? "");
                setAvatar(doc.avatar ?? "");
                setBio(doc.bio ?? "");
                if(doc.role === 'user') setGoals(doc.goals ?? "");
                if(doc.role === 'coach') {
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
        if (!user) return;
        setSaving(true);
        try {
            const data: any = { name, avatar, bio };
            if (profile.role === "user") data.goals = goals;
            if (profile.role === "coach") {
                data.certifications = certifications;
                const price = parseFloat(hourlyPrice);
                data.hourlyPrice = isNaN(price) ? 0 : price;
            }

            // Use imported constants
            await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, user.$id, data);

            // Redirect on success
            Alert.alert("Success", "Your profile has been updated.", [
                { text: "OK", onPress: () => router.replace(profile.role === 'coach' ? '/coach' : '/user') }
            ]);

        } catch (e: any) {
            Alert.alert("Save Error", e.message || "An unknown error occurred.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !user || !profile) {
        return <ActivityIndicator style={styles.loader} size="large" />;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Complete Your Profile</Text>

            {/* <Text style={styles.label}>Avatar (emoji for now):</Text>
            <AvatarPicker avatar={avatar} onChange={setAvatar} /> */}

            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />

            {profile.role === "user" && (
                <TextInput style={styles.input} placeholder="Your Goals (e.g., lose weight)" value={goals} onChangeText={setGoals} />
            )}

            {profile.role === "coach" && (
                <>
                    <TextInput style={styles.input} placeholder="Certifications (comma separated)" value={certifications} onChangeText={setCertifications} />
                    <TextInput style={styles.input} placeholder="Hourly Price (USD)" value={hourlyPrice} keyboardType="numeric" onChangeText={setHourlyPrice} />
                </>
            )}

            <TextInput style={[styles.input, styles.multiline]} placeholder="Bio (optional, share about you)" value={bio} onChangeText={setBio} multiline />

            {saving ? <ActivityIndicator size="large"/> : <Button title="Save Profile" onPress={handleSave} />}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
    label: { alignSelf: 'flex-start', marginLeft: 5, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 16, width: '100%' },
    multiline: { height: 100, textAlignVertical: 'top' },
});