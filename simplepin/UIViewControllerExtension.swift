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
        alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.Default, handler: nil))
        self.presentViewController(alert, animated: true, completion: nil)
    }
    
}