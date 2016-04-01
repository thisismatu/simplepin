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
    var bookmarkCount: String!

    @IBOutlet var usernameLabel: UILabel!
    @IBOutlet var userDetailLabel: UILabel!
    @IBOutlet var logoutButton: UIButton!

    @IBAction func logoutButtonPressed(sender: AnyObject) {
        let alert = UIAlertController(title: nil, message: nil, preferredStyle: UIAlertControllerStyle.ActionSheet)
        alert.addAction(UIAlertAction(title: "Log Out", style: UIAlertActionStyle.Destructive, handler: { action in
            self.defaults.removeObjectForKey("userName")
            self.defaults.removeObjectForKey("userToken")
            self.dismissViewControllerAnimated(false, completion: nil)
            self.performSegueWithIdentifier("logOut", sender: self)
        }))
        alert.addAction(UIAlertAction(title: "Cancel", style: UIAlertActionStyle.Cancel, handler: nil))
        self.presentViewController(alert, animated: true, completion: nil)
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        usernameLabel.text = defaults.stringForKey("userName")
        userDetailLabel.text = bookmarkCount
    }
}