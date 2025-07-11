// app/user/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, SafeAreaView, ScrollView, RefreshControl, useWindowDimensions } from 'react-native';
import { getCurrentUser, logout, databases, Query, DATABASE_ID, RELATIONSHIPS_COLLECTION_ID, USERS_COLLECTION_ID } from '../../services/appwrite';
import { useRouter } from 'expo-router';
import { Models } from 'appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

// --- Types ---
type Relationship = Models.Document & { coachId: string; status: 'requested' | 'active' | 'ended'; };
type CoachProfile = Models.Document & { name: string; avatar?: string; specialization?: string };

// --- Layout Breakpoint ---
const WEB_BREAKPOINT = 1024; // A common breakpoint for two-column layouts

export default function UserDashboard() {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [relationship, setRelationship] = useState<Relationship | null>(null);
    const [coach, setCoach] = useState<CoachProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const router = useRouter();
    const { width } = useWindowDimensions();
    const isWebLayout = width >= WEB_BREAKPOINT;

    // --- Data Fetching ---
    const fetchData = async () => {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) return router.replace('/login');
            setUser(currentUser);

            const relRes = await databases.listDocuments(DATABASE_ID, RELATIONSHIPS_COLLECTION_ID, [
                Query.equal('userId', currentUser.$id), Query.notEqual('status', 'ended')
            ]);

            if (relRes.total > 0) {
                const currentRel = relRes.documents[0] as Relationship;
                setRelationship(currentRel);
                const coachProfile = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, currentRel.coachId);
                setCoach(coachProfile as CoachProfile);
            } else {
                setRelationship(null);
                setCoach(null);
            }
        } catch (error) {
            console.error("Failed to fetch user dashboard data:", error);
            // Don't auto-redirect on fetch error, show a message instead
            // router.replace('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, []);

    const handleLogout = () => { logout().then(() => router.replace('/login')); };
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    // --- Reusable Components for Clean UI ---
    const StatCard = ({ icon, label, value, color }: any) => (
        <View style={styles.statCard}>
            <MaterialCommunityIcons name={icon} size={28} color={color} />
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
        </View>
    );

    const ActionRow = ({ icon, text, onPress }: any) => (
        <Pressable style={styles.actionRow} onPress={onPress}>
            <MaterialCommunityIcons name={icon} size={20} color="#4B5563" />
            <Text style={styles.actionText}>{text}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#D1D5DB" />
        </Pressable>
    );

    const ActivityItem = ({ text, time, color }: any) => (
        <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: color }]} />
            <View>
                <Text style={styles.activityText}>{text}</Text>
                <Text style={styles.activityTime}>{time}</Text>
            </View>
        </View>
    );

    const styles = createStyles(isWebLayout);

    if (loading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#4F46E5" /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. Persistent Navigation Header */}
            <View style={styles.navBar}>
                <View style={styles.logoContainer}>
                    <MaterialCommunityIcons name="dumbbell" size={28} color="#4F46E5" />
                    <Text style={styles.logoText}>FitCoach</Text>
                </View>
                <View style={styles.navActions}>
                    <Pressable style={styles.navButton}><MaterialCommunityIcons name="bell-outline" size={22} color="#4B5563" /></Pressable>
                    <Pressable style={styles.navButton} onPress={() => router.push('/profile-setup')}><MaterialCommunityIcons name="cog-outline" size={22} color="#4B5563" /></Pressable>
                    <Pressable style={styles.navButton} onPress={handleLogout}><MaterialCommunityIcons name="logout" size={22} color="#EF4444" /></Pressable>
                </View>
            </View>

            {/* 2. Scrollable Content Area */}
            <ScrollView contentContainerStyle={styles.scrollContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                {/* Welcome Header */}
                <View style={styles.welcomeHeader}>
                    <View style={styles.userAvatarContainer}>
                        <Image source={{ uri: user?.prefs.avatar || undefined }} style={styles.userAvatar} />
                    </View>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()},</Text>
                        <Text style={styles.userName}>{user?.name}</Text>
                    </View>
                </View>

                {/* 3. Main Two-Column Layout */}
                <View style={styles.mainLayout}>
                    {/* Left Column */}
                    <View style={styles.leftColumn}>
                        {relationship && coach ? (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.statusIcon, { backgroundColor: '#10B9811A' }]}><MaterialCommunityIcons name="check-circle" size={16} color="#10B981" /></View>
                                    <Text style={styles.cardTitle}>Your Training Journey</Text>
                                    <View style={styles.statusBadge}><Text style={styles.statusBadgeText}>Active</Text></View>
                                </View>
                                <Pressable style={styles.coachInfoCard} onPress={() => router.push(`/coaches/${coach.$id}`)}>
                                    <Image source={{ uri: coach.avatar }} style={styles.coachAvatar} />
                                    <View style={{ flex: 1 }}><Text style={styles.coachName}>{coach.name}</Text><Text style={styles.coachSpec}>{coach.specialization}</Text></View>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
                                </Pressable>
                                <Text style={styles.cardDescription}>Access your personalized training plan and track your progress with your dedicated coach.</Text>
                                <Pressable style={styles.primaryButton} onPress={() => router.push(`/coaches/${coach.$id}`)}><Text style={styles.primaryButtonText}>View Coach Profile</Text></Pressable>
                            </View>
                        ) : (
                            <View style={[styles.card, { alignItems: 'center', backgroundColor: '#F9FAFB' }]}>
                                <View style={styles.iconCircle}><MaterialCommunityIcons name="magnify" size={32} color="#4F46E5" /></View>
                                <Text style={[styles.cardTitle, { marginTop: 16, fontSize: 20 }]}>Find Your Perfect Coach</Text>
                                <Text style={[styles.cardDescription, { marginBottom: 24 }]}>Connect with certified professionals to achieve your fitness goals.</Text>
                                <Pressable style={styles.primaryButton} onPress={() => router.push('/coaches')}><Text style={styles.primaryButtonText}>Browse Coaches</Text></Pressable>
                            </View>
                        )}
                        <View style={styles.statsGrid}>
                            <StatCard icon="bullseye-arrow" label="Goals Set" value="3" color="#4F46E5" />
                            <StatCard icon="calendar-check" label="Sessions" value="12" color="#10B981" />
                            <StatCard icon="chart-line" label="Progress" value="85%" color="#8B5CF6" />
                        </View>
                    </View>

                    {/* Right Column (Sidebar) */}
                    <View style={styles.rightColumn}>
                        <View style={styles.card}>
                            <Text style={styles.sidebarTitle}>Quick Actions</Text>
                            <ActionRow icon="account-edit-outline" text="Edit Profile" onPress={() => router.push('/profile-setup')} />
                            <ActionRow icon="dumbbell" text="My Workouts" onPress={() => {}} />
                            <ActionRow icon="chart-timeline-variant" text="View Progress" onPress={() => {}} />
                            <ActionRow icon="help-circle-outline" text="Help & Support" onPress={() => {}} />
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.sidebarTitle}>Recent Activity</Text>
                            <ActivityItem text="Completed workout" time="2 hours ago" color="#10B981" />
                            <ActivityItem text="New message from coach" time="1 day ago" color="#4F46E5" />
                            <ActivityItem text="Goal milestone reached" time="3 days ago" color="#8B5CF6" />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (isWebLayout: boolean) => StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
    navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, height: 64, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoText: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
    navActions: { flexDirection: 'row', alignItems: 'center', gap: isWebLayout ? 8 : 4 },
    navButton: { padding: 8 },
    scrollContainer: { padding: isWebLayout ? 32 : 16 },
    welcomeHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32 },
    userAvatarContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    userAvatar: { width: 60, height: 60, borderRadius: 30 },
    greeting: { fontSize: 16, color: '#6B7280' },
    userName: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
    mainLayout: { flexDirection: isWebLayout ? 'row' : 'column', gap: 24 },
    leftColumn: { flex: isWebLayout ? 2 : 1, gap: 24 },
    rightColumn: { flex: isWebLayout ? 1 : 1, gap: 24 },
    card: { backgroundColor: 'white', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: "#9CA3AF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    cardTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', flex: 1 },
    cardDescription: { fontSize: 15, color: '#6B7280', lineHeight: 22, marginVertical: 8 },
    statusIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    statusBadge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 100, backgroundColor: '#334155' },
    statusBadgeText: { color: 'white', fontWeight: '500', fontSize: 12, textTransform: 'capitalize' },
    coachInfoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginVertical: 8 },
    coachAvatar: { width: 48, height: 48, borderRadius: 24 },
    coachName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
    coachSpec: { fontSize: 14, color: '#6B7280' },
    primaryButton: { backgroundColor: '#1F2937', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    statsGrid: { flexDirection: 'row', gap: 16 },
    statCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#F3F4F6' },
    statLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
    statValue: { fontSize: 24, fontWeight: 'bold' },
    sidebarTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#111827' },
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
    actionText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#374151' },
    activityItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
    activityDot: { width: 8, height: 8, borderRadius: 4 },
    activityText: { fontSize: 14, fontWeight: '500', color: '#374151' },
    activityTime: { fontSize: 12, color: '#9CA3AF' },
});