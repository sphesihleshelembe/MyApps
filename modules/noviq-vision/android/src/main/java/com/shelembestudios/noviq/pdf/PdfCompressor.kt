package com.shelembestudios.noviq.pdf

import android.content.Context
import android.net.Uri
import android.util.Log
import com.tom_roush.pdfbox.pdmodel.PDDocument
import com.tom_roush.pdfbox.pdmodel.graphics.PDXObject
import com.tom_roush.pdfbox.pdmodel.graphics.image.JPEGFactory
import com.tom_roush.pdfbox.pdmodel.graphics.image.PDImageXObject
import java.io.ByteArrayInputStream
import java.io.File
import kotlin.math.round


object PdfCompressor {

    private const val TAG = "NoviqPdf"

    fun compress(
        context: Context,
        inputPath: String,
        mode: CompressionMode
    ): PdfResult {

        val input = if (inputPath.startsWith("file://")) {
            File(Uri.parse(inputPath).path!!)
        } else {
            File(inputPath)
        }

        Log.d(TAG, "Input URI: $inputPath")
        Log.d(TAG, "Resolved path: ${input.absolutePath}")

        if (!input.exists()) {
            throw Exception("Input PDF not found.")
        }

        val output = PdfUtils.createOutputPdf(
            context,
            "Compressed"
        )

        val document = PDDocument.load(input)

               try {

            val pageCount = document.numberOfPages

            Log.d(TAG, "PDF opened successfully")
            Log.d(TAG, "Pages: $pageCount")

            document.pages.forEachIndexed { pageIndex, page ->

                var imageCount = 0

                val resources = page.resources

                for (name in resources.xObjectNames) {

                    val xObject: PDXObject = resources.getXObject(name)

                    if (xObject is PDImageXObject) {

                        val bitmap = xObject.image

                        // Skip tiny images (icons, logos, etc.)
                        if (bitmap.width < 800 && bitmap.height < 800) {
                            continue
                        }

                        imageCount++

                        Log.d(
                            TAG,
                            "Compressing image $imageCount (${bitmap.width} x ${bitmap.height})"
                        )

                        val compressedBytes =
                            ImageCompressor.compress(
                                bitmap,
                                mode
                            )

                        val replacement =
                            JPEGFactory.createFromStream(
                                document,
                                ByteArrayInputStream(compressedBytes)
                            )

                        resources.put(name, replacement)

                        bitmap.recycle()
                    }
                }

                Log.d(
                    TAG,
                    "Page ${pageIndex + 1}: $imageCount image(s)"
                )
            }

            document.save(output)

            val originalSize = input.length()
            val outputSize = output.length()

            Log.d(TAG, "Original size: $originalSize bytes")
            Log.d(TAG, "Compressed size: $outputSize bytes")

            // Never return a file larger than the original
            if (outputSize >= originalSize) {

                output.delete()

                return PdfResult(
                    success = true,
                    outputPath = input.absolutePath,
                    originalSize = originalSize,
                    outputSize = originalSize,
                    pageCount = pageCount,
                    percentSaved = 0.0
                )
            }

            val bytesSaved = originalSize - outputSize

            val percentSaved =
                round(
                    bytesSaved * 1000.0 / originalSize
                ) / 10.0

            return PdfResult(
                success = true,
                outputPath = output.absolutePath,
                originalSize = originalSize,
                outputSize = outputSize,
                pageCount = pageCount,
                percentSaved = percentSaved
            )

        } finally {

            document.close()

        }
    }
}