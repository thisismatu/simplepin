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
    var tokenLogin = false
    let defaults = NSUserDefaults.standardUserDefaults()
    let notifications = NSNotificationCenter.defaultCenter()

    @IBOutlet var usernameField: UITextField!
    @IBOutlet var passwordField: UITextField!
    @IBOutlet var loginButton: UIButton!
    @IBOutlet var spinner: UIActivityIndicatorView!
    @IBOutlet var stackBottomConstraint: NSLayoutConstraint!
    @IBOutlet var forgotPasswordButton: UIButton!
    @IBOutlet var loginMethodSegment: UISegmentedControl!

    @IBAction func loginButtonPressed(sender: AnyObject?) {
        loginButton.enabled = false

        guard let password = passwordField.text,
            let username = usernameField.text else {
                return
        }

        if password.isEmpty || username.isEmpty {
            loginButton.enabled = true
            let title = "Please Enter Your Username and \(tokenLogin == false ? "Password" : "API Key")"
            self.alertError(title, message: nil)
            return
        }

        spinner.alpha = CGFloat(1.0)
        spinner.startAnimating()
        fetchApiTokenTask = Network.fetchApiToken(username, password, loginWithToken: tokenLogin) { userToken in
            if let token = userToken {
                self.defaults.setObject(username+":"+token, forKey: "userToken")
                self.defaults.setObject(username, forKey: "userName")
                self.dismissViewControllerAnimated(true, completion: nil)
                NSNotificationCenter.defaultCenter().postNotificationName("loginSuccessful", object: nil)
                Answers.logLoginWithMethod("Username and Password", success: true, customAttributes: [:])
            } else {
                self.spinner.alpha = CGFloat(0.0)
                self.spinner.stopAnimating()
                self.loginButton.enabled = true
                let title = "Incorrect Username or \(self.tokenLogin == false ? "Password" : "API Key")"
                self.alertErrorWithReachability(title, message: nil)
                return
            }
        }
    }

    @IBAction func forgotPasswordButtonPressed(sender: AnyObject) {
        let urlString = self.tokenLogin == false ? "https://m.pinboard.in/password_reset/" : "https://m.pinboard.in/settings/password"
        let url = NSURL(string: urlString)
        let vc = SFSafariViewController(URL: url!, entersReaderIfAvailable: true)
        presentViewController(vc, animated: true, completion: nil)
    }

    @IBAction func loginMethodSegmentPressed(sender: AnyObject) {
        passwordField.text = ""

        switch loginMethodSegment.selectedSegmentIndex {
        case 0:
            tokenLogin = false
            forgotPasswordButton.setTitle("I Forgot My Password", forState: .Normal)
            passwordField.placeholder = "Password"
        case 1:
            tokenLogin = true
            forgotPasswordButton.setTitle("Show API Token", forState: .Normal)
            passwordField.placeholder = "API Token"
        default:
            break
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        usernameField.delegate = self
        passwordField.delegate = self
        notifications.addObserver(self, selector: #selector(LoginModalViewController.keyboardWillShow(_:)), name: UIKeyboardWillShowNotification, object: nil)
        notifications.addObserver(self, selector: #selector(LoginModalViewController.keyboardWillHide(_:)), name: UIKeyboardWillHideNotification, object: nil)
        notifications.addObserverForName("handleRequestError", object: nil, queue: nil, usingBlock: handleRequestError)
    }

    override func viewWillDisappear(animated: Bool) {
        NSNotificationCenter.defaultCenter().removeObserver(self, name: UIKeyboardWillShowNotification, object: nil)
        NSNotificationCenter.defaultCenter().removeObserver(self, name: UIKeyboardWillHideNotification, object: nil)
    }

    override func touchesBegan(touches: Set<UITouch>, withEvent event: UIEvent?) {
        usernameField.resignFirstResponder()
        passwordField.resignFirstResponder()
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

    func handleRequestError(notification: NSNotification) {
        if let info = notification.userInfo as? Dictionary<String, String> {
            guard let title = info["title"],
                let message = info["message"] else {
                    return
            }
            alertError(title, message: message)
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