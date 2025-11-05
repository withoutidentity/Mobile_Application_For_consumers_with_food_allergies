// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   ScrollView,
//   Alert, // เพิ่ม Alert
// } from "react-native";
// import { useUserProfile } from "@/context/UserProfileContext";
// import Button from "@/components/Button";
// // import { useRouter } from "expo-router"; // หากต้องการใช้ router.back()

// export default function PersonalProfileScreen() {
//   // const router = useRouter(); // หากต้องการใช้ router.back()
  
//   // 1. แก้ไข: เปลี่ยน setProfile เป็น updateProfile
//   const { profile, updateProfile } = useUserProfile(); 

//   // 2. แก้ไข: ลบ email state ออก
//   const [name, setName] = useState(profile.name || "");

//   const handleSave = () => {
//     // 3. แก้ไข: ลบการตรวจสอบ email ออก
//     if (name.trim() === "") {
//       Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกชื่อ-นามสกุลของคุณ");
//       return;
//     }

//     // 4. แก้ไข: เรียกใช้ updateProfile และส่งเฉพาะข้อมูลที่มีอยู่ (name)
//     updateProfile({
//       ...profile, // ส่งข้อมูล profile เดิมกลับไปด้วย
//       name: name.trim(), // อัปเดตเฉพาะชื่อ
//     });

//     Alert.alert("บันทึกข้อมูลแล้ว!");

//     // (ทางเลือก) กลับไปหน้าก่อนหน้า
//     // router.back();
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView style={styles.contentContainer}>
//         <Text style={styles.title}>ประวัติส่วนตัว</Text>
//         <Text style={styles.subtitle}>จัดการข้อมูลส่วนตัวของคุณ</Text>

//         {/* ช่องกรอกชื่อ */}
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>ชื่อ-นามสกุล</Text>
//           <TextInput
//             style={styles.input}
//             value={name}
//             onChangeText={setName}
//             placeholder="กรอกชื่อของคุณ"
//             placeholderTextColor="#9CA3AF"
//           />
//         </View>

//         {/* 5. แก้ไข: ลบช่องกรอกอีเมลออกจาก JSX */}

//         {/* ปุ่มบันทึก */}
//         <Button
//           title="บันทึกข้อมูล"
//           onPress={handleSave}
//           variant="primary"
//           size="large"
//         />
//       </ScrollView>
//     </View>
//   );
// }

// // (Stylesheet เหมือนเดิม ไม่ต้องแก้)
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#ffffff" },
//   contentContainer: { padding: 16 },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#111827",
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#6B7280",
//     marginBottom: 24,
//   },
//   inputGroup: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 16,
//     color: "#374151",
//     marginBottom: 8,
//     fontWeight: "500",
//   },
//   input: {
//     height: 48,
//     borderWidth: 1,
//     borderColor: "#D1D5DB",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     fontSize: 16,
//     backgroundColor: "#ffffff",
//     color: "#111827",
//   },
// });