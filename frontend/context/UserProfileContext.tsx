import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { Allergen, UserProfile } from '@/types';
import { useAuth } from './AuthContext';
import { getMyProfile, updateUserAllergens } from "@/data/userService";

const STORAGE_KEY = 'user_profile';
 
export const [UserProfileProvider, useUserProfile] = createContextHook(() => {
  const [profile, setProfile] = useState<UserProfile>({
    allergens: [],
    dietaryRestrictions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    // Load profile only when auth is done and token is available
    if (!authLoading && token) {
      loadProfileFromAPI();
    } else if (!authLoading && !token) {
      // If user is logged out, clear profile and stop loading
      setProfile({ allergens: [], dietaryRestrictions: [] });
      setIsLoading(false);
    }
  }, [token, authLoading]);

  const loadProfileFromAPI = async () => {
    try {
      setIsLoading(true);
      const apiProfile = await getMyProfile();
      setProfile(apiProfile);
    } catch (error) {
      console.error('Failed to load profile from API:', error);
      // Optionally, handle first launch or fallback to local storage
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (updatedProfile: UserProfile) => {
    try {
      // Now this function updates the backend
      await updateUserAllergens(updatedProfile.allergens); 
      // Refetch the profile from the API to ensure UI is in sync with the database
      await loadProfileFromAPI();
    } catch (error) {
      console.error('Failed to save profile to API:', error);
    }
  };

  const addAllergen = async (allergenId: number) => {
    if (!profile.allergens.includes(allergenId)) {
      const updatedProfile = {
        ...profile,
        allergens: [...profile.allergens, allergenId],
      };
      await saveProfile(updatedProfile); // This will call the API
    }
  };

  const removeAllergen = async (allergenId: number) => {
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