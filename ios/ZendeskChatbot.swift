
//  Created by Vinay Pandravada.


import Foundation
import CommonCrypto
import ZendeskSDKMessaging
import ZendeskSDK
import UIKit


@objc(ZendeskChatbot)
class ZendeskChatbot: UIViewController, UNUserNotificationCenterDelegate {
  /*
      * This class contains Zendesk initialize method in which Default messaging object and channel key are to be passed
      * if initialization is successful message window is initialized and launched from here
      * In case of any error we are just printing it to see what error we had while launching the messaging window
      * In logOutFromZendeskMessagingWindow, In messaging window User will be logged out
   */
  
  @objc(launchZendeskMessagingWindow:callback:)
  func launchZendeskMessagingWindow(_ input: String, callback: RCTResponseSenderBlock) {
    //Secured key is being obtained from info plist file 
    let keyZen = Bundle.main.object(forInfoDictionaryKey: "ZendeskChannelID") as! String
    Zendesk.initialize(withChannelKey: keyZen,
                       messagingFactory: DefaultMessagingFactory()) { result in
      if case .failure(_) = result {
      }
      else{
        
        DispatchQueue.main.async {
          
          guard let viewController = Zendesk.instance?.messaging?.messagingViewController() else { return }
          let appDelegate = UIApplication.shared.delegate as! AppDelegate
          viewController.modalPresentationStyle = .fullScreen
          appDelegate.window.rootViewController?.present(viewController, animated: true)
        }
        
      }
    }
    
    callback(["launchZendeskMessagingWindow"])
  }
  
  @objc(logOutFromZendeskMessagingWindow:callback:)
  func logOutFromZendeskMessagingWindow(_ input: String, callback: RCTResponseSenderBlock) {
    //Secured key is being obtained from info plist file 
    let keyZen = Bundle.main.object(forInfoDictionaryKey: "ZendeskChannelID") as! String
    Zendesk.initialize(withChannelKey: keyZen,
                       messagingFactory: DefaultMessagingFactory()) { result in
      if case let .failure(error) = result {
        //Failed to logiut from Zendesk ususally does not happen
      }
      else{
         //Calling Zendesk instace to log the User out from here
        Zendesk.instance?.logoutUser { result in
          switch result {
          case .success:
            break
          case .failure(let error):
           break
          }
        }
      }
      
    }
    
    
    callback(["Zendesk logged out"])
  }
  
  
  func requiresMainQueueSetup() -> Bool {
    return true
  }
}
