//
//  AddBookmarkTableViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 9.4.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit

class AddBookmarkTableViewController: UITableViewController, UITextViewDelegate {
    var addBookmarkTask: NSURLSessionTask?
    var toreadValue = "no"
    var sharedValue = "yes"
    var passedUrl: String?
    var passedTitle: String?
    var passedDescription: String?
    var passedTags: String?
    let defaults = NSUserDefaults.standardUserDefaults()

    @IBOutlet var privateSwitch: UISwitch!
    @IBOutlet var toreadSwitch: UISwitch!
    @IBOutlet var urlTextField: UITextField!
    @IBOutlet var titleTextField: UITextField!
    @IBOutlet var descriptionTextView: UITextView!
    @IBOutlet var tagsTextField: UITextField!
    @IBOutlet var addButton: UIBarButtonItem!

    @IBAction func toreadSwitchPressed(sender: AnyObject) {
        if (toreadSwitch.on == true) {
            toreadValue = "yes"
        } else if (toreadSwitch.on == false) {
            toreadValue = "no"
        }
    }

    @IBAction func privateSwitchPressed(sender: AnyObject) {
        if (privateSwitch.on == true) {
            sharedValue = "no"
        } else if (privateSwitch.on == false) {
            sharedValue = "yes"
        }

    }

    @IBAction func addButtonPressed(sender: AnyObject) {

        guard let urlText = urlTextField.text,
            let url = NSURL(string: urlText),
            let title = titleTextField.text,
            let description = descriptionTextView.text,
            let tags = tagsTextField.text?.componentsSeparatedByString(" ") else {
                return
        }

        if urlText.isEmpty || title.isEmpty {
            self.alertError("Please provide URL and Title", message: nil)
            return
        }

        self.addBookmarkTask = Network.addBookmark(url, title: title, description: description, tags: tags, shared: sharedValue, toread: toreadValue ) { resultCode in
            if resultCode == "done" {
                print(resultCode)
                self.performSegueWithIdentifier("closeAddBookmarkModal", sender: self)
            } else {
                self.alertError("Something went wrong", message: resultCode)
                print(resultCode)
            }
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        descriptionTextView.delegate = self

        if passedUrl != nil {
            urlTextField.text = passedUrl
            titleTextField.text = passedTitle
            descriptionTextView.text = passedDescription
            tagsTextField.text = passedTags
            addButton.title = "Save"
        }

        if (defaults.boolForKey("privateByDefault") == true) || sharedValue == "no" {
            privateSwitch.on = true
            sharedValue = "no"
        }

        if toreadValue == "yes" {
            toreadSwitch.on = true
            toreadValue = "yes"
        }

        if !descriptionTextView.text.isEmpty {
            descriptionTextView.backgroundColor = UIColor.whiteColor()
        }

    }

    override func viewDidDisappear(animated: Bool) {
        super.viewDidDisappear(animated)
        addBookmarkTask?.cancel()
    }


    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    override func tableView(tableView: UITableView, titleForFooterInSection section: Int) -> String? {
        if section == 0 {
            guard let tags = defaults.stringArrayForKey("userTags") else { return nil }
            let title = "Top tags: "
            return title + tags.joinWithSeparator(", ")
        } else {
            return nil
        }
    }

    func textViewDidChange(textView: UITextView) {
        if descriptionTextView.text.isEmpty {
            descriptionTextView.backgroundColor = nil
        } else {
            descriptionTextView.backgroundColor = UIColor.whiteColor()
        }
    }

}
