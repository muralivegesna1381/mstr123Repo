package com.wearables;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

import android.Manifest;
import android.content.ContentResolver;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Environment;
import android.util.Log;
import android.webkit.MimeTypeMap;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.abedelazizshe.lightcompressorlibrary.CompressionListener;
import com.abedelazizshe.lightcompressorlibrary.VideoCompressor;
import com.abedelazizshe.lightcompressorlibrary.VideoQuality;
import com.abedelazizshe.lightcompressorlibrary.config.Configuration;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.apache.commons.io.FilenameUtils;

import java.io.File;
import java.io.IOException;
import java.sql.Time;
import java.util.ArrayList;

public class QuestionnaireMediaCompression extends ReactContextBaseJavaModule {

    ReactApplicationContext react_Context;
    public QuestionnaireMediaCompression(ReactApplicationContext reactContext) {
        super(reactContext);
        react_Context = reactContext;

    }
    //Mandatory function getName that specifies the module name
    @Override
    public String getName() {
        return "QuestionnaireMediaCompression";
    }

    @ReactMethod
    public void getDeviceName(String pass, Callback cb) {
        Log.d("TEST"," onSuccess  "+pass);

        String extention = FilenameUtils.getExtension(pass);
        String fullPath = FilenameUtils.getFullPath(pass);
        String fileName = FilenameUtils.getBaseName(pass);
        Log.d("File","Extention "+extention);
        Log.d("File","Absolute path "+fullPath);
        Log.d("File","FileName "+fileName);

        String destPath = fullPath +fileName +"compressedFile." + extention;
        Log.d("File","desti  "+destPath);

        ArrayList<Uri>  videoList=  new ArrayList<>();
        videoList.add(Uri.fromFile(new File(pass)));

        VideoCompressor.start(
                getReactApplicationContext(), // => This is required if srcUri is provided. If not, pass null.
                Uri.fromFile(new File(pass)), // => Source can be provided as content uri, it requires context.
                null, // => This could be null if srcUri and context are provided.
                destPath,
                new CompressionListener() {

                    int progressCount = 1;

                    @Override
                    public void onStart() {
                        // Compression start
                        Log.d("VideoUploadWearables","onStart");
//                        cb.invoke("onStart","started");
                    }

                    @Override
                    public void onSuccess() {
                        // On Compression success
                        Log.d("VideoUploadWearables","onSuccess");
                        cb.invoke(destPath);
                    }

                    @Override
                    public void onFailure(String failureMessage) {
                        // On Failure
                        Log.d("VideoUploadWearables","Failure"+failureMessage);
//                        cb.invoke("fail",failureMessage);
                    }

                    @Override
                    public void onProgress(float v) {
                        WritableMap params = Arguments.createMap();

                        if (Math.round(v) == (10 * progressCount)){
                            progressCount += 1;
                            Log.d("VideoUploadWearables11","Progress "+Math.round(v));
                            params.putString("eventProperty", String.valueOf(v));
                            sendEvent(react_Context, "questVideoUploadProgress", params);
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

    private String getfileExtension(Uri uri)
    {
        String extension;
        ContentResolver contentResolver = getReactApplicationContext().getContentResolver();
        MimeTypeMap mimeTypeMap = MimeTypeMap.getSingleton();
        extension= mimeTypeMap.getExtensionFromMimeType(contentResolver.getType(uri));
        return extension;
    }

    private void sendEvent(ReactContext reactContext,

                           String eventName,@Nullable WritableMap params) {

        reactContext

                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)

                .emit(eventName, params);

    }

}
