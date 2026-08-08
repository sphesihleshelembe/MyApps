import React, { useEffect, useState } from "react";
import { View, Image, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScanSession } from "@/services/scanner/ScanSession";
import { LayoutChangeEvent } from "react-native";
import CropOverlay from "./Components/CropOverlay";
import * as ImageManipulator from "expo-image-manipulator";
import ImageEditor from "../../services/scanner/ImageEditor";
import { calculateCropRect } from "../../services/scanner/ImageMath";
import { saveScanImage } from '@/services/scanner/imageStorage';


export default function Cropscan(){

const router = useRouter();
const params = useLocalSearchParams();

const sessionId = params.sessionId as string;
const pageId = params.pageId as string;

const [imageUri, setImageUri] = useState("");
const [loading, setLoading] = useState(true);

const [isApplying, setIsApplying] = useState(false);


const [imageLayout, setImageLayout] = useState({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});
const [displayedImage, setDisplayedImage] = useState({
  left: 0,
  top: 0,
  width: 0,
  height: 0,
});

const [cropArea, setCropArea] = useState({
  left: 0,
  top: 0,
  width: 0,
  height: 0,
});
console.log(cropArea);

const [imageSize, setImageSize] = useState({
  width: 0,
  height: 0,
});

useEffect(() => {
  if (
    imageLayout.width === 0 ||
    imageLayout.height === 0 ||
    imageSize.width === 0 ||
    imageSize.height === 0
  ) {
    return;
  }

const IMAGE_MARGIN = 24;

const availableWidth =
  imageLayout.width - IMAGE_MARGIN * 2;

const availableHeight =
  imageLayout.height - IMAGE_MARGIN * 2;

const scale = Math.min(
  availableWidth / imageSize.width,
  availableHeight / imageSize.height
);

const width = imageSize.width * scale;
const height = imageSize.height * scale;

setDisplayedImage({
  left: IMAGE_MARGIN + (availableWidth - width) / 2,
  top: IMAGE_MARGIN + (availableHeight - height) / 2,
  width,
  height,
});
}, [imageLayout, imageSize]);

useEffect(() => {
  console.log("Stored image size:", imageSize);
}, [imageSize]);

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

const imageInfo = await ImageManipulator.manipulateAsync(

  page.uri,
  [],
  {}
);

setImageSize({
  width: imageInfo.width,
  height: imageInfo.height,
});

console.log("Image size:", imageInfo.width, imageInfo.height);

      }
    } finally {
      setLoading(false);
    }
  }

  loadPage();
}, [sessionId, pageId]);

if (loading) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
}

const handleApply = async () => {
  if (isApplying) return;

  setIsApplying(true);

  console.log("Displayed Image:", displayedImage);
console.log("Image Layout:", imageLayout);
console.log("Crop Area:", cropArea);
console.log("Original Image:", imageSize);

  try {
    const crop = calculateCropRect({

      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
     displayWidth: displayedImage.width,
     displayHeight: displayedImage.height,
      cropLeft: cropArea.left,
      cropTop: cropArea.top,
      cropWidth: cropArea.width,
      cropHeight: cropArea.height,
    });

    const newUri = await ImageEditor.cropImage({
      uri: imageUri,
      originX: crop.originX,
      originY: crop.originY,
      width: crop.width,
      height: crop.height,
    });

   const session = await ScanSession.load(sessionId);

if (!session) {
  throw new Error("Failed to load scan session.");
}

await session.updatePage(pageId, {
  uri: newUri,
});
console.log("Saved new URI:", newUri);
router.back();
  } catch (error) {
    console.error("Crop failed:", error);
  } finally {
    setIsApplying(false);
  }
};


return (
  <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
  <View
  style={{
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  }}
>
      <TouchableOpacity onPress={() => router.back()}>
<Text style={{ fontSize: 16, fontWeight: "700" }}>
  Cancel
</Text>
      </TouchableOpacity>

    <TouchableOpacity
  onPress={handleApply}
  disabled={isApplying}
>
<Text style={{ fontSize: 16, fontWeight: "700" }}>
  Apply
</Text>
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
  style={{
    position: "absolute",
    left: displayedImage.left,
    top: displayedImage.top,
    width: displayedImage.width,
    height: displayedImage.height,
  }}
  resizeMode="contain"
/>

 <CropOverlay
  imageWidth={displayedImage.width}
  imageHeight={displayedImage.height}
  imageLeft={displayedImage.left}
  imageTop={displayedImage.top}
  onCropChange={setCropArea}
/>
  
</View>
</View>
);
}