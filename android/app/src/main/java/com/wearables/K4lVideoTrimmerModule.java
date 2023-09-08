package com.wearables;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

import java.util.ArrayList;
import java.util.List;


@ReactModule(name = K4lVideoTrimmerModule.NAME)
public class K4lVideoTrimmerModule extends ReactContextBaseJavaModule implements ActivityEventListener {
  public static final String NAME = "K4lVideoTrimmer";

  Callback cb;
  private boolean isFirstTimeCalled = false;

  private List<String> croppedPaths = new ArrayList<String>();
  private List<String> inputPaths = new ArrayList<String>();
  private List<String> inputVideoDuration = new ArrayList<String>();

  public K4lVideoTrimmerModule(ReactApplicationContext reactContext) {
    super(reactContext);
    reactContext.addActivityEventListener(this);
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  @ReactMethod
  void clearExistingMedia() {
    inputPaths.clear();
    croppedPaths.clear();
    isFirstTimeCalled = false;
    Log.v("TAGGG", "NODE MODULE METHOD clearExistingMedia");
  }

  @ReactMethod
  void navigateToTrimmer(@NonNull String uri, @NonNull String duration, Callback callback) {
    this.cb = callback;
    Activity activity = getCurrentActivity();
    Log.v("TAGGG", "NODE MODULE METHOD CALLED" + uri);
    inputPaths.add(uri);
    Log.v("TAGGG", "ARRAY LIST SIZE-->" + inputPaths.size());
    inputVideoDuration.add(duration);
    if (activity != null && !isFirstTimeCalled) {
      isFirstTimeCalled = true;
      launchTrimmerActivity(0, activity, 111);
    }
  }


  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    Log.d("TAGGG", "ON activity result called->" + resultCode);
    if (data != null && data.getStringExtra("URI") != null) {
      if (resultCode == Activity.RESULT_OK || resultCode == Activity.RESULT_CANCELED) {
        String dataString = data.getStringExtra("URI");
        croppedPaths.add(dataString);
      }

      if (requestCode == 111) {
        launchTrimmerActivity(1, activity, 222);
      } else if (requestCode == 222) {
        launchTrimmerActivity(2, activity, 333);
      } else if (requestCode == 333) {
        launchTrimmerActivity(3, activity, 444);
      } else if (requestCode == 444) {
        launchTrimmerActivity(4, activity, 555);
      } else if (requestCode == 555) {
        launchTrimmerActivity(5, activity, 666);
      } else if (requestCode == 666) {
        launchTrimmerActivity(6, activity, 777);
      } else if (requestCode == 777) {
        sendURIToNative();
      }
    }
  }

  private void launchTrimmerActivity(int i, Activity activity, int requestCode) {
    Log.d("TAGG", "ON activity DATA i value after->" + i);
    if (inputPaths.size() > i) {
      Intent intent = new Intent(activity, TrimmerMainActivity.class);
      intent.putExtra("EXTRA_VIDEO_PATH", inputPaths.get(i));
      intent.putExtra("VIDEO_TRIM_DURATION", inputVideoDuration.get(i));
      intent.putExtra("RESULT_CODE", requestCode);
      activity.startActivityForResult(intent, requestCode);
    } else {
      //return cropped paths from here
      sendURIToNative();
    }
  }

  private void sendURIToNative() {
    Log.d("TAGG", "SEND URI TO NATIVE" + inputPaths.size());
    if (cb == null) {
      return;
    }
    if (croppedPaths.isEmpty()) {
      this.cb.invoke("");
    }

    if (croppedPaths != null) {
      this.cb.invoke("" + croppedPaths);
      croppedPaths.clear();
      inputPaths.clear();
      isFirstTimeCalled = false;
      return;
    } else {
      this.cb.invoke("");
      return;
    }
  }


  @Override
  public void onNewIntent(Intent intent) {
  }


}