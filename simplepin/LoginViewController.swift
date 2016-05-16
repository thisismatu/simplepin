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

    @IBAction func loginButtonPressed(sender: AnyObject?) {
        loginButton.enabled = false

        guard let password = passwordField.text,
            let username = usernameField.text else {
                return
        }

        if Reachability.isConnectedToNetwork() == false {
            alertError("Couldn't Log in", message: "Try again when you're back online.")
            loginButton.enabled = true
        } else {
            if password.isEmpty || username.isEmpty {
                loginButton.enabled = true
                self.alertError("Please enter your username and password", message: nil)
                return
            }
            spinner.startAnimating()
            fetchApiTokenTask = Network.fetchApiToken(username, password) { userToken in
                if let token = userToken {
                    self.defaults.setObject(username+":"+token, forKey: "userToken")
                    self.defaults.setObject(username, forKey: "userName")
                    self.defaults.setObject(false, forKey: "privateByDefault")
                    self.defaults.setObject(false, forKey: "markAsRead")
                    NSNotificationCenter.defaultCenter().postNotificationName("loginSuccessful", object: nil)
                    self.dismissViewControllerAnimated(true, completion: nil)
                } else {
                    self.spinner.stopAnimating()
                    self.loginButton.enabled = true
                    self.alertError("Incorrect Username or Password", message: nil)
                    return
                }
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
        usernameField.delegate = self
        passwordField.delegate = self
    }
}

// MARK: - UITextFieldDelegate
extension LoginModalViewController: UITextFieldDelegate {
    func textFieldShouldReturn(textField: UITextField) -> Bool {
        if textField == usernameField {
            passwordField.becomeFirstResponder()
        } else if textField == passwordField {
            loginButtonPressed(nil)
        }
        return true
    }
}