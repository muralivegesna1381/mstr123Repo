package com.wearables;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import zendesk.android.Zendesk;
import zendesk.messaging.android.DefaultMessagingFactory;

public class ZendeskLaunchActivity extends AppCompatActivity {
    /*
    * This activity contains Zendesk initialize method in which Context, channel key are to be passed
    * if initialization is successful message window is initialized and launched from here
    * In case of any error we are just printing it to see what error we had while launching the messaging window
    * */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Zendesk.initialize(
                this,
                getResources().getString(R.string.zendesk_channel_key),
                zendesk -> Zendesk.getInstance().getMessaging().showMessaging(ZendeskLaunchActivity.this),
                error -> {},
                new DefaultMessagingFactory());
        finish();



    }
}