//
//  settingsModalViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 14.3.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit
import Fabric
import Crashlytics

class SettingsModalViewController: UITableViewController {
    let appDelegate = UIApplication.sharedApplication().delegate as? AppDelegate
    let defaults = NSUserDefaults.init(suiteName: "group.ml.simplepin")!
    let appstoreUrl = NSURL(string: "itms://itunes.apple.com/us/app/simplepin/id1107506693?ls=1&mt=8")!
    let emailUrl = NSURL(string: "mailto:mathias.lindholm@gmail.com?subject=Simplepin%20Feedback")!
    let device = UIDevice.currentDevice().userInterfaceIdiom

    @IBOutlet var usernameLabel: UILabel!
    @IBOutlet var userDetailLabel: UILabel!
    @IBOutlet var logoutButton: UIButton!
    @IBOutlet var markAsReadSwitch: UISwitch!
    @IBOutlet var privateByDefaultSwitch: UISwitch!
    @IBOutlet var openInSafariSwitch: UISwitch!
    @IBOutlet var versionLabel: UILabel!
    @IBOutlet var sendFeedbackCell: UITableViewCell!
    @IBOutlet var rateAppCell: UITableViewCell!
    @IBOutlet var boldTitleSwitch: UISwitch!
    @IBOutlet var relativeDateSwitch: UISwitch!

    @IBAction func logoutButtonPressed(sender: AnyObject) {
        let alertController = UIAlertController(
            title: device == .Pad ? "Do You Want to Log out?" : nil,
            message: nil,
            preferredStyle: device == .Pad ? .Alert : .ActionSheet)

        let actionLogout = UIAlertAction(title: "Log out", style: UIAlertActionStyle.Destructive, handler: { action in
            self.dismissViewControllerAnimated(true, completion: nil)
            self.appDelegate?.logOut()
        })
        let actionCancel = UIAlertAction(title: "Cancel", style: UIAlertActionStyle.Cancel, handler: nil)

        alertController.addAction(actionLogout)
        alertController.addAction(actionCancel)

        if let popoverController = alertController.popoverPresentationController {
            popoverController.sourceView = logoutButton
            popoverController.sourceRect = logoutButton.bounds
        }

        self.presentViewController(alertController, animated: true, completion: nil)
    }

    @IBAction func markAsReadPressed(sender: AnyObject) {
        if markAsReadSwitch.on == true {
            defaults.setObject(true, forKey: "markAsRead")
            Answers.logCustomEventWithName("Switch Pressed", customAttributes: ["Switch": "markAsRead"])
        } else {
            defaults.setObject(false, forKey: "markAsRead")
        }
    }

    @IBAction func privateByDefaultPressed(sender: AnyObject) {
        if privateByDefaultSwitch.on == true {
            defaults.setObject(true, forKey: "privateByDefault")
        } else {
            defaults.setObject(false, forKey: "privateByDefault")
        }
    }

    @IBAction func openInSafariSwitchPressed(sender: AnyObject) {
        if openInSafariSwitch.on == true {
            defaults.setObject(true, forKey: "openInSafari")
            Answers.logCustomEventWithName("Switch Pressed", customAttributes: ["Switch": "openInSafari"])
        } else {
            defaults.setObject(false, forKey: "openInSafari")
        }
    }

    @IBAction func boldTitleSwitchPressed(sender: AnyObject) {
        if boldTitleSwitch.on == true {
            defaults.setObject(true, forKey: "boldTitleFont")
            Answers.logCustomEventWithName("Switch Pressed", customAttributes: ["Switch": "boldTitleFont"])
        } else {
            defaults.setObject(false, forKey: "boldTitleFont")
        }
    }

    @IBAction func relativeDateSwitchPressed(sender: AnyObject) {
        if relativeDateSwitch.on == true {
            defaults.setBool(true, forKey: "relativeDate")
            Answers.logCustomEventWithName("Switch Pressed", customAttributes: ["Switch": "relativeDate"])
        } else {
            defaults.setBool(false, forKey: "relativeDate")
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
        boldTitleSwitch.on = defaults.boolForKey("boldTitleFont")
        relativeDateSwitch.on = defaults.boolForKey("relativeDate")

        if let version = NSBundle.mainBundle().infoDictionary?["CFBundleShortVersionString"] as? String {
            versionLabel.text = version
        }

        logoutButton.tintColor = Colors.Red

        Answers.logContentViewWithName("Settings view", contentType: "View", contentId: "settings-1", customAttributes: [:])
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