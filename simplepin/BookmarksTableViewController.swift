//
//  BookmarksTableViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 29.2.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit
import SafariServices

struct BookmarkItem {
    let title: String
    let description: String
    let date: NSDate
    let link: NSURL
    let tags: [String]
    let toread: String

    init?(json: [String: AnyObject]) {
        let formatter = NSDateFormatter()
        formatter.dateFormat = "yyyy-MM-DD'T'HH:mm:SSZ"
        let dateString = json["time"] as? String
        let linkString = json["href"] as? String
        let tagsString = json["tags"] as? String

        guard let title = json["description"] as? String,
            let description = json["extended"] as? String,
            let date = formatter.dateFromString(dateString!),
            let link = NSURL(string: linkString!),
            let tags = tagsString?.componentsSeparatedByString(" ").filter({!$0.isEmpty}),
            let toread = json["toread"] as? String else {
                return nil
        }
        self.title = title
        self.description = description
        self.date = date
        self.link = link
        self.tags = tags
        self.toread = toread
    }
}

class BookmarksTableViewController: UITableViewController {
    var bookmarks = [BookmarkItem]()
    var fetchAllPostsTask: NSURLSessionTask?
    let activityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .Gray)
    let defaults = NSUserDefaults.standardUserDefaults()

    @IBOutlet var searchBar: UISearchBar!
    @IBOutlet var tableData: UITableView!
    @IBOutlet var loadingPosts: UIView!
    @IBOutlet var loadingPostsSpinner: UIActivityIndicatorView!

    @IBAction func unwindSettingsModal(segue: UIStoryboardSegue) {
        startFetchAllPostsTask()
    }

    func startFetchAllPostsTask() {
        loadingPostsSpinner.startAnimating()
        fetchAllPostsTask = Network.fetchAllPosts() { [weak self] bookmarks in
            self?.bookmarks = bookmarks
            self?.loadingPostsSpinner.stopAnimating()
            self?.loadingPosts.hidden = true;
            self?.tableData.reloadData()
        }
    }

    func showBookmark(currentUrl: NSURL?) {
        if let url = currentUrl {
            let vc = SFSafariViewController(URL: url, entersReaderIfAvailable: true)
            presentViewController(vc, animated: true, completion: nil)
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        if defaults.stringForKey("userToken") != nil {
            startFetchAllPostsTask()
        }
        else {
            performSegueWithIdentifier("openLoginModal", sender: self)
        }

        tableView.estimatedRowHeight = 96.0
        tableView.rowHeight = UITableViewAutomaticDimension

        // Uncomment the following line to preserve selection between presentations
        // self.clearsSelectionOnViewWillAppear = false

        // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
        // self.navigationItem.rightBarButtonItem = self.editButtonItem()
    }

    override func viewDidDisappear(animated: Bool) {
        super.viewDidDisappear(animated)
        fetchAllPostsTask?.cancel()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    // MARK: - Table view data source

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return bookmarks.count
    }

    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let formatter = NSDateFormatter()
        formatter.dateStyle = .ShortStyle
        formatter.timeStyle = .NoStyle
        let bookmark = bookmarks[indexPath.row]
        let cell = tableView.dequeueReusableCellWithIdentifier("BookmarkCell", forIndexPath: indexPath) as! BookmarkTableViewCell

        cell.titleLabel.text = bookmark.title
        cell.dateLabel.text = formatter.stringFromDate(bookmark.date)

        if bookmark.description.isEmpty {
            cell.descriptionLabel.hidden = true
        } else {
            cell.descriptionLabel.hidden = false
            cell.descriptionLabel.text = bookmark.description
        }

        if bookmark.tags.count == 0 {
            cell.tagsStackView.hidden = true
        } else {
            cell.tagsStackView.hidden = false
            for view in cell.tagsStackView.subviews {
                view.removeFromSuperview()
            }
            for item in bookmark.tags {
                let label = UILabel()
                label.font = UIFont.preferredFontForTextStyle(UIFontTextStyleFootnote)
                label.numberOfLines = 1
                label.tag = indexPath.row
                label.text = item
                label.userInteractionEnabled = true
                label.textAlignment = NSTextAlignment.Right
                label.textColor = self.view.tintColor
                cell.tagsStackView.addArrangedSubview(label)
            }
        }

        if bookmark.toread == "no" {
            cell.unreadIndicator.hidden = true
        } else {
            cell.unreadIndicator.hidden = false
        }

        return cell
    }

    override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        let url = bookmarks[indexPath.row].link
        showBookmark(url)
    }

}