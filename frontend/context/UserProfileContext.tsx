import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/types';

const STORAGE_KEY = 'user_profile';

export const [UserProfileProvider, useUserProfile] = createContextHook(() => {
  const [profile, setProfile] = useState<UserProfile>({
    allergens: [],
    dietaryRestrictions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const storedProfile = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        setIsFirstLaunch(true);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (updatedProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const addAllergen = async (allergenId: string) => {
    if (!profile.allergens.includes(allergenId)) {
      const updatedProfile = {
        ...profile,
        allergens: [...profile.allergens, allergenId],
      };
      await saveProfile(updatedProfile);
    }
  };

  const removeAllergen = async (allergenId: string) => {
    const updatedProfile = {
      ...profile,
      allergens: profile.allergens.filter(id => id !== allergenId),
    };
    await saveProfile(updatedProfile);
  };

  const addDietaryRestriction = async (restriction: string) => {
    if (!profile.dietaryRestrictions.includes(restriction)) {
      const updatedProfile = {
        ...profile,
        dietaryRestrictions: [...profile.dietaryRestrictions, restriction],
      };
      await saveProfile(updatedProfile);
    }
  };

  const removeDietaryRestriction = async (restriction: string) => {
    const updatedProfile = {
      ...profile,
      dietaryRestrictions: profile.dietaryRestrictions.filter(r => r !== restriction),
    };
    await saveProfile(updatedProfile);
  };

  const updateProfile = async (updatedProfile: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updatedProfile };
    await saveProfile(newProfile);
  };

  return {
    profile,
    isLoading,
    isFirstLaunch,
    addAllergen,
    removeAllergen,
    addDietaryRestriction,
    removeDietaryRestriction,
    updateProfile,
    saveProfile,
  };
});