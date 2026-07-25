package com.shelembestudios.noviq.pdf

import android.content.Context
import com.tom_roush.pdfbox.multipdf.PDFMergerUtility
import java.io.File

object PdfMerger {

    fun merge(
        context: Context,
        inputPaths: List<String>,
        outputFileName: String = "Merged_${System.currentTimeMillis()}.pdf"
    ): String {

        val outputDir = File(context.filesDir, "documents")

        if (!outputDir.exists()) {
            outputDir.mkdirs()
        }

        val outputFile = File(outputDir, outputFileName)

        val merger = PDFMergerUtility()

        inputPaths.forEach { path ->
            merger.addSource(File(path))
        }

        merger.destinationFileName = outputFile.absolutePath

        merger.mergeDocuments(null)

return "file://${outputFile.absolutePath}"
}
}