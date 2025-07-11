// app/coach/clients/[userId]/create-plan.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Pressable, ScrollView, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { databases, getCurrentUser, ID, DATABASE_ID, WORKOUTS_COLLECTION_ID, USERS_COLLECTION_ID } from '../../../../services/appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CreateWorkoutPlanScreen() {
    const { userId: clientId } = useLocalSearchParams<{ userId: string }>();
    const router = useRouter();

    const [coachId, setCoachId] = useState('');
    const [clientName, setClientName] = useState('');
    const [title, setTitle] = useState('');
    const [exercises, setExercises] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true); // Changed to true for initial data fetch
    const [saving, setSaving] = useState(false); // Specific state for saving action

    useEffect(() => {
        if (!clientId) return;
        const setup = async () => {
            try {
                const [coach, client] = await Promise.all([
                    getCurrentUser(),
                    databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, clientId)
                ]);
                if (!coach || !client) throw new Error("Could not retrieve user data");
                setCoachId(coach.$id);
                setClientName(client.name);
            } catch (error) {
                Alert.alert("Error", "Could not load client data.");
            } finally {
                setLoading(false);
            }
        };
        setup();
    }, [clientId]);

    const handleSavePlan = async () => {
        if (!title || !exercises) {
            return Alert.alert("Missing Fields", "Please provide a title and list of exercises.");
        }
        setSaving(true);
        try {
            await databases.createDocument(
                DATABASE_ID, WORKOUTS_COLLECTION_ID, ID.unique(),
                { clientId, coachId, title, exercises, notes, createdAt: new Date().toISOString() }
            );
            // --- UX FIX: Automatic redirect on success ---
            router.replace('/coach');
        } catch (e: any) {
            Alert.alert("Error Saving Plan", e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <View style={styles.loader}><ActivityIndicator size="large" color="#4F46E5" /></View>
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.kav}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="chevron-left" size={32} color="#1F2937" />
                    </Pressable>
                </View>

                <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    <Text style={styles.title}>Create Workout Plan</Text>
                    <Text style={styles.subtitle}>For client: <Text style={{fontWeight: 'bold'}}>{clientName || clientId}</Text></Text>

                    <Text style={styles.label}>Plan Title</Text>
                    <TextInput style={styles.input} placeholder="e.g., Week 1 - Strength Focus" value={title} onChangeText={setTitle} />

                    <Text style={styles.label}>Exercises</Text>
                    <TextInput style={[styles.input, styles.multilineInput]} placeholder="e.g., Bench Press: 3 sets of 5 reps..." value={exercises} onChangeText={setExercises} multiline />

                    <Text style={styles.label}>Additional Notes (Optional)</Text>
                    <TextInput style={[styles.input, styles.multilineInput]} placeholder="e.g., Remember to focus on form..." value={notes} onChangeText={setNotes} multiline />
                </ScrollView>

                <View style={styles.footer}>
                    <Pressable
                        style={({ pressed }) => [styles.button, (saving || !title) && styles.disabledButton, pressed && styles.pressedButton]}
                        onPress={handleSavePlan}
                        disabled={saving || !title}
                    >
                        {saving ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Save and Assign Plan</Text>}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    kav: { flex: 1, flexDirection: 'column' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 10, paddingTop: 10 },
    backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    scrollContainer: { flex: 1 },
    contentContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
    subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 24, marginTop: 4 },
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
        backgroundColor: '#F9FAFB',
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    multilineInput: { height: 140, textAlignVertical: 'top' },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        backgroundColor: 'white',
    },
    button: {
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#A5B4FC' },
    pressedButton: { opacity: 0.85 },
});