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
    let defaults = NSUserDefaults.standardUserDefaults()

    @IBOutlet var privateBokkmarkSwitch: UISwitch!
    @IBOutlet var toreadBookmarkSwitch: UISwitch!
    @IBOutlet var urlTextField: UITextField!
    @IBOutlet var titleTextField: UITextField!
    @IBOutlet var descriptionTextView: UITextView!
    @IBOutlet var addButton: UIBarButtonItem!

    @IBAction func addButtonPressed(sender: AnyObject) {

        guard let urlText = urlTextField.text,
            let url = NSURL(string: urlText),
            let title = titleTextField.text,
            let description = descriptionTextView.text else {
                return
        }

        if urlText.isEmpty || title.isEmpty {
            self.alertError("Please provide ULR and title", message: nil)
            return
        }

        self.addBookmarkTask = Network.addBookmark(url, title: title, description: description, tags: [], dt: NSDate(), toread: "no") { resultCode in
            if resultCode == "done" {
                print(resultCode)
            } else {
                self.alertError("Something went wrong", message: resultCode)
                print(resultCode)
            }
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        descriptionTextView.delegate = self

        if (defaults.boolForKey("privateByDefault") == true) {
            privateBokkmarkSwitch.on = true
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

    func textViewDidChange(textView: UITextView) {
        if descriptionTextView.text.isEmpty {
            descriptionTextView.backgroundColor = nil
        } else {
            descriptionTextView.backgroundColor = UIColor.whiteColor()
        }
    }

}
