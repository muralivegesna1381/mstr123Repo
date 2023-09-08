package com.wearables;

import android.net.Uri;
import android.os.Environment;
import android.util.Log;

import androidx.annotation.Nullable;

import com.abedelazizshe.lightcompressorlibrary.CompressionListener;
import com.abedelazizshe.lightcompressorlibrary.VideoCompressor;
import com.abedelazizshe.lightcompressorlibrary.VideoQuality;
import com.abedelazizshe.lightcompressorlibrary.config.Configuration;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.apache.commons.io.FilenameUtils;

import java.io.File;
import java.util.ArrayList;
import java.util.Calendar;

public class VideoCompression extends ReactContextBaseJavaModule {
    ReactApplicationContext react_Context;
    String finalDestPath = null;

    public VideoCompression(ReactApplicationContext reactContext) {
        super(reactContext);
        react_Context = reactContext;

    }

    //Mandatory function getName that specifies the module name
    @Override
    public String getName() {
        return "VideoCompression";
    }

    @ReactMethod
    public void getDeviceName(String inputFilePath, Callback cb) {
        Log.d("TEST", " VideoCompression inputPath::" + inputFilePath);

        String extention = FilenameUtils.getExtension(inputFilePath);
        String fullPath = FilenameUtils.getFullPath(inputFilePath);
        String fileName = FilenameUtils.getBaseName(inputFilePath);

        /**
         *  Don't create new file for compression if video happen trim
         */
        finalDestPath = inputFilePath;
        if(!inputFilePath.contains("files/TrimmedVideo/")){
            finalDestPath = getFileName(fileName, extention);
        }
        Log.d("File", "VideoCompression destPath::" + finalDestPath);

        ArrayList<Uri> videoList = new ArrayList<>();
        videoList.add(Uri.fromFile(new File(inputFilePath)));

        VideoCompressor.start(
                getReactApplicationContext(), // => This is required if srcUri is provided. If not, pass null.
                Uri.fromFile(new File(inputFilePath)), // => Source can be provided as content uri, it requires context.
                null, // => This could be null if srcUri and context are provided.
                finalDestPath,
                new CompressionListener() {

                    int progressCount = 1;

                    @Override
                    public void onStart() {
                        // Compression start
                        Log.d("VideoUploadWearables", "onStart");
//                        cb.invoke("onStart","started");
                    }

                    @Override
                    public void onSuccess() {
                        // On Compression success
                        Log.d("VideoUploadWearables", "onSuccess final compressed Output-->" + finalDestPath);
                        cb.invoke(finalDestPath);
                    }

                    @Override
                    public void onFailure(String failureMessage) {
                        // On Failure
                        Log.d("VideoUploadWearables", "Failure" + failureMessage);
//                        cb.invoke("fail",failureMessage);
                    }

                    @Override
                    public void onProgress(float v) {
                        WritableMap params = Arguments.createMap();

                        if (Math.round(v) == (10 * progressCount)) {
                            progressCount += 1;
                            Log.d("VideoUploadWearables11", "Progress " + Math.round(v));
                            params.putString("eventProperty", String.valueOf(v));
                            sendEvent(react_Context, "videoUploadRecieveProgressMsg", params);
                        }

//                        cb.invoke(v);
                        // Update UI with progress value
               /* runOnUiThread(new Runnable() {
                    public void run() {
                        progress.setText(progressPercent + "%");
                        progressBar.setProgress((int) progressPercent);
                    }
                });*/
                    }

                    @Override
                    public void onCancelled() {
                        // On Cancelled
                    }
                }, new Configuration(
                        VideoQuality.MEDIUM,
                        false,
                        false,
                        null /*videoHeight: double, or null*/,
                        null /*videoWidth: double, or null*/,
                        null /*videoBitrate: int, or null*/
                )
        );


    }

    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    private String getFileName(String fileName, String extention) {
        String path = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getPath();
        Calendar calender = Calendar.getInstance();
        String fileDateTime = calender.get(Calendar.YEAR) + "_" +
                calender.get(Calendar.MONTH) + "_" +
                calender.get(Calendar.DAY_OF_MONTH) + "_" +
                calender.get(Calendar.HOUR_OF_DAY) + "_" +
                calender.get(Calendar.MINUTE) + "_" +
                calender.get(Calendar.SECOND);
        String fName = "trimmed_video_";
        if (fileName != null && !fileName.isEmpty())
            fName = fileName;
        File newFile = new File(path + File.separator +
                (fName) + fileDateTime + "." + extention);
        return String.valueOf(newFile);
    }
}