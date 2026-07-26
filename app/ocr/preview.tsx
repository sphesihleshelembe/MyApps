import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { OCRSession } from "@/services/ocr/OCRSession";
import { requireNativeModule } from 'expo-modules-core';

const NoviqVision = requireNativeModule('NoviqVision');


export default function OCRPreviewScreen() {

 const router = useRouter();

  const image = OCRSession.getImage();

const [loading, setLoading] = useState(false);
  
  const handleRetake = () => {
  OCRSession.clear();
  router.replace("/ocr/camera");
};

const handleExtractText = async () => {

  try {

    if (!image) {
      console.log("No image available");
      return;
    }

    setLoading(true);

    const result = await NoviqVision.extractText(
      image.uri
    );

    console.log("OCR TEXT:", result);

OCRSession.setText(result);

router.push("/ocr/result");

  } catch (error) {

    console.log("OCR ERROR:", error);

  } finally {

    setLoading(false);

  }

};

    useEffect(() => {
    if (!image) {
      router.replace("/ocr/camera");
    }
  }, [image]);

    if (!image) {
    return null;
  }


return (
  <SafeAreaView style={styles.container}>

    <View style={styles.header}>

      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons
          name="arrow-back"
          size={28}
          color="white"
        />
      </TouchableOpacity>

      <Text style={styles.title}>
        Preview
      </Text>

      <View style={{ width: 28 }} />

    </View>

    <Image
      source={{ uri: image.uri }}
      style={styles.image}
      resizeMode="contain"
    />

<View style={styles.bottomBar}>

  <TouchableOpacity
    style={styles.secondaryButton}
    onPress={handleRetake}
  >
    <Text style={styles.secondaryText}>
      Retake
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.primaryButton}
    onPress={handleExtractText}
  >
    <Text style={styles.primaryText}>
      Extract Text
    </Text>
  </TouchableOpacity>

</View>

  </SafeAreaView>
);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  image: {
    flex: 1,
    width: "100%",
  },

  bottomBar: {
    flexDirection: "row",
    padding: 20,
    gap: 16,
  },

  secondaryButton: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  primaryButton: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  secondaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
