import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { UserProfile, UserAllergy, Severity } from '@/types';
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
      // 1. Optimistic Update: อัปเดต state ใน UI ทันทีเพื่อให้ตอบสนองเร็ว
      setProfile(updatedProfile);

      // 2. ส่งข้อมูลไปที่ Backend ในเบื้องหลัง
      // เราไม่จำเป็นต้อง await หรือ refetch ข้อมูลใหม่ที่นี่
      // เพราะ UI ได้อัปเดตไปแล้ว
      updateUserAllergens(updatedProfile.allergens).catch(error => {
        console.error('Failed to sync profile to API, rolling back UI is recommended:', error);
        // ในแอปพลิเคชันจริง อาจจะต้องมี logic ในการ rollback UI กลับไปสถานะเดิมหากการบันทึกผิดพลาด
      });
    } catch (error) {
      console.error('An error occurred during the save process:', error);
    }
  };

  const updateAllergen = (allergenId: number, severity: Severity) => {
    setProfile(currentProfile => {
      // หาก currentProfile ไม่มีค่า (ซึ่งไม่ควรจะเกิดขึ้น) ให้คืนค่าเดิมกลับไป
      // เพื่อป้องกันการคืนค่า null ซึ่งผิดประเภท
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
      saveProfile(updatedProfile); // saveProfile จะจัดการการส่งข้อมูลไป backend เอง
      return updatedProfile;
    });
  };


  const removeAllergen = (allergenId: number) => {
    setProfile(currentProfile => {
      if (!currentProfile) return currentProfile;

      const newAllergens = currentProfile.allergens.filter(allergy => allergy.allergenId !== allergenId);
      const updatedProfile = { ...currentProfile, allergens: newAllergens };
      saveProfile(updatedProfile);
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