package com.shelembestudios.noviq.pdf

import android.content.Context
import android.util.Log
import com.tom_roush.pdfbox.cos.COSName
import com.tom_roush.pdfbox.pdmodel.PDDocument
import com.tom_roush.pdfbox.pdmodel.graphics.PDXObject
import com.tom_roush.pdfbox.pdmodel.graphics.image.PDImageXObject
import java.io.File
import android.net.Uri
import android.graphics.Bitmap
import java.io.ByteArrayOutputStream
import com.tom_roush.pdfbox.pdmodel.graphics.image.JPEGFactory
import java.io.ByteArrayInputStream

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
Log.d(TAG, "Exists: ${input.exists()}")

        if (!input.exists()) {
            throw Exception("Input PDF not found.")
        }

        val output = PdfUtils.createOutputPdf(
            context,
            "Compressed"
        )

        val document = PDDocument.load(input)

        try {

            Log.d(TAG, "PDF opened successfully")
            Log.d(TAG, "Pages: ${document.numberOfPages}")

            val pageCount = document.numberOfPages

            document.pages.forEachIndexed { pageIndex, page ->

                var imageCount = 0

                val resources = page.resources

                for (name in resources.xObjectNames) {

                    val xObject: PDXObject = resources.getXObject(name)

if (xObject is PDImageXObject) {

    imageCount++

    val bitmap = xObject.image
    if (bitmap.width < 800 && bitmap.height < 800) {
    imageCount++
    continue
}

    Log.d(
        TAG,
        "Compressing image $imageCount (${bitmap.width} x ${bitmap.height})"
    )

    val compressedBytes = ImageCompressor.compress(
    bitmap,
    mode
)

    val replacement = JPEGFactory.createFromStream(
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


Log.d(TAG, "Original size: ${input.length()} bytes")
Log.d(TAG, "Compressed size: ${output.length()} bytes")

        } finally {

            document.close()

        }

        val bytesSaved = input.length() - output.length()

val percentSaved =
    (bytesSaved * 100.0 / input.length())

 return PdfResult(
    success = true,
    outputPath = output.absolutePath,
    originalSize = input.length(),
    outputSize = output.length(),
    pageCount = document.numberOfPages,
    percentSaved = percentSaved

)
    }

}