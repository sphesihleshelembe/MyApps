package com.shelembestudios.noviq.pdf

import android.content.Context

object PdfConverter {

    fun render(
        context: Context,
        inputPath: String
    ): PdfResult {

        return PdfResult(
            success = false,
            error = "PDF to Image not implemented yet."
        )

    }

}