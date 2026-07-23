package com.shelembestudios.noviq.pdf

import android.content.Context

object PdfEngine {

    fun merge(
        context: Context,
        inputPaths: List<String>
    ): PdfResult {

        return try {

            val output = PdfMerger.merge(
                context = context,
                inputPaths = inputPaths
            )

            PdfResult(
                success = true,
                outputPath = output
            )

        } catch (e: Exception) {

            PdfResult(
                success = false,
                error = e.message
            )

        }
    }

    fun compress(
        context: Context,
        inputPath: String,
     mode: CompressionMode = CompressionMode.HIGH
    ): PdfResult {

        return try {

    PdfCompressor.compress(
    context = context,
    inputPath = inputPath,
    mode = mode
)

        } catch (e: Exception) {

            PdfResult(
                success = false,
                error = e.message
            )

        }
    }


    fun render(
        context: Context,
        inputPath: String
    ): PdfResult {

        return try {

            PdfConverter.render(
    context,
    inputPath
)

        } catch (e: Exception) {

            PdfResult(
                success = false,
                error = e.message
            )

        }

    }

}