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
    var shared: String
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
            let shared = json["shared"] as? String,
            let toread = json["toread"] as? String else {
                return nil
        }
        self.title = title
        self.description = description
        self.date = date
        self.link = link
        self.tags = tags
        self.shared = shared
        self.toread = toread
    }
}

class BookmarksTableViewController: UITableViewController {
    var bookmarksArray = [BookmarkItem]()
    var filteredBookmarks = [BookmarkItem]()
    var fetchAllPostsTask: NSURLSessionTask?
    var checkForUpdatesTask: NSURLSessionTask?
    var deleteBookmarkTask: NSURLSessionTask?
    var addBookmarkTask: NSURLSessionTask?
    var urlToPass: String = ""
    var titleToPass: String = ""
    var descriptionToPass: String = ""
    var tagsToPass: String = ""
    var toreadToPass: String = ""
    var sharedToPass: String = ""
    let activityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .Gray)
    let defaults = NSUserDefaults.standardUserDefaults()
    let searchController = UISearchController(searchResultsController: nil)

    @IBOutlet var searchBar: UISearchBar!
    @IBOutlet var loadingPosts: UIView!
    @IBOutlet var loadingPostsSpinner: UIActivityIndicatorView!

    override func viewDidLoad() {
        super.viewDidLoad()

        NSNotificationCenter.defaultCenter().addObserverForName(
            "loginSuccessful",
            object: nil, queue: nil,
            usingBlock: loginSuccessfull)

        if defaults.stringForKey("userToken") != nil {
            startFetchAllPostsTask()
        }

        searchController.searchResultsUpdater = self
        searchController.dimsBackgroundDuringPresentation = false
        searchController.searchBar.autocapitalizationType = .None
        searchController.searchBar.spellCheckingType = .No
        searchController.searchBar.searchBarStyle = .Default
        searchController.searchBar.barTintColor = .whiteColor()
        searchController.searchBar.translucent = false
        searchController.searchBar.layer.borderColor = UIColor.whiteColor().CGColor
        searchController.searchBar.layer.borderWidth = 1
        searchController.searchBar.setSearchFieldBackgroundImage(UIImage(named: "bg_searchfield"), forState: .Normal)
        searchController.searchBar.searchTextPositionAdjustment = UIOffset.init(horizontal: 7.0, vertical: 0.0)
        definesPresentationContext = true
        tableView.tableHeaderView = searchController.searchBar

        self.refreshControl?.tintColor = UIColor(white: 0, alpha: 0.38)
        self.refreshControl?.addTarget(self, action: #selector(BookmarksTableViewController.handleRefresh(_:)), forControlEvents: UIControlEvents.ValueChanged)

        let longPressRecognizer = UILongPressGestureRecognizer(target: self, action: #selector(BookmarksTableViewController.longPress(_:)))
        self.view.addGestureRecognizer(longPressRecognizer)

        tableView.estimatedRowHeight = 120.0
        tableView.rowHeight = UITableViewAutomaticDimension
    }

    override func viewDidAppear(animated: Bool) {
        super.viewDidAppear(true)

        if Reachability.isConnectedToNetwork() == false {
            alertError("No Internet Connection", message: "Try again later when you're back online.")
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

    // MARK: - Bookmark stuff

    func loginSuccessfull(notification: NSNotification) {
        startFetchAllPostsTask()
    }

    func startFetchAllPostsTask() {
        loadingPostsSpinner.startAnimating()
        fetchAllPostsTask = Network.fetchAllPosts() { [weak self] bookmarks in
            self?.bookmarksArray = bookmarks
            self?.loadingPostsSpinner.stopAnimating()
            self?.loadingPosts.hidden = true;
            self?.tableView.reloadData()
        }
    }

    func showBookmark(currentUrl: NSURL?) {
        if let url = currentUrl {
            if defaults.boolForKey("openInSafari") == true {
                UIApplication.sharedApplication().openURL(url)
            } else if defaults.boolForKey("openInSafari") == false {
                let vc = SFSafariViewController(URL: url, entersReaderIfAvailable: true)
                presentViewController(vc, animated: true, completion: nil)
            }
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
        filteredBookmarks = bookmarksArray.filter { bookmark in
            let titleMatch = bookmark.title.lowercaseString.containsString(searchText.lowercaseString)
            let descriptionMatch = bookmark.description.lowercaseString.containsString(searchText.lowercaseString)
            let tagMatch = bookmark.tags.joinWithSeparator(" ").lowercaseString.containsString(searchText.lowercaseString)
            return titleMatch || descriptionMatch || tagMatch
        }
        tableView.reloadData()
    }

    // MARK: - Table view

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if searchController.active && searchController.searchBar.text != "" {
            return filteredBookmarks.count
        }
        return bookmarksArray.count
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
            bookmark = bookmarksArray[indexPath.row]
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
            cell.tagsLabel.hidden = true
        } else {
            cell.tagsLabel.hidden = false
            cell.tagsLabel.text = nil
            cell.tagsLabel.text = bookmark.tags.joinWithSeparator("  ")
            cell.tagsLabel.textColor = self.view.tintColor
        }

        if bookmark.shared == "no" {
            cell.titleLabel.textColor = UIColor.darkGrayColor()
            cell.titleLabel.text = "Private: " + bookmark.title
        } else {
            cell.titleLabel.textColor = UIColor.blackColor()
        }

        if bookmark.toread == "no" {
            cell.unreadIndicator.hidden = true
            cell.titleLabel.font = UIFont.preferredFontForTextStyle(UIFontTextStyleBody)
        } else {
            cell.unreadIndicator.hidden = false
            cell.titleLabel.font = UIFont.preferredFontForTextStyle(UIFontTextStyleHeadline)
        }

        return cell
    }

    override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        var bookmark: BookmarkItem

        if searchController.active && searchController.searchBar.text != "" {
            bookmark = filteredBookmarks[indexPath.row]
        } else {
            bookmark = bookmarksArray[indexPath.row]
        }

        if ((defaults.boolForKey("markAsRead") == true) && bookmark.toread == "yes") {
            self.addBookmarkTask = Network.addBookmark(bookmark.link, title: bookmark.title, description: bookmark.description, tags: bookmark.tags, dt: bookmark.date, shared: bookmark.shared, toread: "no") { resultCode in
                if resultCode == "done" {
                    bookmark.toread = "no"
                    self.tableView.reloadRowsAtIndexPaths([indexPath], withRowAnimation: .None)
                    self.showBookmark(bookmark.link)
                } else {
                    self.alertError("Something went wrong", message: resultCode)
                    return
                }
            }
        } else {
            self.showBookmark(bookmark.link)
        }
    }

    // MARK: - Navigation

    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if segue.identifier == "openSettingsModal" {
            let navigationController = segue.destinationViewController as! UINavigationController
            let vc = navigationController.topViewController as! SettingsModalViewController
            let count = String(bookmarksArray.count)
            vc.bookmarkCount = count+" bookmarks"
        } else if segue.identifier == "openEditBookmarkModal" {
            let navigationController = segue.destinationViewController as! UINavigationController
            let vc = navigationController.topViewController as! AddBookmarkTableViewController
            vc.passedUrl = urlToPass
            vc.passedTitle = titleToPass
            vc.passedDescription = descriptionToPass
            vc.passedTags = tagsToPass
            vc.toreadValue = toreadToPass
            vc.sharedValue = sharedToPass
        }
    }

    @IBAction func unwindSettingsModal(segue: UIStoryboardSegue) {
    }

    @IBAction func unwindAddBookmarkModal(segue: UIStoryboardSegue) {
        startFetchAllPostsTask()
    }

    // MARK: - Editing

    func longPress(longPressGestureRecognizer: UILongPressGestureRecognizer) {
        if longPressGestureRecognizer.state == UIGestureRecognizerState.Began {

            let touchPoint = longPressGestureRecognizer.locationInView(self.view)

            if let indexPath = tableView.indexPathForRowAtPoint(touchPoint) {
                var bookmark: BookmarkItem

                if searchController.active && searchController.searchBar.text != "" {
                    bookmark = filteredBookmarks[indexPath.row]
                } else {
                    bookmark = bookmarksArray[indexPath.row]
                }

                let alert = UIAlertController(title: bookmark.title, message: nil, preferredStyle: UIAlertControllerStyle.ActionSheet)

                if bookmark.toread == "yes" {
                    alert.addAction(UIAlertAction(title: "Mark as Read", style: UIAlertActionStyle.Default, handler: { action in
                        self.addBookmarkTask = Network.addBookmark(bookmark.link, title: bookmark.title, description: bookmark.description, tags: bookmark.tags, dt: bookmark.date, shared: bookmark.shared, toread: "no") { resultCode in
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
                        self.addBookmarkTask = Network.addBookmark(bookmark.link, title: bookmark.title, description: bookmark.description, tags: bookmark.tags, dt: bookmark.date, shared: bookmark.shared, toread: "yes") { resultCode in
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

                alert.addAction(UIAlertAction(title: "Edit", style: UIAlertActionStyle.Default, handler: { action in
                    self.urlToPass = bookmark.link.absoluteString
                    self.titleToPass = bookmark.title
                    self.descriptionToPass = bookmark.description
                    self.tagsToPass = bookmark.tags.joinWithSeparator(" ")
                    self.toreadToPass = bookmark.toread
                    self.sharedToPass = bookmark.shared
                    self.performSegueWithIdentifier("openEditBookmarkModal", sender: self)
                }))
                alert.addAction(UIAlertAction(title: "Delete", style: UIAlertActionStyle.Destructive, handler: { action in
                    self.deleteBookmarkTask = Network.deleteBookmark(bookmark.link) { resultCode in
                        if resultCode == "done" {
                            self.bookmarksArray.removeAtIndex(indexPath.row)
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

// MARK: - Search result update

extension BookmarksTableViewController: UISearchResultsUpdating {
    func updateSearchResultsForSearchController(searchController: UISearchController) {
        filterContentForSearchText(searchController.searchBar.text!)
    }
}