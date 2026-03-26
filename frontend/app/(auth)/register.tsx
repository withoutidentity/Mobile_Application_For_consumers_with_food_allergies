import { useRouter } from "expo-router";
import { TriangleAlert } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  HEALTH_WARNING,
  PRIVACY_MODAL_TITLE,
  PRIVACY_SECTIONS,
  PRIVACY_VERSION,
  TERMS_MODAL_TITLE,
  TERMS_SECTIONS,
  TERMS_VERSION,
} from "../../constants/legal";

type LegalModalType = "terms" | "privacy" | null;

const CheckboxRow = ({
  checked,
  onPress,
  children,
}: {
  checked: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) => (
  <View className="flex-row items-start rounded-2xl border border-border bg-white p-4">
    <View
      className="mr-3 mt-1"
    >
      <Pressable
        onPress={onPress}
        className={`h-5 w-5 items-center justify-center rounded border ${
          checked ? "border-primary bg-primary" : "border-slate-400 bg-white"
        }`}
      >
        {checked ? <Text className="text-xs font-bold text-white">✓</Text> : null}
      </Pressable>
    </View>
    <View className="flex-1">{children}</View>
  </View>
);

const LegalModal = ({
  visible,
  title,
  version,
  sections,
  onClose,
}: {
  visible: boolean;
  title: string;
  version: string;
  sections: { heading: string; body: string[] }[];
  onClose: () => void;
}) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <View className="flex-1 justify-end bg-black/40">
      <View className="max-h-[82%] rounded-t-3xl bg-white px-5 pb-8 pt-5">
        <View className="mb-4 flex-row items-start justify-between">
          <View className="mr-4 flex-1">
            <Text className="text-xl font-bold text-slate-900">{title}</Text>
            <Text className="mt-1 text-sm text-slate-500">เวอร์ชัน {version}</Text>
          </View>
          <Pressable onPress={onClose} className="rounded-full bg-slate-100 px-3 py-2">
            <Text className="font-semibold text-slate-700">ปิด</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {sections.map((section) => (
            <View key={section.heading} className="mb-5">
              <Text className="mb-2 text-base font-bold text-slate-900">
                {section.heading}
              </Text>
              {section.body.map((paragraph) => (
                <Text key={paragraph} className="mb-2 text-sm leading-6 text-slate-700">
                  • {paragraph}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacyConsent, setAcceptedPrivacyConsent] = useState(false);
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { width, height } = Dimensions.get("window");
  const isSubmitEnabled = useMemo(
    () => acceptedTerms && acceptedPrivacyConsent && !loading,
    [acceptedPrivacyConsent, acceptedTerms, loading]
  );

  const handleRegister = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!name) newErrors.name = "กรุณากรอกชื่อ";
    if (!email) newErrors.email = "กรุณากรอกอีเมล";
    if (!password) newErrors.password = "กรุณากรอกรหัสผ่าน";
    if (!confirmPassword) newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }
    if (!acceptedTerms) {
      newErrors.acceptedTerms = "กรุณายอมรับเงื่อนไขการใช้งาน";
    }
    if (!acceptedPrivacyConsent) {
      newErrors.acceptedPrivacyConsent = "กรุณายินยอมการประมวลผลข้อมูลส่วนบุคคล";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          acceptedTerms,
          acceptedPrivacyConsent,
          termsVersion: TERMS_VERSION,
          privacyVersion: PRIVACY_VERSION,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        router.replace("/login");
      } else {
        setErrors({
          general: data.message || "สมัครสมาชิกไม่สำเร็จ",
        });
      }
    } catch {
      setErrors({ general: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้" });
    } finally {
      setLoading(false);
    }
  };

  const modalConfig =
    activeModal === "terms"
      ? {
          title: TERMS_MODAL_TITLE,
          version: TERMS_VERSION,
          sections: TERMS_SECTIONS,
        }
      : activeModal === "privacy"
      ? {
          title: PRIVACY_MODAL_TITLE,
          version: PRIVACY_VERSION,
          sections: PRIVACY_SECTIONS,
        }
      : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      {modalConfig ? (
        <LegalModal
          visible
          title={modalConfig.title}
          version={modalConfig.version}
          sections={modalConfig.sections}
          onClose={() => setActiveModal(null)}
        />
      ) : null}

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: height * 0.05,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: width * 0.5, height: width * 0.5, marginBottom: 20 }}
          resizeMode="contain"
        />

        <Text className="mb-5 text-center text-2xl font-bold text-text">สมัครสมาชิก</Text>

        <View className="mb-3 w-[85%] max-w-[400px]">
          <TextInput
            placeholder="ชื่อ"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrors((prev) => ({ ...prev, name: "", general: "" }));
            }}
            className="rounded-lg border border-border p-3 text-black"
            placeholderTextColor="#999"
          />
          {errors.name ? (
            <Text className="mt-1 text-right text-red-500">{errors.name}</Text>
          ) : null}
        </View>

        <View className="mb-3 w-[85%] max-w-[400px]">
          <TextInput
            placeholder="อีเมล"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors((prev) => ({ ...prev, email: "", general: "" }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            className="rounded-lg border border-border p-3 text-black"
            placeholderTextColor="#999"
          />
          {errors.email ? (
            <Text className="mt-1 text-right text-red-500">{errors.email}</Text>
          ) : null}
        </View>

        <View className="mb-3 w-[85%] max-w-[400px]">
          <TextInput
            placeholder="รหัสผ่าน"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors((prev) => ({ ...prev, password: "", general: "" }));
            }}
            secureTextEntry
            className="rounded-lg border border-border p-3 text-black"
            placeholderTextColor="#999"
          />
          {errors.password ? (
            <Text className="mt-1 text-right text-red-500">{errors.password}</Text>
          ) : null}
        </View>

        <View className="mb-3 w-[85%] max-w-[400px]">
          <TextInput
            placeholder="ยืนยันรหัสผ่าน"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setErrors((prev) => ({
                ...prev,
                confirmPassword: "",
                general: "",
              }));
            }}
            secureTextEntry
            className="rounded-lg border border-border p-3 text-black"
            placeholderTextColor="#999"
          />
          {errors.confirmPassword ? (
            <Text className="mt-1 text-right text-red-500">{errors.confirmPassword}</Text>
          ) : null}
        </View>

        <View className="mt-3 w-[85%] max-w-[400px] rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <View className="mb-1 flex-row items-center">
            <TriangleAlert size={20} color="#78350f" />
            <Text className="ml-2 text-base font-bold text-amber-900">
               คำเตือนสำคัญด้านสุขภาพ
            </Text>
          </View>
          <Text className="mt-2 text-sm leading-6 text-amber-900">{HEALTH_WARNING}</Text>
        </View>

        <View className="mt-4 w-[85%] max-w-[400px] gap-3">
          <CheckboxRow
            checked={acceptedTerms}
            onPress={() => {
              setAcceptedTerms((prev) => !prev);
              setErrors((prev) => ({ ...prev, acceptedTerms: "", general: "" }));
            }}
          >
            <Text className="text-sm leading-6 text-slate-800">
              ข้าพเจ้าได้อ่านและยอมรับ{" "}
              <Text className="font-semibold text-primary" onPress={() => setActiveModal("terms")}>
                เงื่อนไขการใช้งานและข้อสงวนสิทธิ์ทางการแพทย์
              </Text>{" "}
              (คลิกเพื่ออ่านฉบับเต็ม)
            </Text>
          </CheckboxRow>
          {errors.acceptedTerms ? (
            <Text className="text-right text-red-500">{errors.acceptedTerms}</Text>
          ) : null}

          <CheckboxRow
            checked={acceptedPrivacyConsent}
            onPress={() => {
              setAcceptedPrivacyConsent((prev) => !prev);
              setErrors((prev) => ({
                ...prev,
                acceptedPrivacyConsent: "",
                general: "",
              }));
            }}
          >
            <Text className="text-sm leading-6 text-slate-800">
              ข้าพเจ้ายินยอมให้ประมวลผลข้อมูลสุขภาพและประวัติการแพ้อาหาร เพื่อใช้ในการแจ้งเตือนสารก่อภูมิแพ้และประมวลผลผ่านระบบ AI ตามที่ระบุไว้ใน{" "}
              <Text
                className="font-semibold text-primary"
                onPress={() => setActiveModal("privacy")}
              >
                นโยบายความเป็นส่วนตัว
              </Text>{" "}
              (คลิกเพื่ออ่านฉบับเต็ม)
            </Text>
          </CheckboxRow>
          {errors.acceptedPrivacyConsent ? (
            <Text className="text-right text-red-500">
              {errors.acceptedPrivacyConsent}
            </Text>
          ) : null}
        </View>

        {errors.general ? (
          <View className="mb-1 mt-3 w-[85%] max-w-[400px]">
            <Text className="text-right text-red-500">{errors.general}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleRegister}
          disabled={!isSubmitEnabled}
          className={`mt-4 w-[85%] max-w-[400px] items-center rounded-lg p-4 ${
            isSubmitEnabled ? "bg-primary opacity-100" : "bg-slate-300 opacity-80"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center font-bold text-white">สมัครสมาชิก</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push("/login")}>
          <Text className="mt-4 text-center text-primary">
            มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
