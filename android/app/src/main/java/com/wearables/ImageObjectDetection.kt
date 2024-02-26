package com.wearables

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Handler
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.label.ImageLabeling
import com.google.mlkit.vision.label.defaults.ImageLabelerOptions

//Created by nravva on 07/11/23.
//This File acting as bridging for object detection
class ImageObjectDetection : ReactContextBaseJavaModule {
    //constructor
    constructor(reactContext: ReactApplicationContext?) : super(reactContext) {}

    //Mandatory function getName that specifies the module name
    override fun getName(): String {
        return "ImageObjectDetection"
    }

    //Custom function that we are going to export to JS
    @ReactMethod
    fun getImageLabellingData(imageAsBase64: String, cb: Callback) {
        //Log.v("ImageObjectDetection", "imageAsBase64-->$imageAsBase64")
        try {
            val decodedString = Base64.decode(imageAsBase64, Base64.DEFAULT)
            val image = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.size)

            processImageLabeling(image, cb)

        } catch (e: Exception) {
            cb.invoke("", null)
            e.printStackTrace()
        }
    }

    private fun processImageLabeling(bitmap: Bitmap?, cb: Callback) {
        val image = InputImage.fromBitmap(bitmap!!, 0)
        val labeler = ImageLabeling.getClient(ImageLabelerOptions.DEFAULT_OPTIONS)
        labeler.process(image)
            .addOnSuccessListener { labels ->
                // Task completed successfully
                var isDataMatch = false
                var catConfidenceValue = 0F
                var toyConfidenceValue = 0F

                for (label in labels) {
                    Log.v(
                        "ImageObjectDetection",
                        String.format("Label %s, confidence %f", label.text, label.confidence)
                    )
                    if (label.text.contains("Toy") && label.confidence > 0.85) {
                        toyConfidenceValue = label.confidence
                        isDataMatch = false
                    }
                    if (label.text.contains("Cat") && label.confidence > 0.85) {
                        catConfidenceValue = label.confidence
                        isDataMatch = false
                    }
                    if (label.text.contains("Dog")) {
                        if (label.confidence > 0.95) {
                            isDataMatch = true
                        }
                        else if (catConfidenceValue > 0.95) {
                            isDataMatch = false
                        }
                        else if (catConfidenceValue > 0.85 && label.confidence < 0.75) {
                            isDataMatch = false
                        }
                        else if (toyConfidenceValue > 0.85 && label.confidence < 0.75) {
                            isDataMatch = false
                        }
                        else if (label.confidence > 0.60) {
                            isDataMatch = true
                        }
                    }
                }

                Handler().postDelayed({
                    cb.invoke(isDataMatch)
                }, 600)
            }
            .addOnFailureListener { e ->
                e.printStackTrace()
                // Task failed with an exception
                cb.invoke(false)
            }
    }

//    private fun saveBitmapToLocal(bmp: Bitmap, cb: Callback) {
//        try {
//            val fileName = getFileName()
//            val fOut = FileOutputStream(fileName)
//            Log.v("ImageBackgroundRemover", "ImageBackgroundRemover-->$fileName")
//            bmp.compress(Bitmap.CompressFormat.PNG, 85, fOut)
//            fOut.flush()
//            fOut.close()
//
//            cb.invoke(fileName)
//        } catch (e: Exception) {
//            cb.invoke("")
//        }
//    }
//
//    private fun getFileName(): String {
//        val path =
//            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).path
//        val calender = Calendar.getInstance()
//        val fileDateTime = calender[Calendar.YEAR].toString() + "_" +
//                calender[Calendar.MONTH] + "_" +
//                calender[Calendar.DAY_OF_MONTH] + "_" +
//                calender[Calendar.HOUR_OF_DAY] + "_" +
//                calender[Calendar.MINUTE] + "_" +
//                calender[Calendar.SECOND]
//        val fName = "trimmed_image_"
//        val newFile = File(
//            path + File.separator +
//                    fName + fileDateTime + ".png"
//        )
//        return newFile.toString()
//    }
}