import React from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';



export default function EditScan() {

   const params = useLocalSearchParams();
   const imageUri = params.uri as string;
   const router = useRouter();



  return (
  <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <ArrowLeft size={22} color="#000" strokeWidth={2} />
      </TouchableOpacity>
    </View>

    <Image
      source={{ uri: imageUri }}
      style={styles.image}
      resizeMode="contain"
    />
  </View>
)};

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
});