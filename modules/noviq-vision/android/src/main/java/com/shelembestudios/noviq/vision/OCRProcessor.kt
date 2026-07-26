package com.shelembestudios.noviq.vision

import android.content.Context
import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import java.io.File


object OCRProcessor {

    suspend fun extractText(
        context: Context,
        imagePath: String
    ): String {

        val uri = if (imagePath.startsWith("file://")) {
            Uri.parse(imagePath)
        } else {
            Uri.fromFile(File(imagePath))
        }

        val image = InputImage.fromFilePath(
            context,
            uri
        )

        val recognizer = TextRecognition
            .getClient(
                TextRecognizerOptions.DEFAULT_OPTIONS
            )

        return suspendCancellableCoroutine { continuation ->

            recognizer.process(image)
                .addOnSuccessListener { result ->

                    recognizer.close()

                    continuation.resume(
                        result.text
                    )
                }
                .addOnFailureListener {

                    recognizer.close()

                    continuation.resume("")
                }
        }
    }
}