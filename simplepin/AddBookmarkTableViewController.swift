//
//  AddBookmarkTableViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 9.4.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit

class AddBookmarkTableViewController: UITableViewController, UITextViewDelegate {
    let defaults = NSUserDefaults.standardUserDefaults()

    @IBOutlet var privateBokkmarkSwitch: UISwitch!
    @IBOutlet var toreadBookmarkSwitch: UISwitch!
    @IBOutlet var descriptionTextView: UITextView!

    override func viewDidLoad() {
        super.viewDidLoad()

        descriptionTextView.delegate = self

        if (defaults.boolForKey("privateByDefault") == true) {
            privateBokkmarkSwitch.on = true
        }

    }

    func textViewDidBeginEditing(view: UITextView) {
        if !descriptionTextView.text.isEmpty {
            descriptionTextView.backgroundColor = UIColor.whiteColor()
        }
    }

    func textViewDidEndEditing(textView: UITextView) {
        if descriptionTextView.text.isEmpty {
            descriptionTextView.backgroundColor = UIColor.clearColor()
        }
    }

    // TODO: Fix the placeholder https://grokswift.com/uitextview-placeholder/ https://codedump.io/share/Pt7eXF6JKQf/1/text-view-placeholder-swift

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

}
