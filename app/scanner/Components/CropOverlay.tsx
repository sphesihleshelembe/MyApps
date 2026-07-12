import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

export default function CropOverlay() {
  const [crop, setCrop] = useState({
    left: 40,
    top: 100,
    width: 260,
    height: 350,
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.cropBox,
          {
            left: crop.left,
            top: crop.top,
            width: crop.width,
            height: crop.height,
          },
        ]}
      >
        <View style={styles.handleTL} />
        <View style={styles.handleTR} />
        <View style={styles.handleBL} />
        <View style={styles.handleBR} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cropBox: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#00AEEF",
  },

  handleTL: {
    position: "absolute",
    left: -9,
    top: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#00AEEF",
  },

  handleTR: {
    position: "absolute",
    right: -9,
    top: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#00AEEF",
  },

  handleBL: {
    position: "absolute",
    left: -9,
    bottom: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#00AEEF",
  },

  handleBR: {
    position: "absolute",
    right: -9,
    bottom: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#00AEEF",
  },
});