package com.shelembestudios.noviq.vision


import android.content.Context
import org.opencv.android.Utils
import org.opencv.core.Mat
import org.opencv.core.CvType
import org.opencv.imgcodecs.Imgcodecs
import org.opencv.imgproc.Imgproc
import java.io.File
import org.opencv.core.Core
import org.opencv.core.Size

object ImageFilters {

    fun grayscale(
        context: Context,
        imagePath: String
    ): String {

        // Load image
        val inputMat = Imgcodecs.imread(
            imagePath.replace("file://", "")
        )

        if (inputMat.empty()) {
            throw Exception("Could not load image")
        }

        // Convert to grayscale
        val grayMat = Mat()

        Imgproc.cvtColor(
            inputMat,
            grayMat,
            Imgproc.COLOR_BGR2GRAY
        )
        // Save result
        val outputFile = File(
            context.cacheDir,
            "grayscale_${System.currentTimeMillis()}.jpg"
        )

        Imgcodecs.imwrite(
            outputFile.absolutePath,
            grayMat
        )

        // Release memory
        inputMat.release()
        grayMat.release()

        return "file://${outputFile.absolutePath}"
    }

    fun blackWhite(
    context: Context,
    imagePath: String
): String {

    val inputMat = Imgcodecs.imread(
        imagePath.replace("file://", "")
    )

    if (inputMat.empty()) {
        throw Exception("Could not load image")
    }


    // Convert to grayscale
    val grayMat = Mat()

    Imgproc.cvtColor(
        inputMat,
        grayMat,
        Imgproc.COLOR_BGR2GRAY
    )

    // Remove small lighting variations
    val blurred = Mat()

    Imgproc.GaussianBlur(
        grayMat,
        blurred,
        org.opencv.core.Size(5.0, 5.0),
        0.0
    )

    // Create document-style black and white
    val threshold = Mat()

    Imgproc.adaptiveThreshold(
        blurred,
        threshold,
        255.0,
        Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C,
        Imgproc.THRESH_BINARY,
        11,
        2.0
    )

    val outputFile = File(
        context.cacheDir,
        "blackwhite_${System.currentTimeMillis()}.jpg"
    )

    Imgcodecs.imwrite(
        outputFile.absolutePath,
        threshold
    )


    inputMat.release()
    grayMat.release()
    blurred.release()
    threshold.release()

    return "file://${outputFile.absolutePath}"
}

fun autoEnhance(
    context: Context,
    imagePath: String
): String {

    val inputMat = Imgcodecs.imread(
        imagePath.replace("file://", "")
    )

    if (inputMat.empty()) {
        throw Exception("Could not load image")
    }


    // Convert to LAB colour space
    val lab = Mat()

    Imgproc.cvtColor(
        inputMat,
        lab,
        Imgproc.COLOR_BGR2Lab
    )


    // Split channels
    val channels = ArrayList<Mat>()

    Core.split(
        lab,
        channels
    )


    // Enhance brightness/contrast channel
    val clahe = Imgproc.createCLAHE(
        2.0,
        org.opencv.core.Size(8.0, 8.0)
    )


    clahe.apply(
        channels[0],
        channels[0]
    )


    Core.merge(
        channels,
        lab
    )


    // Convert back
    val enhanced = Mat()

    Imgproc.cvtColor(
        lab,
        enhanced,
        Imgproc.COLOR_Lab2BGR
    )


    val outputFile = File(
        context.cacheDir,
        "enhanced_${System.currentTimeMillis()}.jpg"
    )


    Imgcodecs.imwrite(
        outputFile.absolutePath,
        enhanced
    )


    inputMat.release()
    lab.release()
    enhanced.release()

    channels.forEach {
        it.release()
    }



    return "file://${outputFile.absolutePath}"
}

fun magicColor(
    context: Context,
    imagePath: String
): String {

    val inputMat = Imgcodecs.imread(
        imagePath.replace("file://", "")
    )

    if (inputMat.empty()) {
        throw Exception("Could not load image")
    }


    // Convert to LAB
    val lab = Mat()

    Imgproc.cvtColor(
        inputMat,
        lab,
        Imgproc.COLOR_BGR2Lab
    )


    val channels = ArrayList<Mat>()

    Core.split(
        lab,
        channels
    )


    // Improve lighting
    val clahe = Imgproc.createCLAHE(
        3.0,
        Size(8.0,8.0)
    )

    clahe.apply(
        channels[0],
        channels[0]
    )


    Core.merge(
        channels,
        lab
    )


    val result = Mat()

    Imgproc.cvtColor(
        lab,
        result,
        Imgproc.COLOR_Lab2BGR
    )


    // Slight color boost
    val hsv = Mat()

    Imgproc.cvtColor(
        result,
        hsv,
        Imgproc.COLOR_BGR2HSV
    )


    val hsvChannels = ArrayList<Mat>()

    Core.split(
        hsv,
        hsvChannels
    )


    hsvChannels[1].convertTo(
        hsvChannels[1],
        -1,
        1.25,
        0.0
    )


    Core.merge(
        hsvChannels,
        hsv
    )


    Imgproc.cvtColor(
        hsv,
        result,
        Imgproc.COLOR_HSV2BGR
    )


    val output = File(
        context.cacheDir,
        "magic_color_${System.currentTimeMillis()}.jpg"
    )


    Imgcodecs.imwrite(
        output.absolutePath,
        result
    )


    inputMat.release()
    lab.release()
    result.release()
    hsv.release()

    channels.forEach { it.release() }
    hsvChannels.forEach { it.release() }


    return "file://${output.absolutePath}"
}
}