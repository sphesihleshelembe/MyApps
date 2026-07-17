package com.shelembestudios.noviq.vision

import android.content.Context

object DocumentDetector {

    fun detect(
        context: Context,
        imagePath: String
    ): Map<String, Any> {

        return mapOf(
            "found" to false,
            "corners" to emptyList<Map<String, Double>>()
        )
    }
}