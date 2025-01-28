#import "AppDelegate.h"
#import <React/RCTBridge.h>
#import <React/RCTRootView.h>
#import <React/RCTBundleURLProvider.h>
#import "RNSplashScreen.h"
#import <Firebase.h>
//#ifdef FB_SONARKIT_ENABLED
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>


@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
//  self.moduleName = @"Wearables";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"Wearables"
                                            initialProperties:nil];
  if (@available(iOS 13.0, *)) {
      rootView.backgroundColor = [UIColor systemBackgroundColor];
  } else {
      rootView.backgroundColor = [UIColor whiteColor];
  }
  //self.initialProps = @{};
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  [FIRApp configure];
  [application registerForRemoteNotifications];
  [RNSplashScreen show];
  
  return YES;
}

// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
 [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
  [FIRMessaging messaging].APNSToken = deviceToken;
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
  
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
// [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for localNotification event
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
//  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
}

//Called when a notification is delivered to a foreground app.
-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (void) triggerCallback: (NSString *)url {
  
  NSLog(@"RN binding - Native View - NATIVE TRIGGER CALLBACK %@", url);
  NSString * eventId = url;
   callbackRN(@[(eventId)]);
  [self.window.rootViewController dismissViewControllerAnimated:TRUE completion:nil];
}

- (void) goToNativeView: (NSString *)url argTypes:(RCTResponseSenderBlock)callback {
  
  NSLog(@"RN binding - Native View - Loading goToNativeView %@", url);
  
  callbackRN = callback;
  
//  NSInteger eventId = 12333;
//   callback(@[@(eventId)]);

  UIStoryboard * storyBoard = [UIStoryboard storyboardWithName:@"Main" bundle:nil];
  
  UIViewController *vc = [storyBoard instantiateViewControllerWithIdentifier:@"VTC"] ;
 // vc.callback = callback;
  
  dispatch_async(dispatch_get_main_queue(), ^{
      [self.window.rootViewController presentViewController:vc animated:true completion:nil];
  });
  
}

@end
