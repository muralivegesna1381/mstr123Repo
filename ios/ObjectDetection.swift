//Created by nravva on 07/11/23.
//This File acting as briding for object detection using MLKit

import Foundation
import CommonCrypto

import MLImage
import MLKit
import UIKit


@objc(ObjectDetection)
class ObjectDetection: NSObject {
  
  var newCallBack: RCTResponseSenderBlock? = nil;
  
  @objc(imageObjectDetection:callback:)
  func imageObjectDetection(_ imageAsBase64: String, callback: @escaping RCTResponseSenderBlock) {
    newCallBack = callback;
    let imgData = convertBase64ToImage(base64String: imageAsBase64)
    
    let image = VisionImage(image: imgData)
    let labeler = ImageLabeler.imageLabeler(options: ImageLabelerOptions())
    labeler.process(image) { labels, error in
      guard error == nil, let labels = labels else { return }
      let finalResult =  self.getLabelText(labelsData: labels)
    }
   
    
    
  }
  
  func convertBase64ToImage(base64String: String) -> UIImage {
    let decodedData = NSData(base64Encoded: base64String, options: NSData.Base64DecodingOptions(rawValue: 0) )
    var decodedimage = UIImage(data: decodedData! as Data)
      return decodedimage!

  }
  
  func getLabelText (labelsData :[ImageLabel]) -> Bool{
    var objectDataMatched = false;
    var catConfidenceVal:Float = 0;
    var toyConfidenceVal:Float = 0;
    
    for label in labelsData {
      if(label.text.contains("Toy") && label.confidence>0.85){
        toyConfidenceVal = label.confidence
        objectDataMatched = false;
      }
      if(label.text.contains("Cat") && label.confidence>0.85){
        catConfidenceVal = label.confidence
        objectDataMatched = false;
      }
      if(label.text.contains("Dog")){
        if(label.confidence>0.95){
          objectDataMatched = true;
        }
        else if(catConfidenceVal>0.95){
          objectDataMatched = false;
        }
        else if(catConfidenceVal>0.85 && label.confidence<0.75){
          objectDataMatched = false;
        }
        else if(toyConfidenceVal>0.85 && label.confidence<0.75){
          objectDataMatched = false;
        }
        else if(label.confidence>0.60){
          objectDataMatched = true;
        }
      }
      
    }

    newCallBack!([objectDataMatched])
    return objectDataMatched;
  }
  
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
