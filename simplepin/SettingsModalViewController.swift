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
    let appstoreUrl = NSURL(string: "itms://itunes.apple.com/us/app/ultralight-photo-editor/id972428565?mt=8")! // TODO: change url
    let emailUrl = NSURL(string: "mailto:mathias.lindholm@gmail.com?subject=Simplepin%20Feedback")!

    @IBOutlet var usernameLabel: UILabel!
    @IBOutlet var userDetailLabel: UILabel!
    @IBOutlet var logoutButton: UIButton!
    @IBOutlet var markAsReadSwitch: UISwitch!
    @IBOutlet var privateByDefaultSwitch: UISwitch!
    @IBOutlet var openInSafariSwitch: UISwitch!
    @IBOutlet var versionLabel: UILabel!
    @IBOutlet var sendFeedbackCell: UITableViewCell!
    @IBOutlet var rateAppCell: UITableViewCell!

    @IBAction func logoutButtonPressed(sender: AnyObject) {
        let preferredStyle = UIDevice.currentDevice().userInterfaceIdiom == .Pad ? UIAlertControllerStyle.Alert : UIAlertControllerStyle.ActionSheet
        let alert = UIAlertController(title: "Do You Want to Log out?", message: nil, preferredStyle: preferredStyle)
        alert.addAction(UIAlertAction(title: "Log out", style: UIAlertActionStyle.Destructive, handler: { action in
            self.dismissViewControllerAnimated(true, completion: nil)
            self.appDelegate?.logOut()
        }))
        alert.addAction(UIAlertAction(title: "Cancel", style: UIAlertActionStyle.Cancel, handler: nil))
        if let popoverController = alert.popoverPresentationController {
            popoverController.sourceView = logoutButton
            popoverController.sourceRect = logoutButton.bounds
        }
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

        let count = defaults.integerForKey("bookmarkCount")
        userDetailLabel.text = String(count) + " bookmark\(count == 1 ? "" : "s")"

        markAsReadSwitch.on = defaults.boolForKey("markAsRead")
        privateByDefaultSwitch.on = defaults.boolForKey("privateByDefault")
        openInSafariSwitch.on = defaults.boolForKey("openInSafari")

        if let version = NSBundle.mainBundle().infoDictionary?["CFBundleShortVersionString"] as? String {
            versionLabel.text = version
        }

        logoutButton.tintColor = UIColor(red:1.00, green:0.23, blue:0.19, alpha:1.0)
    }

    override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        guard let cell = tableView.cellForRowAtIndexPath(indexPath) else { return }

        switch cell {
        case sendFeedbackCell:
            if UIApplication.sharedApplication().canOpenURL(emailUrl) {
                UIApplication.sharedApplication().openURL(emailUrl)
                self.tableView.deselectRowAtIndexPath(indexPath, animated: true)
            } else {
                alertError("There Was an Error Opening Mail", message: nil)
            }
        case rateAppCell:
            if UIApplication.sharedApplication().canOpenURL(appstoreUrl) {
                UIApplication.sharedApplication().openURL(appstoreUrl)
                self.tableView.deselectRowAtIndexPath(indexPath, animated: true)
            } else {
                alertError("There Was an Error Opening App Store", message: nil)
            }
        default: break
        }
    }
}