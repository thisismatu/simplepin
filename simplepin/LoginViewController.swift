//
//  LoginViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 30.03.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit
import Fabric
import Crashlytics
import SafariServices

class LoginModalViewController: UIViewController {
    var fetchApiTokenTask: NSURLSessionTask?
    let defaults = NSUserDefaults.standardUserDefaults()
    let notifications = NSNotificationCenter.defaultCenter()

    @IBOutlet var usernameField: UITextField!
    @IBOutlet var passwordField: UITextField!
    @IBOutlet var loginButton: UIButton!
    @IBOutlet var spinner: UIActivityIndicatorView!
    @IBOutlet var stackBottomConstraint: NSLayoutConstraint!

    @IBAction func loginButtonPressed(sender: AnyObject?) {
        loginButton.enabled = false

        guard let password = passwordField.text,
            let username = usernameField.text else {
                return
        }

        if password.isEmpty || username.isEmpty {
            loginButton.enabled = true
            self.alertError("Please enter your username and password", message: nil)
            return
        }
        spinner.alpha = CGFloat(1.0)
        spinner.startAnimating()
        fetchApiTokenTask = Network.fetchApiToken(username, password) { userToken in
            if let token = userToken {
                self.defaults.setObject(username+":"+token, forKey: "userToken")
                self.defaults.setObject(username, forKey: "userName")
                self.defaults.setObject(false, forKey: "privateByDefault")
                self.defaults.setObject(false, forKey: "markAsRead")
                self.dismissViewControllerAnimated(true, completion: nil)
                NSNotificationCenter.defaultCenter().postNotificationName("loginSuccessful", object: nil)
                Answers.logLoginWithMethod("Username and Password", success: true, customAttributes: [:])
            } else {
                self.spinner.alpha = CGFloat(0.0)
                self.spinner.stopAnimating()
                self.loginButton.enabled = true
                self.alertErrorWithReachability("Incorrect Username or Password", message: nil)
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
        usernameField.delegate = self
        passwordField.delegate = self
        notifications.addObserver(self, selector: #selector(LoginModalViewController.keyboardWillShow(_:)), name: UIKeyboardWillShowNotification, object: nil)
        notifications.addObserver(self, selector: #selector(LoginModalViewController.keyboardWillHide(_:)), name: UIKeyboardWillHideNotification, object: nil)
    }

    override func viewWillDisappear(animated: Bool) {
        NSNotificationCenter.defaultCenter().removeObserver(self, name: UIKeyboardWillShowNotification, object: nil)
        NSNotificationCenter.defaultCenter().removeObserver(self, name: UIKeyboardWillHideNotification, object: nil)
    }

    func keyboardWillShow(notification: NSNotification) {
        self.stackBottomConstraint.constant = 176
        UIView.animateWithDuration(0.1) {
            self.view.layoutSubviews()
        }
    }

    func keyboardWillHide(notification: NSNotification) {
        stackBottomConstraint.constant = 16
        UIView.animateWithDuration(0.1) {
            self.view.layoutSubviews()
        }
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