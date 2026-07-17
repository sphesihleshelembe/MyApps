package com.shelembestudios.noviq.vision

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.opencv.android.OpenCVLoader

class NoviqVisionModule : Module() {

  override fun definition() = ModuleDefinition {

    Name("NoviqVision")

    AsyncFunction("grayscale") { imagePath: String ->

      if (!OpenCVLoader.initDebug()) {
        throw Exception("OpenCV initialization failed")
      }

      val context = appContext.reactContext
        ?: throw Exception("React context is not available.")

      ImageFilters.grayscale(context, imagePath)
    }


    AsyncFunction("blackWhite") { imagePath: String ->

      if (!OpenCVLoader.initDebug()) {
        throw Exception("OpenCV initialization failed")
      }

      val context = appContext.reactContext
        ?: throw Exception("React context is not available.")

      ImageFilters.blackWhite(context, imagePath)
    }

    AsyncFunction("autoEnhance") { imagePath: String ->

    if (!OpenCVLoader.initDebug()) {
        throw Exception("OpenCV initialization failed")
    }

    val context = appContext.reactContext
        ?: throw Exception("React context is not available.")

    ImageFilters.autoEnhance(context, imagePath)
}
AsyncFunction("magicColor") { imagePath: String ->

    if (!OpenCVLoader.initDebug()) {
        throw Exception("OpenCV initialization failed")
    }

    val context = appContext.reactContext
        ?: throw Exception("React context is not available.")

    ImageFilters.magicColor(context, imagePath)
}
AsyncFunction("detectDocument") { imagePath: String ->

    if (!OpenCVLoader.initDebug()) {
        throw Exception("OpenCV initialization failed")
    }

    val context = appContext.reactContext
        ?: throw Exception("React context is not available.")

    DocumentDetector.detect(context, imagePath)
}
  }
}