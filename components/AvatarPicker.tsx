import React from "react";
import { View, Text, TextInput } from "react-native";

// For MVP: just emoji picker, not file upload yet
export default function AvatarPicker({ avatar, onChange }: { avatar: string; onChange: (val: string) => void }) {
    return (
        <View className="mb-2">
            <Text className="mb-1">Avatar (emoji for now):</Text>
            <TextInput
                className="border p-2 w-full rounded text-2xl"
                value={avatar}
                maxLength={2}
                onChangeText={onChange}
                placeholder="😀"
            />
        </View>
    );
}
