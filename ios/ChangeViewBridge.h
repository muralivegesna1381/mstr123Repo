//
//  ChangeViewBridge.h
//  Wearables
//
//  Created by Vinay Pandravada on 22/05/23.
//

#import <React/RCTBridgeModule.h>
#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface ChangeViewBridge : NSObject <RCTBridgeModule>
- (void) changeToNativeView;
@end

NS_ASSUME_NONNULL_END
