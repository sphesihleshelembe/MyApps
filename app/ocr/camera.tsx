import { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
  type FlashMode,
} from "expo-camera";

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import * as ImageManipulator from "expo-image-manipulator";
import { saveOCRImage } from "@/services/ocr";
import { OCRSession } from "@/services/ocr/OCRSession";
console.log("OCRSession =", OCRSession);
import * as ImagePicker from "expo-image-picker";

export default function OCRCameraScreen() {
  const router = useRouter();

  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();

  const [flash, setFlash] = useState<FlashMode>("off");

  const processImage = async (
  uri: string,
  width?: number,
  height?: number
) => {
  try {
    // Normalize to JPEG
    const normalized = await ImageManipulator.manipulateAsync(
      uri,
      [],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Save permanently
    const savedUri = await saveOCRImage(normalized.uri);

    // Store in session
    OCRSession.setImage({
      uri: savedUri,
      width: width ?? normalized.width,
      height: height ?? normalized.height,
    });

    router.push("/ocr/preview");
  } catch (error) {
    console.error("Image processing failed:", error);
  }
};
 

  const capturePhoto = async () => {
  if (!cameraRef.current) return;

  try {
    // Take the photo
    const photo = await cameraRef.current.takePictureAsync({
      quality: 1,
      skipProcessing: false,
    });

    if (!photo?.uri) return;

    await processImage(
  photo.uri,
  photo.width,
  photo.height
);

  } catch (error) {
    console.error("Capture failed:", error);
  }
};

const pickFromGallery = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsEditing: false,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    await processImage(
      asset.uri,
      asset.width,
      asset.height
    );

  } catch (error) {
    console.error("Gallery failed:", error);
  }
};

    if (!permission) {
    return null;
  }
   

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera permission is required.
          </Text>

          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>
              Grant Permission
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
      
    return (
    <SafeAreaView style={styles.container}>

      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flash}
      />

     <View style={styles.header}>
  <TouchableOpacity onPress={() => router.back()}>
    <Ionicons name="arrow-back" size={28} color="white" />
  </TouchableOpacity>

  <Text style={styles.title}>Extract Text</Text>

  <TouchableOpacity
    onPress={() =>
      setFlash(flash === "off" ? "on" : "off")
    }
  >
    <Ionicons
      name={flash === "on" ? "flash" : "flash-off"}
      size={24}
      color="white"
    />
  </TouchableOpacity>
</View>

  <View style={styles.bottomBar}>
<TouchableOpacity onPress={pickFromGallery}>
<Ionicons name="images" size={30} color="white" />
  </TouchableOpacity>

 <TouchableOpacity
  style={styles.captureButton}
  onPress={capturePhoto}
>
    <View style={styles.captureInner} />
  </TouchableOpacity>

  <View style={{ width: 30 }} />
  </View>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  permissionText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },

  permissionButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  permissionButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  header: {
  position: "absolute",
  top: 20,
  left: 20,
  right: 20,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

title: {
  color: "white",
  fontSize: 20,
  fontWeight: "700",
},

bottomBar: {
  position: "absolute",
  bottom: 40,
  left: 30,
  right: 30,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

captureButton: {
  width: 72,
  height: 72,
  borderRadius: 36,
  borderWidth: 4,
  borderColor: "white",
  justifyContent: "center",
  alignItems: "center",
},

captureInner: {
  width: 58,
  height: 58,
  borderRadius: 29,
  backgroundColor: "white",
  },
});