import React, { useEffect, useState } from 'react';
import { View, Alert, StatusBar, Platform, Text, TextInput} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './src/navigation/appNavigator';
import * as DataStorageLocal from "./src/utils/storage/dataStorageLocal";
import * as Constant from "./src/utils/constants/constant";
import * as Apolloclient from './src/config/apollo/apolloConfig';
import TimerWidgetComponent from './src/components/timerComponent/timerWidget/timerWidgetComponent';
import messaging from '@react-native-firebase/messaging';
import PushNotification, { Importance } from 'react-native-push-notification';
import QuestionnaireMediaUpload from './src/utils/questionnaireMediaUpload/questionnaireMediaUpload';
import ImageBackgrounUpload from './src/utils/mediaProcessingComponents/imageBackgroundUpload/imageBackgroundUpload';
import VideoBackgroundUpload from './src/utils/mediaProcessingComponents/videoBackgroundUpload/videoBackgroundUpload';
import CaptureBFIUpload from './src/bfiComponents/captureImages/imageCapture/captureBFIUpload';
import auth from '@react-native-firebase/auth';
import { firebase } from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import { ApolloProvider } from '@apollo/react-hooks';

const Stack = createNativeStackNavigator();

function App() {

  useEffect(() => {

    checkPermission();
    onAppBootstrap();
    messageListener();
    enableFirebaseFeatures();
    saveDefaultChatbotMessage();
  
    if (Platform.OS === 'android') {
      crateChannelPushNotifications();;
    }
  
    if (Text.defaultProps == null) {
      Text.defaultProps = {};    Text.defaultProps.allowFontScaling = false;
    }
    if (TextInput.defaultProps == null) {
        TextInput.defaultProps = {};
        TextInput.defaultProps.allowFontScaling = false;
    }

    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      // updateNotificationFlow();
      // Handle background notification if needed
    });
 
    // // Check if the app was opened from a notification (cold start)
    // messaging()
    //   .getInitialNotification()
    //   .then(remoteMessage => {
    //     if (remoteMessage) {
    //     }
    //   });
 
    return unsubscribeBackground; // Clean up the listener
  
  }, []);
  
  async function enableFirebaseFeatures() {
    await firebase.analytics().setAnalyticsCollectionEnabled(true);
    await crashlytics().setCrashlyticsCollectionEnabled(true)
    await firebase.perf().setPerformanceCollectionEnabled(true);
  }
  
  async function onAppBootstrap() {
  
    auth().signInAnonymously().then(() => {}).catch(error => {})
  
  };
  
  const checkPermission = async () => {
  
    const enabled = await messaging().hasPermission();
    getFcmToken();
    if (enabled === 1) {
      getFcmToken();
    } else {
      requestPermission();
    }
  
    let camPermissions = await DataStorageLocal.getDataFromAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED);
    if (!camPermissions) {
      await DataStorageLocal.saveDataToAsync(Constant.IOS_CAMERA_PERMISSIONS_GRANTED, 'isFirstTime');
    }
    let blePermissions = await DataStorageLocal.getDataFromAsync(Constant.IOS_BLE_PERMISSIONS_GRANTED);
    if (!blePermissions) {
      await DataStorageLocal.saveDataToAsync(Constant.IOS_BLE_PERMISSIONS_GRANTED, 'isFirstTime');
    }
  };
  
  const crateChannelPushNotifications = () => {
  
    PushNotification.createChannel(
      {
        channelId: "Wearables_Mobile_Android", // (required)
        channelName: "Wearables_Android_Channel", // (required)
        channelDescription: "Local Notifications", // (optional) default: undefined.
        playSound: false, // (optional) default: true
        soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
        importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
        vibrate: false, // (optional) default: true. Creates the default vibration pattern if true.
      },
      (created) => { } // (optional) callback returns whether the channel was created, false means it already existed.
    );
  
  }
  
  const getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
  }
  
  const saveDefaultChatbotMessage = () => {
    let tempArray = [
      {
        id: "12345",
        text: "Hey! I am your virtual assistant. How may I help you?",
        timeStamp: new Date(),
        type: "agentMessage"
      },
    ]
  
    if (Platform.OS === 'ios') {
      saveChatMessages(tempArray);
    }
  }
  const saveChatMessages = async (msgArray) => {
    await DataStorageLocal.saveDataToAsync(Constant.ZDCHAT_MESSAGES_ARRAY, JSON.stringify(msgArray))
    saveDefaultDateSetValue("chatEnded");
  }
  
  const saveDefaultDateSetValue = async (value) => {
    await DataStorageLocal.saveDataToAsync(Constant.ZDCHAT_DEFAULT_DATE_SET_VALUE, value.toString())
  
  };
  
  const requestPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled;
    // if (enabled) {
  
    // }
  };
  
  const messageListener = async () => {
    
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      const { title, body } = remoteMessage.notification;
      Alert.alert(title, body);
    });
    messaging().onMessage(async remoteMessage => {
      const { title, body } = remoteMessage.notification;
      Alert.alert(title, body);
    });
    messaging().onNotificationOpenedApp(remoteMessage => {
      //remoteMessage.notification
    });
  };

  const updateNotificationFlow = async () => {
    await DataStorageLocal.saveDataToAsync(Constant.IS_FROM_NOTIFICATION, JSON.stringify(true)); 
  }

  return (
    <ApolloProvider client={Apolloclient.client}>
      <StatusBar translucent={true} />
      <View style={{ flex: 1 }}>
        <AppNavigator style={{ flex: 1 }} />
        <TimerWidgetComponent /> 
        <VideoBackgroundUpload />
        <QuestionnaireMediaUpload /> 
        <ImageBackgrounUpload />
         <CaptureBFIUpload /> 
      </View>
    </ApolloProvider>
  );
}

export default App;