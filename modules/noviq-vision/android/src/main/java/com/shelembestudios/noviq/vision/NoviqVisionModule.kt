package com.shelembestudios.noviq.vision

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NoviqVisionModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("NoviqVision")

       AsyncFunction("grayscale") { imagePath: String ->
    val context = appContext.reactContext
        ?: throw Exception("React context is not available.")

    ImageFilters.grayscale(context, imagePath)
}
    }
}