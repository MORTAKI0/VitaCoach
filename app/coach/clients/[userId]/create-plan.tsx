// app/coach/clients/[userId]/create-plan.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Pressable, ScrollView, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { databases, getCurrentUser, ID, DATABASE_ID, WORKOUTS_COLLECTION_ID, USERS_COLLECTION_ID } from '../../../../services/appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const WEB_BREAKPOINT = 768;

export default function CreateWorkoutPlanScreen() {
    const { userId: clientId } = useLocalSearchParams<{ userId: string }>();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isWebLayout = width >= WEB_BREAKPOINT;

    const [coachId, setCoachId] = useState('');
    const [clientName, setClientName] = useState('');
    const [title, setTitle] = useState('');
    const [exercises, setExercises] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
            router.replace('/coach');
        } catch (e: any) {
            Alert.alert("Error Saving Plan", e.message);
        } finally {
            setSaving(false);
        }
    };

    const styles = createStyles(isWebLayout);

    if (loading) {
        return <View style={styles.loader}><ActivityIndicator size="large" color="#4F46E5" /></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.kav}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="chevron-left" size={32} color="#1F2937" />
                    </Pressable>
                </View>

                <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.formWrapper}>
                        <Text style={styles.title}>Create Workout Plan</Text>
                        <Text style={styles.subtitle}>For client: <Text style={{ fontWeight: 'bold' }}>{clientName || clientId}</Text></Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Plan Title</Text>
                            <TextInput style={styles.input} placeholder="e.g., Week 1 - Strength Focus" value={title} onChangeText={setTitle} />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Exercises</Text>
                            <TextInput style={[styles.input, styles.multilineInput]} placeholder="e.g.,
Bench Press: 3 sets of 5 reps
Squats: 3 sets of 8 reps..." value={exercises} onChangeText={setExercises} multiline />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Additional Notes (Optional)</Text>
                            <TextInput style={[styles.input, styles.multilineInput]} placeholder="e.g., Remember to focus on form and control." value={notes} onChangeText={setNotes} multiline />
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Pressable
                        style={({ pressed }) => [styles.buttonContainer, (saving || !title) && styles.disabledButton, pressed && styles.pressedButton]}
                        onPress={handleSavePlan}
                        disabled={saving || !title}
                    >
                        <LinearGradient colors={saving || !title ? ['#A5B4FC', '#C7D2FE'] : ['#4F46E5', '#6D28D9']} style={styles.buttonGradient}>
                            {saving ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Save and Assign Plan</Text>}
                        </LinearGradient>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (isWebLayout: boolean) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    kav: { flex: 1, flexDirection: 'column' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 10, paddingTop: 10, alignSelf: 'flex-start' },
    backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    scrollContainer: { flex: 1 },
    formWrapper: {
        width: '100%',
        maxWidth: isWebLayout ? 700 : undefined, // Center and constrain width on web
        alignSelf: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    title: { fontSize: 32, fontWeight: 'bold', color: '#1F2937' },
    subtitle: { fontSize: 18, color: '#6B7280', marginBottom: 32, marginTop: 4 },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    multilineInput: { height: 160, textAlignVertical: 'top', lineHeight: 22 },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    buttonContainer: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    buttonGradient: {
        padding: 18,
        alignItems: 'center',
    },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    disabledButton: {
        // The gradient colors are changed directly, no separate style needed here
    },
    pressedButton: {
        opacity: 0.8,
    },
});