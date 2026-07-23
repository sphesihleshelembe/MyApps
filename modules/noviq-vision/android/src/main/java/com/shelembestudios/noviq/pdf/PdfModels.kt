package com.shelembestudios.noviq.pdf

enum class CompressionMode(
    val quality: Int,
    val maxWidth: Int
) {
    LOW(
        quality = 90,
        maxWidth = 2200
    ),

    BALANCED(
        quality = 75,
        maxWidth = 1500
    ),

    HIGH(
        quality = 55,
        maxWidth = 1000
    )
}

data class PdfResult(
    val success: Boolean,
    val outputPath: String? = null,
    val originalSize: Long? = null,
    val outputSize: Long? = null,
    val pageCount: Int? = null,
    val percentSaved: Double? = null,
    val error: String? = null

)