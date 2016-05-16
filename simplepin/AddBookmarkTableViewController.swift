//
//  AddBookmarkTableViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 9.4.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit
import Fabric
import Crashlytics

class AddBookmarkTableViewController: UITableViewController, UITextViewDelegate, UITextFieldDelegate {
    var addBookmarkTask: NSURLSessionTask?
    var toreadValue: String?
    var sharedValue: String?
    var passedUrl: NSURL?
    var bookmarkDate: NSDate?
    var bookmark: BookmarkItem?
    let defaults = NSUserDefaults.standardUserDefaults()

    @IBOutlet var privateSwitch: UISwitch!
    @IBOutlet var toreadSwitch: UISwitch!
    @IBOutlet var urlTextField: UITextField!
    @IBOutlet var titleTextField: UITextField!
    @IBOutlet var descriptionTextView: UITextView!
    @IBOutlet var tagsTextField: UITextField!
    @IBOutlet var addButton: UIBarButtonItem!

    @IBAction func addButtonPressed(sender: AnyObject) {
        if (toreadSwitch.on == true) {
            toreadValue = "yes"
        } else if (toreadSwitch.on == false) {
            toreadValue = "no"
        }

        if (privateSwitch.on == true) {
            sharedValue = "no"
        } else if (privateSwitch.on == false) {
            sharedValue = "yes"
        }

        guard let urlText = urlTextField.text,
            let url = NSURL(string: urlText),
            let title = titleTextField.text,
            let description = descriptionTextView.text,
            let tags = tagsTextField.text?.componentsSeparatedByString(" "),
            let shared = sharedValue,
            let toread = toreadValue else {
                return
        }

        if Reachability.isConnectedToNetwork() == false {
            alertError("Couldn't Add Bookmark", message: "Try again when you're back online.")
        } else {
            self.addBookmarkTask = Network.addBookmark(url, title: title, description: description, tags: tags, dt: bookmarkDate, shared: shared, toread: toread) { resultCode in
                if resultCode == "done" {
                    NSNotificationCenter.defaultCenter().postNotificationName("bookmarkAdded", object: nil)
                    self.performSegueWithIdentifier("closeAddBookmarkModal", sender: self)
                } else {
                    self.alertErrorWithReachability("Something Went Wrong", message: resultCode)
                }
            }
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        descriptionTextView.delegate = self
        urlTextField.addTarget(self, action: #selector(AddBookmarkTableViewController.textFieldDidChange(_:)), forControlEvents: UIControlEvents.EditingChanged)
        titleTextField.addTarget(self, action: #selector(AddBookmarkTableViewController.textFieldDidChange(_:)), forControlEvents: UIControlEvents.EditingChanged)

        if let bookmark = bookmark {
            navigationItem.title = "Edit Bookmark"
            addButton.title = "Save"
            urlTextField.text = bookmark.link.absoluteString
            titleTextField.text = bookmark.title
            descriptionTextView.text = bookmark.description
            tagsTextField.text = bookmark.tags.joinWithSeparator(" ")
            bookmarkDate = bookmark.date
            sharedValue = bookmark.shared
            toreadValue = bookmark.toread
        } else {
            bookmarkDate = nil
        }

        if let url = passedUrl {
            urlTextField.text = url.absoluteString
        }

        checkValidBookmark()

        privateSwitch.on = defaults.boolForKey("privateByDefault") || sharedValue == "no"
        toreadSwitch.on = toreadValue == "yes"

        if !descriptionTextView.text.isEmpty {
            descriptionTextView.backgroundColor = UIColor.whiteColor()
        }

        Answers.logContentViewWithName("Add/edit bookmark view", contentType: "View", contentId: "addedit-1", customAttributes: [:])
    }

    override func viewDidDisappear(animated: Bool) {
        super.viewDidDisappear(animated)
        addBookmarkTask?.cancel()
    }

    override func tableView(tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        if section == 0 {
            guard let tags = defaults.stringArrayForKey("userTags") else { return nil }
            let title = "Separate tags with space.\n\n"
            return title + tags.joinWithSeparator(", ")
        } else {
            return nil
        }
    }

    func checkValidBookmark() {
        let url = urlTextField.text ?? ""
        let title = titleTextField.text ?? ""
        if !url.isEmpty && !title.isEmpty {
            addButton.enabled = true
        } else {
            addButton.enabled = false
        }
    }

    func textFieldDidChange(textField: UITextField) {
        checkValidBookmark()
    }

    func textViewDidChange(textView: UITextView) {
        if descriptionTextView.text.isEmpty {
            descriptionTextView.backgroundColor = nil
        } else {
            descriptionTextView.backgroundColor = UIColor.whiteColor()
        }
    }
}