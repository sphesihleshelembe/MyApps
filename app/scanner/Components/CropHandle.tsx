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
}

export default function CropHandle({
  x,
  y,
}: CropHandleProps) {
  const pan = Gesture.Pan()
    .onUpdate((event) => {
      x.value += event.changeX;
      y.value += event.changeY;
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