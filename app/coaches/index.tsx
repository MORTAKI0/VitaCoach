// app/coaches/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Pressable, TextInput, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { databases, Query, DATABASE_ID, USERS_COLLECTION_ID } from '../../services/appwrite';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Coach = {
    $id: string;
    name: string;
    avatar?: string;
    avgRating?: number;
    certifications?: string;
    hourlyPrice?: number;
    city?: string;
};

// Reusable Coach Card Component for FlatList
const CoachCard = ({ item }: { item: Coach }) => {
    const router = useRouter();
    return (
        <Pressable style={styles.card} onPress={() => router.push(`/coaches/${item.$id}`)}>
            <Image source={{ uri: item.avatar || undefined }} style={styles.avatar} contentFit="cover" />
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.city}>{item.city || 'Remote'}</Text>
                <View style={styles.statsRow}>
                    <Text style={styles.rating}>⭐ {item.avgRating?.toFixed(1) ?? 'New'}</Text>
                    {item.hourlyPrice && <Text style={styles.price}>${item.hourlyPrice}/hr</Text>}
                </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
        </Pressable>
    );
};

export default function CoachesMarketplace() {
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [loading, setLoading] = useState(true);
    // State for filters
    const [cityFilter, setCityFilter] = useState('');
    const [specFilter, setSpecFilter] = useState('');

    // Debounce state to prevent firing queries on every keystroke
    const [debouncedSpecFilter, setDebouncedSpecFilter] = useState(specFilter);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSpecFilter(specFilter);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [specFilter]);


    useEffect(() => {
        setLoading(true);
        const queries = [Query.equal('role', 'coach')];

        // Add filters to the query array if they exist
        if (cityFilter.trim()) {
            queries.push(Query.equal('city', cityFilter.trim()));
        }
        if (debouncedSpecFilter.trim()) {
            // Use 'search' for partial matches on certifications/specializations
            queries.push(Query.search('certifications', debouncedSpecFilter.trim()));
        }

        databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, queries)
            .then(res => setCoaches(res.documents as unknown as Coach[]))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [cityFilter, debouncedSpecFilter]); // Re-run effect when filters change

    const renderEmptyListComponent = () => (
        <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-search-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Coaches Found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search filters or check back later.</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Find a Coach</Text>
                <View style={styles.filterContainer}>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="map-marker-outline" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.filterInput}
                            placeholder="Filter by City"
                            value={cityFilter}
                            onChangeText={setCityFilter}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="star-box-outline" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.filterInput}
                            placeholder="Filter by Specialization"
                            value={specFilter}
                            onChangeText={setSpecFilter}
                        />
                    </View>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
            ) : (
                <FlatList
                    data={coaches}
                    renderItem={CoachCard}
                    keyExtractor={(item) => item.$id}
                    contentContainerStyle={styles.listContentContainer}
                    ListEmptyComponent={renderEmptyListComponent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        backgroundColor: 'white',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    filterContainer: {
        paddingHorizontal: 20,
        marginTop: 16,
        gap: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    filterInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        marginLeft: 8,
        color: '#111827',
    },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContentContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#4B5563",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
    infoContainer: { flex: 1, marginRight: 10, gap: 4 },
    name: { fontSize: 18, fontWeight: '600', color: '#111827' },
    city: { fontSize: 14, color: '#6B7280' },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
    rating: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
    price: { fontSize: 15, fontWeight: 'bold', color: '#007AFF' },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
        textAlign: 'center'
    },
});