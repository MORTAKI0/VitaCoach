// app/user/hire/[coachId].tsx
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    databases,
    account,
    ID,
    DATABASE_ID,
    RELATIONSHIPS_COLLECTION_ID,
} from '../../../services/appwrite';

export default function HireCoach() {
    const { coachId } = useLocalSearchParams<{ coachId: string }>();
    const router = useRouter();
    const [status, setStatus] = useState<'idle' | 'requested' | 'error'>('idle');

    const handleHire = async () => {
        if (!coachId) return setStatus('error');

        try {
            // get current user session
            const me = await account.get();
            await databases.createDocument(
                DATABASE_ID,
                RELATIONSHIPS_COLLECTION_ID,
                ID.unique(),
                {
                    userId: me.$id,
                    coachId,
                    status: 'requested',
                }
            );
            setStatus('requested');
            setTimeout(() => router.back(), 700);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
            <Text style={{ fontSize: 18, marginBottom: 12 }}>
                {status === 'requested'
                    ? '✅ Request sent!'
                    : status === 'error'
                        ? '❌ Something went wrong'
                        : `Hire Coach ${coachId}`}
            </Text>
            {status === 'idle' && <Button title="Send Request" onPress={handleHire} />}
            {status !== 'idle' && (
                <Button title="Back to Profile" onPress={() => router.push(`/coaches/${coachId}`)} />
            )}
        </View>
    );
}
