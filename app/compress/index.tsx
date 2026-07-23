import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { FileText } from "lucide-react-native";
import NoviqPdf from "@/modules/noviq-vision/src/NoviqPdf";

import { useTheme } from "@/hooks/useTheme";

export default function CompressScreen() {
  const { colors } = useTheme();

  const [pdf, setPdf] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [resultPath, setResultPath] = useState<string | null>(null);

  const pickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    setPdf(result.assets[0]);
  };

  const compressPdf = async () => {
  if (!pdf) return;

  try {
    setCompressing(true);

    console.log("NoviqPdf module:", NoviqPdf);
    console.log("PDF:", pdf);
console.log("PDF URI:", pdf.uri);

    const result = await NoviqPdf.compress(
  pdf.uri,
  "BALANCED"
);

    console.log("Compression result:", result);

    if (result.success) {
      setResultPath(result.outputPath ?? null);
    } else {
      Alert.alert(
        "Compression failed",
        result.error ?? "Unknown error"
      );
    }

  } catch (error) {
    console.error(error);

    Alert.alert(
      "Error",
      "Could not compress PDF"
    );

  } finally {
    setCompressing(false);
  }
};

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        Smart Compress
      </Text>

      <TouchableOpacity
        style={[
          styles.pickButton,
          {
            backgroundColor: colors.primary,
          },
        ]}
        onPress={pickPdf}
      >
        <Text style={styles.pickButtonText}>Choose PDF</Text>
      </TouchableOpacity>

      {pdf && (
        <View
          style={[
            styles.fileCard,
            {
              backgroundColor: colors.card,
            },
          ]}
        >
          <FileText
            size={28}
            color={colors.primary}
          />

          <View style={{ marginLeft: 12 }}>
            <Text
              style={{
                color: colors.text,
                fontWeight: "600",
              }}
            >
              {pdf.name}
            </Text>

            <Text
              style={{
                color: colors.textSecondary,
              }}
            >
              {(pdf.size! / 1024 / 1024).toFixed(2)} MB
            </Text>
          </View>
        </View>
      )}
      <TouchableOpacity
  style={[
    styles.pickButton,
    {
      backgroundColor: colors.primary,
      marginTop: 20,
      opacity: compressing ? 0.6 : 1,
    },
  ]}
  disabled={compressing}
  onPress={compressPdf}
>
  <Text style={styles.pickButtonText}>
    {compressing ? "Compressing..." : "Compress PDF"}
  </Text>
</TouchableOpacity>

{resultPath && (
  <Text
    style={{
      color: colors.text,
      marginTop: 20,
    }}
  >
    Saved:
    {"\n"}
    {resultPath}
  </Text>
)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },

  pickButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  pickButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },

  fileCard: {
    marginTop: 24,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
  },
});