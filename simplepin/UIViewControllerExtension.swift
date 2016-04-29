//
//  UIViewControllerExtension.swift
//  simplepin
//
//  Created by Mathias Lindholm on 8.4.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit

extension UIViewController {

    func alertError(title: String, message: String?) {
        let alert = UIAlertController(title: title, message: message?.sentencecaseString, preferredStyle: UIAlertControllerStyle.Alert)
        alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.Cancel, handler: nil))
        self.presentViewController(alert, animated: true, completion: nil)
    }

    func alertErrorWithReachability(title: String, message: String?) {
        var alert = UIAlertController(title: title, message: message?.sentencecaseString, preferredStyle: UIAlertControllerStyle.Alert)
        if Reachability.isConnectedToNetwork() == false {
            alert = UIAlertController(title: "No Internet Connection", message: "Try again later when you're back online.", preferredStyle: UIAlertControllerStyle.Alert)
        }
        alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.Cancel, handler: nil))
        self.presentViewController(alert, animated: true, completion: nil)
    }

}