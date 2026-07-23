package com.shelembestudios.noviq.pdf

import android.content.Context
import java.io.File
import java.text.DecimalFormat

object PdfUtils {

    /**
     * Returns the Noviq PDF output directory.
     */
    fun getOutputDirectory(context: Context): File {
        val directory = File(context.filesDir, PdfConstants.PDF_DIRECTORY)

        if (!directory.exists()) {
            directory.mkdirs()
        }

        return directory
    }

    /**
     * Creates an output PDF file.
     */
    fun createOutputPdf(
        context: Context,
        prefix: String = PdfConstants.DEFAULT_PREFIX
    ): File {

        val fileName =
            "${prefix}_${System.currentTimeMillis()}${PdfConstants.DEFAULT_EXTENSION}"

        return File(getOutputDirectory(context), fileName)
    }

    /**
     * Checks whether a PDF exists.
     */
    fun fileExists(path: String): Boolean {
        return File(path).exists()
    }

    /**
     * Returns file size in bytes.
     */
    fun getFileSize(path: String): Long {
        return File(path).length()
    }

    /**
     * Converts bytes into a readable string.
     */
    fun formatFileSize(bytes: Long): String {

        if (bytes <= 0) return "0 B"

        val units = arrayOf("B", "KB", "MB", "GB")

        var size = bytes.toDouble()
        var index = 0

        while (size >= 1024 && index < units.lastIndex) {
            size /= 1024
            index++
        }

        return DecimalFormat("#.##").format(size) + " " + units[index]
    }

}