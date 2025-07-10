// app/coaches/[coachId].tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    databases,
    Query,
    DATABASE_ID,
    USERS_COLLECTION_ID,
    RATINGS_COLLECTION_ID,
} from '../../services/appwrite';

type Rating = {
    $id:       string;
    userId:    string;
    stars:     number;
    comment:   string;
    createdAt: string;
};

export default function CoachProfile() {
    const { coachId } = useLocalSearchParams<{ coachId: string }>();
    const router = useRouter();
    const [coach, setCoach]     = useState<any>(null);
    const [ratings, setRatings] = useState<Rating[]>([]);

    useEffect(() => {
        if (!coachId) return router.replace('/coaches');
        databases
            .listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
                Query.equal('userId', coachId),
            ])
            .then(res => setCoach(res.documents[0]));
        databases
            .listDocuments(DATABASE_ID, RATINGS_COLLECTION_ID, [
                Query.equal('coachId', coachId),
            ])
            .then(res => setRatings(res.documents as unknown as Rating[]));
    }, [coachId]);

    if (!coach) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text>Loading coach…</Text>
            </View>
        );
    }

    return (
        <ScrollView className="p-4">
            <Text className="text-2xl font-bold">{coach.name}</Text>
            <Text className="mt-2">⭐ Avg: {coach.avgRating?.toFixed(1) ?? '–'}</Text>
            <Text className="mt-4 font-semibold">Ratings:</Text>
            {ratings.map(r => (
                <View key={r.$id} className="mt-2 p-2 bg-gray-100 rounded">
                    <Text>⭐ {r.stars}</Text>
                    <Text>{r.comment}</Text>
                    <Text className="text-xs text-gray-600">
                        {new Date(r.createdAt).toLocaleDateString()}
                    </Text>
                </View>
            ))}
        </ScrollView>
    );
}
