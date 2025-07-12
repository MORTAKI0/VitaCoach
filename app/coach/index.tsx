// app/coach/index.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Models } from 'appwrite';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { DATABASE_ID, databases, getCurrentUser, logout, Query, RELATIONSHIPS_COLLECTION_ID, USERS_COLLECTION_ID } from '../../services/appwrite';

// --- Type Definitions ---
type Relationship = Models.Document & { userId: string; status: 'requested' | 'active' | 'ended'; };
type ClientProfile = Models.Document & { name: string; avatar?: string; };

// --- Layout Breakpoint ---
const WEB_BREAKPOINT = 1024; // A common breakpoint for two-column desktop layouts

export default function CoachDashboard() {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [requests, setRequests] = useState<Relationship[]>([]);
    const [clients, setClients] = useState<Relationship[]>([]);
    const [clientProfiles, setClientProfiles] = useState<Record<string, ClientProfile>>({});
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const router = useRouter();
    const { width } = useWindowDimensions();
    const isWebLayout = width >= WEB_BREAKPOINT;

    const fetchData = useCallback(async () => {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) throw new Error("No user found");
            const profile = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, currentUser.$id);
            if ((profile as any).role !== 'coach') throw new Error("User is not a coach");
            setUser(currentUser);

            const [requestsRes, clientsRes] = await Promise.all([
                databases.listDocuments(DATABASE_ID, RELATIONSHIPS_COLLECTION_ID, [Query.equal('coachId', currentUser.$id), Query.equal('status', 'requested')]),
                databases.listDocuments(DATABASE_ID, RELATIONSHIPS_COLLECTION_ID, [Query.equal('coachId', currentUser.$id), Query.equal('status', 'active')])
            ]);

            const reqDocs = requestsRes.documents as Relationship[];
            const clientDocs = clientsRes.documents as Relationship[];
            setRequests(reqDocs);
            setClients(clientDocs);

            const allUserIds = [...reqDocs, ...clientDocs].map(r => r.userId).filter(id => id);
            if (allUserIds.length > 0) {
                const profilesRes = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [Query.equal('$id', allUserIds)]);
                const profilesMap = profilesRes.documents.reduce((acc, doc) => {
                    acc[doc.$id] = doc as ClientProfile;
                    return acc;
                }, {} as Record<string, ClientProfile>);
                setClientProfiles(profilesMap);
            }
        } catch (error) { console.error(error); router.replace('/login'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleLogout = () => { logout().then(() => router.replace('/login')); };

    const handleUpdateRequest = async (docId: string, newStatus: 'active' | 'ended') => {
        const isAccepting = newStatus === 'active';
        const requestToUpdate = requests.find(r => r.$id === docId);
        if (!requestToUpdate) return;
        setProcessingId(docId);
        if (isAccepting) {
            setRequests(prev => prev.filter(r => r.$id !== docId));
            setClients(prev => [...prev, { ...requestToUpdate, status: 'active' }]);
        } else {
            setRequests(prev => prev.filter(r => r.$id !== docId));
        }
        try {
            if (isAccepting) {
                await databases.updateDocument(DATABASE_ID, RELATIONSHIPS_COLLECTION_ID, docId, { status: 'active' });
            } else {
                await databases.deleteDocument(DATABASE_ID, RELATIONSHIPS_COLLECTION_ID, docId);
            }
        } catch (e: any) {
            Alert.alert("Error", e.message);
            fetchData(); // Revert on error
        } finally {
            setProcessingId(null);
        }
    };

    const styles = createStyles(isWebLayout);

    if (loading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#4F46E5" /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navBar}>
                <View style={styles.logoContainer}><MaterialCommunityIcons name="dumbbell" size={28} color="#4F46E5" /><Text style={styles.logoText}>FitCoach</Text></View>
                <View style={styles.navActions}>
                    <Pressable style={styles.navButton}><MaterialCommunityIcons name="bell-outline" size={22} color="#4B5563" /></Pressable>
                    <Pressable style={styles.navButton} onPress={() => router.push('/profile-setup')}><MaterialCommunityIcons name="cog-outline" size={22} color="#4B5563" /></Pressable>
                    <Pressable style={styles.navButton} onPress={handleLogout}><MaterialCommunityIcons name="logout" size={22} color="#EF4444" /></Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.welcomeHeader}>
                    <View style={styles.userAvatarContainer}>
                        <Image source={{ uri: user?.prefs.avatar || undefined }} style={styles.userAvatar} />
                    </View>
                    <View>
                        <Text style={styles.greeting}>Welcome back, Coach!</Text>
                        <Text style={styles.userName}>{user?.name}</Text>
                    </View>
                </View>

                <View style={styles.mainLayout}>
                    {/* Requests Column */}
                    <View style={styles.column}>
                        {requests.length > 0 ? requests.map(req => (
                            <View key={req.$id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Image source={{ uri: clientProfiles[req.userId]?.avatar }} style={styles.clientAvatar} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.clientName}>{clientProfiles[req.userId]?.name || 'New User'}</Text>
                                        <View style={styles.statusRow}>
                                            <MaterialCommunityIcons name="clock-outline" size={16} color="#F59E0B" style={{ marginRight: 4 }} />
                                            <Text style={styles.statusRequested}>Requested</Text>
                                            <Text style={styles.cardDate}> · {new Date(req.$createdAt).toLocaleDateString()}</Text>
                                        </View>
                                    </View>
                                </View>
                                {processingId === req.$id ? <ActivityIndicator color="#4F46E5" /> : (
                                    <View style={styles.cardActions}>
                                        <Pressable style={styles.declineButton} onPress={() => handleUpdateRequest(req.$id, 'ended')}>
                                            <MaterialCommunityIcons name="close-circle" size={18} color="#EF4444" />
                                            <Text style={styles.declineButtonText}>Decline</Text>
                                        </Pressable>
                                        <Pressable style={styles.acceptButton} onPress={() => handleUpdateRequest(req.$id, 'active')}>
                                            <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
                                            <Text style={styles.acceptButtonText}>Accept</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        )) : (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="account-plus-outline" size={40} color="#E0E7FF" />
                                <Text style={styles.emptyText}>No new client requests.</Text>
                            </View>
                        )}
                    </View>

                    {/* Clients Column */}
                    <View style={styles.column}>
                        {clients.length > 0 ? clients.map(client => (
                            <Pressable key={client.$id} style={[styles.card, styles.cardPressable]} onPress={() => router.push(`/coach/clients/${client.userId}/create-plan`)}>
                                <View style={styles.cardHeader}>
                                    <Image source={{ uri: clientProfiles[client.userId]?.avatar }} style={styles.clientAvatar} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.clientName}>{clientProfiles[client.userId]?.name}</Text>
                                        <View style={styles.statusRow}>
                                            <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" style={{ marginRight: 4 }} />
                                            <Text style={styles.statusActive}>Active</Text>
                                        </View>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
                                </View>
                            </Pressable>
                        )) : (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="account-group-outline" size={40} color="#E0E7FF" />
                                <Text style={styles.emptyText}>No active clients.</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (isWebLayout: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, height: 64, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoText: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
    navActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    navButton: { padding: 8 },
    scrollContainer: { padding: isWebLayout ? 32 : 16 },
    welcomeHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32 },
    userAvatarContainer: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
    userAvatar: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: '#E0E7FF' },
    greeting: { fontSize: 16, color: '#6B7280' },
    userName: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
    mainLayout: { flexDirection: isWebLayout ? 'row' : 'column', gap: 32 },
    column: { flex: 1, gap: 24 },
    card: { backgroundColor: 'white', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#9CA3AF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, marginBottom: 0 },
    cardPressable: { transitionDuration: '150ms', transitionProperty: 'box-shadow', shadowColor: '#6366F1', shadowOpacity: 0.12 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 },
    clientAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E0E7FF', borderWidth: 2, borderColor: '#E0E7FF' },
    clientName: { fontSize: 17, fontWeight: 'bold', color: '#1F2937' },
    cardDate: { fontSize: 13, color: '#9CA3AF' },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    statusRequested: { fontSize: 13, color: '#F59E0B', fontWeight: '600', marginRight: 4 },
    statusActive: { fontSize: 13, color: '#10B981', fontWeight: '600', marginRight: 4 },
    cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    declineButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5' },
    declineButtonText: { color: '#B91C1C', fontWeight: '700', marginLeft: 4 },
    acceptButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#D1FAE5', borderColor: '#6EE7B7', borderWidth: 1, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    acceptButtonText: { color: '#047857', fontWeight: '700', marginLeft: 4 },
    emptyState: { alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#F3F4F6', borderRadius: 16, marginTop: 8 },
    emptyText: { color: '#9CA3AF', fontStyle: 'italic', paddingTop: 12, fontSize: 15, textAlign: 'center' },
});