// app/user/rate/[coachId].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ActivityIndicator, Pressable, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { account, databases, functions, ID, DATABASE_ID, RATINGS_COLLECTION_ID, RELATIONSHIPS_COLLECTION_ID, Query, APPWRITE_FUNCTION_ID } from '../../../services/appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const StarRating = ({ rating, onRate }: { rating: number, onRate: (rate: number) => void }) => (
    <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => onRate(star)} style={({ pressed }) => [styles.starButton, pressed && styles.starButtonPressed]}>
                <MaterialCommunityIcons name={star <= rating ? 'star' : 'star-outline'} size={40} color={star <= rating ? '#FFC107' : '#D1D5DB'} />
            </Pressable>
        ))}
    </View>
);

export default function RateCoach() {
    const { coachId } = useLocalSearchParams<{ coachId: string }>();
    const router = useRouter();

    const [stars, setStars] = useState(5);
    const [comment, setComment] = useState('');
    const [busy, setBusy] = useState(false);
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
                const res = await databases.listDocuments(DATABASE_ID, RELATIONSHIPS_COLLECTION_ID, [
                    Query.equal('userId', me.$id), Query.equal('coachId', coachId), Query.equal('status', 'active')
                ]);
                if (res.total > 0) setCanRate(true);
                else {
                    Alert.alert("Permission Denied", "You can only rate an active coach.", [{ text: "OK", onPress: () => router.replace(`/coaches/${coachId}`) }]);
                }
            } catch (error) {
                Alert.alert("Error", "Could not verify permission.");
                router.back();
            } finally {
                setLoading(false);
            }
        };
        checkPermission();
    }, [coachId]);

    const handleRate = async () => {
        if (comment.trim().length === 0) return Alert.alert('Missing Comment', 'Please share some feedback.');
        setBusy(true);
        try {
            const me = await account.get();
            await databases.createDocument(DATABASE_ID, RATINGS_COLLECTION_ID, ID.unique(), {
                userId: me.$id, coachId, stars, comment, createdAt: new Date().toISOString(),
            });
            await functions.createExecution(APPWRITE_FUNCTION_ID, JSON.stringify({ coachId }));

            // Redirect immediately on success
            router.replace('/user');

        } catch (err: any) {
            Alert.alert('Error', err?.message ?? 'Unknown error.');
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#6366F1" /></View>;
    if (!canRate) return <View style={styles.loader}><Text>Verifying permission...</Text></View>;

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="chevron-left" size={32} color="#1F2937" />
                    </Pressable>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={styles.content}>
                        <View style={styles.headerIconContainer}>
                            <LinearGradient colors={['#FFD54F', '#FFC107']} style={styles.iconBackground}>
                                <MaterialCommunityIcons name="star-plus-outline" size={32} color="white" />
                            </LinearGradient>
                        </View>

                        <Text style={styles.title}>Rate Your Experience</Text>
                        <Text style={styles.subtitle}>Your feedback helps other users find the right coach.</Text>

                        <StarRating rating={stars} onRate={setStars} />

                        <TextInput
                            placeholder="Share what you liked and what could be improved..."
                            value={comment}
                            onChangeText={setComment}
                            multiline
                            style={styles.input}
                            textAlignVertical="top"
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.submitButtonContainer,
                            pressed && !busy && comment.trim() && styles.pressedButton
                        ]}
                        onPress={handleRate}
                        disabled={busy || !comment.trim()}
                    >
                        <LinearGradient
                            colors={
                                busy || !comment.trim()
                                    ? ['#D1D5DB', '#9CA3AF']
                                    : ['#10B981', '#059669', '#047857']
                            }
                            style={styles.submitButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {busy ? (
                                <View style={styles.buttonContent}>
                                    <ActivityIndicator color="white" size="small" />
                                    <Text style={styles.submitButtonText}>Submitting...</Text>
                                </View>
                            ) : (
                                <View style={styles.buttonContent}>
                                    <MaterialCommunityIcons name="send-check-outline" size={24} color="white" />
                                    <Text style={styles.submitButtonText}>Submit Rating</Text>
                                </View>
                            )}
                        </LinearGradient>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white'
    },
    container: {
        flex: 1,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    header: {
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 5,
        backgroundColor: 'white',
        zIndex: 1,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerIconContainer: {
        alignItems: 'center',
        marginBottom: 20
    },
    iconBackground: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
        color: '#1F2937'
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 32
    },
    starButton: {
        padding: 4
    },
    starButtonPressed: {
        transform: [{ scale: 0.9 }],
        opacity: 0.8
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
        minHeight: 120,
        maxHeight: 200,
        lineHeight: 22,
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        borderTopWidth: 2,
        borderTopColor: '#E5E7EB',
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 10,
    },
    submitButtonContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#10B981',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 12,
    },
    submitButton: {
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderRadius: 20,
        minHeight: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    pressedButton: {
        opacity: 0.9,
        transform: [{ scale: 0.97 }],
    }
});