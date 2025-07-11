// app/user/rate/[coachId].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { account, databases, functions, ID, DATABASE_ID, RATINGS_COLLECTION_ID, RELATIONSHIPS_COLLECTION_ID, Query, APPWRITE_FUNCTION_ID } from '../../../services/appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// A reusable component for the star rating UI
const StarRating = ({ rating, onRate }: { rating: number, onRate: (rate: number) => void }) => {
    return (
        <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => onRate(star)}>
                    <MaterialCommunityIcons
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={40}
                        color={star <= rating ? '#FFC107' : '#D1D5DB'}
                    />
                </Pressable>
            ))}
        </View>
    );
};

export default function RateCoach() {
    const { coachId } = useLocalSearchParams<{ coachId: string }>();
    const router = useRouter();

    // State for the form itself
    const [stars, setStars] = useState(5);
    const [comment, setComment] = useState('');
    const [busy, setBusy] = useState(false);

    // State for access control and loading
    const [canRate, setCanRate] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!coachId) {
            Alert.alert("Error", "No coach specified.", [{ text: "OK", onPress: () => router.back() }]);
            return;
        }

        const checkPermission = async () => {
            try {
                const me = await account.get();
                // CRUCIAL: Check for an active relationship before allowing a rating
                const res = await databases.listDocuments(DATABASE_ID, RELATIONSHIPS_COLLECTION_ID, [
                    Query.equal('userId', me.$id),
                    Query.equal('coachId', coachId),
                    Query.equal('status', 'active')
                ]);

                if (res.total > 0) {
                    setCanRate(true); // Permission granted
                } else {
                    Alert.alert("Permission Denied", "You can only rate a coach you have an active training relationship with.", [
                        { text: "OK", onPress: () => router.replace(`/coaches/${coachId}`) }
                    ]);
                }
            } catch (error) {
                Alert.alert("Error", "Could not verify your permission to rate this coach.");
                router.back();
            } finally {
                setLoading(false);
            }
        };

        checkPermission();
    }, [coachId]);

    const handleRate = async () => {
        if (comment.trim().length === 0) {
            return Alert.alert('Missing Comment', 'Please share some feedback about your experience.');
        }
        setBusy(true);
        try {
            const me = await account.get();
            await databases.createDocument(DATABASE_ID, RATINGS_COLLECTION_ID, ID.unique(), {
                userId: me.$id,
                coachId,
                stars,
                comment,
                createdAt: new Date().toISOString(),
            });

            // Trigger cloud function to recalculate the coach's average rating
            await functions.createExecution(APPWRITE_FUNCTION_ID, JSON.stringify({ coachId }));

            Alert.alert('Thank You!', 'Your rating has been submitted successfully.', [
                { text: 'OK', onPress: () => router.replace(`/coaches/${coachId}`) }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'An unknown error occurred.');
        } finally {
            setBusy(false);
        }
    };

    if (loading) {
        return <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />;
    }

    if (!canRate) {
        // This view is shown just before the redirect alert, preventing the form from flashing
        return <View style={styles.loader}><Text>Verifying permission...</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Rate Your Experience</Text>
            <Text style={styles.subtitle}>Your feedback helps other users find the right coach. Select a star rating and leave a comment below.</Text>

            <StarRating rating={stars} onRate={setStars} />

            <TextInput
                placeholder="Share your experience..."
                value={comment}
                onChangeText={setComment}
                multiline
                style={styles.input}
            />

            <Pressable
                style={({ pressed }) => [styles.submitButton, (busy || !comment) && styles.disabledButton, pressed && styles.pressedButton]}
                onPress={handleRate}
                disabled={busy || !comment}
            >
                {busy ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.submitButtonText}>Submit Rating</Text>
                )}
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: '#1F2937'
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 32,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        padding: 16,
        marginBottom: 24,
        borderRadius: 12,
        fontSize: 16,
        height: 140,
        textAlignVertical: 'top'
    },
    submitButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    disabledButton: {
        backgroundColor: '#AECBFA',
    },
    pressedButton: {
        opacity: 0.8
    }
});