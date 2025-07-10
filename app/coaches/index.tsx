// app/coaches/index.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Pressable, View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { databases, Query, DATABASE_ID, USERS_COLLECTION_ID } from '../../services/appwrite';

type Coach = {
    $id:      string;
    name:     string;
    avatar?:  string;
    avgRating?: number;
};

export default function CoachesIndex() {
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const router = useRouter();

    useEffect(() => {
        databases
            .listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
                Query.equal('role', 'coach'),
            ])
            .then(res => setCoaches(res.documents as unknown as Coach[]))
            .catch(console.error);
    }, []);

    return (
        <ScrollView className="p-4">
            {coaches.map(coach => (
                <Pressable
                    key={coach.$id}
                    className="mb-4 p-4 bg-white rounded shadow"
                    onPress={() => router.push(`/coaches/${coach.$id}`)}
                >
                    <View className="flex-row items-center">
                        {coach.avatar && (
                            <Image
                                source={{ uri: coach.avatar }}
                                className="w-12 h-12 rounded-full mr-4"
                            />
                        )}
                        <View>
                            <Text className="text-lg font-semibold">{coach.name}</Text>
                            <Text>⭐ {coach.avgRating?.toFixed(1) ?? '–'}</Text>
                        </View>
                    </View>
                </Pressable>
            ))}
        </ScrollView>
    );
}
