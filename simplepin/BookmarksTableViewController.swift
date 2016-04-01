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
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:SSZ"
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
    var checkForUpdatesTask: NSURLSessionTask?
    let activityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .Gray)
    let defaults = NSUserDefaults.standardUserDefaults()

    @IBOutlet var searchBar: UISearchBar!
    @IBOutlet var tableData: UITableView!
    @IBOutlet var loadingPosts: UIView!
    @IBOutlet var loadingPostsSpinner: UIActivityIndicatorView!

    @IBAction func unwindLoginModal(segue: UIStoryboardSegue) {
        startFetchAllPostsTask()
    }

    @IBAction func unwindSettingsModal(segue: UIStoryboardSegue) {
    }

    @IBAction func logOut(segue: UIStoryboardSegue) {
        performSegueWithIdentifier("openLoginModal", sender: self)
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

    func handleRefresh(refreshControl: UIRefreshControl) {
        self.tableView.reloadData()

        checkForUpdatesTask = Network.checkForUpdates() { updateDate in
            let lastUpdatedDate = self.bookmarks.first?.date
            print("updateDate: \(updateDate), lastUpdatedDate: \(lastUpdatedDate)")
            if lastUpdatedDate?.compare(updateDate!) == NSComparisonResult.OrderedAscending {
                print("New posts available")
                self.startFetchAllPostsTask()
            } else {
                print("No updates available :(")
                return
            }
        }

        refreshControl.endRefreshing()
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        if defaults.stringForKey("userToken") != nil {
            startFetchAllPostsTask()
        }
        else {
            performSegueWithIdentifier("openLoginModal", sender: self)
        }

        self.refreshControl?.tintColor = UIColor(white: 0, alpha: 0.38)
        self.refreshControl?.addTarget(self, action: #selector(BookmarksTableViewController.handleRefresh(_:)), forControlEvents: UIControlEvents.ValueChanged)

        let longPressRecognizer = UILongPressGestureRecognizer(target: self, action: Selector("longPress:"))
        self.view.addGestureRecognizer(longPressRecognizer)

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
        checkForUpdatesTask?.cancel()
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
                let button = UIButton()
                button.titleLabel?.font = UIFont.preferredFontForTextStyle(UIFontTextStyleFootnote)
                button.setTitleColor(self.view.tintColor, forState: .Normal)
                button.setTitle(item, forState: .Normal)
                button.contentHorizontalAlignment = .Right
                button.contentEdgeInsets = UIEdgeInsetsMake(4.0, 2.0, 4.0, 2.0)
                button.setContentHuggingPriority(252, forAxis: .Horizontal)
                button.tag = indexPath.row
                // button.addTarget(self, action: "tagButtonClicked", forControlEvents: .TouchUpInside)
                cell.tagsStackView.addArrangedSubview(button)
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

    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if (segue.identifier == "openSettingsModal") {
            let navigationController = segue.destinationViewController as! UINavigationController
            let vc = navigationController.topViewController as! SettingsModalViewController
            let count = String(bookmarks.count)
            vc.bookmarkCount = count+" bookmarks"

        }
    }

    func longPress(longPressGestureRecognizer: UILongPressGestureRecognizer) {
        if longPressGestureRecognizer.state == UIGestureRecognizerState.Began {
            let touchPoint = longPressGestureRecognizer.locationInView(self.view)
            if tableView.indexPathForRowAtPoint(touchPoint) != nil {
                let alert = UIAlertController(title: nil, message: nil, preferredStyle: UIAlertControllerStyle.ActionSheet)
                alert.addAction(UIAlertAction(title: "Mark as Read", style: UIAlertActionStyle.Default, handler: nil))
                alert.addAction(UIAlertAction(title: "Edit", style: UIAlertActionStyle.Default, handler: nil))
                alert.addAction(UIAlertAction(title: "Delete", style: UIAlertActionStyle.Destructive, handler: nil))
                alert.addAction(UIAlertAction(title: "Cancel", style: UIAlertActionStyle.Cancel, handler: nil))
                self.presentViewController(alert, animated: true, completion: nil)
            }
        }
    }
}