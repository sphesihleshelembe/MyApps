package com.shelembestudios.noviq.vision

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import java.io.File
import java.io.FileOutputStream
import android.content.Context

object ImageFilters {

fun grayscale(context: Context, imagePath: String): String {

        val input = context.contentResolver.openInputStream(
    android.net.Uri.parse(imagePath)
) ?: throw Exception("Unable to open image.")

val bitmap = BitmapFactory.decodeStream(input)
    ?: throw Exception("Unable to decode image.")

input.close()

        val width = bitmap.width
        val height = bitmap.height

        val output = Bitmap.createBitmap(
            width,
            height,
            Bitmap.Config.ARGB_8888
        )

        for (y in 0 until height) {
            for (x in 0 until width) {

                val pixel = bitmap.getPixel(x, y)

                val r = Color.red(pixel)
                val g = Color.green(pixel)
                val b = Color.blue(pixel)

                val gray = ((r + g + b) / 3)

                output.setPixel(
                    x,
                    y,
                    Color.rgb(gray, gray, gray)
                )
            }
        }

  val outFile = File(
    context.cacheDir,
    "grayscale_${System.currentTimeMillis()}.jpg"
)

        FileOutputStream(outFile).use {
            output.compress(
                Bitmap.CompressFormat.JPEG,
                100,
                it
            )
        }

        bitmap.recycle()
        output.recycle()

return "file://" + outFile.absolutePath    }
}