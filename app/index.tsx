// app/index.tsx (This code is correct)

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Pressable,
    useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

const heroImageUrl = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=3270&auto=format&fit=crop';

const COLORS = {
    primary: '#007AFF',
    primarySlightlyLighter: '#2E94FF',
    white: '#FFFFFF',
    darkText: '#1C1C1E',
    lightText: '#8E8E93',
    subtleGray: '#F2F2F7',
};

const WEB_BREAKPOINT = 768;

export default function HomeScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isWebLayout = width >= WEB_BREAKPOINT;

    const styles = createStyles(isWebLayout);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: heroImageUrl }}
                        style={styles.image}
                        contentFit="cover"
                        transition={500}
                    />
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.webContentWrapper}>
                        <Text style={styles.headerLogo}>VitaCoach</Text>
                        {isWebLayout && <View style={{ flex: 1 }} />}
                        <View>
                            <Text style={styles.title}>Unlock Your Potential</Text>
                            <Text style={styles.subtitle}>
                                Your personal guide to fitness, right in your pocket.
                            </Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <Pressable onPress={() => router.push("/signup")}>
                                {({ hovered }) => (
                                    <LinearGradient
                                        colors={[COLORS.primarySlightlyLighter, COLORS.primary]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={[styles.primaryButton, hovered && styles.primaryButtonHover]}
                                    >
                                        <Text style={styles.primaryButtonText}>Get Started for Free</Text>
                                    </LinearGradient>
                                )}
                            </Pressable>
                            <Pressable onPress={() => router.push("/login")}>
                                {({ hovered }) => (
                                    <View style={[styles.secondaryButton, hovered && styles.secondaryButtonHover]}>
                                        <Text style={styles.secondaryButtonText}>I Already Have an Account</Text>
                                    </View>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const createStyles = (isWebLayout: boolean) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    container: { flex: 1, flexDirection: isWebLayout ? 'row' : 'column' },
    imageContainer: { flex: 1 },
    image: { width: '100%', height: '100%' },
    contentContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: isWebLayout ? 0 : 24,
        borderTopLeftRadius: isWebLayout ? 0 : 30,
        borderTopRightRadius: isWebLayout ? 0 : 30,
        marginTop: isWebLayout ? 0 : -30,
    },
    webContentWrapper: {
        width: '100%',
        height: '100%',
        maxWidth: isWebLayout ? 450 : undefined,
        paddingHorizontal: isWebLayout ? 40 : 0,
        justifyContent: 'space-between',
    },
    headerLogo: {
        fontWeight: 'bold',
        fontSize: 22,
        color: COLORS.darkText,
        textAlign: isWebLayout ? 'left' : 'center',
        marginBottom: 20,
        opacity: isWebLayout ? 1 : 0,
        height: isWebLayout ? 'auto' : 0,
    },
    title: {
        fontSize: isWebLayout ? 40 : 32,
        fontWeight: 'bold',
        color: COLORS.darkText,
        textAlign: isWebLayout ? 'left' : 'center',
        lineHeight: isWebLayout ? 48 : 38,
    },
    subtitle: {
        fontSize: 17,
        color: COLORS.lightText,
        textAlign: isWebLayout ? 'left' : 'center',
        marginTop: 15,
        lineHeight: 24,
    },
    buttonContainer: { width: '100%', marginTop: 40 },
    primaryButton: {
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    primaryButtonHover: { transform: [{ scale: 1.03 }] },
    primaryButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
    secondaryButton: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
    secondaryButtonHover: { backgroundColor: COLORS.subtleGray },
    secondaryButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
});