
import { View, StyleSheet } from "react-native";
import React, { useEffect } from "react";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";

import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";

interface CropOverlayProps {
  imageWidth: number;
  imageHeight: number;
  imageLeft: number;
  imageTop: number;
  onCropChange?: (crop: {
    left: number;
    top: number;
    width: number;
    height: number;
  }) => void;
}

export default function CropOverlay({
  imageWidth,
  imageHeight,
  imageLeft,
  imageTop,
  onCropChange,
}: CropOverlayProps) {
const left = useSharedValue(0);
const top = useSharedValue(0);
const width = useSharedValue(imageWidth);
const height = useSharedValue(imageHeight);

useEffect(() => {
  left.value = 0;
  top.value = 0;
  width.value = imageWidth;
  height.value = imageHeight;
}, [imageWidth, imageHeight]);

const startLeft = useSharedValue(0);
const startTop = useSharedValue(0);
const startWidth = useSharedValue(0);
const startHeight = useSharedValue(0);

const topLeftGesture = Gesture.Pan()
  .onBegin(() => {
    startLeft.value = left.value;
    startTop.value = top.value;
    startWidth.value = width.value;
    startHeight.value = height.value;
  })
  .onUpdate((event) => {
    const newWidth = startWidth.value - event.translationX;
    const newHeight = startHeight.value - event.translationY;

    if (newWidth > 80) {
      left.value = startLeft.value + event.translationX;
      width.value = newWidth;
    }

    if (newHeight > 80) {
      top.value = startTop.value + event.translationY;
      height.value = newHeight;
    }
  });

  const topRightGesture = Gesture.Pan()
  .onBegin(() => {
    startTop.value = top.value;
    startWidth.value = width.value;
    startHeight.value = height.value;
  })
  .onUpdate((event) => {
    if (startWidth.value + event.translationX > 80) {
    width.value = startWidth.value + event.translationX;
}

   if (startHeight.value - event.translationY > 80) {
   top.value = startTop.value + event.translationY;
   height.value = startHeight.value - event.translationY;
}
  });

const bottomLeftGesture = Gesture.Pan()
  .onBegin(() => {
    startLeft.value = left.value;
    startWidth.value = width.value;
    startHeight.value = height.value;
  })
  .onUpdate((event) => {

    if (startWidth.value - event.translationX > 80) {
    left.value = startLeft.value + event.translationX;
    width.value = startWidth.value - event.translationX;
}

   if (startHeight.value + event.translationY > 80) {
   height.value = startHeight.value + event.translationY;
}

  });

const bottomRightGesture = Gesture.Pan()
  .onBegin(() => {
    startWidth.value = width.value;
    startHeight.value = height.value;
  })
  .onUpdate((event) => {
    if (startWidth.value + event.translationX > 80) {
    width.value = startWidth.value + event.translationX;
}

   if (startHeight.value + event.translationY > 80) {
   height.value = startHeight.value + event.translationY;
}
  });

const pan = Gesture.Pan()
  .onBegin(() => {
    startLeft.value = left.value;
    startTop.value = top.value;
  })
  .onUpdate((event) => {
    left.value = startLeft.value + event.translationX;
    top.value = startTop.value + event.translationY;
  });

  const cropStyle = useAnimatedStyle(() => {
  return {
    left: left.value,
    top: top.value,
    width: width.value,
    height: height.value,
  };
});

const topLeftStyle = useAnimatedStyle(() => {
  return {
    left: left.value,
    top: top.value,
  };
});
const topRightStyle = useAnimatedStyle(() => {
  return {
    left: left.value + width.value,
    top: top.value,
  };
});
const bottomLeftStyle = useAnimatedStyle(() => {
  return {
    left: left.value,
    top: top.value + height.value,
  };
});
const bottomRightStyle = useAnimatedStyle(() => {
  return {
    left: left.value + width.value,
    top: top.value + height.value,
  };
});

const topMaskStyle = useAnimatedStyle(() => ({
  top: 0,
  left: 0,
  right: 0,
  height: top.value,
}));

const leftMaskStyle = useAnimatedStyle(() => ({
  top: top.value,
  left: 0,
  width: left.value,
  height: height.value,
}));

const rightMaskStyle = useAnimatedStyle(() => ({
  top: top.value,
  left: left.value + width.value,
  right: 0,
  height: height.value,
}));

const bottomMaskStyle = useAnimatedStyle(() => ({
  top: top.value + height.value,
  left: 0,
  right: 0,
  bottom: 0,
}));

const gridStyle = useAnimatedStyle(() => ({
  left: left.value,
  top: top.value,
  width: width.value,
  height: height.value,
}));

useAnimatedReaction(
  () => ({
    left: left.value,
    top: top.value,
    width: width.value,
    height: height.value,
  }),
  (crop) => {
    if (onCropChange) {
      runOnJS(onCropChange)(crop);
    }
  }
);

return (
  <View
    style={[
      StyleSheet.absoluteFill,
      {
        left: imageLeft,
        top: imageTop,
        width: imageWidth,
        height: imageHeight,
      },
    ]}
  >
  
 <Animated.View
  style={[
    styles.darkArea,
    topMaskStyle,
  ]}
/>

<Animated.View
  style={[
    styles.darkArea,
    leftMaskStyle,
  ]}
/>

<Animated.View
  style={[
    styles.darkArea,
    rightMaskStyle,
  ]}
/>

<Animated.View
  style={[
    styles.darkArea,
    bottomMaskStyle,
  ]}
/>

    <Animated.View
      style={[
        styles.cropBox,
        cropStyle,
      ]}
    />

    <Animated.View
  style={[
    styles.gridContainer,
    gridStyle,
  ]}
>
  <View style={styles.verticalLine} />
  <View style={styles.horizontalLine} />
</Animated.View>

  <GestureDetector gesture={topLeftGesture}>
  <Animated.View
    style={[
      styles.handle,
      topLeftStyle,
    ]}
  />
</GestureDetector>

  <GestureDetector gesture={topRightGesture}>
  <Animated.View
    style={[
      styles.handle,
      topRightStyle,
    ]}
  />
</GestureDetector>
   <GestureDetector gesture={bottomLeftGesture}>
  <Animated.View
    style={[
      styles.handle,
      bottomLeftStyle,
    ]}
  />
</GestureDetector>
   <GestureDetector gesture={bottomRightGesture}>
  <Animated.View
    style={[
      styles.handle,
      bottomRightStyle,
    ]}
  />
</GestureDetector>

  </View>
);
}

const styles = StyleSheet.create({
  cropBox: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#00AEEF",
  },

  handle: {
  position: "absolute",
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: "#00AEEF",
  marginLeft: -10,
  marginTop: -10,
},
darkArea: {
  position: "absolute",
  backgroundColor: "rgba(0,0,0,0.45)",
},

gridContainer: {
  position: "absolute",
},

verticalLine: {
  position: "absolute",
  left: "50%",
  top: 0,
  bottom: 0,
  width: 1,
  backgroundColor: "rgba(255,255,255,0.6)",
},

horizontalLine: {
  position: "absolute",
  top: "50%",
  left: 0,
  right: 0,
  height: 1,
  backgroundColor: "rgba(255,255,255,0.6)",
},


  topRight: {
    left: 290,
    top: 90,
  },

});