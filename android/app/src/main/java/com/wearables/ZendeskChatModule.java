package com.wearables;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import kotlin.Unit;
import zendesk.android.FailureCallback;
import zendesk.android.SuccessCallback;
import zendesk.android.Zendesk;
import zendesk.messaging.android.DefaultMessagingFactory;

public class ZendeskChatModule extends ReactContextBaseJavaModule {

    public static final String NAME = "ZendeskChatModule";

    private Context mActivity = null;

//    public CustomReactPackage(Activity activity) {
//        mActivity = activity;
//    }
    /*
    * This module is created to expose methods to React code base. This module exposes two methods
    * launchZendeskChatWindow for launching Zendesk Chatbot from the Native modules
    * logOutFromZendeskWindow for logging the User out which is used when User needs to be logged out
    * */

    public ZendeskChatModule(ReactApplicationContext reactContext) {
        mActivity = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    void launchZendeskChatWindow(String pass, Callback cb) {
        //This method is called from Native Code base to initiate the Zendesk chatting activity
        Intent zendeskIntent = new Intent(mActivity, ZendeskLaunchActivity.class);
        zendeskIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        mActivity.startActivity(zendeskIntent);
        cb.invoke("initialized");

    }

    @ReactMethod
    void logOutFromZendeskWindow(String pass, Callback cb) {
        //This method is called from Native Code base to log User out from the Zendesk chatting activity
        Zendesk.initialize(
                mActivity,
                mActivity.getResources().getString(R.string.zendesk_channel_key),
                zendesk -> {
                    Zendesk.getInstance().logoutUser(value -> {
                    }, error -> {
                    });
                },
                error -> {},
                new DefaultMessagingFactory());

    }

}
