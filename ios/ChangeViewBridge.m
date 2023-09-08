//
//  ChangeViewBridge.m
//  Wearables
//
//  Created by Vinay Pandravada on 22/05/23.
//

#import "ChangeViewBridge.h"
#import "AppDelegate.h"
#import "Wearables-Swift.h"

@implementation ChangeViewBridge

RCT_EXPORT_MODULE(ChangeViewBridge);

RCT_EXPORT_METHOD(changeToNativeView: (NSArray *)urls callback:(RCTResponseSenderBlock)callbackrn) {
  NSLog(@"RN binding - Native View - Loading MyViewController.swift %@", urls);
  dispatch_async(dispatch_get_main_queue(), ^{
    AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
    //[appDelegate goToNativeView: url argTypes: callbackrn];
    //[appDelegate goToNativeView: urls argTypes: callbackrn];
    UIStoryboard * storyBoard = [UIStoryboard storyboardWithName:@"Main" bundle:nil];
    VideoMainViewController * vc = (VideoMainViewController *)[storyBoard instantiateViewControllerWithIdentifier:@"VTC"] ;
    
    vc.inputUrls = urls;
    vc.callBack  = callbackrn;
    UIWindow *window = [UIApplication sharedApplication].keyWindow;
    dispatch_async(dispatch_get_main_queue(), ^{
    [window.rootViewController presentViewController:vc animated:true completion:nil];

    });
    
    
    
  });
  
  
  
 // RCT_EXPORT_VIEW_PROPERTY(onBarCodeCaptured, RCTDirectEventBlock);
  
}
@end
