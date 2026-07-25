import React, { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import NoviqPdf from "../../modules/noviq-vision/src/NoviqPdf";
import { savePdf } from "@/services/export/savePdf";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { Typography, Spacing, BorderRadius, Shadows } from "@/theme";
import { FileText, Plus, Layers, X, GripVertical } from "lucide-react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

export default function MergeScreen() {
  const [pdfs, setPdfs] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const { colors } = useTheme();
  const [merging, setMerging] = useState(false);

const pickPDFs = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/pdf",
    multiple: true,
    copyToCacheDirectory: true,
  });

  console.log("Picker result:", result);

  if (!result.canceled) {
    console.log("Selected:", result.assets);
    console.log("Count:", result.assets.length);

setPdfs((current) => {
  const existingUris = new Set(current.map((pdf) => pdf.uri));

  const newPdfs = result.assets.filter(
    (pdf) => !existingUris.has(pdf.uri)
  );

  return [...current, ...newPdfs];
});  }
};

const getPdfOrder = (uri: string) =>
  pdfs.findIndex((pdf) => pdf.uri === uri) + 1;

const removePdf = (uri: string) => {
  setPdfs((current) =>
    current.filter((pdf) => pdf.uri !== uri)
  );
};
const primaryButtonStyle = (
  disabled: boolean
) => [
  styles.button,
  {
    backgroundColor: colors.primary,
    opacity: disabled ? 0.5 : 1,
  },
];

const mergePDFs = async () => {
  setMerging(true);

  try {
    const paths = pdfs.map((pdf) => pdf.uri.replace("file://", ""));

    const result = await NoviqPdf.merge(paths);

    if (result.success && result.outputPath) {
      const saved = await savePdf(
        result.outputPath,
        `Merged_${Date.now()}.pdf`
      );

      if (saved) {
        Alert.alert(
          "Success",
          "Merged PDF saved successfully."
        );
      } else {
        Alert.alert(
          "Cancelled",
          "The merged PDF was not saved."
        );
      }
    } else {
      Alert.alert(
        "Error",
        result.error ?? "Merge failed"
      );
    }
  } catch (e) {
    console.error(e);

    Alert.alert(
      "Error",
      "Something went wrong while merging the PDFs."
    );
  } finally {
    setMerging(false);
  }
};

return (
<SafeAreaView
  style={[
    styles.container,
    { backgroundColor: colors.background },
  ]}
>
<View style={styles.header}>
  <Text
    style={[
      styles.title,
      { color: colors.text },
    ]}
  >
    Merge PDF
  </Text>

  <Text
    style={[
      styles.subtitle,
      { color: colors.textSecondary },
    ]}
  >
    Combine multiple PDF files into a single document.
  </Text>
</View>


<TouchableOpacity
style={primaryButtonStyle(merging)}

  disabled={merging}
  onPress={pickPDFs}
>

  <Plus
    size={20}
    color="#fff"
  />

  <Text style={styles.buttonText}>
    Add PDF
  </Text>

</TouchableOpacity>

    <Text style={styles.counter}>
  Selected PDFs ({pdfs.length})
</Text>

<View style={styles.listContainer}>

{pdfs.length === 0 ? (
  <View
    style={[
      styles.emptyState,
      {
        backgroundColor: colors.card,
        borderColor: colors.border,
      },
    ]}
  >
    <FileText
      size={44}
      color={colors.textSecondary}
    />

    <Text
      style={[
        styles.emptyTitle,
        { color: colors.text },
      ]}
    >
      No PDFs selected
    </Text>

    <Text
      style={[
        styles.emptySubtitle,
        { color: colors.textSecondary },
      ]}
    >
      Tap "Add PDF" to begin merging documents.
    </Text>
  </View>
) : (
<DraggableFlatList
  data={pdfs}
  keyExtractor={(item) => item.uri}
  onDragEnd={({ data }) => setPdfs(data)}
  renderItem={({ item, index, drag, isActive }) => (
<View
  style={[
    styles.pdfCard,
    {
      opacity: isActive ? 0.8 : 1,
      transform: [{ scale: isActive ? 1.02 : 1 }],
    },
          Shadows.sm,
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: colors.primaryLight,
            },
          ]}
        >
          <>
  <Text
    style={[
      styles.orderNumber,
      {
        color: colors.primary,
      },
    ]}
  >
{getPdfOrder(item.uri)}
</Text>

  <FileText
    size={18}
    color={colors.primary}
  />
</>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.pdfName,
              { color: colors.text },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text
            style={[
              styles.pdfSize,
              { color: colors.textSecondary },
            ]}
          >
            {(item.size! / 1024 / 1024).toFixed(2)} MB
          </Text>
        </View>
        

<View
  style={styles.actions}
>

  <TouchableOpacity
    onLongPress={drag}
    delayLongPress={150}
    style={styles.dragHandle}
  >
    <GripVertical
      size={20}
      color={colors.textSecondary}
    />
  </TouchableOpacity>

<TouchableOpacity
 onPress={() => removePdf(item.uri)}
>
  <X
    size={20}
    color={colors.error}
  />
</TouchableOpacity>

</View>
      </View>
    )}
  />
)}
   </View>

    <TouchableOpacity
 style={[
  ...primaryButtonStyle(
    pdfs.length < 2 || merging
  ),
  Shadows.md,

]}

disabled={pdfs.length < 2 || merging}
onPress={() => {
    console.log("Merge button pressed");
    console.log("PDF count:", pdfs.length);
    mergePDFs();
  }}
>
<Text style={styles.buttonText}>
{merging ? (
  <>
    <ActivityIndicator
      color="#fff"
      size="small"
    />

    <Text style={styles.buttonText}>
      Merging PDFs...
    </Text>
  </>
) : (
  <Text style={styles.buttonText}>
    {`Merge ${pdfs.length} PDF${pdfs.length === 1 ? "" : "s"}`}
  </Text>
)}
</Text>
</TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  header: {
    marginBottom: 28,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },

  counter: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  pdfCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  pdfName: {
    fontSize: 16,
    fontWeight: "600",
  },

  pdfSize: {
    fontSize: 13,
    marginTop: 4,
  },
  emptyState: {
  borderWidth: 1,
  borderRadius: 18,
  paddingVertical: 40,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 24,
},

emptyTitle: {
  fontSize: 18,
  fontWeight: "600",
  marginTop: 16,
},

emptySubtitle: {
  marginTop: 6,
  fontSize: 14,
  textAlign: "center",
  paddingHorizontal: 30,
},
listContainer: {
  flex: 1,
},
actions: {
  flexDirection: "row",
  alignItems: "center",
},

dragHandle: {
  paddingHorizontal: 8,
  marginRight: 4,
},
orderNumber: {
  fontWeight: "700",
  fontSize: 14,
  marginBottom: 2,
},
});