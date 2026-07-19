package com.shelembestudios.noviq.vision

import android.content.Context
import android.net.Uri
import android.util.Log
import org.opencv.core.Mat
import org.opencv.imgcodecs.Imgcodecs
import java.io.File
import org.opencv.core.MatOfPoint2f
import org.opencv.core.Point
import org.opencv.core.Size
import org.opencv.imgproc.Imgproc

object DocumentCropper {

    fun crop(
        context: Context,
        imagePath: String,
        corners: List<Map<String, Double>>
    ): String {

        val uri = Uri.parse(imagePath)

val input = context.contentResolver.openInputStream(uri)
    ?: throw Exception("Unable to open image.")

val tempFile = File(
    context.cacheDir,
    "crop_input.jpg"
)

input.use { stream ->
    tempFile.outputStream().use { output ->
        stream.copyTo(output)
    }
}

val image = Imgcodecs.imread(tempFile.absolutePath)

if (image.empty()) {
    throw Exception("OpenCV failed to load image.")
}

Log.d(
    "NoviqCropper",
    "Image loaded: ${image.cols()} x ${image.rows()}"
)

val points = corners.map {
    org.opencv.core.Point(
        it["x"] ?: 0.0,
        it["y"] ?: 0.0
    )
}

val ordered = points.sortedWith(compareBy { it.y })

val top = ordered.take(2).sortedBy { it.x }
val bottom = ordered.takeLast(2).sortedBy { it.x }

val topLeft = top[0]
val topRight = top[1]
val bottomLeft = bottom[0]
val bottomRight = bottom[1]

val srcPoints = org.opencv.core.MatOfPoint2f(
    topLeft,
    topRight,
    bottomRight,
    bottomLeft
)

Log.d(
    "NoviqCropper",
    "Ordered corners created"
)
val widthTop = Math.hypot(
    topRight.x - topLeft.x,
    topRight.y - topLeft.y
)

val widthBottom = Math.hypot(
    bottomRight.x - bottomLeft.x,
    bottomRight.y - bottomLeft.y
)

val maxWidth = widthTop.coerceAtLeast(widthBottom)

val heightLeft = Math.hypot(
    bottomLeft.x - topLeft.x,
    bottomLeft.y - topLeft.y
)

val heightRight = Math.hypot(
    bottomRight.x - topRight.x,
    bottomRight.y - topRight.y
)

val maxHeight = heightLeft.coerceAtLeast(heightRight)

val destination = org.opencv.core.MatOfPoint2f(
    Point(0.0, 0.0),
    Point(maxWidth, 0.0),
    Point(maxWidth, maxHeight),
    Point(0.0, maxHeight)
)

val transform = Imgproc.getPerspectiveTransform(
    srcPoints,
    destination
)

val output = Mat()

Imgproc.warpPerspective(
    image,
    output,
    transform,
    Size(maxWidth, maxHeight)
)
val scansDir = File(
    context.filesDir,
    "scans"
)

if (!scansDir.exists()) {
    scansDir.mkdirs()
}

val outputFile = File(
    scansDir,
    "cropped_${System.currentTimeMillis()}.jpg"
)

Imgcodecs.imwrite(
    outputFile.absolutePath,
    output
)

return outputFile.toURI().toString().replace("file:/", "file:///")
    }
}