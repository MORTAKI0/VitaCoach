// app/coach/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Pressable, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { getCurrentUser, logout, databases, Query, DATABASE_ID, RELATIONSHIPS_COLLECTION_ID, USERS_COLLECTION_ID } from '../../services/appwrite';
import { Models } from 'appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Relationship = Models.Document & { userId: string; status: 'requested' | 'active' | 'ended'; };

export default function CoachDashboard() {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [requests, setRequests] = useState<Relationship[]>([]);
    const [clients, setClients] = useState<Relationship[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const router = useRouter();

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

            setRequests(requestsRes.documents as Relationship[]);
            setClients(clientsRes.documents as Relationship[]);
        } catch (error) { console.error(error); router.replace('/login'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleLogout = () => { logout().then(() => router.replace('/login')); };

    // --- CORRECTED: Removed fetchData() to rely on the optimistic update ---
    const handleAcceptRequest = async (docId: string) => {
        const requestToAccept = requests.find(r => r.$id === docId);
        if (!requestToAccept) return;

        setProcessingId(docId);
        // 1. Optimistically update the UI
        setRequests(prev => prev.filter(r => r.$id !== docId));
        setClients(prev => [...prev, { ...requestToAccept, status: 'active' }]);

        try {
            // 2. Send update to database in the background
            await databases.updateDocument(DATABASE_ID, RELATIONSHIPS_COLLECTION_ID, docId, { status: 'active' });
        } catch (e: any) {
            Alert.alert("Error Accepting Request", e.message);
            // 3. Revert UI on failure
            setRequests(prev => [...prev, requestToAccept]);
            setClients(prev => prev.filter(c => c.$id !== docId));
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeclineRequest = async (docId: string) => {
        const requestToDecline = requests.find(r => r.$id === docId);
        if (!requestToDecline) return;

        setProcessingId(docId);
        // 1. Optimistically update the UI
        setRequests(prev => prev.filter(r => r.$id !== docId));

        try {
            // 2. Send delete request to the database
            await databases.deleteDocument(DATABASE_ID, RELATIONSHIPS_COLLECTION_ID, docId);
        } catch (e: any) {
            Alert.alert("Error Declining Request", e.message);
            // 3. Revert UI on failure
            setRequests(prev => [...prev, requestToDecline]);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#6366F1" /></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Coach Dashboard</Text>
                        <Text style={styles.title}>{user?.name}</Text>
                    </View>
                    <Pressable onPress={handleLogout} style={styles.logoutButton}><MaterialCommunityIcons name="logout" size={24} color="white" /></Pressable>
                </View>
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}><MaterialCommunityIcons name="account-group" size={24} color="#6366F1" /><Text style={styles.statNumber}>{clients.length}</Text><Text style={styles.statLabel}>Active Clients</Text></View>
                    <View style={styles.statCard}><MaterialCommunityIcons name="clock-outline" size={24} color="#F59E0B" /><Text style={styles.statNumber}>{requests.length}</Text><Text style={styles.statLabel}>Pending Requests</Text></View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Client Requests</Text>
                        {requests.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{requests.length}</Text></View>}
                    </View>
                    {requests.length > 0 ? requests.map(req => (
                        <View key={req.$id} style={styles.requestCard}>
                            <View style={styles.requestInfo}><View style={styles.avatarContainer}><MaterialCommunityIcons name="account" size={20} color="#6366F1" /></View><View><Text style={styles.requestTitle}>New Client Request</Text><Text style={styles.requestSubtitle}>User ID: {req.userId}</Text></View></View>
                            {processingId === req.$id ? <ActivityIndicator color="#6366F1" /> : <View style={styles.requestActions}><Pressable style={styles.declineButton} onPress={() => handleDeclineRequest(req.$id)}><MaterialCommunityIcons name="close" size={18} color="#EF4444" /></Pressable><Pressable style={styles.acceptButton} onPress={() => handleAcceptRequest(req.$id)}><MaterialCommunityIcons name="check" size={18} color="white" /><Text style={styles.acceptButtonText}>Accept</Text></Pressable></View>}
                        </View>
                    )) : <View style={styles.emptyState}><MaterialCommunityIcons name="inbox-outline" size={48} color="#9CA3AF" /><Text style={styles.emptyTitle}>No pending requests</Text></View>}
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Active Clients</Text>
                        {clients.length > 0 && <View style={[styles.badge, styles.successBadge]}><Text style={styles.badgeText}>{clients.length}</Text></View>}
                    </View>
                    {clients.length > 0 ? clients.map(client => (
                        <View key={client.$id} style={styles.clientCard}>
                            <View style={styles.clientInfo}><View style={[styles.avatarContainer, styles.activeAvatar]}><MaterialCommunityIcons name="account-check" size={20} color="#10B981" /></View><View><Text style={styles.clientName}>Client: {client.userId}</Text><Text style={styles.clientStatus}>Active Training</Text></View></View>
                            <Pressable style={styles.manageButton} onPress={() => router.push(`/coach/clients/${client.userId}/create-plan`)}><Text style={styles.manageButtonText}>Manage</Text></Pressable>
                        </View>
                    )) : <View style={styles.emptyState}><MaterialCommunityIcons name="account-group-outline" size={48} color="#9CA3AF" /><Text style={styles.emptyTitle}>No active clients</Text></View>}
                </View>
                <View style={styles.actionSection}>
                    <Pressable style={styles.actionButton} onPress={() => router.push(`/coaches/${user?.$id}`)}><MaterialCommunityIcons name="account-eye" size={20} color="#6366F1" /><Text style={styles.actionButtonText}>View Public Profile</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" /></Pressable>
                    <Pressable style={styles.actionButton} onPress={() => router.push('/profile-setup')}><MaterialCommunityIcons name="pencil" size={20} color="#6366F1" /><Text style={styles.actionButtonText}>Edit Profile</Text><MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" /></Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 50, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    greeting: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)' },
    title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
    logoutButton: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    statsContainer: { flexDirection: 'row', gap: 16 },
    statCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 20, alignItems: 'center' },
    statNumber: { fontSize: 32, fontWeight: 'bold', color: '#1F2937', marginTop: 8 },
    statLabel: { fontSize: 14, color: '#6B7280', marginTop: 4 },
    content: { flex: 1, marginTop: -15 },
    section: { marginTop: 30, marginHorizontal: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: '#1F2937' },
    badge: { backgroundColor: '#F59E0B', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
    successBadge: { backgroundColor: '#10B981' },
    badgeText: { fontSize: 12, fontWeight: 'bold', color: 'white' },
    requestCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
    requestInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatarContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    activeAvatar: { backgroundColor: '#DCFCE7' },
    requestTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    requestSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
    requestActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    declineButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
    acceptButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 18, gap: 6 },
    acceptButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
    clientCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    clientInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    clientName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    clientStatus: { fontSize: 14, color: '#10B981', marginTop: 2 },
    manageButton: { backgroundColor: '#EEF2FF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 18 },
    manageButtonText: { color: '#4338CA', fontWeight: '600' },
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 12 },
    emptyText: { fontSize: 14, color: '#9CA3AF' },
    actionSection: { marginTop: 30, marginBottom: 40 },
    actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 12 },
    actionButtonText: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginLeft: 12, flex: 1 },
});