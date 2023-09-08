package com.wearables;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.MediaController;
import android.widget.Toast;
import android.widget.VideoView;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

//import com.cocosw.bottomsheet.BottomSheet;
import com.gowtham.library.utils.LogMessage;
import com.gowtham.library.utils.TrimType;
import com.gowtham.library.utils.TrimVideo;

import java.io.File;

public class TrimmerMainActivity extends AppCompatActivity implements View.OnClickListener {

    private static final String TAG = "MainActivity";
    private VideoView videoView;
    private MediaController mediaController;
    private EditText edtFixedGap, edtMinGap, edtMinFrom, edtMAxTo;
    private int trimType;

    private Uri path_Extra;

    private Long duration_Extra;
    private int result_Code;

    public static String[] storge_permissions = {
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.READ_EXTERNAL_STORAGE
    };

    @RequiresApi(api = Build.VERSION_CODES.TIRAMISU)
    public static String[] storge_permissions_33 = {
            Manifest.permission.READ_MEDIA_IMAGES,
            Manifest.permission.READ_MEDIA_AUDIO,
            Manifest.permission.READ_MEDIA_VIDEO
    };


    ActivityResultLauncher<Intent> videoTrimResultLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == Activity.RESULT_OK &&
                        result.getData() != null) {
                    Uri uri = Uri.parse(TrimVideo.getTrimmedVideoPath(result.getData()));
                    Intent intent = new Intent();
                    intent.putExtra("URI",uri.toString());
                    intent.putExtra("Title","Videotitle");
                    setResult(Activity.RESULT_OK,intent );
                    finish();
                    String filepath = String.valueOf(uri);
                    File file = new File(filepath);
                    long length = file.length();
                    //Log.d(TAG, "Video size:: " + (length / 1024));
                } else{
                    // LogMessage.v("videoTrimResultLauncher data is null");
                    Intent intent = new Intent();
                    intent.putExtra("URI",path_Extra.toString());
                    intent.putExtra("Title","Videotitle");
                    setResult(Activity.RESULT_CANCELED,intent );
                    finish();
                }

            });

    ActivityResultLauncher<Intent> takeOrSelectVideoResultLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == Activity.RESULT_OK &&
                        result.getData() != null) {
                    Intent data = result.getData();
                    //check video duration if needed
           /*        if (TrimmerUtils.getDuration(this,data.getData())<=30){
                    Toast.makeText(this,"Video should be larger than 30 sec",Toast.LENGTH_SHORT).show();
                    return;
                }*/
                    if (data.getData() != null) {
                        LogMessage.v("Video path:: " + path_Extra);
                        openTrimActivity(String.valueOf(path_Extra));
                    } else {
                        Toast.makeText(this, "video uri is null", Toast.LENGTH_SHORT).show();
                    }
                } else
                    LogMessage.v("takeVideoResultLauncher data is null");
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(null);
        setContentView(R.layout.activity_timmer_main);
        videoView = findViewById(R.id.video_view);
        edtFixedGap = findViewById(R.id.edt_fixed_gap);
        edtMinGap = findViewById(R.id.edt_min_gap);
        edtMinFrom = findViewById(R.id.edt_min_from);
        edtMAxTo = findViewById(R.id.edt_max_to);
        mediaController = new MediaController(this);

        Intent extraIntent = getIntent();
        path_Extra = Uri.parse(extraIntent.getStringExtra("EXTRA_VIDEO_PATH"));
        duration_Extra = Long.valueOf(extraIntent.getStringExtra("VIDEO_TRIM_DURATION"));
        result_Code = extraIntent.getIntExtra("RESULT_CODE",0);

        findViewById(R.id.btn_default_trim).setOnClickListener(this);
        findViewById(R.id.btn_fixed_gap).setOnClickListener(this);
        findViewById(R.id.btn_min_gap).setOnClickListener(this);
        findViewById(R.id.btn_min_max_gap).setOnClickListener(this);

        onDefaultTrimClicked();
    }

    public static String[] permissions() {
        String[] p;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            p = storge_permissions_33;
        } else {
            p = storge_permissions;
        }
        return p;
    }

    private void openTrimActivity(String data) {
        if (trimType == 0) {
            TrimVideo.activity(data)
                    // .setCompressOption(new CompressOption()) //pass empty constructor for default compress option
                    .start(this, videoTrimResultLauncher);
        } else if (trimType == 1) {
            TrimVideo.activity(data)
                    .setTrimType(TrimType.FIXED_DURATION)
                    .setFixedDuration(getEdtValueLong(edtFixedGap))
                    .setLocal("ar")
                    .start(this, videoTrimResultLauncher);
        } else if (trimType == 2) {
            TrimVideo.activity(data)
                    .setTrimType(TrimType.MIN_DURATION)
                    .setLocal("ar")
                    .setMinDuration(getEdtValueLong(edtMinGap))
                    .start(this, videoTrimResultLauncher);
        } else {
            TrimVideo.activity(data)
                    .setTrimType(TrimType.MIN_MAX_DURATION)
                    .setLocal("ar")
                    .setMinToMax(getEdtValueLong(edtMinFrom), getEdtValueLong(edtMAxTo))
                    .start(this, videoTrimResultLauncher);
        }
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.btn_default_trim:
                onDefaultTrimClicked();
                break;
            case R.id.btn_fixed_gap:
                onFixedTrimClicked();
                break;
            case R.id.btn_min_gap:
                onMinGapTrimClicked();
                break;
            case R.id.btn_min_max_gap:
                onMinToMaxTrimClicked();
                break;
        }
    }

    private void onDefaultTrimClicked() {
        trimType = 0;
        if (checkCamStoragePer()) {
            Log.v("TAGG", "STOPPED ACTION HERE 1");
            LogMessage.v("Video path:: " + path_Extra);
            openTrimActivity(String.valueOf(path_Extra));
        } else {
            Log.v("TAGG", "STOPPED ACTION REQ Permissions calling");
            ActivityCompat.requestPermissions(TrimmerMainActivity.this,
                    permissions(),
                    1);
        }
        //showVideoOptions();
    }

    private void onFixedTrimClicked() {
        trimType = 1;
        if (isEdtTxtEmpty(edtFixedGap))
            Toast.makeText(this, "Enter fixed gap duration", Toast.LENGTH_SHORT).show();
        else if (checkCamStoragePer()){
            Log.v("TAGG","STOPPED ACTION HERE 2");

        }
        //showVideoOptions();
    }

    private void onMinGapTrimClicked() {
        trimType = 2;
        if (isEdtTxtEmpty(edtMinGap))
            Toast.makeText(this, "Enter min gap duration", Toast.LENGTH_SHORT).show();
        else if (checkCamStoragePer()){
            Log.v("TAGG","STOPPED ACTION HERE 3");

        }
        //showVideoOptions();
    }


    private void onMinToMaxTrimClicked() {
        trimType = 3;
        if (isEdtTxtEmpty(edtMinFrom))
            Toast.makeText(this, "Enter min gap duration", Toast.LENGTH_SHORT).show();
        else if (isEdtTxtEmpty(edtMAxTo))
            Toast.makeText(this, "Enter max gap duration", Toast.LENGTH_SHORT).show();
        else if (checkCamStoragePer()){
            Log.d("TAGG","STOPPED VIDEO OPTIONS 4");
        }
        // showVideoOptions();
    }

//    public void showVideoOptions() {
//        try {
//            BottomSheet.Builder builder = getBottomSheet();
//            builder.sheet(R.menu.menu_video);
//            builder.listener(item -> {
//                if (R.id.action_take == item.getItemId())
//                    captureVideo();
//                else
//                    openVideo();
//                return false;
//            });
//            builder.show();
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//    }

//    public BottomSheet.Builder getBottomSheet() {
//        return new BottomSheet.Builder(this).title(R.string.txt_option);
//    }

    public void captureVideo() {
        try {
            Intent intent = new Intent("android.media.action.VIDEO_CAPTURE");
            intent.putExtra("android.intent.extra.durationLimit", 60);
            takeOrSelectVideoResultLauncher.launch(intent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void openVideo() {
        try {
            Intent intent = new Intent();
            intent.setType("video/*");
            intent.setAction(Intent.ACTION_GET_CONTENT);
            //intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
            intent.putExtra("android.intent.extra.durationLimit", 1200);
            takeOrSelectVideoResultLauncher.launch(Intent.createChooser(intent, "Select Video"));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (isPermissionOk(grantResults)){
            Log.v("TAGG","STOPPED ACTION ONREQUESTPERMISSIONSRESULT");
            openTrimActivity(String.valueOf(path_Extra));
        }else{
            Toast.makeText(this, "Permission Denied", Toast.LENGTH_SHORT).show();
            finish();
        }
        // showVideoOptions();
    }

    private boolean isEdtTxtEmpty(EditText editText) {
        return editText.getText().toString().trim().isEmpty();
    }

    private long getEdtValueLong(EditText editText) {
        return Long.parseLong(editText.getText().toString().trim());
    }

    private boolean checkCamStoragePer() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return checkPermission(Manifest.permission.READ_MEDIA_VIDEO,Manifest.permission.READ_MEDIA_IMAGES, Manifest.permission.CAMERA);
        } else {
            return checkPermission(Manifest.permission.READ_EXTERNAL_STORAGE, Manifest.permission.CAMERA);
        }
    }

    private boolean checkPermission(String... permissions) {
        boolean allPermitted = false;
        for (String permission : permissions) {
            allPermitted = (ContextCompat.checkSelfPermission(this, permission)
                    == PackageManager.PERMISSION_GRANTED);
            if (!allPermitted)
                break;
        }
        if (allPermitted)
            return true;
        ActivityCompat.requestPermissions(this, permissions,
                220);
        return false;
    }

    private boolean isPermissionOk(int... results) {
        boolean isAllGranted = true;
        for (int result : results) {
            if (PackageManager.PERMISSION_GRANTED != result) {
                isAllGranted = false;
                break;
            }
        }
        return isAllGranted;
    }
}