//
//  LoginViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 30.03.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit

class LoginModalViewController: UIViewController {
    var fetchApiTokenTask: NSURLSessionTask?
    let defaults = NSUserDefaults.standardUserDefaults()

    @IBOutlet var username: UITextField!
    @IBOutlet var password: UITextField!
    @IBOutlet var button: UIButton!
    @IBOutlet var spinner: UIActivityIndicatorView!

    @IBAction func buttonPressed(sender: AnyObject) {
        spinner.startAnimating()
        button.enabled = false

        guard let password = password.text,
            let username = username.text else {
                return
        }

        if password.isEmpty || username.isEmpty {
            spinner.stopAnimating()
            button.enabled = true

            let alert = UIAlertController(title: "Please enter your username and password", message: nil, preferredStyle: UIAlertControllerStyle.Alert)
            alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.Default, handler: nil))
            self.presentViewController(alert, animated: true, completion: nil)

            return
        }

        fetchApiTokenTask = Network.fetchApiToken(username, password) { userToken in
            if let token = userToken {
                self.defaults.setObject(username+":"+token, forKey: "userToken")
                self.defaults.setObject(username, forKey: "userName")
                self.performSegueWithIdentifier("closeLoginModal", sender: nil)
                // TODO: Figure out how to run startFetchAllPostsTask
            } else {
                self.spinner.stopAnimating()
                self.button.enabled = true

                let alert = UIAlertController(title: "Incorrect username or password", message: "Please check your login credentials and try again.", preferredStyle: UIAlertControllerStyle.Alert)
                alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.Default, handler: nil))
                self.presentViewController(alert, animated: true, completion: nil)

                return
            }
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()
    }

}
