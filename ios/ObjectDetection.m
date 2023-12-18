
//Created by nravva on 07/11/23.
//This File acting as briding for object detection uisng MLKit

#import "React/RCTBridgeModule.h"


@interface RCT_EXTERN_MODULE(ObjectDetection, NSObject)
RCT_EXTERN_METHOD(imageObjectDetection: (NSString *)imageAsBase64 callback:(RCTResponseSenderBlock)callback )
@end
