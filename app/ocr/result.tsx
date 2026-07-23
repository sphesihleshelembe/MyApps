import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { OCRSession } from "@/services/ocr/OCRSession";
import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

export default function OCRResultScreen() {
  const router = useRouter();

const [text, setText] = useState(
  OCRSession.getText()
); const handleCopy = async () => {
 await Clipboard.setStringAsync(text);
  alert("Text copied to clipboard.");
};
const handleShare = async () => {
  try {
    await Share.share({
          message: text,    });
  } catch (error) {
    console.log(error);
  }
};
const handleSave = async () => {
  try {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      return;
    }

    const fileUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        `OCR_${Date.now()}`,
        "text/plain"
      );

    await FileSystem.writeAsStringAsync(
      fileUri,
      text
    );

    alert("File saved successfully!");

  } catch (error) {
    console.log("Save failed:", error);
  }
};

  return (
    <SafeAreaView style={styles.container}>
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    >

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>Extracted Text</Text>

        <View style={{ width: 28 }} />
      </View>

    <TextInput
  style={styles.editor}
  multiline
  value={text}
  onChangeText={setText}
  placeholder="No text extracted"
  placeholderTextColor="#888"
  textAlignVertical="top"
/>

      <View style={styles.actions}>
        <TouchableOpacity
  style={styles.actionButton}
  onPress={handleCopy}
>
  <Text style={styles.actionText}>Copy</Text>
</TouchableOpacity>

       <TouchableOpacity
  style={styles.actionButton}
  onPress={handleShare}
>
  <Text style={styles.actionText}>Share</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.primaryButton}
  onPress={handleSave}
>
  <Text style={styles.primaryText}>
    Save
  </Text>
</TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
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

  content: {
    flex: 1,
  },

  contentContainer: {
    padding: 20,
  },

  text: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 26,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
  },

  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
  },

  actionText: {
    color: "#fff",
    fontWeight: "600",
  },

  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
  editor: {
  flex: 1,
  margin: 20,
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#333",
  color: "#fff",
  fontSize: 16,
  lineHeight: 26,
  textAlignVertical: "top",
},
});