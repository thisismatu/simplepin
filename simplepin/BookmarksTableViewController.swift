//
//  BookmarksTableViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 29.2.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit
import SafariServices

class BookmarkItem {
    let title: String
    let description: String
    let date: NSDate
    let link: NSURL
    let tags: [String]
    var toread: String

    init?(json: [String: AnyObject]) {
        let dateString = json["time"] as? String
        let linkString = json["href"] as? String
        let tagsString = json["tags"] as? String

        guard let title = json["description"] as? String,
            let description = json["extended"] as? String,
            let date = dateString?.toDate(),
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
    var filteredBookmarks = [BookmarkItem]()
    var fetchAllPostsTask: NSURLSessionTask?
    var checkForUpdatesTask: NSURLSessionTask?
    var deleteBookmarkTask: NSURLSessionTask?
    var addBookmarkTask: NSURLSessionTask?
    let activityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .Gray)
    let defaults = NSUserDefaults.standardUserDefaults()
    let searchController = UISearchController(searchResultsController: nil)

    @IBOutlet var searchBar: UISearchBar!
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

    @IBAction func unwindAddBookmarkModal(segue: UIStoryboardSegue) {
    }

    func startFetchAllPostsTask() {
        loadingPostsSpinner.startAnimating()
        fetchAllPostsTask = Network.fetchAllPosts() { [weak self] bookmarks in
            self?.bookmarks = bookmarks
            self?.loadingPostsSpinner.stopAnimating()
            self?.loadingPosts.hidden = true;
            self?.tableView.reloadData()
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

        if Reachability.isConnectedToNetwork() == false {
            alertError("No Internet Connection", message: "Try again later when you're back online.")
        }

        checkForUpdatesTask = Network.checkForUpdates() { updateDate in
            let lastUpdateDate = self.defaults.objectForKey("lastUpdateDate") as? NSDate
            if lastUpdateDate < updateDate {
                self.startFetchAllPostsTask()
            } else {
                return
            }
        }

        refreshControl.endRefreshing()
    }

    func filterContentForSearchText(searchText: String, scope: String = "All") {
        filteredBookmarks = bookmarks.filter { bookmark in
            return bookmark.title.lowercaseString.containsString(searchText.lowercaseString)
        }
        tableView.reloadData()
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        if Reachability.isConnectedToNetwork() == false {
            alertError("No Internet Connection", message: "Try again later when you're back online.")
        }

        if defaults.stringForKey("userToken") != nil {
            startFetchAllPostsTask()
        }

        searchController.searchResultsUpdater = self
        searchController.dimsBackgroundDuringPresentation = false
        searchController.hidesNavigationBarDuringPresentation = false
        searchController.searchBar.searchBarStyle = .Minimal
        definesPresentationContext = true
        tableView.tableHeaderView = searchController.searchBar

        self.refreshControl?.tintColor = UIColor(white: 0, alpha: 0.38)
        self.refreshControl?.addTarget(self, action: #selector(BookmarksTableViewController.handleRefresh(_:)), forControlEvents: UIControlEvents.ValueChanged)

        let longPressRecognizer = UILongPressGestureRecognizer(target: self, action: #selector(BookmarksTableViewController.longPress(_:)))
        self.view.addGestureRecognizer(longPressRecognizer)

        tableView.estimatedRowHeight = 96.0
        tableView.rowHeight = UITableViewAutomaticDimension

        // Uncomment the following line to preserve selection between presentations
        // self.clearsSelectionOnViewWillAppear = false

        // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
        // self.navigationItem.rightBarButtonItem = self.editButtonItem()
    }

    override func viewDidAppear(animated: Bool) {
        super.viewDidAppear(true)

        if defaults.stringForKey("userToken") == nil {
            performSegueWithIdentifier("openLoginModal", sender: self)
        }
    }

    override func viewDidDisappear(animated: Bool) {
        super.viewDidDisappear(animated)
        fetchAllPostsTask?.cancel()
        checkForUpdatesTask?.cancel()
        deleteBookmarkTask?.cancel()
        addBookmarkTask?.cancel()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    // MARK: - Table view data source

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if searchController.active && searchController.searchBar.text != "" {
            return filteredBookmarks.count
        }
        return bookmarks.count
    }

    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("BookmarkCell", forIndexPath: indexPath) as! BookmarkTableViewCell
        let formatter = NSDateFormatter()
        formatter.dateStyle = .ShortStyle
        formatter.timeStyle = .NoStyle
        var bookmark: BookmarkItem

        if searchController.active && searchController.searchBar.text != "" {
            bookmark = filteredBookmarks[indexPath.row]
        } else {
            bookmark = bookmarks[indexPath.row]
        }

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
                button.titleLabel?.font = UIFont.preferredFontForTextStyle(UIFontTextStyleSubheadline)
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
        var bookmark: BookmarkItem

        if searchController.active && searchController.searchBar.text != "" {
            bookmark = filteredBookmarks[indexPath.row]
        } else {
            bookmark = bookmarks[indexPath.row]
        }

        if ((defaults.boolForKey("markAsRead") == true) && bookmark.toread == "yes") {
            self.addBookmarkTask = Network.addBookmark(bookmark.link, title: bookmark.title, description: bookmark.description, tags: bookmark.tags, dt: bookmark.date, toread: "no") { resultCode in
                if resultCode == "done" {
                    bookmark.toread = "no"
                    self.tableView.reloadRowsAtIndexPaths([indexPath], withRowAnimation: .None)
                } else {
                    self.alertError("Something went wrong", message: resultCode)
                    return
                }
            }
        }

        let url = bookmark.link
        showBookmark(url)
    }

    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if segue.identifier == "openSettingsModal" {
            let navigationController = segue.destinationViewController as! UINavigationController
            let vc = navigationController.topViewController as! SettingsModalViewController
            let count = String(bookmarks.count)
            vc.bookmarkCount = count+" bookmarks"

        }
    }

    func longPress(longPressGestureRecognizer: UILongPressGestureRecognizer) {
        if longPressGestureRecognizer.state == UIGestureRecognizerState.Began {

            let touchPoint = longPressGestureRecognizer.locationInView(self.view)

            if let indexPath = tableView.indexPathForRowAtPoint(touchPoint) {
                var bookmark: BookmarkItem

                if searchController.active && searchController.searchBar.text != "" {
                    bookmark = filteredBookmarks[indexPath.row]
                } else {
                    bookmark = bookmarks[indexPath.row]
                }

                let alert = UIAlertController(title: bookmark.title, message: nil, preferredStyle: UIAlertControllerStyle.ActionSheet)

                if bookmark.toread == "yes" {
                    alert.addAction(UIAlertAction(title: "Mark as Read", style: UIAlertActionStyle.Default, handler: { action in
                        self.addBookmarkTask = Network.addBookmark(bookmark.link, title: bookmark.title, description: bookmark.description, tags: bookmark.tags, dt: bookmark.date, toread: "no") { resultCode in
                            if resultCode == "done" {
                                bookmark.toread = "no"
                                self.tableView.reloadRowsAtIndexPaths([indexPath], withRowAnimation: .None)
                            } else {
                                self.alertError("Something went wrong", message: resultCode)
                                return
                            }
                        }
                    }))
                } else {
                    alert.addAction(UIAlertAction(title: "Mark as Unread", style: UIAlertActionStyle.Default, handler: { action in
                        self.addBookmarkTask = Network.addBookmark(bookmark.link, title: bookmark.title, description: bookmark.description, tags: bookmark.tags, dt: bookmark.date, toread: "yes") { resultCode in
                            if resultCode == "done" {
                                bookmark.toread = "yes"
                                self.tableView.reloadRowsAtIndexPaths([indexPath], withRowAnimation: .None)
                            } else {
                                self.alertError("Something went wrong", message: resultCode)
                                return
                            }
                        }
                    }))
                }

                alert.addAction(UIAlertAction(title: "Edit", style: UIAlertActionStyle.Default, handler: nil))
                alert.addAction(UIAlertAction(title: "Delete", style: UIAlertActionStyle.Destructive, handler: { action in
                    self.deleteBookmarkTask = Network.deleteBookmark(bookmark.link) { resultCode in
                        if resultCode == "done" {
                            self.bookmarks.removeAtIndex(indexPath.row)
                            self.tableView.deleteRowsAtIndexPaths([indexPath], withRowAnimation: .Left)
                            self.tableView.reloadData()
                        } else {
                            self.alertError("Something went wrong", message: resultCode)
                            return
                        }
                    }
                }))
                alert.addAction(UIAlertAction(title: "Cancel", style: UIAlertActionStyle.Cancel, handler: nil))
                self.presentViewController(alert, animated: true, completion: nil)
            }
        }
    }
}

extension BookmarksTableViewController: UISearchResultsUpdating {
    func updateSearchResultsForSearchController(searchController: UISearchController) {
        filterContentForSearchText(searchController.searchBar.text!)
    }
}