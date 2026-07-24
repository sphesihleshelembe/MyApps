import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import {
  FileText,
  FolderOpen,
  Share2,
  Download,
  CircleCheckBig,
} from "lucide-react-native";
import NoviqPdf from "@/modules/noviq-vision/src/NoviqPdf";

import { useTheme } from "@/hooks/useTheme";
import * as IntentLauncher from "expo-intent-launcher";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { ActivityIndicator } from "react-native";



function formatSize(bytes?: number) {
  if (!bytes) return "-";

  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default function CompressScreen() {
  const { colors } = useTheme();

  const [pdf, setPdf] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [compressing, setCompressing] = useState(false);
const [result, setResult] = useState<{
  outputPath?: string;
  originalSize?: number;
  outputSize?: number;
  pageCount?: number;
  percentSaved?: number;
} | null>(null);  const [compressionMode, setCompressionMode] = useState<
  "LOW" | "BALANCED" | "HIGH"
>("BALANCED");

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
  compressionMode
);

    console.log("Compression result:", result);

   if (result.success) {
  setResult({
    outputPath: result.outputPath ?? undefined,
    originalSize: result.originalSize ?? undefined,
    outputSize: result.outputSize ?? undefined,
    pageCount: result.pageCount ?? undefined,
    percentSaved: result.percentSaved ?? undefined,
  });
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
const sharePdf = async () => {
  if (!result?.outputPath) return;

  console.log("Output path:", result.outputPath);

  const uri = result.outputPath.startsWith("file://")
    ? result.outputPath
    : `file://${result.outputPath}`;

  console.log("Sharing URI:", uri);

  try {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Share Compressed PDF",
    });
  } catch (e) {
    console.error(e);
  }
};

const openPdf = async () => {
  if (!result?.outputPath) return;

  try {
    const uri = result.outputPath.startsWith("file://")
      ? result.outputPath
      : `file://${result.outputPath}`;

    const contentUri = await FileSystem.getContentUriAsync(uri);

    await IntentLauncher.startActivityAsync(
      "android.intent.action.VIEW",
      {
        data: contentUri,
        type: "application/pdf",
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
      }
    );
  } catch (e) {
    console.error(e);

    Alert.alert(
      "Unable to open PDF",
      "No PDF viewer is installed or the file couldn't be opened."
    );
  }
};

const saveToDownloads = async () => {
  if (!result?.outputPath) return;

  try {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      return;
    }

    const destinationUri =
      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        `Compressed_${Date.now()}.pdf`,
        "application/pdf"
      );

    const pdfBase64 = await FileSystem.readAsStringAsync(
      result.outputPath.startsWith("file://")
        ? result.outputPath
        : `file://${result.outputPath}`,
      {
        encoding: FileSystem.EncodingType.Base64,
      }
    );

    await FileSystem.writeAsStringAsync(
      destinationUri,
      pdfBase64,
      {
        encoding: FileSystem.EncodingType.Base64,
      }
    );

    Alert.alert(
      "Success",
      "PDF saved successfully!"
    );

  } catch (error) {
    console.error(error);
    Alert.alert(
      "Error",
      "Could not save PDF."
    );
  }
};

return (
  <SafeAreaView
    style={{
      flex: 1,
      backgroundColor: colors.background,
    }}
  >
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 40,
      }}
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
      <Text
  style={{
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
  }}
>
  Compression Level
</Text>

<View
  style={{
    gap: 12,
  }}
>
  {[
    {
      key: "LOW",
      title: "Low",
      description: "Best quality • Slight reduction",
    },
    {
      key: "BALANCED",
      title: "Balanced",
      description: "Recommended • Good balance",
    },
    {
      key: "HIGH",
      title: "High",
      description: "Maximum reduction • Smallest file",
    },
  ].map((mode) => (
    <TouchableOpacity
      key={mode.key}
      onPress={() =>
        setCompressionMode(
          mode.key as "LOW" | "BALANCED" | "HIGH"
        )
      }
      style={{
        padding: 16,
        borderRadius: 14,
        borderWidth: 2,
        borderColor:
          compressionMode === mode.key
            ? colors.primary
            : colors.border,
        backgroundColor: colors.card,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontWeight: "700",
          fontSize: 16,
        }}
      >
        {mode.title}
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          marginTop: 4,
        }}
      >
        {mode.description}
      </Text>
    </TouchableOpacity>
  ))}
</View>
<TouchableOpacity
  activeOpacity={0.8}
  disabled={compressing || !pdf}
  onPress={compressPdf}
  style={[
    styles.pickButton,
    {
      backgroundColor:
        compressing || !pdf
          ? colors.border
          : colors.primary,
      marginTop: 20,
      opacity: compressing ? 0.8 : 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
  ]}
>
{compressing && (
  <ActivityIndicator
    size="small"
    color="#FFF"
  />
)}
  <Text style={styles.pickButtonText}>
    {compressing
      ? "Compressing..."
      : "Compress PDF"}
  </Text>
</TouchableOpacity>

{result && (
  <View
    style={{
      marginTop: 24,
      padding: 20,
      borderRadius: 18,
      backgroundColor: colors.card,
    }}
  >
    {/* Header */}
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
      }}
    >
      <CircleCheckBig
        size={28}
        color="#16A34A"
      />

      <Text
        style={{
          fontSize: 22,
          fontWeight: "700",
          color: colors.text,
          marginLeft: 10,
        }}
      >
        Compression Complete
      </Text>
    </View>

    {/* Hero Result */}
    <View
      style={{
        alignItems: "center",
        marginBottom: 24,
      }}
    >
      <Text
        style={{
          fontSize: 46,
          fontWeight: "800",
          color: "#16A34A",
        }}
      >
        {result.percentSaved?.toFixed(1)}%
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 16,
          marginTop: 4,
        }}
      >
        Space Saved
      </Text>
    </View>

    {/* Divider */}
    <View
      style={{
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 20,
      }}
    />

    {/* Stats */}
    <View
      style={{
        gap: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            color: colors.textSecondary,
          }}
        >
          Original Size
        </Text>

        <Text
          style={{
            color: colors.text,
            fontWeight: "700",
          }}
        >
          {formatSize(result.originalSize)}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            color: colors.textSecondary,
          }}
        >
          Compressed Size
        </Text>

        <Text
          style={{
            color: colors.text,
            fontWeight: "700",
          }}
        >
          {formatSize(result.outputSize)}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            color: colors.textSecondary,
          }}
        >
          Pages
        </Text>

        <Text
          style={{
            color: colors.text,
            fontWeight: "700",
          }}
        >
          {result.pageCount}
        </Text>
      </View>
    </View>

    {/* Open */}
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={openPdf}
      style={[
        styles.pickButton,
        {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.primary,
          marginTop: 28,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        },
      ]}
    >
      <FolderOpen
        size={20}
        color={colors.primary}
      />

      <Text
        style={[
          styles.pickButtonText,
          {
            color: colors.primary,
          },
        ]}
      >
        Open PDF
      </Text>
    </TouchableOpacity>

    {/* Share */}
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={sharePdf}
      style={[
        styles.pickButton,
        {
          backgroundColor: colors.primary,
          marginTop: 12,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        },
      ]}
    >
      <Share2
        size={20}
        color="#FFF"
      />

      <Text style={styles.pickButtonText}>
        Share PDF
      </Text>
    </TouchableOpacity>

    {/* Save */}
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={saveToDownloads}
      style={[
        styles.pickButton,
        {
          backgroundColor: "#16A34A",
          marginTop: 12,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        },
      ]}
    >
      <Download
        size={20}
        color="#FFF"
      />

      <Text style={styles.pickButtonText}>
        Save to Downloads
      </Text>
    </TouchableOpacity>
  </View>
)}
    </ScrollView>
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