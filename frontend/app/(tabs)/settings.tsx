import Button from '@/components/Button';
import { useUserProfile } from '@/context/UserProfileContext';
import { useRouter } from "expo-router";
import { Bell, HelpCircle, Moon, Trash2, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useAuth } from "@/context/AuthContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { removeToken } = useAuth();
  const { profile, saveProfile } = useUserProfile();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    Alert.alert('Coming Soon', 'Dark mode will be available in a future update.');
  };

  const handleNotificationsToggle = () => {
    setNotifications(!notifications);
    Alert.alert('Coming Soon', 'Notification settings will be available in a future update.');
  };

  const handleClearProfile = () => {
    Alert.alert(
      'Clear Profile',
      'Are you sure you want to clear your allergen profile? This will remove all your saved allergens.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            saveProfile({
              allergens: [],
              dietaryRestrictions: [],
              name: profile.name,
              emergencyContact: profile.emergencyContact,
            });
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    removeToken();
  };

  return (
    <ScrollView className="flex-1 bg-[#F8F9FA]" contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-[#666666] mb-2">Settings</Text>
        <Text className="text-base text-[#666666]">Customize your experience</Text>
      </View>

      {/* Profile Settings - moved to top */}
      <View className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-[#333333] mb-4">Profile</Text>
        <Pressable
          className="flex-row items-center py-3"
          onPress={() => router.push("/allergen-profile")}
        >
          <User size={20} color="#333333" className="mr-3" />
          <Text className="text-base text-[#333333]">Allergen Profile</Text>
        </Pressable>
      </View>

      {/* Appearance */}
      <View className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-[#333333] mb-4">Appearance</Text>
        <View className="flex-row justify-between items-center border-b border-[#E5E5E5] py-3">
          <View className="flex-row items-center flex-1">
            <Moon size={20} color="#333333" className="mr-3" />
            <Text className="text-base text-[#333333]">Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: '#ccc', true: '#2A9D8F' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Notifications */}
      <View className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-[#333333] mb-4">Notifications</Text>
        <View className="flex-row justify-between items-center border-b border-[#E5E5E5] py-3">
          <View className="flex-row items-center flex-1">
            <Bell size={20} color="#333333" className="mr-3" />
            <Text className="text-base text-[#333333]">Enable Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: '#ccc', true: '#2A9D8F' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Emergency Contact */}
      <View className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-[#333333] mb-4">Emergency Contact</Text>
        <Pressable className="flex-row items-center">
          <User size={20} color="#333333" className="mr-3" />
          <View>
            <Text className="text-base text-[#333333]">Emergency Contact</Text>
            <Text className="text-sm text-[#666666] mt-1">
              {profile.emergencyContact || 'Not set'}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Support */}
      <View className="mb-6 bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold text-[#333333] mb-4">Support</Text>
        <Pressable className="flex-row items-center">
          <HelpCircle size={20} color="#333333" className="mr-3" />
          <Text className="text-base text-[#333333]">Help & FAQ</Text>
        </Pressable>
      </View>

      {/* Data */}
      <View className="mb-6">
        <Button
          title="Clear Allergen Profile"
          onPress={handleClearProfile}
          variant="danger"
          icon={<Trash2 size={16} color="#fff" />}
        />
      </View>

      {/* Logout */}
      <View className="mb-6">
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="primary"
        />
      </View>

      {/* Footer */}
      <View className="items-center mt-6 mb-4">
        <Text className="text-sm text-[#666666]">Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}
