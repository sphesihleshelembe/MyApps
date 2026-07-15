
import { View, Text,  ActivityIndicator } from 'react-native';
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





export default function EditScan() {


  const router = useRouter();
  const params = useLocalSearchParams();

  const sessionId = params.sessionId as string;
  const pageId = params.pageId as string;

  const [currentUri, setCurrentUri] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  

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
        uri: currentUri,
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
  return (
  <View style={styles.container}>
   <View style={styles.header}>
  <TouchableOpacity
    onPress={() => router.back()}
    style={styles.backButton}
  >
    <ArrowLeft size={24} />
  </TouchableOpacity>

 

  <TouchableOpacity
    onPress={handleDone}
    style={styles.doneButton}
  >
    <Text style={styles.doneText}>Done</Text>
  </TouchableOpacity>
</View>

 {currentUri ? (
  <Image
    source={{ uri: currentUri }}
    style={styles.image}
    resizeMode="contain"
  />
) : (
  <Text>Loading...</Text>
)}

  <View style={styles.toolbar}>

    {/* Rotate */}
    <TouchableOpacity
      style={styles.toolButton}
      onPress={() => rotateImage(90)}
      disabled={isProcessing}
    >
      <RotateCw size={24} color="#000" />
      <Text style={styles.toolLabel}>Rotate</Text>
    </TouchableOpacity>

    {/* Crop */}
    <TouchableOpacity
      style={styles.toolButton}
      onPress={() =>
  router.push({
    pathname: "/scanner/cropscan",
    params: {
      sessionId,
      pageId,
    },
  })
}
      disabled={isProcessing}
    >
      <Scissors size={24} color="#000" />
      <Text style={styles.toolLabel}>Crop</Text>
    </TouchableOpacity>

    {/* Filters - remove later */}
    <TouchableOpacity
      style={styles.toolButton}
     onPress={() =>
  router.push({
    pathname: "/scanner/filterScan",
    params: {
      sessionId,
      pageId,
    },
  })
}
      disabled={isProcessing}
    >
      <Palette size={24} color="#000" />
      <Text style={styles.toolLabel}>Filters</Text>
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

  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },

  toolButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  toolLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});