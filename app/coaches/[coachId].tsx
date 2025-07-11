// app/coaches/[coachId].tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { databases, Query, DATABASE_ID, USERS_COLLECTION_ID, RATINGS_COLLECTION_ID } from '../../services/appwrite';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Rating = { $id: string; userId: string; stars: number; comment: string; createdAt: string; };

export default function CoachProfile() {
    const { coachId } = useLocalSearchParams<{ coachId: string }>();
    const router = useRouter();
    const [coach, setCoach] = useState<any>(null);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!coachId) { router.replace('/coaches'); return; }
        Promise.all([
            databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [Query.equal('$id', coachId)]),
            databases.listDocuments(DATABASE_ID, RATINGS_COLLECTION_ID, [Query.equal('coachId', coachId)])
        ]).then(([coachRes, ratingsRes]) => {
            if (coachRes.documents.length === 0) return router.replace('/coaches');
            setCoach(coachRes.documents[0]);
            setRatings(ratingsRes.documents as any[]);
        }).catch(console.error).finally(() => setLoading(false));
    }, [coachId]);

    if (loading) return <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />;
    if (!coach) return <View style={styles.loader}><Text>Coach not found.</Text></View>;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image source={{ uri: coach.avatar }} style={styles.avatar} />
                <Text style={styles.name}>{coach.name}</Text>
                <Text style={styles.certifications}>{coach.certifications}</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>⭐ {coach.avgRating?.toFixed(1) ?? '–'}</Text>
                        <Text style={styles.statLabel}>{ratings.length} Reviews</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>${coach.hourlyPrice}</Text>
                        <Text style={styles.statLabel}>Per Hour</Text>
                    </View>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <Pressable style={styles.primaryButton} onPress={() => router.push(`/user/hire/${coachId}`)}>
                    <MaterialCommunityIcons name="account-plus-outline" size={20} color="white" />
                    <Text style={styles.primaryButtonText}>Hire Me</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => router.push(`/user/rate/${coachId}`)}>
                    <MaterialCommunityIcons name="star-plus-outline" size={20} color="#007AFF" />
                    <Text style={styles.secondaryButtonText}>Rate Coach</Text>
                </Pressable>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About Me</Text>
                <Text style={styles.bio}>{coach.bio || 'No biography provided.'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                {ratings.length > 0 ? ratings.map(r => (
                    <View key={r.$id} style={styles.reviewCard}>
                        <Text style={styles.reviewStars}>{'⭐'.repeat(r.stars)}</Text>
                        <Text style={styles.reviewComment}>"{r.comment}"</Text>
                        <Text style={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</Text>
                    </View>
                )) : <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', padding: 24, backgroundColor: '#F8F9FA' },
    avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 16, borderWidth: 3, borderColor: 'white' },
    name: { fontSize: 26, fontWeight: 'bold' },
    certifications: { fontSize: 16, color: '#555', marginTop: 4, textAlign: 'center' },
    statsContainer: { flexDirection: 'row', marginTop: 20 },
    stat: { alignItems: 'center', marginHorizontal: 20 },
    statValue: { fontSize: 20, fontWeight: 'bold' },
    statLabel: { fontSize: 14, color: 'gray', marginTop: 4 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    primaryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 100 },
    primaryButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
    secondaryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFEFEF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 100 },
    secondaryButtonText: { color: '#007AFF', fontWeight: 'bold', marginLeft: 8 },
    section: { padding: 24 },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
    bio: { fontSize: 16, lineHeight: 24, color: '#333' },
    reviewCard: { marginBottom: 16, padding: 16, backgroundColor: '#F8F9FA', borderRadius: 12, borderWidth: 1, borderColor: '#EEE' },
    reviewStars: { fontSize: 16 },
    reviewComment: { fontSize: 16, fontStyle: 'italic', color: '#444', marginVertical: 8 },
    reviewDate: { fontSize: 12, color: 'gray', textAlign: 'right' },
    noReviews: { color: 'gray', fontStyle: 'italic' },
});