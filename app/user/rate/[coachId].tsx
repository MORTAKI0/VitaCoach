// app/user/rate/[coachId].tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    account,
    databases,
    functions,
    ID,
    DATABASE_ID,
    RATINGS_COLLECTION_ID,
    APPWRITE_FUNCTION_ID,
} from '../../../services/appwrite';

export default function RateCoach() {
    const { coachId } = useLocalSearchParams<{ coachId: string }>();
    const router = useRouter();

    const [stars,    setStars]    = useState('5');
    const [comment,  setComment]  = useState('');
    const [busy,     setBusy]     = useState(false);

    const handleRate = async () => {
        if (!coachId) return Alert.alert('No coach id');

        setBusy(true);
        try {
            // 1) author of the rating
            const me = await account.get();

            // 2) store rating
            await databases.createDocument(
                DATABASE_ID,
                RATINGS_COLLECTION_ID,
                ID.unique(),
                {
                    userId:   me.$id,
                    coachId,
                    stars:    parseInt(stars, 10),
                    comment,
                    createdAt: new Date().toISOString(),
                },
            );

            // 3) trigger cloud function to recalc avgRating
            await functions.createExecution(
                APPWRITE_FUNCTION_ID,
                JSON.stringify({ coachId }),
            );

            // 4) back to profile
            router.replace(`/coaches/${coachId}`);
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Unknown');
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 18, marginBottom: 8 }}>Rate Coach</Text>

            <TextInput
                placeholder="Stars (1–5)"
                keyboardType="number-pad"
                value={stars}
                onChangeText={setStars}
                style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
            />

            <TextInput
                placeholder="Comment"
                value={comment}
                onChangeText={setComment}
                multiline
                style={{ borderWidth: 1, padding: 8, marginBottom: 12, height: 80 }}
            />

            <Button
                title={busy ? 'Sending…' : 'Submit Rating'}
                onPress={handleRate}
                disabled={busy}
            />
        </View>
    );
}
