import { View, Text,  ActivityIndicator,ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';
import { RotateCcw, RotateCw } from 'lucide-react-native';
import { Scissors, Palette } from 'lucide-react-native';

import { ScanSession } from '@/services/scanner/ScanSession';
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import { saveScanImage } from '@/services/scanner/imageStorage';
import {

  VisionEngine,
  FilterType,
} from "@/services/scanner/Filters";
import NoviqVision from "@/modules/noviq-vision/src";

export default function filterScan() {


  const router = useRouter();
  const params = useLocalSearchParams();

  const sessionId = params.sessionId as string;
  const pageId = params.pageId as string;

  const [currentUri, setCurrentUri] = useState('');
  const [previewUri, setPreviewUri] = useState("");
  const [originalUri, setOriginalUri] = useState("");
  const [loading, setLoading] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

 
  React.useEffect(() => {
  try {
  } catch (e) {
    console.error(e);
  }
}, []);
  useFocusEffect(
  useCallback(() => {
    async function loadPage() {
      try {
        const session = await ScanSession.load(sessionId);

        if (!session) return;

        const page = session.getPages().find(
          p => p.id === pageId
        );

        if (page) {
setCurrentUri(page.uri);
setOriginalUri(page.uri);
setPreviewUri(page.uri);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [sessionId, pageId])
  );
    const handleDone = async () => {
    try {
      const session = await ScanSession.load(sessionId);

      if (!session) return;

      await session.updatePage(pageId, {
      uri: previewUri,
      
      });

      router.back();
    } catch (e) {
      console.log(e);
    }
  };


 const rotateImage = async (degrees: number) => {
  try {
    setIsProcessing(true);

    const result = await ImageManipulator.manipulateAsync(
      currentUri,
      [{ rotate: degrees }],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    const permanentUri = await saveScanImage(result.uri);

    setCurrentUri(permanentUri);

    try {
      await FileSystem.deleteAsync(result.uri, {
        idempotent: true,
      });
    } catch {
      // Ignore cleanup errors
    }

  } catch (e) {
    console.log(e);
  } finally {
    setIsProcessing(false);
  }
};

const FILTERS: FilterType[] = [
  "Original",
  "Auto",
  "Grayscale",
  "BlackWhite",
  "Enhance",
  "MagicColor",
];

const FILTER_LABELS: Record<FilterType, string> = {
  Original: "Original",
  Auto: "Auto",
  Grayscale: "Grayscale",
  BlackWhite: "Black & White",
  Enhance: "Enhance",
  MagicColor: "MagicColor"
};

const [selectedFilter, setSelectedFilter] = useState("Original");

const handleFilterPress = async (filter: FilterType) => {
  try {
    setIsFiltering(true);

    setSelectedFilter(filter);

   const processedUri = await VisionEngine.applyFilter(
  originalUri,
  filter
);

console.log("Original:", originalUri);
console.log("Processed:", processedUri);


    setPreviewUri(processedUri);
 } catch (error) {
  console.error("Filter error:", error);

  if (error instanceof Error) {
    console.error(error.stack);
  }
} finally {
  setIsFiltering(false);
}
};

const renderPreview = () => {
  if (!previewUri) {
    return <Text>Loading...</Text>;
  }

  switch (selectedFilter) {
  case "Grayscale":
  return (
    <Image
      source={{ uri: previewUri }}
      style={{
        width: "100%",
        height: "100%",
      }}
      resizeMode="contain"
    />
  );
 

    default:
      return (
        <Image
          source={{ uri: previewUri }}
          style={styles.image}
          resizeMode="contain"
        />
      );
  }
};

  return (
      <View style={styles.container}>

  {/* Header */}
  <View style={styles.header}>
    <TouchableOpacity
      onPress={() => router.back()}
      style={styles.backButton}
    >
      <ArrowLeft size={24} />
    </TouchableOpacity>

    <Text style={styles.title}>Filters</Text>
  </View>

  {/* Preview */}
  <View style={styles.previewContainer}>
   {isFiltering ? (
  <ActivityIndicator size="large" color="#007AFF" />
) : (
  renderPreview()
)}
  </View>

  {/* Bottom Panel */}
  <View style={styles.bottomPanel}>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
    >
      {FILTERS.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            selectedFilter === filter &&
              styles.selectedFilterButton,
          ]}
          onPress={() => handleFilterPress(filter)}
        >
          <Text
            style={{
              color:
                selectedFilter === filter
                  ? "#FFF"
                  : "#000",
              fontWeight: "600",
            }}
          >
            {FILTER_LABELS[filter]}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>

    <TouchableOpacity
      style={styles.applyButton}
      onPress={handleDone}
    >
      <Text style={styles.applyButtonText}>
        Apply
      </Text>
    </TouchableOpacity>

  </View>

</View>
  
);

}
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },

  image: {
    flex: 1,
    width: '100%',
  },
  title: {
  flex: 1,
  textAlign: "center",
  fontSize: 20,
  fontWeight: "600",
  marginRight: 40,
},
filterContainer: {
  paddingHorizontal: 16,
  paddingVertical: 16,
  alignItems: "center",
},

filterButton: {
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: "#E5E5E5",
  marginRight: 12,
},

selectedFilterButton: {
  backgroundColor: "#007AFF",
  borderColor: "#007AFF",
},

applyButton: {
  margin: 16,
  backgroundColor: "#007AFF",
  borderRadius: 12,
  paddingVertical: 16,
  alignItems: "center",
},

applyButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "600",
},

previewContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
},

bottomPanel: {
  borderTopWidth: 1,
  borderTopColor: "#E5E5E5",
  backgroundColor: "#FFFFFF",
  paddingBottom: 10,
},
});