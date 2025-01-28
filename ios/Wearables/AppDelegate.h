//#import <RCTAppDelegate.h>
#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UNUserNotificationCenter.h>
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

//@interface AppDelegate : RCTAppDelegate
//
//@end
@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate,UNUserNotificationCenterDelegate>{
  RCTResponseSenderBlock callbackRN;
}

@property (nonatomic, strong) UIWindow *window;

- (void) triggerCallback: (NSString *) url;
- (void) goToNativeView:(NSString *)url argTypes:(RCTResponseSenderBlock)callback ;

@end

