// app/index.tsx (Enhanced version)

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Pressable,
    useWindowDimensions,
    Animated,
    StatusBar,
    ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

const heroImageUrl = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=3270&auto=format&fit=crop';

const COLORS = {
    primary: '#007AFF',
    primarySlightlyLighter: '#2E94FF',
    primaryDark: '#0056CC',
    white: '#FFFFFF',
    darkText: '#1C1C1E',
    lightText: '#8E8E93',
    subtleGray: '#F2F2F7',
    shadowColor: '#000000',
    success: '#34C759',
    warning: '#FF9500',
};

const WEB_BREAKPOINT = 768;

export default function HomeScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isWebLayout = width >= WEB_BREAKPOINT;

    // Animation refs
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoTranslateY = useRef(new Animated.Value(-20)).current;
    const titleScale = useRef(new Animated.Value(0.8)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const subtitleOpacity = useRef(new Animated.Value(0)).current;
    const buttonsTranslateY = useRef(new Animated.Value(30)).current;
    const buttonsOpacity = useRef(new Animated.Value(0)).current;
    const imageScale = useRef(new Animated.Value(1.1)).current;

    useEffect(() => {
        // Staggered animations for better UX
        const animationSequence = Animated.sequence([
            // Image zoom-in effect
            Animated.timing(imageScale, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),

            // Logo animation
            Animated.parallel([
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(logoTranslateY, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),

            // Title animation
            Animated.parallel([
                Animated.timing(titleScale, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(titleOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),

            // Subtitle animation
            Animated.timing(subtitleOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),

            // Buttons animation
            Animated.parallel([
                Animated.timing(buttonsTranslateY, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonsOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]);

        // Start animations after a brief delay
        const timer = setTimeout(() => {
            animationSequence.start();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const styles = createStyles(isWebLayout);

    const handleGetStarted = () => {
        // Add haptic feedback if available
        router.push("/signup");
    };

    const handleLogin = () => {
        router.push("/login");
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    {/* Image Section with Overlay */}
                    <View style={styles.imageContainer}>
                        <Animated.View
                            style={[
                                styles.imageWrapper,
                                {
                                    transform: [{ scale: imageScale }]
                                }
                            ]}
                        >
                            <Image
                                source={{ uri: heroImageUrl }}
                                style={styles.image}
                                contentFit="cover"
                                transition={500}
                            />
                        </Animated.View>

                        {/* Gradient Overlay */}
                        <LinearGradient
                            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
                            style={styles.imageOverlay}
                        />

                        {/* Floating Elements */}
                        <View style={styles.floatingElements}>
                            <View style={[styles.floatingCard, styles.floatingCard1]}>
                                <Text style={styles.floatingText}>💪</Text>
                            </View>
                            <View style={[styles.floatingCard, styles.floatingCard2]}>
                                <Text style={styles.floatingText}>🏃‍♂️</Text>
                            </View>
                            <View style={[styles.floatingCard, styles.floatingCard3]}>
                                <Text style={styles.floatingText}>🎯</Text>
                            </View>
                        </View>
                    </View>

                    {/* Content Section */}
                    <View style={styles.contentContainer}>
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollViewContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.webContentWrapper}>
                                {/* Logo */}
                                <Animated.View
                                    style={[
                                        styles.logoContainer,
                                        {
                                            opacity: logoOpacity,
                                            transform: [{ translateY: logoTranslateY }]
                                        }
                                    ]}
                                >
                                    <Text style={styles.headerLogo}>VitaCoach</Text>
                                    <View style={styles.logoBadge}>
                                        <Text style={styles.logoBadgeText}>AI</Text>
                                    </View>
                                </Animated.View>

                                {isWebLayout && <View style={{ flex: 1 }} />}

                                {/* Main Content */}
                                <View style={styles.mainContent}>
                                    <Animated.View
                                        style={{
                                            opacity: titleOpacity,
                                            transform: [{ scale: titleScale }]
                                        }}
                                    >
                                        <Text style={styles.title}>Unlock Your{'\n'}Potential</Text>
                                        <View style={styles.titleUnderline} />
                                    </Animated.View>

                                    <Animated.View style={{ opacity: subtitleOpacity }}>
                                        <Text style={styles.subtitle}>
                                            Your personal AI-powered fitness coach that adapts to your lifestyle and goals.
                                        </Text>
                                    </Animated.View>

                                    {/* Feature Pills */}
                                    <View style={styles.featurePills}>
                                        <View style={styles.featurePill}>
                                            <Text style={styles.featurePillText}>🔥 Personalized Workouts</Text>
                                        </View>
                                        <View style={styles.featurePill}>
                                            <Text style={styles.featurePillText}>📊 Progress Tracking</Text>
                                        </View>
                                        <View style={styles.featurePill}>
                                            <Text style={styles.featurePillText}>🎯 Goal Setting</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Buttons */}
                                <Animated.View
                                    style={[
                                        styles.buttonContainer,
                                        {
                                            opacity: buttonsOpacity,
                                            transform: [{ translateY: buttonsTranslateY }]
                                        }
                                    ]}
                                >
                                    <Pressable onPress={handleGetStarted}>
                                        {({ pressed }) => (
                                            <LinearGradient
                                                colors={[COLORS.primarySlightlyLighter, COLORS.primary]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={[
                                                    styles.primaryButton,
                                                    pressed && styles.primaryButtonPressed
                                                ]}
                                            >
                                                <Text style={styles.primaryButtonText}>Get Started for Free</Text>
                                                <View style={styles.buttonArrow}>
                                                    <Text style={styles.buttonArrowText}>→</Text>
                                                </View>
                                            </LinearGradient>
                                        )}
                                    </Pressable>

                                    <Pressable onPress={handleLogin}>
                                        {({ pressed }) => (
                                            <View style={[
                                                styles.secondaryButton,
                                                pressed && styles.secondaryButtonPressed
                                            ]}>
                                                <Text style={styles.secondaryButtonText}>I Already Have an Account</Text>
                                            </View>
                                        )}
                                    </Pressable>

                                    {/* Trust Indicators */}
                                    <View style={styles.trustIndicators}>
                                        <Text style={styles.trustText}>✨ Free forever • 🔒 Secure • 🚀 No ads</Text>
                                    </View>
                                </Animated.View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
}

const createStyles = (isWebLayout: boolean) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    container: {
        flex: 1,
        flexDirection: isWebLayout ? 'row' : 'column'
    },
    imageContainer: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
    },
    image: {
        width: '100%',
        height: '100%'
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    floatingElements: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
    },
    floatingCard: {
        position: 'absolute',
        width: 60,
        height: 60,
        backgroundColor: COLORS.white,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    floatingCard1: {
        top: '20%',
        right: '10%',
    },
    floatingCard2: {
        top: '50%',
        left: '8%',
    },
    floatingCard3: {
        bottom: '25%',
        right: '15%',
    },
    floatingText: {
        fontSize: 24,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: isWebLayout ? 0 : 30,
        borderTopRightRadius: isWebLayout ? 0 : 30,
        marginTop: isWebLayout ? 0 : -30,
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: isWebLayout ? 0 : 24,
    },
    webContentWrapper: {
        width: '100%',
        height: '100%',
        maxWidth: isWebLayout ? 450 : undefined,
        paddingHorizontal: isWebLayout ? 40 : 0,
        justifyContent: 'space-between',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: isWebLayout ? 'flex-start' : 'center',
        marginBottom: 20,
        opacity: isWebLayout ? 1 : 0,
        height: isWebLayout ? 'auto' : 0,
    },
    headerLogo: {
        fontWeight: 'bold',
        fontSize: 24,
        color: COLORS.darkText,
        textAlign: isWebLayout ? 'left' : 'center',
    },
    logoBadge: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 8,
    },
    logoBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: isWebLayout ? 42 : 36,
        fontWeight: 'bold',
        color: COLORS.darkText,
        textAlign: isWebLayout ? 'left' : 'center',
        lineHeight: isWebLayout ? 50 : 42,
        marginBottom: 8,
    },
    titleUnderline: {
        width: 60,
        height: 4,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
        alignSelf: isWebLayout ? 'flex-start' : 'center',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        color: COLORS.lightText,
        textAlign: isWebLayout ? 'left' : 'center',
        lineHeight: 26,
        marginBottom: 24,
    },
    featurePills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: isWebLayout ? 'flex-start' : 'center',
        marginBottom: 20,
    },
    featurePill: {
        backgroundColor: COLORS.subtleGray,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    featurePillText: {
        fontSize: 14,
        color: COLORS.darkText,
        fontWeight: '600',
    },
    buttonContainer: {
        width: '100%',
    },
    primaryButton: {
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 12,
    },
    primaryButtonPressed: {
        transform: [{ scale: 0.98 }]
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: 'bold',
        marginRight: 8,
    },
    buttonArrow: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonArrowText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: COLORS.subtleGray,
        backgroundColor: COLORS.white,
        marginBottom: 24,
    },
    secondaryButtonPressed: {
        backgroundColor: COLORS.subtleGray,
        transform: [{ scale: 0.98 }]
    },
    secondaryButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600'
    },
    trustIndicators: {
        alignItems: 'center',
    },
    trustText: {
        fontSize: 14,
        color: COLORS.lightText,
        textAlign: 'center',
    },
});