// app/user/hire/[coachId].tsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { databases, account, ID, DATABASE_ID, RELATIONSHIPS_COLLECTION_ID, Query } from '../../../services/appwrite';

export default function HireCoach() {
    const { coachId } = useLocalSearchParams<{ coachId: string }>();
    const router = useRouter();
    const [status, setStatus] = useState<'idle' | 'hiring' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleHire = async () => {
        if (!coachId) return;
        setStatus('hiring');

        try {
            const me = await account.get();

            // VALIDATION: Check if user already has an active or requested coach
            const existingRelationships = await databases.listDocuments(
                DATABASE_ID,
                RELATIONSHIPS_COLLECTION_ID,
                [Query.equal('userId', me.$id), Query.notEqual('status', 'ended')]
            );

            if (existingRelationships.total > 0) {
                setErrorMessage('You can only hire one coach at a time. Please end your current coaching relationship first.');
                setStatus('error');
                return;
            }

            // Create the new relationship document
            await databases.createDocument(
                DATABASE_ID,
                RELATIONSHIPS_COLLECTION_ID,
                ID.unique(),
                { userId: me.$id, coachId, status: 'requested' }
            );
            setStatus('success');
            setTimeout(() => router.replace(`/coaches/${coachId}`), 1500);
        } catch (err: any) {
            setErrorMessage(err.message || 'An unknown error occurred.');
            setStatus('error');
        }
    };

    return (
        <View style={styles.container}>
            {status === 'hiring' && <ActivityIndicator size="large" />}

            {status === 'idle' && (
                <>
                    <Text style={styles.title}>Send Hire Request?</Text>
                    <Text style={styles.subtitle}>A request will be sent to the coach for approval.</Text>
                    <Button title="Confirm & Send Request" onPress={handleHire} />
                </>
            )}

            {status === 'success' && (
                <Text style={styles.title}>✅ Request Sent!</Text>
            )}

            {status === 'error' && (
                <>
                    <Text style={styles.title}>❌ Error</Text>
                    <Text style={styles.subtitle}>{errorMessage}</Text>
                    <Button title="Back to Profile" onPress={() => router.back()} />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 24 },
});