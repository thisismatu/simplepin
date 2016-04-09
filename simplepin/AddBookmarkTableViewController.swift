//
//  AddBookmarkTableViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 9.4.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit

class AddBookmarkTableViewController: UITableViewController {
    let defaults = NSUserDefaults.standardUserDefaults()

    @IBOutlet var privateBokkmarkSwitch: UISwitch!
    @IBOutlet var toreadBookmarkSwitch: UISwitch!

    override func viewDidLoad() {
        super.viewDidLoad()

        if (defaults.boolForKey("privateByDefault") == true) {
            privateBokkmarkSwitch.on = true
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

}
