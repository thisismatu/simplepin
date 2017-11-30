//
//  OptionsTableViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 7.7.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit

protocol OptionsTableViewDelegate: class {
    func didEnterInformation(data: Bookmark)
}

class OptionsTableViewController: UITableViewController {
    weak var delegate: OptionsTableViewDelegate? = nil
    var passedBookmark = Bookmark()
    let groupDefaults = NSUserDefaults(suiteName: "group.ml.simplepin")!

    var descriptionCell: UITableViewCell = UITableViewCell()
    var tagsCell: UITableViewCell = UITableViewCell()
    var shareCell: UITableViewCell = UITableViewCell()
    var toreadCell: UITableViewCell = UITableViewCell()
    var descriptionLabel: UITextField = UITextField()
    var tagsLabel: UITextField = UITextField()
    var privateSwitch: UISwitch = UISwitch()
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
        self.privateSwitch.on = groupDefaults.boolForKey("privateByDefault")
        self.shareCell.accessoryView = privateSwitch
        self.shareCell.addSubview(self.privateSwitch)

        self.toreadCell.textLabel?.text = "Read Later"
        self.toreadSwitch.on = groupDefaults.boolForKey("toreadByDefault")
        self.toreadCell.accessoryView = toreadSwitch
        self.toreadCell.addSubview(self.toreadSwitch)
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = nil

        descriptionLabel.text = passedBookmark.description
        tagsLabel.text = passedBookmark.tags.joinWithSeparator(" ")
        privateSwitch.on = passedBookmark.personal
        toreadSwitch.on = passedBookmark.toread
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }

    override func viewWillDisappear(animated: Bool) {
        super.viewWillDisappear(true)

        guard let description = descriptionLabel.text,
            let tags = tagsLabel.text?.componentsSeparatedByString(" ") else { return }

        passedBookmark.description = description
        passedBookmark.tags = tags
        passedBookmark.personal = privateSwitch.on
        passedBookmark.toread = toreadSwitch.on

        delegate?.didEnterInformation(passedBookmark)
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

}
