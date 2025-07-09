import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
    const router = useRouter();
    return (
        <View className="flex-1 items-center justify-center bg-white px-4">
            <Text className="text-3xl font-bold text-blue-600 mb-6">
                Welcome to VitaCoach!
            </Text>
            <Text className="text-base text-gray-700 mb-8 text-center">
                Get fit. Find your coach. Track your journey.
            </Text>
            <Pressable
                className="w-full max-w-xs bg-blue-600 rounded-2xl py-3 mb-4"
                onPress={() => router.push("/signup")}
            >
                <Text className="text-center text-white font-bold text-lg">Sign Up</Text>
            </Pressable>
            <Pressable
                className="w-full max-w-xs border-2 border-blue-600 rounded-2xl py-3"
                onPress={() => router.push("/login")}
            >
                <Text className="text-center text-blue-600 font-bold text-lg">Log In</Text>
            </Pressable>
        </View>
    );
}
