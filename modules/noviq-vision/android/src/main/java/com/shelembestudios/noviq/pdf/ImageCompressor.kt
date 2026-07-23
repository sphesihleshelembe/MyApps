package com.shelembestudios.noviq.pdf

import android.graphics.Bitmap
import java.io.ByteArrayOutputStream
import kotlin.math.roundToInt

object ImageCompressor {

  

    fun compress(
    bitmap: Bitmap,
    mode: CompressionMode
): ByteArray {

       val resizedBitmap = resize(
    bitmap,
    mode.maxWidth
)

        val output = ByteArrayOutputStream()

      resizedBitmap.compress(
    Bitmap.CompressFormat.JPEG,
    mode.quality,
    output
)

        if (resizedBitmap !== bitmap) {
            resizedBitmap.recycle()
        }

        return output.toByteArray()
    }

    private fun resize(
    bitmap: Bitmap,
    maxWidth: Int
): Bitmap {

        if (bitmap.width <= maxWidth) {
            return bitmap
        }

        val scale = maxWidth.toFloat() / bitmap.width

       val newWidth = maxWidth

        val newHeight = (bitmap.height * scale).roundToInt()

        return Bitmap.createScaledBitmap(
            bitmap,
            newWidth,
            newHeight,
            true
        )
    }
}