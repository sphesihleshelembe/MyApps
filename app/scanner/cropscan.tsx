import React, { useEffect, useState } from "react";
import { View, Image, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScanSession } from "@/services/scanner/ScanSession";
import { LayoutChangeEvent } from "react-native";
import CropOverlay from "./Components/CropOverlay";


export default function Cropscan(){

const router = useRouter();
const params = useLocalSearchParams();

const sessionId = params.sessionId as string;
const pageId = params.pageId as string;

const [imageUri, setImageUri] = useState("");
const [loading, setLoading] = useState(true);


const [imageLayout, setImageLayout] = useState({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});


useEffect(() => {
  async function loadPage() {
    try {
      const session = await ScanSession.load(sessionId);

      if (!session) return;

      const page = session.getPages().find(
        (p) => p.id === pageId
      );

      if (page) {
        setImageUri(page.uri);
      }
    } finally {
      setLoading(false);
    }
  }

  loadPage();
}, [sessionId, pageId]);
return (
  <View style={{ flex: 1, backgroundColor: "#fff" }}>
    <View
      style={{
        height: 56,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
      }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text>Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text>Apply</Text>
      </TouchableOpacity>
    </View>

   <View
  style={{ flex: 1 }}
  onLayout={(event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;

    setImageLayout({
      x,
      y,
      width,
      height,
    });
  }}
>
  <Image
    source={{ uri: imageUri }}
    style={{ flex: 1 }}
    resizeMode="contain"
  />

  <CropOverlay />
</View>
</View>
);
}