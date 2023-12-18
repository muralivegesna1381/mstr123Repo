
//  Created by Vinay Pandravada on 12/18/19.

/*
   * This module is created to expose methods to React code base. This module exposes two methods
   * launchZendeskMessagingWindow for launching Zendesk Chatbot from the Native modules
   * logOutFromZendeskMessagingWindow for logging the User out which is used when User needs to be logged out
   *
 */ 

#import "React/RCTBridgeModule.h"
@interface RCT_EXTERN_MODULE(ZendeskChatbot, NSObject)
RCT_EXTERN_METHOD(launchZendeskMessagingWindow: (NSString *)input callback:(RCTResponseSenderBlock)callback )
RCT_EXTERN_METHOD(logOutFromZendeskMessagingWindow: (NSString *)input callback:(RCTResponseSenderBlock)callback )

@end
