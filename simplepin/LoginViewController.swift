//
//  LoginViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 30.03.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit
import SafariServices

class LoginModalViewController: UIViewController {
    var fetchApiTokenTask: NSURLSessionTask?
    let defaults = NSUserDefaults.standardUserDefaults()

    @IBOutlet var usernameField: UITextField!
    @IBOutlet var passwordField: UITextField!
    @IBOutlet var loginButton: UIButton!
    @IBOutlet var spinner: UIActivityIndicatorView!

    @IBAction func loginButtonPressed(sender: AnyObject) {
        spinner.startAnimating()
        loginButton.enabled = false

        guard let password = passwordField.text,
            let username = usernameField.text else {
                return
        }

        if password.isEmpty || username.isEmpty {
            spinner.stopAnimating()
            loginButton.enabled = true
            self.alertError("Please enter your username and password")
            return
        }

        fetchApiTokenTask = Network.fetchApiToken(username, password) { userToken in
            if let token = userToken {
                self.defaults.setObject(username+":"+token, forKey: "userToken")
                self.defaults.setObject(username, forKey: "userName")
                self.performSegueWithIdentifier("closeLoginModal", sender: nil)
            } else {
                self.spinner.stopAnimating()
                self.loginButton.enabled = true
                self.alertError("Incorrect username or password")
                return
            }
        }
    }

    @IBAction func forgotPasswordButtonPressed(sender: AnyObject) {
        let url = NSURL(string: "https://m.pinboard.in/password_reset/")
        let vc = SFSafariViewController(URL: url!, entersReaderIfAvailable: true)
        presentViewController(vc, animated: true, completion: nil)
    }


    override func viewDidLoad() {
        super.viewDidLoad()
    }

}
