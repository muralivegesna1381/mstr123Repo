package com.wearables;


import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class PasswordPackage implements ReactPackage {

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(
            ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        //We import the module file here
        modules.add(new com.passwordenvryption.PasswordEncryption(reactContext));
        modules.add(new com.wearables.VideoCompression(reactContext));
       // modules.add(new ChatbotBridgingManager(reactContext));
        modules.add(new com.wearables.QuestionnaireMediaCompression(reactContext));
        modules.add(new K4lVideoTrimmerModule(reactContext));
        modules.add(new ZendeskChatModule(reactContext));
        modules.add(new ImageBlueIdentification(reactContext));
        modules.add(new ImageObjectDetection(reactContext));
        return modules;
    }

    // Backward compatibility
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return new ArrayList<>();
    }
}