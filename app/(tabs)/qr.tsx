import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Linking,
  Share,
} from "react-native";

import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScanLine,
  QrCode,
  History,
  Camera,
  Link,
  Mail,
  Phone,
  Wifi,
  ChevronRight,
  Zap,
  Eye,
EyeOff,
} from 'lucide-react-native';
import QRCode from "react-native-qrcode-svg";
import {
  Clipboard as ClipboardIcon,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, BorderRadius, Shadows } from '@/theme';
import { Card, SectionHeader } from '@/components';
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import Animated, {
  FadeInDown,
  FadeOutDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
} from "react-native-reanimated";

import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sharing from "expo-sharing";
import ViewShot, { captureRef } from "react-native-view-shot";
import { saveQr } from "@/services/export/saveQr";
import * as FileSystem from "expo-file-system/legacy";
import { Alert } from "react-native";


type QrTab = 'scanner' | 'generator';

const QR_GENERATOR_TYPES = [
  { id: 'url', label: 'URL / Link', icon: Link, color: '#2563EB' },
  { id: 'email', label: 'Email', icon: Mail, color: '#7C3AED' },
  { id: 'phone', label: 'Phone', icon: Phone, color: '#059669' },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi, color: '#0891B2' },
];



const QR_HISTORY_PLACEHOLDER = [
  {
    id: '1',
    type: 'URL',
    content: 'https://shelembestudios.com',
    createdAt: '1 hour ago',
    color: '#2563EB',
  },
  {
    id: '2',
    type: 'Email',
    content: 'hello@shelembestudios.com',
    createdAt: 'Yesterday',
    color: '#7C3AED',
  },
  {
    id: '3',
    type: 'Phone',
    content: '+1 (555) 000-1234',
    createdAt: '3 days ago',
    color: '#059669',
  },
];

const QR_COLORS = [
  {
    id: "black",
    color: "#000000",
    label: "Classic",
  },
  {
    id: "blue",
    color: "#2563EB",
    label: "Noviq Blue",
  },
  {
    id: "purple",
    color: "#7C3AED",
    label: "Purple",
  },
  {
    id: "green",
    color: "#059669",
    label: "Green",
  },
];

type HistoryItem = {
  id: string;
  type: "website" | "email" | "phone" | "wifi" | "text";
  content: string;
  createdAt: string;
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}


export default function QRScreen() {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<QrTab>('scanner');
  const [selectedGenType, setSelectedGenType] = useState('url');
  const [inputValue, setInputValue] = useState('');
  const scanLinePosition = useSharedValue(0);
  const [permission, requestPermission] = useCameraPermissions();

const [cameraOpen, setCameraOpen] = useState(false);
const [flashOn, setFlashOn] = useState(false);

const [scanned, setScanned] = useState(false);
const [history, setHistory] = useState<HistoryItem[]>([]);
const qrRef = useRef<any>(null);
const qrViewRef = useRef<ViewShot>(null);

const [wifiName, setWifiName] = useState("");
const [wifiPassword, setWifiPassword] = useState("");
const [wifiSecurity, setWifiSecurity] = useState<"WPA" | "nopass">("WPA");
const [showWifiPassword, setShowWifiPassword] = useState(false);

const [scanResult, setScanResult] = useState<string | null>(null);
const [scanType, setScanType] = useState<
  "website" | "email" | "phone" | "wifi" | "text"
>("text");
const qrScale = useSharedValue(0.8);
const qrOpacity = useSharedValue(0);
const [qrColor, setQrColor] = useState("#000000");

const clearHistory = async () => {
  await AsyncStorage.removeItem("qr_history");
  setHistory([]);
};

useEffect(() => {
  if (cameraOpen) {
    scanLinePosition.value = withRepeat(
      withTiming(190, { duration: 1800 }),
      -1,
      true
    );
  } else {
    scanLinePosition.value = 0;
  }
}, [cameraOpen]);

const scanLineStyle = useAnimatedStyle(() => ({
  transform: [
    {
      translateY: scanLinePosition.value,
    },
  ],
}));

useEffect(() => {
  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem("qr_history");

      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.log("Failed to load history", error);
    }
  };

  loadHistory();
}, []);

useEffect(() => {
  if (isQrValid()) {
    qrScale.value = withSpring(1);
    qrOpacity.value = withSpring(1);
  } else {
    qrScale.value = 0.8;
    qrOpacity.value = 0;
  }
}, [
  inputValue,
  wifiName,
  wifiPassword,
  wifiSecurity,
  selectedGenType,
]);

const qrAnimatedStyle = useAnimatedStyle(() => ({
  transform: [
    {
      scale: qrScale.value,
    },
  ],
  opacity: qrOpacity.value,
}));



const getQrType = (value: string) => {
  const text = value.trim();

  if (/^https?:\/\//i.test(text)) {
    return "website";
  }

  if (text.startsWith("mailto:")) {
    return "email";
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return "email";
  }

  if (text.startsWith("tel:")) {
    return "phone";
  }

  if (/^\+?[0-9\s()-]{7,}$/.test(text)) {
    return "phone";
  }

  if (text.startsWith("WIFI:")) {
    return "wifi";
  }

  return "text";
};

const pasteFromClipboard = async () => {
  console.log("Paste button pressed");

  const text = await Clipboard.getStringAsync();
  console.log("Clipboard:", text);

  if (!text.trim()) return;

  const type = getQrType(text);

  setScanResult(text);
  setScanType(type);
  setScanned(true);
  setCameraOpen(false);

  await saveHistory(type, text);

  await Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success
  );
};

const saveHistory = async (
  type: "website" | "email" | "phone" | "wifi" | "text",
  content: string
) => {
  try {
    const item: HistoryItem = {
      id: Date.now().toString(),
      type,
      content,
      createdAt: new Date().toLocaleString(),
    };

    const existing = await AsyncStorage.getItem("qr_history");

    const history: HistoryItem[] = existing
      ? JSON.parse(existing)
      : [];

    const updated = [item, ...history];

    await AsyncStorage.setItem(
      "qr_history",
      JSON.stringify(updated)
    );

    setHistory(updated);
  } catch (error) {
    console.log("Failed to save history", error);
  }
};


const handleBarcodeScanned = async (
  result: BarcodeScanningResult
) => {
  if (scanned) return;

const type = getQrType(result.data);

setScanned(true);
setCameraOpen(false);
setScanResult(result.data);
setScanType(type);

await saveHistory(type, result.data);

  await Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success
  );
};

const getQrValue = () => {
  switch (selectedGenType) {
    case "url":
      return inputValue;

    case "email":
      return inputValue.startsWith("mailto:")
        ? inputValue
        : `mailto:${inputValue}`;

    case "phone":
      return inputValue.startsWith("tel:")
        ? inputValue
        : `tel:${inputValue}`;

    case "wifi":
      if (!wifiName.trim()) return "";

      if (wifiSecurity === "nopass") {
        return `WIFI:T:nopass;S:${wifiName};;`;
      }

      return `WIFI:T:WPA;S:${wifiName};P:${wifiPassword};;`;

    default:
      return inputValue;
  }
};

const isQrValid = () => {
  switch (selectedGenType) {
    case "url":
      return /^https?:\/\/.+/i.test(inputValue.trim());

    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        inputValue.trim()
      );

    case "phone":
      return /^[+]?[0-9\s()-]{7,}$/.test(
        inputValue.trim()
      );

    case "wifi":
      if (!wifiName.trim()) return false;

      if (wifiSecurity === "WPA" && !wifiPassword.trim()) {
        return false;
      }

      return true;

    default:
      return inputValue.trim().length > 0;
  }
};

const shareQr = async () => {
  try {
    if (!qrViewRef.current) return;

    const uri = await captureRef(qrViewRef, {
      format: "png",
      quality: 1,
    });

    await Sharing.shareAsync(uri);
  } catch (error) {
    console.log(error);
  }
};

const saveQrImage = async () => {
  try {
    if (!qrViewRef.current) return;

    const imageUri = await captureRef(qrViewRef, {
      format: "png",
      quality: 1,
    });

    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) return;

    const success = await saveQr(
      permissions.directoryUri,
      imageUri,
      `QR_${Date.now()}.png`
    );

    if (success) {
      Alert.alert("Success", "QR code saved successfully.");
    } else {
      Alert.alert("Error", "Failed to save QR code.");
    }
  } catch (error) {
    console.log(error);
    Alert.alert("Error", "Something went wrong.");
  }
};

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>QR Code</Text>
          <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
            Scan and generate QR codes instantly
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcherWrapper}>
          <View
            style={[
              styles.tabSwitcher,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'scanner' && [
                  styles.tabButtonActive,
                  { backgroundColor: colors.primary },
                ],
              ]}
              onPress={() => setActiveTab('scanner')}
              activeOpacity={0.75}
            >
              <ScanLine
                size={16}
                color={activeTab === 'scanner' ? '#FFFFFF' : colors.textSecondary}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color:
                      activeTab === 'scanner' ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                Scanner
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'generator' && [
                  styles.tabButtonActive,
                  { backgroundColor: colors.primary },
                ],
              ]}
              onPress={() => setActiveTab('generator')}
              activeOpacity={0.75}
            >
              <QrCode
                size={16}
                color={
                  activeTab === 'generator' ? '#FFFFFF' : colors.textSecondary
                }
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color:
                      activeTab === 'generator'
                        ? '#FFFFFF'
                        : colors.textSecondary,
                  },
                ]}
              >
                Generator
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <View style={styles.tabContent}>
            {/* Viewfinder placeholder */}
<Card
  style={[
    styles.viewfinderCard,
    {
      borderColor: colors.border,
      borderWidth: 1,
    },
  ]}
  shadow="none"
  padding={0}
>
{cameraOpen ? (
  <>
<CameraView
  style={styles.viewfinderArea}
  facing="back"
  enableTorch={flashOn}
  barcodeScannerSettings={{
    barcodeTypes: ["qr"],
  }}
  onBarcodeScanned={handleBarcodeScanned}
/>

<TouchableOpacity
  style={[
    styles.cancelButton,
    {
      backgroundColor: "rgba(0,0,0,0.6)",
    },
  ]}
  onPress={() => {
    setCameraOpen(false);
    setScanned(false);
  }}
>
  <Text
    style={{
      color: "#fff",
      fontWeight: "600",
    }}
  >
    Cancel
  </Text>
</TouchableOpacity>

<Animated.View
  style={[
    styles.scanLine,
    scanLineStyle,
    {
      backgroundColor: colors.primary,
    },
  ]}
/>

    <TouchableOpacity
      style={[
        styles.flashButton,
        {
          backgroundColor: flashOn
            ? colors.primary
            : "rgba(0,0,0,0.45)",
        },
      ]}
      onPress={() => setFlashOn(!flashOn)}
    >
      <Zap
        size={22}
        color="#FFFFFF"
        strokeWidth={2}
      />
    </TouchableOpacity>
  </>
) : (
    <View
      style={[
        styles.viewfinderArea,
        {
          backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
        },
      ]}
    >
      {/* Corner markers */}
      {["tl", "tr", "bl", "br"].map((pos) => (
        <View
          key={pos}
          style={[
            styles.cornerMarker,
            styles[`corner_${pos}` as keyof typeof styles] as any,
            { borderColor: colors.primary },
          ]}
        />
      ))}

      <Camera
        size={40}
        color={colors.textDisabled}
        strokeWidth={1.5}
      />

      <Text
        style={[
          styles.viewfinderLabel,
          { color: colors.textSecondary },
        ]}
      >
        Camera preview
      </Text>

      <Text
        style={[
          styles.viewfinderHint,
          { color: colors.textDisabled },
        ]}
      >
        Tap to open camera
      </Text>
    </View>
  )}
</Card>

{scanResult && (
  <Animated.View
    entering={FadeInDown.duration(400)}
    exiting={FadeOutDown.duration(250)}
  >
    <Card
      style={{
        marginTop: 20,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
<Text
  style={{
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
  }}
>
  {scanType === "website" && "🌐 Website"}
  {scanType === "email" && "📧 Email"}
  {scanType === "phone" && "📞 Phone Number"}
  {scanType === "wifi" && "📶 Wi-Fi"}
  {scanType === "text" && "📝 Text"}
</Text>

    <Text
      style={{
        color: colors.textSecondary,
        marginBottom: 20,
      }}
    >
      {scanResult}
    </Text>

{scanType === "website" && (
  <TouchableOpacity
    style={[
      styles.actionButton,
      {
        backgroundColor: colors.primary,
        marginBottom: 12,
      },
    ]}
    onPress={() => Linking.openURL(scanResult!)}
  >
    <Text style={{ color: "#fff", fontWeight: "600" }}>
      Open Website
    </Text>
  </TouchableOpacity>
)}

{scanType === "phone" && (
  <TouchableOpacity
    style={[
      styles.actionButton,
      {
        backgroundColor: colors.primary,
        marginBottom: 12,
      },
    ]}
    onPress={() =>
      Linking.openURL(
        scanResult!.startsWith("tel:")
          ? scanResult!
          : `tel:${scanResult}`
      )
    }
  >
    <Text style={{ color: "#fff", fontWeight: "600" }}>
      Call Number
    </Text>
  </TouchableOpacity>
)}

{scanType === "email" && (
  <TouchableOpacity
    style={[
      styles.actionButton,
      {
        backgroundColor: colors.primary,
        marginBottom: 12,
      },
    ]}
    onPress={() =>
      Linking.openURL(
        scanResult!.startsWith("mailto:")
          ? scanResult!
          : `mailto:${scanResult}`
      )
    }
  >
    <Text style={{ color: "#fff", fontWeight: "600" }}>
      Compose Email
    </Text>
  </TouchableOpacity>
)}

{scanType === "text" && (
  <TouchableOpacity
    style={[
      styles.actionButton,
      {
        backgroundColor: colors.primary,
        marginBottom: 12,
      },
    ]}
    onPress={async () => {
      await Clipboard.setStringAsync(scanResult!);
    }}
  >
    <Text
      style={{
        color: "#fff",
        fontWeight: "600",
      }}
    >
      Copy Text
    </Text>
  </TouchableOpacity>
)}

{scanType === "wifi" && (
  <TouchableOpacity
    style={[
      styles.actionButton,
      {
        backgroundColor: colors.primary,
        marginBottom: 12,
      },
    ]}
    onPress={async () => {
      await Clipboard.setStringAsync(scanResult!);
    }}
  >
    <Text
      style={{
        color: "#fff",
        fontWeight: "600",
      }}
    >
      Copy Wi-Fi Details
    </Text>
  </TouchableOpacity>
)}

    <TouchableOpacity
      style={[
        styles.actionButton,
        {
          backgroundColor: colors.primary,
        },
      ]}
    onPress={() => {
  setScanResult(null);
  setScanned(false);
  setCameraOpen(true);
}}
    >
      <Text
        style={{
          color: "#fff",
          fontWeight: "600",
        }}
      >
        Scan Again
      </Text>
    </TouchableOpacity>
      </Card>
  </Animated.View>
)}

<View
  style={{
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  }}
>
  <TouchableOpacity
    sdisabled={!scanResult}
style={[
  styles.actionButton,
  {
    flex: 1,
    backgroundColor: scanResult
      ? colors.card
      : colors.border,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: scanResult ? 1 : 0.5,
  },
]}
   onPress={async () => {
  await Clipboard.setStringAsync(scanResult!);
}}
  >
    <Text style={{ color: colors.text }}>
      Copy
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    disabled={!scanResult}
style={[
  styles.actionButton,
  {
    flex: 1,
    backgroundColor: scanResult
      ? colors.card
      : colors.border,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: scanResult ? 1 : 0.5,
  },
]}
    onPress={() =>
      Share.share({
        message: scanResult!,
      })
    }
  >
    <Text style={{ color: colors.text }}>
      Share
    </Text>
  </TouchableOpacity>
</View>

            <TouchableOpacity
              style={[
                styles.openCameraButton,
                { backgroundColor: colors.primary },
              ]}
              activeOpacity={0.85}
              onPress={async () => {
  if (!permission?.granted) {
    const response = await requestPermission();

    if (!response.granted) return;
  }

  setCameraOpen(true);
}}
            >
              <Camera size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.openCameraLabel}>Open Camera</Text>
            </TouchableOpacity>

            {/* Or paste */}
            <View style={styles.dividerRow}>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
              <Text
                style={[styles.dividerText, { color: colors.textDisabled }]}
              >
                or
              </Text>
              <View
                style={[styles.dividerLine, { backgroundColor: colors.border }]}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.pasteButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={pasteFromClipboard}
              activeOpacity={0.75}
            >
              <ClipboardIcon size={18} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.pasteLabel, { color: colors.primary }]}>
                Paste from Clipboard
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Generator Tab */}
        {activeTab === 'generator' && (
          <View style={styles.tabContent}>
            {/* Type selector */}
            <View style={styles.genSection}>
              <Text style={[styles.genSectionLabel, { color: colors.text }]}>
                Content Type
              </Text>
              <View style={styles.genTypeGrid}>
                {QR_GENERATOR_TYPES.map((type) => {
                  const isSelected = selectedGenType === type.id;
                  const bgColor = hexToRgba(
                    type.color,
                    isDark ? 0.15 : 0.09
                  );
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.genTypeCard,
                        {
                          backgroundColor: isSelected
                            ? type.color
                            : colors.card,
                          borderColor: isSelected ? type.color : colors.border,
                        },
                        Shadows.sm,
                      ]}
                      onPress={() => setSelectedGenType(type.id)}
                      activeOpacity={0.75}
                    >
                      <View
                        style={[
                          styles.genTypeIcon,
                          {
                            backgroundColor: isSelected
                              ? 'rgba(255,255,255,0.2)'
                              : bgColor,
                          },
                        ]}
                      >
                        <type.icon
                          size={20}
                          color={isSelected ? '#FFFFFF' : type.color}
                          strokeWidth={2}
                        />
                      </View>
                      <Text
                        style={[
                          styles.genTypeLabel,
                          {
                            color: isSelected ? '#FFFFFF' : colors.text,
                          },
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Input */}
 {selectedGenType === "wifi" ? (
  <>
    <View
      style={[
        styles.inputContainer,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          marginBottom: 12,
        },
      ]}
    >
      <TextInput
        placeholder="Network Name (SSID)"
        placeholderTextColor={colors.textDisabled}
        value={wifiName}
        onChangeText={setWifiName}
        style={[styles.textInput, { color: colors.text }]}
      />

    </View>

{wifiSecurity === "WPA" && (
  <View
    style={[
      styles.inputContainer,
      {
        backgroundColor: colors.card,
        borderColor: colors.border,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
      },
    ]}
  >
    <TextInput
      placeholder="Password"
      placeholderTextColor={colors.textDisabled}
      value={wifiPassword}
      onChangeText={setWifiPassword}
      secureTextEntry={!showWifiPassword}
      style={[
        styles.textInput,
        {
          color: colors.text,
          flex: 1,
        },
      ]}
    />

    <TouchableOpacity
      onPress={() =>
        setShowWifiPassword(!showWifiPassword)
      }
    >
      {showWifiPassword ? (
        <EyeOff
          size={20}
          color={colors.textSecondary}
        />
      ) : (
        <Eye
          size={20}
          color={colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  </View>
)}

    <View
  style={{
    flexDirection: "row",
    gap: 12,
  }}
>
  <TouchableOpacity
    style={[
      styles.actionButton,
      {
        flex: 1,
        backgroundColor:
          wifiSecurity === "WPA"
            ? colors.primary
            : colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      },
    ]}
    onPress={() => setWifiSecurity("WPA")}
  >
    <Text
      style={{
        color:
          wifiSecurity === "WPA"
            ? "#fff"
            : colors.text,
        fontWeight: "600",
      }}
    >
      WPA/WPA2
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.actionButton,
      {
        flex: 1,
        backgroundColor:
          wifiSecurity === "nopass"
            ? colors.primary
            : colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      },
    ]}
onPress={() => {
  setWifiSecurity("nopass");
  setWifiPassword("");
}}  >
    <Text
      style={{
        color:
          wifiSecurity === "nopass"
            ? "#fff"
            : colors.text,
        fontWeight: "600",
      }}
    >
      Open
    </Text>
  </TouchableOpacity>
</View>

  </>
) : (
  <View
    style={[
      styles.inputContainer,
      {
        backgroundColor: colors.card,
        borderColor: colors.border,
      },
    ]}
  >
    <TextInput
      style={[styles.textInput, { color: colors.text }]}
      placeholder={
        selectedGenType === "url"
          ? "https://example.com"
          : selectedGenType === "email"
          ? "name@example.com"
          : "+1 (555) 000-0000"
      }
      placeholderTextColor={colors.textDisabled}
      value={inputValue}
      onChangeText={setInputValue}
      autoCapitalize="none"
      autoCorrect={false}
    />
  </View>
)}

            {/* QR Preview placeholder */}
 <View
  style={[
    styles.qrPreviewArea,
    {
      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
    },
  ]}
>
 {isQrValid() ? (
<Animated.View style={qrAnimatedStyle}>
<ViewShot
  ref={qrViewRef}
  options={{
    format: "png",
    quality: 1,
  }}
>
<View
  style={{
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
  }}
>
<View
  style={{
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
  }}
>
  <QRCode
    value={getQrValue()}
    size={160}
    backgroundColor="white"
    color={qrColor}
    ecl="H"
  />


  <Text
    style={{
      marginTop: 8,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.5,
      color: "#CBD5E1",
    }}
  >
    SHELEMBESTUDIOS
  </Text>
</View>

  </View>
</ViewShot>
</Animated.View>
  ) : (
    <>
      <QrCode
        size={80}
        color={colors.textDisabled}
        strokeWidth={1}
      />

      <Text
        style={[
          styles.qrPreviewHint,
          {
            color: colors.textDisabled,
          },
        ]}
      >
        {selectedGenType === "wifi"
  ? "Enter network details to generate QR"
  : "Enter valid content to generate QR"}

      </Text>
    </>
  )}
</View>

    
          </View>
        )}

        <View style={{ marginTop: 20 }}>
  <Text
    style={{
      color: colors.text,
      fontWeight: "600",
      marginBottom: 10,
    }}
  >
    QR Style
  </Text>

  <View
    style={{
      flexDirection: "row",
      gap: 12,
    }}
  >
    {QR_COLORS.map((item) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => setQrColor(item.color)}
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: item.color,
          borderWidth: qrColor === item.color ? 3 : 0,
          borderColor: colors.primary,
        }}
      />
    ))}
  </View>
</View>

 <View
  style={{
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  }}
>
  <TouchableOpacity
    style={[
      styles.actionButton,
      {
        flex: 1,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      },
    ]}
disabled={!isQrValid()}
onPress={saveQrImage}
  >
    <Text
      style={{
        color: colors.text,
        fontWeight: "600",
      }}
    >
      💾 Save QR
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.actionButton,
      {
        flex: 1,
        backgroundColor: colors.primary,
      },
    ]}
   disabled={!isQrValid()}
    onPress={shareQr}
  >
    <Text
      style={{
        color: "#fff",
        fontWeight: "600",
      }}
    >
      📤 Share QR
    </Text>
  </TouchableOpacity>
</View>

        {/* History */}
        <View style={styles.historySection}>
          <SectionHeader
            title="Recent QR Codes"
            actionLabel="Clear"
       onAction={clearHistory}
          />

          {history.length === 0 ? (
  <Text
    style={{
      textAlign: "center",
      color: colors.textSecondary,
      marginTop: 20,
    }}
  >
    No QR codes scanned yet.
  </Text>
) : (
         history.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.historyRow,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
                Shadows.sm,
              ]}
              activeOpacity={0.75}
            >
             <View
  style={[
    styles.historyIcon,
    {
      backgroundColor: hexToRgba(colors.primary, 0.12),
    },
  ]}
>
  {item.type === "website" && (
    <Link size={20} color={colors.primary} strokeWidth={2} />
  )}

  {item.type === "email" && (
    <Mail size={20} color={colors.primary} strokeWidth={2} />
  )}

  {item.type === "phone" && (
    <Phone size={20} color={colors.primary} strokeWidth={2} />
  )}

  {item.type === "wifi" && (
    <Wifi size={20} color={colors.primary} strokeWidth={2} />
  )}

  {item.type === "text" && (
    <ClipboardIcon size={20} color={colors.primary} strokeWidth={2} />
  )}
</View>

  <View style={styles.historyInfo}>
        <Text
          style={[styles.historyType, { color: colors.textSecondary }]}
        >
          {item.type === "website" && "Website"}
          {item.type === "email" && "Email"}
          {item.type === "phone" && "Phone"}
          {item.type === "wifi" && "Wi-Fi"}
          {item.type === "text" && "Text"}
        </Text>


          <Text
          style={[styles.historyContent, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.content}
        </Text>
      </View>


              <Text style={[styles.historyDate, { color: colors.textDisabled }]}>
                {item.createdAt}
              </Text>
            </TouchableOpacity>
                   ))
)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing['3xl'] },

  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  screenTitle: {
    ...Typography.headingL,
    marginBottom: 4,
  },
  screenSubtitle: {
    ...Typography.body,
  },

  tabSwitcherWrapper: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  tabSwitcher: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  tabButtonActive: {
    // backgroundColor set inline
  },
  tabLabel: {
    ...Typography.bodyMedium,
    fontSize: 14,
  },

  tabContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
  },

  viewfinderCard: {
    overflow: 'hidden',
    borderRadius: BorderRadius.xl,
  },
  viewfinderArea: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  cornerMarker: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderWidth: 3,
  },
  corner_tl: {
    top: 20,
    left: 20,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
  },
  corner_tr: {
    top: 20,
    right: 20,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 6,
  },
  corner_bl: {
    bottom: 20,
    left: 20,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
  },
  corner_br: {
    bottom: 20,
    right: 20,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 6,
  },
  viewfinderLabel: {
    ...Typography.bodyMedium,
  },
  viewfinderHint: {
    ...Typography.caption,
  },

  openCameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  openCameraLabel: {
    ...Typography.button,
    color: '#FFFFFF',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.base,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...Typography.caption,
  },

  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  pasteLabel: {
    ...Typography.button,
  },

  genSection: {
    marginBottom: Spacing.lg,
  },
  genSectionLabel: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.sm,
  },
  genTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  genTypeCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  genTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  genTypeLabel: {
    ...Typography.bodyMedium,
    fontSize: 13,
    flex: 1,
  },
  inputContainer: {
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  textInput: {
    ...Typography.body,
    paddingVertical: Spacing.xs,
  },
  qrPreviewCard: {
    overflow: 'hidden',
  },
qrPreviewArea: {
  minHeight: 260,
  alignItems: "center",
  justifyContent: "center",
  gap: Spacing.md,
  borderRadius: BorderRadius.lg,
  overflow: "hidden",
},
  qrPreviewHint: {
    ...Typography.caption,
    textAlign: 'center',
  },
  generateLabel: {
    ...Typography.button,
  },

  historySection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  historyInfo: {
    flex: 1,
  },
  historyType: {
    ...Typography.caption,
    marginBottom: 2,
  },
  historyContent: {
    ...Typography.bodyMedium,
  },
  historyDate: {
    ...Typography.caption,
    flexShrink: 0,
  },
  actionButton: {
  paddingVertical: 14,
  borderRadius: 14,
  alignItems: "center",
},
flashButton: {
  position: "absolute",
  right: 16,
  top: 16,
  width: 46,
  height: 46,
  borderRadius: 23,
  alignItems: "center",
  justifyContent: "center",
},
scanLine: {
  position: "absolute",
  top: 15,
  left: 30,
  right: 30,
  height: 3,
  borderRadius: 10,
},
cancelButton: {
  position: "absolute",
  left: 16,
  top: 16,
  paddingHorizontal: 16,
  height: 44,
  borderRadius: 22,
  justifyContent: "center",
},
});
