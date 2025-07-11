// app/coach/index.tsx
import React, { useEffect, useState } from 'react';
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
    const router = useRouter();

    const fetchData = async () => {
        setLoading(true);
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
    };

    useEffect(() => { fetchData(); }, []);

    const handleLogout = () => { logout().then(() => router.replace('/login')); };

    const handleUpdateRequest = async (docId: string, newStatus: 'active' | 'ended') => {
        try {
            await databases.updateDocument(DATABASE_ID, RELATIONSHIPS_COLLECTION_ID, docId, { status: newStatus });
            fetchData();
        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Loading your dashboard...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Good morning</Text>
                        <Text style={styles.title}>Coach Dashboard</Text>
                    </View>
                    <Pressable onPress={handleLogout} style={styles.logoutButton}>
                        <MaterialCommunityIcons name="logout" size={24} color="white" />
                    </Pressable>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <MaterialCommunityIcons name="account-group" size={24} color="#6366F1" />
                        <Text style={styles.statNumber}>{clients.length}</Text>
                        <Text style={styles.statLabel}>Active Clients</Text>
                    </View>
                    <View style={styles.statCard}>
                        <MaterialCommunityIcons name="clock-outline" size={24} color="#F59E0B" />
                        <Text style={styles.statNumber}>{requests.length}</Text>
                        <Text style={styles.statLabel}>Pending Requests</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Client Requests Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Client Requests</Text>
                        {requests.length > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{requests.length}</Text>
                            </View>
                        )}
                    </View>

                    {requests.length > 0 ? (
                        requests.map(req => (
                            <View key={req.$id} style={styles.requestCard}>
                                <View style={styles.requestHeader}>
                                    <View style={styles.requestInfo}>
                                        <View style={styles.avatarContainer}>
                                            <MaterialCommunityIcons name="account" size={20} color="#6366F1" />
                                        </View>
                                        <View>
                                            <Text style={styles.requestTitle}>New Client Request</Text>
                                            <Text style={styles.requestSubtitle}>User ID: {req.userId}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.requestActions}>
                                        <Pressable
                                            style={styles.declineButton}
                                            onPress={() => handleUpdateRequest(req.$id, 'ended')}
                                        >
                                            <MaterialCommunityIcons name="close" size={18} color="#EF4444" />
                                        </Pressable>
                                        <Pressable
                                            style={styles.acceptButton}
                                            onPress={() => handleUpdateRequest(req.$id, 'active')}
                                        >
                                            <MaterialCommunityIcons name="check" size={18} color="white" />
                                            <Text style={styles.acceptButtonText}>Accept</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="inbox-outline" size={48} color="#9CA3AF" />
                            <Text style={styles.emptyTitle}>No pending requests</Text>
                            <Text style={styles.emptyText}>New client requests will appear here</Text>
                        </View>
                    )}
                </View>

                {/* Active Clients Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Active Clients</Text>
                        {clients.length > 0 && (
                            <View style={[styles.badge, styles.successBadge]}>
                                <Text style={styles.badgeText}>{clients.length}</Text>
                            </View>
                        )}
                    </View>

                    {clients.length > 0 ? (
                        clients.map(client => (
                            <View key={client.$id} style={styles.clientCard}>
                                <View style={styles.clientInfo}>
                                    <View style={[styles.avatarContainer, styles.activeAvatar]}>
                                        <MaterialCommunityIcons name="account-check" size={20} color="#10B981" />
                                    </View>
                                    <View>
                                        <Text style={styles.clientName}>Client: {client.userId}</Text>
                                        <Text style={styles.clientStatus}>Active Training</Text>
                                    </View>
                                </View>
                                <View style={styles.activeIndicator} />
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="account-group-outline" size={48} color="#9CA3AF" />
                            <Text style={styles.emptyTitle}>No active clients</Text>
                            <Text style={styles.emptyText}>Your clients will appear here once you accept requests</Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionSection}>
                    <Pressable
                        style={styles.actionButton}
                        onPress={() => router.push(`/coaches/${user?.$id}`)}
                    >
                        <MaterialCommunityIcons name="account-eye" size={20} color="#6366F1" />
                        <Text style={styles.actionButtonText}>View Public Profile</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </Pressable>

                    <Pressable
                        style={styles.actionButton}
                        onPress={() => router.push('/profile-setup')}
                    >
                        <MaterialCommunityIcons name="pencil" size={20} color="#6366F1" />
                        <Text style={styles.actionButtonText}>Edit Profile</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    header: {
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    greeting: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    logoutButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    content: {
        flex: 1,
        marginTop: -15,
    },
    section: {
        marginTop: 30,
        marginHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
    },
    badge: {
        backgroundColor: '#F59E0B',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: 24,
        alignItems: 'center',
    },
    successBadge: {
        backgroundColor: '#10B981',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
    },
    requestCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    requestInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activeAvatar: {
        backgroundColor: '#DCFCE7',
    },
    requestTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    requestSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    requestActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    declineButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B981',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 18,
        gap: 6,
    },
    acceptButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    clientCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    clientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    clientName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    clientStatus: {
        fontSize: 14,
        color: '#10B981',
        marginTop: 2,
    },
    activeIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 12,
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 4,
    },
    actionSection: {
        marginTop: 30,
        marginHorizontal: 20,
        marginBottom: 40,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 12,
        flex: 1,
    },
});