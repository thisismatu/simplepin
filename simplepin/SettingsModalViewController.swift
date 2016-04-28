//
//  settingsModalViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 14.3.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit

class SettingsModalViewController: UITableViewController {
    let appDelegate = UIApplication.sharedApplication().delegate as? AppDelegate
    let defaults = NSUserDefaults.standardUserDefaults()
    var bookmarkCount: String!

    @IBOutlet var usernameLabel: UILabel!
    @IBOutlet var userDetailLabel: UILabel!
    @IBOutlet var logoutButton: UIButton!
    @IBOutlet var markAsReadSwitch: UISwitch!
    @IBOutlet var privateByDefaultSwitch: UISwitch!
    @IBOutlet var openInSafariSwitch: UISwitch!
    @IBOutlet var versionLabel: UILabel!

    @IBAction func logoutButtonPressed(sender: AnyObject) {
        let alert = UIAlertController(title: nil, message: nil, preferredStyle: UIAlertControllerStyle.ActionSheet)
        alert.addAction(UIAlertAction(title: "Log Out", style: UIAlertActionStyle.Destructive, handler: { action in
            self.dismissViewControllerAnimated(true, completion: nil)
            self.appDelegate?.logOut()
        }))
        alert.addAction(UIAlertAction(title: "Cancel", style: UIAlertActionStyle.Cancel, handler: nil))
        self.presentViewController(alert, animated: true, completion: nil)
    }

    @IBAction func markAsReadPressed(sender: AnyObject) {
        if (markAsReadSwitch.on == true) {
            defaults.setObject(true, forKey: "markAsRead")
        } else if (markAsReadSwitch.on == false) {
            defaults.setObject(false, forKey: "markAsRead")
        }
    }

    @IBAction func privateByDefaultPressed(sender: AnyObject) {
        if (privateByDefaultSwitch.on == true) {
            defaults.setObject(true, forKey: "privateByDefault")
        } else if (privateByDefaultSwitch.on == false) {
            defaults.setObject(false, forKey: "privateByDefault")
        }
    }

    @IBAction func openInSafariSwitchPressed(sender: AnyObject) {
        if (openInSafariSwitch.on == true) {
            defaults.setObject(true, forKey: "openInSafari")
        } else if (openInSafariSwitch.on == false) {
            defaults.setObject(false, forKey: "openInSafari")
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        usernameLabel.text = defaults.stringForKey("userName")
        userDetailLabel.text = bookmarkCount

        if (defaults.boolForKey("markAsRead") == true) {
            markAsReadSwitch.on = true
        }

        if (defaults.boolForKey("privateByDefault") == true) {
            privateByDefaultSwitch.on = true
        }

        if (defaults.boolForKey("openInSafari") == true) {
            openInSafariSwitch.on = true
        }

        if let version = NSBundle.mainBundle().infoDictionary?["CFBundleShortVersionString"] as? String {
            versionLabel.text = version
        }
    }
}