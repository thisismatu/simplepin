//
//  settingsModalViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 14.3.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit

class SettingsModalViewController: UITableViewController {
    var fetchApiTokenTask: NSURLSessionTask?
    let defaults = NSUserDefaults.standardUserDefaults()

    @IBOutlet var usernameLabel: UILabel!
    @IBOutlet var usernameTextField: UITextField!
    @IBOutlet var passwordTextField: UITextField!
    @IBOutlet var passwordCell: UITableViewCell!
    @IBOutlet var loginButton: UIButton!
    @IBOutlet var loginSpinner: UIActivityIndicatorView!

    @IBAction func loginButtonPressed(sender: AnyObject) {
        loginSpinner.startAnimating()
        loginButton.enabled = false

        guard let password = passwordTextField.text,
            let username = usernameTextField.text else {
                return
        }

        if password.isEmpty || username.isEmpty {
            loginSpinner.stopAnimating()
            loginButton.enabled = true
            let alert = UIAlertController(title: "Please enter your username and password", message: nil, preferredStyle: UIAlertControllerStyle.Alert)
            alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.Default, handler: nil))
            self.presentViewController(alert, animated: true, completion: nil)
            return
        }

        fetchApiTokenTask = Network.fetchApiToken(username, password) { userToken in
            if let token = userToken {
                self.defaults.setObject(username+":"+token, forKey: "userToken")
                self.defaults.setObject(username, forKey: "userName")
                self.performSegueWithIdentifier("closeSettings", sender: self)
            } else {
                self.loginSpinner.stopAnimating()
                self.loginButton.enabled = true
                let alert = UIAlertController(title: "Incorrect username or password", message: "Please check your login credentials and try again.", preferredStyle: UIAlertControllerStyle.Alert)
                alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.Default, handler: nil))
                self.presentViewController(alert, animated: true, completion: nil)
            }
        }

    }

    override func viewDidLoad() {
        super.viewDidLoad()
        if defaults.stringForKey("userToken") != nil {
            usernameLabel.text = "Logged in as"
            usernameTextField.text = defaults.stringForKey("userName")! as String
            usernameTextField.enabled = false
            passwordCell.hidden = true
            loginButton.setTitle("Log out", forState: UIControlState.Normal)
            loginButton.setTitleColor(UIColor.redColor(), forState: UIControlState.Normal)
        }
    }
}