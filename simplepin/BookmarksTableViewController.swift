//
//  BookmarksTableViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 29.2.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit
import Fabric
import Crashlytics
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
            let tags = tagsString?.componentsSeparatedByString(" ").filter({ !$0.isEmpty }),
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

class BookmarksTableViewController: UITableViewController, UISearchBarDelegate, UICollectionViewDelegate, UICollectionViewDataSource, UICollectionViewDelegateFlowLayout {
    let appDelegate = UIApplication.sharedApplication().delegate as? AppDelegate
    var bookmarksArray = [BookmarkItem]()
    var filteredBookmarks = [BookmarkItem]()
    var fetchAllPostsTask: NSURLSessionTask?
    var checkForUpdatesTask: NSURLSessionTask?
    var deleteBookmarkTask: NSURLSessionTask?
    var addBookmarkTask: NSURLSessionTask?
    var fetchTagsTask: NSURLSessionTask?
    var bookmarkToPass = BookmarkItem?()
    var urlToPass: NSURL?
    var dontAddThisUrl: NSURL?
    let activityIndicator = UIActivityIndicatorView(activityIndicatorStyle: .Gray)
    let defaults = NSUserDefaults.standardUserDefaults()
    let searchController = UISearchController(searchResultsController: nil)
    let notifications = NSNotificationCenter.defaultCenter()
    var searchIsActive: Bool {return searchController.active && searchController.searchBar.text != ""}
    var searchTimer: NSTimer?

    @IBOutlet var emptyState: UIView!
    @IBOutlet var emptyStateSpinner: UIActivityIndicatorView!
    @IBOutlet var emptyStateLabel: UILabel!

    override func viewDidLoad() {
        super.viewDidLoad()

        notifications.addObserverForName("loginSuccessful", object: nil, queue: nil, usingBlock: successfullAddOrLogin)
        notifications.addObserverForName("bookmarkAdded", object: nil, queue: nil, usingBlock: successfullAddOrLogin)
        notifications.addObserverForName("handleRequestError", object: nil, queue: nil, usingBlock: handleRequestError)
        notifications.addObserverForName("tokenChanged", object: nil, queue: nil, usingBlock: tokenChanged)
        notifications.addObserver(self, selector: #selector(BookmarksTableViewController.applicationWillEnterForeground), name: UIApplicationWillEnterForegroundNotification, object: nil)

        if defaults.stringForKey("userToken") != nil {
            startFetchAllPostsTask()
        }

        configureSearchController()

        self.refreshControl?.tintColor = UIColor(white: 0, alpha: 0.38)
        self.refreshControl?.addTarget(self, action: #selector(BookmarksTableViewController.handleRefresh(_:)), forControlEvents: UIControlEvents.ValueChanged)

        let longPressRecognizer = UILongPressGestureRecognizer(target: self, action: #selector(BookmarksTableViewController.longPress(_:)))
        self.view.addGestureRecognizer(longPressRecognizer)

        tableView.estimatedRowHeight = 120.0
        tableView.rowHeight = UITableViewAutomaticDimension
    }

    override func viewDidDisappear(animated: Bool) {
        super.viewDidDisappear(animated)
        checkForUpdatesTask?.cancel()
        deleteBookmarkTask?.cancel()
        fetchTagsTask?.cancel()
    }

    func applicationWillEnterForeground() {
        checkPasteboard()
    }

    func configureSearchController() {
        searchController.searchBar.delegate = self
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
    }

    func checkPasteboard() {
        if let pasteboardUrl = UIPasteboard.generalPasteboard().URL {
            if !bookmarksArray.contains( { $0.link == pasteboardUrl }) && self.dontAddThisUrl != pasteboardUrl {
                let alert = UIAlertController(title: "Add Link to Pinboard?", message: "\(pasteboardUrl)", preferredStyle: UIAlertControllerStyle.Alert)
                alert.addAction(UIAlertAction(title: "Cancel", style: .Cancel, handler: { action in
                    self.dontAddThisUrl = pasteboardUrl
                }))
                alert.addAction(UIAlertAction(title: "Add", style: .Default, handler: { action in
                    self.urlToPass = pasteboardUrl
                    self.performSegueWithIdentifier("openEditBookmarkModal", sender: self)
                }))
                self.presentViewController(alert, animated: true, completion: nil)
            }
        }
    }

    func showEmptyState(message: String, spinner: Bool) {
        emptyState.hidden = false
        emptyStateLabel.text = message

        if spinner == true {
            emptyStateSpinner.startAnimating()
        } else {
            emptyStateSpinner.stopAnimating()
        }
    }

    func hideEmptyState() {
        emptyState.hidden = true
        emptyStateSpinner.stopAnimating()
    }

    // MARK: - Events

    func successfullAddOrLogin(notification: NSNotification) {
        startFetchAllPostsTask()
    }

    func handleRequestError(notification: NSNotification) {
        if let info = notification.userInfo as? Dictionary<String, String> {
            guard let title = info["title"],
                let message = info["message"] else {
                    return
            }
            alertError(title, message: message)
        }
    }

    func tokenChanged(notification: NSNotification) {
        dismissViewControllerAnimated(true, completion: nil)
        appDelegate?.logOut()
    }

    // MARK: - Bookmark stuff

    func startFetchAllPostsTask() {
        if Reachability.isConnectedToNetwork() == false {
            showEmptyState("No internet connection.", spinner: false)
        } else {
            showEmptyState("Loading bookmarks…", spinner: true)
            fetchAllPostsTask = Network.fetchAllPosts() { [weak self] bookmarks in
                self?.bookmarksArray = bookmarks
                if self?.bookmarksArray.count > 0 {
                    self?.hideEmptyState()
                } else {
                    self?.showEmptyState("No bookmarks.", spinner: false)
                }
                self?.defaults.setObject(NSDate(), forKey: "lastUpdateDate")
                self?.tableView.reloadData()
                self?.checkPasteboard()
                self?.filterContentForSearchText(self?.searchController.searchBar.text ?? "")
            }
            fetchTagsTask = Network.fetchTags() { userTags in
                self.defaults.setObject(userTags, forKey: "userTags")
            }
        }
    }

    func showBookmark(currentUrl: NSURL?) {
        if let url = currentUrl {
            if defaults.boolForKey("openInSafari") == true {
                UIApplication.sharedApplication().openURL(url)
            } else {
                let vc = SFSafariViewController(URL: url, entersReaderIfAvailable: true)
                presentViewController(vc, animated: true, completion: nil)
            }
        }
    }

    func handleRefresh(refreshControl: UIRefreshControl) {
        self.tableView.reloadData()
        if Reachability.isConnectedToNetwork() == false {
            alertError("Couldn't Refresh Bookmarks", message: "Try again when you're back online.")
        } else {
            checkForUpdatesTask = Network.checkForUpdates() { updateDate in
                let lastUpdateDate = self.defaults.objectForKey("lastUpdateDate") as? NSDate
                if lastUpdateDate > updateDate && self.bookmarksArray.isEmpty {
                    self.startFetchAllPostsTask()
                } else if lastUpdateDate < updateDate {
                    self.startFetchAllPostsTask()
                } else {
                    return
                }
            }
        }
        refreshControl.endRefreshing()
    }

    // MARK: - Search

    func filterContentForSearchText(searchText: String, scope: String = "All") {
        let searchTextArray = searchText.lowercaseString.componentsSeparatedByString(" ")
        var searchResults: [Set<BookmarkItem>] = []

        for item in searchTextArray where !item.isEmpty {
            let searchResult = bookmarksArray.filter { bookmark in
                let title = bookmark.title.lowercaseString.containsString(item)
                let description = bookmark.description.lowercaseString.containsString(item)
                let tags = bookmark.tags.joinWithSeparator(" ").lowercaseString.containsString(item)
                if scope == "Tag" {
                    return tags
                }
                return title || description || tags
            }
            searchResults.append(Set(searchResult))
        }

        if let first = searchResults.first {
            var result = first
            for item in searchResults[1..<searchResults.count] {
                result = result.intersect(item)
            }
            let sortedResult = result.sort({ $0.date > $1.date })
            filteredBookmarks = Array(sortedResult)
        } else {
            filteredBookmarks = []
        }

        if !searchText.isEmpty && filteredBookmarks.isEmpty {
            showEmptyState("Couldn't find \(searchText)", spinner: false)
        } else {
            hideEmptyState()
        }

        tableView.reloadData()
    }

    func searchBar(searchBar: UISearchBar, textDidChange searchText: String) {
        searchTimer?.invalidate()
        searchTimer = NSTimer.scheduledTimerWithTimeInterval(2.0, target: self, selector: #selector(BookmarksTableViewController.logSearchQuery), userInfo: searchText, repeats: false)
    }

    func logSearchQuery() {
        if let search = searchTimer?.userInfo as? String {
            if search.characters.count > 2 {
                Answers.logSearchWithQuery(search, customAttributes: nil)
            }
        }
    }

    // MARK: - Table view

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if searchIsActive {
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
        if searchIsActive {
            bookmark = filteredBookmarks[indexPath.row]
        } else {
            bookmark = bookmarksArray[indexPath.row]
        }

        cell.titleLabel.text = bookmark.title

        if defaults.boolForKey("relativeDate") == true {
            cell.dateLabel.text = bookmark.date.timeAgo()
        } else {
            cell.dateLabel.text = formatter.stringFromDate(bookmark.date)
        }

        if bookmark.description.isEmpty {
            cell.descriptionLabel.hidden = true
        } else {
            cell.descriptionLabel.hidden = false
            cell.descriptionLabel.text = bookmark.description
        }

        if bookmark.tags.count == 0 {
            cell.collectionView.collectionViewLayout.invalidateLayout()
            cell.collectionView.hidden = true
        } else {
            cell.collectionView.hidden = false
        }

        if bookmark.toread == "no" {
            cell.unreadIndicator.hidden = true
            cell.titleLabel.font = UIFont.preferredFontForTextStyle(UIFontTextStyleBody)
        } else {
            cell.unreadIndicator.hidden = false
            cell.titleLabel.font = UIFont.preferredFontForTextStyle(UIFontTextStyleHeadline)
        }

        cell.privateIndicator.hidden = bookmark.shared == "no" ? false : true

        return cell
    }

    override func tableView(tableView: UITableView, willDisplayCell cell: UITableViewCell, forRowAtIndexPath indexPath: NSIndexPath) {
        let cell = cell as! BookmarkTableViewCell
        cell.setCollectionViewDataSourceDelegate(self, forRow: indexPath.row)
    }

    override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        var bookmark: BookmarkItem
        if searchIsActive {
            bookmark = filteredBookmarks[indexPath.row]
        } else {
            bookmark = bookmarksArray[indexPath.row]
        }

        if ((defaults.boolForKey("markAsRead") == true) && bookmark.toread == "yes") {
            if Reachability.isConnectedToNetwork() == true {
                self.addBookmarkTask = Network.addBookmark(bookmark.link, title: bookmark.title, description: bookmark.description, tags: bookmark.tags, dt: bookmark.date, shared: bookmark.shared, toread: "no") { resultCode in
                    if resultCode == "done" {
                        bookmark.toread = "no"
                        self.tableView.reloadRowsAtIndexPaths([indexPath], withRowAnimation: .None)
                    }
                }
            }
        }

        self.tableView.deselectRowAtIndexPath(indexPath, animated: true)
        self.showBookmark(bookmark.link)
    }

    // MARK: - Collection View

    func collectionView(collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        if searchIsActive {
            return filteredBookmarks[collectionView.tag].tags.count
        }
        return bookmarksArray[collectionView.tag].tags.count
    }

    func collectionView(collectionView: UICollectionView,layout collectionViewLayout: UICollectionViewLayout, sizeForItemAtIndexPath indexPath: NSIndexPath) -> CGSize {

        var bookmark: BookmarkItem
        if searchIsActive {
            bookmark = filteredBookmarks[collectionView.tag]
        } else {
            bookmark = bookmarksArray[collectionView.tag]
        }

        let tag = bookmark.tags[indexPath.row]
        let size = tag.sizeWithAttributes([NSFontAttributeName: UIFont.preferredFontForTextStyle(UIFontTextStyleSubheadline)])
        let finalSize = CGSize(width: size.width + 12, height: 20)

        return finalSize
    }

    func collectionView(collectionView: UICollectionView, cellForItemAtIndexPath indexPath: NSIndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCellWithReuseIdentifier("TagCell", forIndexPath: indexPath) as! TagCollectionViewCell

        var bookmark: BookmarkItem
        if searchIsActive {
            bookmark = filteredBookmarks[collectionView.tag]
        } else {
            bookmark = bookmarksArray[collectionView.tag]
        }

        cell.tagLabel.text = bookmark.tags[indexPath.row]

        return cell
    }

    func collectionView(collectionView: UICollectionView, didSelectItemAtIndexPath indexPath: NSIndexPath) {
        var bookmark: BookmarkItem
        if searchIsActive {
            bookmark = filteredBookmarks[collectionView.tag]
        } else {
            bookmark = bookmarksArray[collectionView.tag]
        }
        searchController.active = true
        searchController.searchBar.text = bookmark.tags[indexPath.row]
        filterContentForSearchText(bookmark.tags[indexPath.row], scope: "Tag")
        collectionView.deselectItemAtIndexPath(indexPath, animated: true)
    }

    // MARK: - Navigation

    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if segue.identifier == "openEditBookmarkModal" {
            let navigationController = segue.destinationViewController as! UINavigationController
            if let vc = navigationController.topViewController as? AddBookmarkTableViewController {
                if bookmarkToPass != nil {
                    vc.bookmark = bookmarkToPass
                } else {
                    vc.passedUrl = urlToPass
                }
                bookmarkToPass = nil
            }
        }
    }

    @IBAction func unwindSettingsModal(segue: UIStoryboardSegue) {
        self.tableView.reloadData()
    }

    @IBAction func unwindAddBookmarkModal(segue: UIStoryboardSegue) { }

    // MARK: - Editing

    func longPress(longPressGestureRecognizer: UILongPressGestureRecognizer) {
        if longPressGestureRecognizer.state == UIGestureRecognizerState.Began {
            let touchPoint = longPressGestureRecognizer.locationInView(self.view)

            if let indexPath = tableView.indexPathForRowAtPoint(touchPoint) {
                var bookmark: BookmarkItem
                if searchIsActive {
                    bookmark = filteredBookmarks[indexPath.row]
                } else {
                    bookmark = bookmarksArray[indexPath.row]
                }

                let alertController = UIAlertController(title: bookmark.title, message: nil, preferredStyle: UIAlertControllerStyle.ActionSheet)

                func actionReadUnread(status: String) -> UIAlertAction {
                    let title = status == "yes" ? "Read" : "Unread"
                    let toread = status == "yes" ? "no" : "yes"
                    let action = UIAlertAction(title: "Mark as \(title)", style: UIAlertActionStyle.Default, handler: { action in
                        self.addBookmarkTask = Network.addBookmark(bookmark.link, title: bookmark.title, description: bookmark.description, tags: bookmark.tags, dt: bookmark.date, shared: bookmark.shared, toread: toread) { resultCode in
                            if resultCode == "done" {
                                bookmark.toread = toread
                                self.tableView.reloadRowsAtIndexPaths([indexPath], withRowAnimation: .None)
                            } else {
                                self.alertErrorWithReachability("Something Went Wrong", message: resultCode)
                                return
                            }
                        }
                    })
                    return action
                }
                let actionEdit = UIAlertAction(title: "Edit", style: UIAlertActionStyle.Default, handler: { action in
                    self.bookmarkToPass = bookmark
                    self.performSegueWithIdentifier("openEditBookmarkModal", sender: self)
                })
                let actionDelete = UIAlertAction(title: "Delete", style: UIAlertActionStyle.Destructive, handler: { action in
                    self.deleteBookmarkTask = Network.deleteBookmark(bookmark.link) { resultCode in
                        if resultCode == "done" {
                            if self.searchController.active {
                                self.filteredBookmarks.removeAtIndex(indexPath.row)
                                self.bookmarksArray.removeAtIndex(indexPath.row)
                            } else {
                                self.bookmarksArray.removeAtIndex(indexPath.row)
                            }
                            self.defaults.setObject(self.bookmarksArray.count, forKey: "bookmarkCount")
                            self.tableView.deleteRowsAtIndexPaths([indexPath], withRowAnimation: .Left)
                            self.tableView.reloadData()
                        } else {
                            self.alertErrorWithReachability("Something Went Wrong", message: resultCode)
                            return
                        }
                    }
                })
                let actionCancel = UIAlertAction(title: "Cancel", style: UIAlertActionStyle.Cancel, handler: nil)

                alertController.addAction(actionReadUnread(bookmark.toread))
                alertController.addAction(actionEdit)
                alertController.addAction(actionDelete)
                alertController.addAction(actionCancel)

                if let popoverController = alertController.popoverPresentationController {
                    popoverController.sourceView = tableView.cellForRowAtIndexPath(indexPath)
                    popoverController.sourceRect = tableView.cellForRowAtIndexPath(indexPath)!.bounds
                }
                
                self.presentViewController(alertController, animated: true, completion: nil)
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

// implement Hashable to support Sets (and Equatable to support Hashable)
extension BookmarkItem: Hashable, Equatable {
    var hashValue: Int { return title.hashValue ^ description.hashValue }
}
func ==(lhs: BookmarkItem, rhs: BookmarkItem) -> Bool {
    return lhs.title == rhs.title && lhs.description == rhs.description
}