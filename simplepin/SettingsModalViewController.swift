//
//  settingsModalViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 14.3.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit

class SettingsModalViewController: UITableViewController {
    let defaults = NSUserDefaults.standardUserDefaults()

    @IBOutlet var usernameTextField: UITextField!
    @IBOutlet var passwordTextField: UITextField!

    @IBAction func loginButtonPressed(sender: AnyObject) {
        defaults.setObject(usernameTextField.text, forKey: "userName")
        defaults.setObject(passwordTextField.text, forKey: "apiToken")
    }

    override func viewDidLoad() {
        if let apiToken = defaults.stringForKey("apiToken") {
            usernameTextField.text = defaults.stringForKey("userName")! as String
            passwordTextField.text = defaults.stringForKey("apiToken")! as String
        }
    }
}
