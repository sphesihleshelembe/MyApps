package com.shelembestudios.noviq.pdf

import android.content.Context
import com.tom_roush.pdfbox.pdmodel.PDDocument
import java.io.File

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
fun split(
    context: Context,
    inputPath: String
): PdfResult {

    return try {

        val outputFiles = mutableListOf<String>()

        PDDocument.load(File(inputPath)).use { document ->

            val totalPages = document.numberOfPages

            val originalName =
                File(inputPath)
                    .nameWithoutExtension


            for (pageIndex in 0 until totalPages) {

                PDDocument().use { newDocument ->

                    newDocument.importPage(
                        document.getPage(pageIndex)
                    )

                    val outputFile = File(
                        context.filesDir,
                        "${originalName}_page_${pageIndex + 1}.pdf"
                    )


                    newDocument.save(outputFile)


                    outputFiles.add(
                        outputFile.absolutePath
                    )
                }
            }


            PdfResult(
                success = true,
                files = outputFiles,
                pageCount = totalPages
            )
        }


    } catch (e: Exception) {

        PdfResult(
            success = false,
            error = e.message
        )
    }
}

}