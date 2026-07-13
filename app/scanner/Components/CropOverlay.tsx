import React from "react";
import { View, StyleSheet } from "react-native";
import CropHandle from "./CropHandle";
 import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

export default function CropOverlay() {
const left = useSharedValue(40);
const top = useSharedValue(100);
const right = useSharedValue(300);
const bottom = useSharedValue(450);

const cropBoxStyle = useAnimatedStyle(() => {
  return {
    left: left.value,
    top: top.value,
    width: right.value - left.value,
    height: bottom.value - top.value,
  };
});



return (
  <View style={StyleSheet.absoluteFill}>
    <Animated.View
  style={[
    styles.cropBox,
    cropBoxStyle,
  ]}
/>

  <CropHandle
  x={left}
  y={top}
/>
  </View>
);
}

const styles = StyleSheet.create({
  cropBox: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#00AEEF",
  },
});