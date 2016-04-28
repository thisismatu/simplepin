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
    var fetchTagsTask: NSURLSessionTask?
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
    @IBOutlet var suggestedTagsStackView: UIStackView!

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

        if Reachability.isConnectedToNetwork() == false {
            alertError("No Internet Connection", message: "Try again later when you're back online.")
        } else  {
            fetchTagsTask = Network.fetchTags() { userTags in
                for item in userTags! {
                    let button = UIButton()
                    button.setTitle(item, forState: .Normal)
                    button.setTitleColor(self.view.tintColor, forState: .Normal)
                    self.suggestedTagsStackView.addArrangedSubview(button)
                }
            }
        }

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
        fetchTagsTask?.cancel()
    }


    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    func textViewDidChange(textView: UITextView) {
        if descriptionTextView.text.isEmpty {
            descriptionTextView.backgroundColor = nil
        } else {
            descriptionTextView.backgroundColor = UIColor.whiteColor()
        }
    }

}
