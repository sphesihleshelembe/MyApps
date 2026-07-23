package com.shelembestudios.noviq.vision

import android.content.Context
import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlin.coroutines.resume
import kotlinx.coroutines.suspendCancellableCoroutine


object OCRProcessor {

    suspend fun extractText(
        context: Context,
        imagePath: String
    ): String {

        val image = InputImage.fromFilePath(
            context,
            Uri.parse(imagePath)
        )

        val recognizer = TextRecognition
            .getClient(
                TextRecognizerOptions.DEFAULT_OPTIONS
            )

        return suspendCancellableCoroutine { continuation ->

            recognizer.process(image)
                .addOnSuccessListener { result ->

                    continuation.resume(
                        result.text
                    )

                }
                .addOnFailureListener {

                    continuation.resume(
                        ""
                    )

                }
        }
    }
}