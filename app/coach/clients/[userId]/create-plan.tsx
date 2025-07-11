// app/coach/clients/[userId]/create-plan.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Pressable, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
// --- CORRECTED PATH: ../../../../ goes up from [userId] -> clients -> coach -> app -> to the root ---
import { databases, getCurrentUser, ID, DATABASE_ID, WORKOUTS_COLLECTION_ID, USERS_COLLECTION_ID } from '../../../../services/appwrite';

export default function CreateWorkoutPlanScreen() {
    const { userId: clientId } = useLocalSearchParams<{ userId: string }>();
    const router = useRouter();

    const [coachId, setCoachId] = useState('');
    const [clientName, setClientName] = useState('');
    const [title, setTitle] = useState('');
    const [exercises, setExercises] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

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
                Alert.alert("Error", "Could not load user data.");
            }
        };
        setup();
    }, [clientId]);


    const handleSavePlan = async () => {
        if (!title || !exercises) {
            return Alert.alert("Missing Fields", "Please provide a title and list of exercises.");
        }
        setLoading(true);
        try {
            await databases.createDocument(
                DATABASE_ID,
                WORKOUTS_COLLECTION_ID,
                ID.unique(),
                {
                    clientId,
                    coachId,
                    title,
                    exercises,
                    notes,
                    createdAt: new Date().toISOString(),
                }
            );
            Alert.alert("Success!", "Workout plan has been saved and assigned.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (e: any) {
            Alert.alert("Error Saving Plan", e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Create Workout Plan</Text>
                <Text style={styles.subtitle}>For client: {clientName || clientId}</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Plan Title (e.g., Week 1 - Strength)"
                    value={title}
                    onChangeText={setTitle}
                />
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Exercises (e.g., Bench Press: 3 sets of 5 reps)"
                    value={exercises}
                    onChangeText={setExercises}
                    multiline
                />
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Additional Notes (optional)"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                />

                <Pressable
                    style={({ pressed }) => [styles.button, loading && styles.disabledButton, pressed && styles.pressedButton]}
                    onPress={handleSavePlan}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Save and Assign Plan</Text>}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { padding: 20 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1F2937' },
    subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 24 },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    multilineInput: { height: 120, textAlignVertical: 'top' },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#AECBFA' },
    pressedButton: { opacity: 0.8 },
});