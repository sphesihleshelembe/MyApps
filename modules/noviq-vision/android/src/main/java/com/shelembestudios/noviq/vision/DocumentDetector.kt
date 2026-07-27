package com.shelembestudios.noviq.vision

import android.content.Context
import org.opencv.core.Mat
import org.opencv.imgcodecs.Imgcodecs
import org.opencv.imgproc.Imgproc
import org.opencv.core.Size
import org.opencv.core.MatOfPoint
import org.opencv.core.MatOfPoint2f
import org.opencv.core.Point
import org.opencv.core.CvType

object DocumentDetector {

    init {
        System.loadLibrary("opencv_java4")
    }

    fun detect(
        context: Context,
        imagePath: String
    ): Map<String, Any> {

        val uri = android.net.Uri.parse(imagePath)

        val input = context.contentResolver.openInputStream(uri)
            ?: throw Exception("Unable to open image.")

        val tempFile = java.io.File(
            context.cacheDir,
            "detect_input.jpg"
        )

        input.use { stream ->
            tempFile.outputStream().use { output ->
                stream.copyTo(output)
            }
        }

        val mat = Imgcodecs.imread(tempFile.absolutePath)

        if (mat.empty()) {
            throw Exception("OpenCV failed to load image.")
        }

        val gray = Mat()

Imgproc.cvtColor(
    mat,
    gray,
    Imgproc.COLOR_BGR2GRAY
)

   val blurred = Mat()

Imgproc.GaussianBlur(
    gray,
    blurred,
    Size(5.0, 5.0),
    0.0
)
val edges = Mat()

Imgproc.Canny(
    blurred,
    edges,
    75.0,
    200.0
)

val contours = mutableListOf<MatOfPoint>()
val hierarchy = Mat()

Imgproc.findContours(
    edges,
    contours,
    hierarchy,
    Imgproc.RETR_EXTERNAL,
    Imgproc.CHAIN_APPROX_SIMPLE
)

var biggestArea = 0.0


var bestScore = Double.NEGATIVE_INFINITY
var biggestContour: MatOfPoint2f? = null

val imageCenterX = mat.cols() / 2.0
val imageCenterY = mat.rows() / 2.0

for (contour in contours) {

    val contour2f = MatOfPoint2f(*contour.toArray())

    val area = Imgproc.contourArea(contour2f)


    // Always remember the largest contour we've seen
    if (area > biggestArea) {
        biggestArea = area
    }

 if (area < 50000) {
    continue
}

    val approx = MatOfPoint2f()

    Imgproc.approxPolyDP(
        contour2f,
        approx,
        0.02 * Imgproc.arcLength(contour2f, true),
        true
    )

    // For now, don't compare the area again.
if (
    approx.total() == 4L &&
    Imgproc.isContourConvex(MatOfPoint(*approx.toArray()))
) {

    val rect = Imgproc.boundingRect(MatOfPoint(*approx.toArray()))

    val centerX = rect.x + rect.width / 2.0
    val centerY = rect.y + rect.height / 2.0

    val distance = Math.hypot(
        centerX - imageCenterX,
        centerY - imageCenterY
    )

    val score = area - (distance * 1000)

    if (score > bestScore) {
        bestScore = score
        biggestContour = approx
    }
}
}

val corners = mutableListOf<Map<String, Double>>()

if (biggestContour != null) {
    for (point in biggestContour.toArray()) {
        corners.add(
            mapOf(
                "x" to point.x,
                "y" to point.y
            )
        )
    }
}

return mapOf(
    "found" to (biggestContour != null),
    "area" to biggestArea,
    "contours" to contours.size,
    "corners" to corners
)
    }
}