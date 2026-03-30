import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { UserProfile, UserAllergy, Severity } from '@/types';
import { useAuth } from './AuthContext';
import { getMyProfile, updateMyProfile, updateUserAllergens } from "@/data/userService";

export const [UserProfileProvider, useUserProfile] = createContextHook(() => {
  const [profile, setProfile] = useState<UserProfile>({
    allergens: [],
    dietaryRestrictions: [],
    role: 'USER'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const { token, loading: authLoading, removeToken } = useAuth();

  useEffect(() => {
    if (!authLoading && token) {
      void loadProfileFromAPI();
    } else if (!authLoading && !token) {
      setProfile({ allergens: [], dietaryRestrictions: [], role: 'USER' });
      setIsLoading(false);
    }
  }, [token, authLoading]);

  const loadProfileFromAPI = async () => {
    try {
      setIsLoading(true);
      const apiProfile = await getMyProfile();
      setProfile(apiProfile);
    } catch (error: any) {
      console.error('Failed to load profile from API:', error);
      if (error.response && error.response.status === 401) {
        await removeToken();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (updatedProfile: UserProfile) => {
    try {
      setProfile(updatedProfile);

      const syncedProfile = await updateMyProfile({
        name: updatedProfile.name || '',
        emergencyContact: updatedProfile.emergencyContact,
        dietaryRestrictions: updatedProfile.dietaryRestrictions || [],
      });

      await updateUserAllergens(updatedProfile.allergens);

      setProfile({
        ...syncedProfile,
        allergens: updatedProfile.allergens,
      });
    } catch (error) {
      console.error('An error occurred during the save process:', error);
    }
  };

  const updateAllergen = (allergenId: number, severity: Severity) => {
    setProfile(currentProfile => {
      if (!currentProfile) return currentProfile;

      const existingAllergenIndex = currentProfile.allergens.findIndex(
        (a) => a.allergenId === allergenId
      );

      let newAllergens: UserAllergy[];

      if (existingAllergenIndex > -1) {
        newAllergens = currentProfile.allergens.map((a, index) =>
          index === existingAllergenIndex ? { ...a, severity } : a
        );
      } else {
        newAllergens = [...currentProfile.allergens, { allergenId, severity }];
      }

      const updatedProfile = { ...currentProfile, allergens: newAllergens };
      void saveProfile(updatedProfile);
      return updatedProfile;
    });
  };

  const removeAllergen = (allergenId: number) => {
    setProfile(currentProfile => {
      if (!currentProfile) return currentProfile;

      const newAllergens = currentProfile.allergens.filter(allergy => allergy.allergenId !== allergenId);
      const updatedProfile = { ...currentProfile, allergens: newAllergens };
      void saveProfile(updatedProfile);
      return updatedProfile;
    });
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
    updateAllergen,
    removeAllergen,
    addDietaryRestriction,
    removeDietaryRestriction,
    updateProfile,
    saveProfile,
  };
});
