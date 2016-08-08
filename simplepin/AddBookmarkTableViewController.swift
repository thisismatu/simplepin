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
    let defaults = NSUserDefaults(suiteName: "group.ml.simplepin")!
    var addBookmarkTask: NSURLSessionTask?
    var passedUrl: NSURL?
    var bookmarkDate: NSDate?
    var bookmark: BookmarkItem?
    var tagsArray: [TagItem]?

    @IBOutlet var privateSwitch: UISwitch!
    @IBOutlet var toreadSwitch: UISwitch!
    @IBOutlet var urlTextField: UITextField!
    @IBOutlet var titleTextField: UITextField!
    @IBOutlet var descriptionTextView: UITextView!
    @IBOutlet var tagsTextField: UITextField!
    @IBOutlet var addButton: UIBarButtonItem!

    //MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()

        descriptionTextView.delegate = self
        urlTextField.addTarget(self, action: #selector(self.textFieldDidChange(_:)), forControlEvents: UIControlEvents.EditingChanged)
        titleTextField.addTarget(self, action: #selector(self.textFieldDidChange(_:)), forControlEvents: UIControlEvents.EditingChanged)

        privateSwitch.on = defaults.boolForKey("privateByDefault")

        if let bookmark = bookmark {
            navigationItem.title = "Edit Bookmark"
            addButton.title = "Save"
            urlTextField.text = bookmark.url.absoluteString
            titleTextField.text = bookmark.title
            descriptionTextView.text = bookmark.description
            tagsTextField.text = bookmark.tags.joinWithSeparator(" ")
            bookmarkDate = bookmark.date
            privateSwitch.on = bookmark.personal
            toreadSwitch.on = bookmark.toread
        } else {
            bookmarkDate = nil
        }

        if let url = passedUrl {
            urlTextField.text = url.absoluteString
        }

        checkValidBookmark()

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
            guard let tags = tagsArray else { return nil }
            let popular = tags.filter{ $0.count > 1 }.map{ $0.tag }
            let title = "Top tags: " + popular.joinWithSeparator(", ")
            return title
        } else {
            return nil
        }
    }

    //MARK: - Actions

    @IBAction func addButtonPressed(sender: AnyObject) {

        guard let urlText = urlTextField.text,
            let url = NSURL(string: urlText),
            let title = titleTextField.text,
            let description = descriptionTextView.text,
            let tags = tagsTextField.text?.componentsSeparatedByString(" ") else {
                return
        }

        if Reachability.isConnectedToNetwork() == false {
            alertError("Couldn't Add Bookmark", message: "Try again when you're back online.")
        } else {
            self.addBookmarkTask = Network.addBookmark(url, title: title, shared: privateSwitch.on, description: description, tags: tags, dt: bookmarkDate, toread: toreadSwitch.on) { resultCode in
                if resultCode == "done" {
                    NSNotificationCenter.defaultCenter().postNotificationName("bookmarkAdded", object: nil)
                    self.performSegueWithIdentifier("closeAddBookmarkModal", sender: self)
                } else {
                    self.alertErrorWithReachability("Something Went Wrong", message: resultCode)
                }
            }
        }
    }

    //MARK: - Functions

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