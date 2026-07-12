import React from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";

interface CropHandleProps {
  x: number;
  y: number;
  onMove: (x: number, y: number) => void;
}

export default function CropHandle({
  x,
  y,
  onMove,
}: CropHandleProps) {
  const translateX = useSharedValue(x);
  const translateY = useSharedValue(y);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = x + event.translationX;
      translateY.value = y + event.translationY;
    })
    .onEnd(() => {
      onMove(translateX.value, translateY.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: "#00AEEF",
            marginLeft: -10,
            marginTop: -10,
          },
          animatedStyle,
        ]}
      />
    </GestureDetector>
  );
}