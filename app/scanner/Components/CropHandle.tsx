import React from "react";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";

interface CropHandleProps {
  x: SharedValue<number>;
  y: SharedValue<number>;
  imageWidth: number;
  imageHeight: number;
}

export default function CropHandle({
  x,
  y,
  imageWidth,
  imageHeight,
}: CropHandleProps) {

const pan = Gesture.Pan()
  .onUpdate((event) => {
    const HANDLE_RADIUS = 10;

    x.value = Math.min(
      Math.max(
        x.value + event.changeX,
        HANDLE_RADIUS
      ),
      imageWidth - HANDLE_RADIUS
    );

    y.value = Math.min(
      Math.max(
        y.value + event.changeY,
        HANDLE_RADIUS
      ),
      imageHeight - HANDLE_RADIUS
    );
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
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