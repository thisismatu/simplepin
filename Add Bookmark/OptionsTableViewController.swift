//
//  OptionsTableViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 7.7.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit

struct Bookmark {
    var description: String
    var tags: [String]
    var shared: String
    var toread: String
}

class OptionsTableViewController: UITableViewController {
    let defaults = NSUserDefaults(suiteName: "group.ml.simplepin")!

    var descriptionCell: UITableViewCell = UITableViewCell()
    var tagsCell: UITableViewCell = UITableViewCell()
    var shareCell: UITableViewCell = UITableViewCell()
    var toreadCell: UITableViewCell = UITableViewCell()

    var descriptionLabel: UITextField = UITextField()
    var tagsLabel: UITextField = UITextField()

    var shareSwitch: UISwitch = UISwitch()
    var toreadSwitch: UISwitch = UISwitch()

    override func loadView() {
        super.loadView()

        self.title = "Options"

        self.descriptionLabel = UITextField(frame: CGRectInset(self.descriptionCell.contentView.bounds, 15, 0))
        self.descriptionLabel.placeholder = "Description"
        self.descriptionLabel.autocorrectionType = .Default
        self.descriptionLabel.autocapitalizationType = .Sentences
        self.descriptionCell.addSubview(self.descriptionLabel)

        self.tagsLabel = UITextField(frame: CGRectInset(self.tagsCell.contentView.bounds, 15, 0))
        self.tagsLabel.placeholder = "Tags (separated by space)"
        self.tagsLabel.autocorrectionType = .Default
        self.tagsLabel.autocapitalizationType = .None
        self.tagsCell.addSubview(self.tagsLabel)

        self.shareCell.textLabel?.text = "Private"
        self.shareSwitch.on = defaults.boolForKey("privateByDefault")
        self.shareCell.accessoryView = shareSwitch
        self.shareCell.addSubview(self.shareSwitch)

        self.toreadCell.textLabel?.text = "Read Later"
        self.toreadCell.accessoryView = toreadSwitch
        self.toreadCell.addSubview(self.toreadSwitch)
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = nil
        //self.clearsSelectionOnViewWillAppear = false
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }

    // MARK: - Table view data source

    override func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        return 1
    }

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return 4
    }

    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        switch(indexPath.row) {
        case 0: return self.descriptionCell
        case 1: return self.tagsCell
        case 2: return self.shareCell
        case 3: return self.toreadCell
        default: fatalError("Unknown row in section 0")
        }
    }

    override func tableView(tableView: UITableView, willDisplayCell cell: UITableViewCell, forRowAtIndexPath indexPath: NSIndexPath) {
        cell.backgroundColor = nil
    }

    override func tableView(tableView: UITableView, shouldHighlightRowAtIndexPath indexPath: NSIndexPath) -> Bool {
        return false
    }

    // MARK: - Navigation

//    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
//        if let vc = segue.destinationViewController as? ShareViewController {
//            let shareString = shareSwitch.on == true ? "no" : "yes"
//            let toreadString = toreadSwitch.on == true ? "yes" : "no"
//
//            guard let description = descriptionLabel.text,
//                let tags = tagsLabel.text?.componentsSeparatedByString(" ") else { return }
//
//            vc.bookmark = Bookmark.init(description: description, tags: tags, shared: shareString, toread: toreadString)
//        }
//    }

}
