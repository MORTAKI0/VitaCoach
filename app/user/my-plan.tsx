// app/user/my-plan.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, SafeAreaView, FlatList, LayoutAnimation, UIManager, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { account, databases, Query, DATABASE_ID, WORKOUTS_COLLECTION_ID } from '../../services/appwrite';
import { Models } from 'appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type WorkoutPlan = Models.Document & {
    title: string;
    exercises: string;
    notes?: string;
    createdAt: string;
};

// --- Reusable, Collapsible Card Component ---
const WorkoutPlanCard = ({ plan, isExpanded, onToggle }: { plan: WorkoutPlan, isExpanded: boolean, onToggle: () => void }) => {
    // Animate layout changes when isExpanded changes
    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }, [isExpanded]);

    return (
        <View style={styles.card}>
            <Pressable onPress={onToggle} style={styles.cardHeader}>
                <View style={styles.cardHeaderInfo}>
                    <View style={styles.cardIcon}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={24} color="#4F46E5" />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>{plan.title}</Text>
                        <Text style={styles.cardDate}>Assigned: {new Date(plan.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
                <MaterialCommunityIcons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={28} color="#6B7280" />
            </Pressable>

            {isExpanded && (
                <View style={styles.cardBody}>
                    <Text style={styles.sectionTitle}>Exercises</Text>
                    <Text style={styles.sectionContent}>{plan.exercises}</Text>
                    {plan.notes && (
                        <>
                            <Text style={styles.sectionTitle}>Coach's Notes</Text>
                            <Text style={styles.sectionContent}>{plan.notes}</Text>
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

export default function MyWorkoutPlansScreen() {
    const router = useRouter();
    const [plans, setPlans] = useState<WorkoutPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const me = await account.get();
                const res = await databases.listDocuments(
                    DATABASE_ID, WORKOUTS_COLLECTION_ID,
                    [Query.equal('clientId', me.$id), Query.orderDesc('createdAt')]
                );
                setPlans(res.documents as WorkoutPlan[]);
                if (res.documents.length > 0) {
                    setExpandedPlanId(res.documents[0].$id);
                }
            } catch (error) {
                console.error("Failed to fetch workout plans:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleTogglePlan = (planId: string) => {
        setExpandedPlanId(prevId => (prevId === planId ? null : planId));
    };

    if (loading) {
        return <View style={styles.loader}><ActivityIndicator size="large" color="#4F46E5" /></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* The custom header has been removed to use the default stack navigator header */}
            <FlatList
                data={plans}
                keyExtractor={(item) => item.$id}
                contentContainerStyle={styles.listContainer}
                ListHeaderComponent={
                    <Text style={styles.title}>My Workout Plans</Text>
                }
                renderItem={({ item }) => (
                    <WorkoutPlanCard
                        plan={item}
                        isExpanded={expandedPlanId === item.$id}
                        onToggle={() => handleTogglePlan(item.$id)}
                    />
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="text-box-remove-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No Workout Plans Yet</Text>
                        <Text style={styles.emptySubtitle}>Your coach has not assigned a workout plan. Check back soon!</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
    listContainer: { padding: 20 },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    cardHeaderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1, // Allow text to shrink if needed
    },
    cardIcon: {
        backgroundColor: '#EEF2FF',
        padding: 8,
        borderRadius: 100
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    cardDate: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    cardBody: {
        padding: 16,
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        marginHorizontal: 16,
        paddingBottom: 20,
    },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 16, marginBottom: 8 },
    sectionContent: { fontSize: 16, color: '#4B5563', lineHeight: 24 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginTop: 16 },
    emptySubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 8 },
});