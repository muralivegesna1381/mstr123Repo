package com.wearables;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import com.gowtham.library.utils.TrimType;
import com.gowtham.library.utils.TrimVideo;

//import life.knowledge4.videotrimmer.K4LVideoTrimmer;
//import life.knowledge4.videotrimmer.interfaces.OnTrimVideoListener;

public class TrimmerActivity extends AppCompatActivity {

  String videoUri;

  ActivityResultLauncher<Intent> startForResult = registerForActivityResult(
    new ActivityResultContracts.StartActivityForResult(),
    result -> {
      if (result.getResultCode() == Activity.RESULT_OK &&
        result.getData() != null) {
        String uri = TrimVideo.getTrimmedVideoPath(result.getData());
        Intent returnIntent = new Intent();
        returnIntent.putExtra("URI", uri);
        setResult(1, returnIntent);
        finish();
      } else {
        Intent returnIntent = new Intent();
        returnIntent.putExtra("error", 1);
        returnIntent.putExtra("URI", "");
        setResult(2, returnIntent);
        finish();
      }
    });

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_trimmer);
    try {
      Intent extraIntent = getIntent();
      Uri path = Uri.parse(extraIntent.getStringExtra("EXTRA_VIDEO_PATH"));

      Long duration = Long.valueOf(extraIntent.getStringExtra("VIDEO_TRIM_DURATION"));
      this.videoUri = String.valueOf(path);
      openTrimActivity(this.videoUri, duration);
    } catch (NumberFormatException e) {
      e.printStackTrace();
    }
  }

  private void openTrimActivity(String path, Long duration) {
     TrimVideo.activity(String.valueOf(path))
      .setTrimType(TrimType.DEFAULT)
      .setHideSeekBar(true)
      .start(TrimmerActivity.this, startForResult);
  }
}
