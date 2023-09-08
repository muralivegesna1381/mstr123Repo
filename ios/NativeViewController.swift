//
//  NativeViewController.swift
//  Wearables
//
//  Created by Vinay Pandravada on 22/05/23.
//

import UIKit

@objc(NativeViewController)
class NativeViewController: UIViewController {
  
  @IBOutlet var okOutlet: UIButton!
  @IBAction func okAction(sender: UIButton){
    if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
      appDelegate.triggerCallback("facebook.com")
        }
  }

  @objc var callback: RCTResponseSenderBlock?
    override func viewDidLoad() {
        super.viewDidLoad()
      
      print("MyViewController loaded...")

        // Do any additional setup after loading the view.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destination.
        // Pass the selected object to the new view controller.
    }
    */

}

