package com.shelembestudios.noviq.pdf

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NoviqPdfModule : Module() {

    override fun definition() = ModuleDefinition {

        Name("NoviqPdf")

AsyncFunction("compress") { inputPath: String, mode: String ->

    val compressionMode = when (mode.uppercase()) {
        "LOW" -> CompressionMode.LOW
        "HIGH" -> CompressionMode.HIGH
        else -> CompressionMode.BALANCED
    }

    val result = PdfEngine.compress(
        context = appContext.reactContext
            ?: throw Exception("Context unavailable"),
        inputPath = inputPath,
        mode = compressionMode
    )

    mapOf(
        "success" to result.success,
        "outputPath" to result.outputPath,
        "originalSize" to result.originalSize,
        "outputSize" to result.outputSize,
        "pageCount" to result.pageCount,
        "error" to result.error,
        "percentSaved" to result.percentSaved
    )
}
AsyncFunction("merge") { inputPaths: List<String> ->

    val result = PdfEngine.merge(
        context = appContext.reactContext
            ?: throw Exception("Context unavailable"),
        inputPaths = inputPaths
    )

    mapOf(
        "success" to result.success,
        "outputPath" to result.outputPath,
        "error" to result.error
    )
}
AsyncFunction("split") { 
    inputPath: String ->

    val result = PdfEngine.split(
        context = appContext.reactContext
            ?: throw Exception("Context unavailable"),
        inputPath = inputPath
    )

    mapOf(
        "success" to result.success,
        "files" to result.files,
        "pageCount" to result.pageCount,
        "error" to result.error
    )
}

    }

}