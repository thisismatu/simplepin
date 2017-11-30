//
//  ShareViewController.swift
//  Add Bookmark
//
//  Created by Mathias Lindholm on 04.07.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit
import Social

struct Bookmark {
    var url: NSURL
    var description: String
    var tags: [String]
    var personal: Bool
    var toread: Bool

    init() {
        self.url = NSURL()
        self.description = ""
        self.tags = []
        self.personal = false
        self.toread = false
    }
}

class ShareViewController: SLComposeServiceViewController, OptionsTableViewDelegate {
    let groupDefaults = NSUserDefaults(suiteName: "group.ml.simplepin")!
    var addBookmarkTask: NSURLSessionTask?
    var bookmark = Bookmark()

    override func viewDidLoad() {
        super.viewDidLoad()
        getUrl()
        bookmark.personal = groupDefaults.boolForKey("privateByDefault")
        bookmark.toread = groupDefaults.boolForKey("toreadByDefault")

        if groupDefaults.stringForKey("userToken") == nil {
            let alert = UIAlertController(title: "Please Log In", message: "Sharing requires you to be logged in. Open Simplepin, log in and try again.", preferredStyle: UIAlertControllerStyle.Alert)
            alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.Cancel, handler: { _ in self.cancel() }))
            self.presentViewController(alert, animated: true, completion: nil)
        }

        var openExtensionCount = groupDefaults.objectForKey("openShareExtension") as? [Int] ?? [Int]()
        openExtensionCount.append(1)
        groupDefaults.setObject(openExtensionCount, forKey: "openShareExtension")
    }

    override func viewDidDisappear(animated: Bool) {
        super.viewDidDisappear(animated)
        addBookmarkTask?.cancel()
    }

    override func isContentValid() -> Bool {
        if contentText.isEmpty {
            return false
        }
        if groupDefaults.stringForKey("userToken") == nil {
            return false
        }
        return true
    }

    override func didSelectPost() {
        self.addBookmarkTask = self.addBookmark(self.bookmark.url, title: self.contentText, shared: self.bookmark.personal, description: self.bookmark.description, tags: self.bookmark.tags, toread: self.bookmark.toread) { resultCode in

            if resultCode != "done" {
                let alert = UIAlertController(title: "Something Went Wrong", message: resultCode, preferredStyle: UIAlertControllerStyle.Alert)
                alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.Cancel, handler: nil))
                self.presentViewController(alert, animated: true, completion: nil)
                return
            }

            var postToPinboardCount = self.groupDefaults.objectForKey("postToPinboard") as? [Int] ?? [Int]()
            postToPinboardCount.append(1)
            self.groupDefaults.setObject(postToPinboardCount, forKey: "postToPinboard")

            self.extensionContext?.completeRequestReturningItems([], completionHandler:nil)
        }
    }

    override func configurationItems() -> [AnyObject]! {
        return [optionsConfigurationItem]
    }

    lazy var optionsConfigurationItem: SLComposeSheetConfigurationItem = {
        let item = SLComposeSheetConfigurationItem()
        item.title = "Options"
        item.tapHandler = self.showOptions
        return item
    }()

    func showOptions() {
        let vc = OptionsTableViewController(style: .Plain)
        vc.passedBookmark = bookmark
        vc.delegate = self
        self.pushConfigurationViewController(vc)
    }

    func getUrl() {
        if let item = extensionContext?.inputItems.first as? NSExtensionItem {
            if let itemProvider = item.attachments?.first as? NSItemProvider {
                if itemProvider.hasItemConformingToTypeIdentifier("public.url") {
                    itemProvider.loadItemForTypeIdentifier("public.url", options: nil, completionHandler: { (url, error) -> Void in
                        if let shareURL = url as? NSURL {
                            self.bookmark.url = shareURL
                        }
                    })
                }
            }
        }
    }

    func didEnterInformation(data: Bookmark) {
        bookmark = data
        self.popConfigurationViewController()
    }

    func addBookmark(url: NSURL, title: String, shared: Bool, description: String = "", tags: [String] = [], toread: Bool = false, completion: (String?) -> Void) -> NSURLSessionTask? {
        let userToken = groupDefaults.stringForKey("userToken")! as String
        let urlString = url.absoluteString
        let tagsString = tags.joinWithSeparator(" ")
        let shared = !shared

        let urlQuery = NSURLComponents()
        urlQuery.scheme = "https"
        urlQuery.host = "api.pinboard.in"
        urlQuery.path = "/v1/posts/add"
        urlQuery.queryItems = [
            NSURLQueryItem(name: "url", value: urlString),
            NSURLQueryItem(name: "description", value: title),
            NSURLQueryItem(name: "extended", value: description),
            NSURLQueryItem(name: "tags", value: tagsString),
            NSURLQueryItem(name: "shared", value: shared.boolToString),
            NSURLQueryItem(name: "toread", value: toread.boolToString),
            NSURLQueryItem(name: "auth_token", value: userToken),
            NSURLQueryItem(name: "format", value: "json"),
        ]

        guard let url = urlQuery.URL else {
            completion(nil)
            return nil
        }

        let task = NSURLSession.sharedSession().dataTaskWithURL(url) { (data, httpResponse, error) -> Void in
            dispatch_async(dispatch_get_main_queue(), { () -> Void in
                guard let data = data where error == nil else {
                    completion(nil)
                    return
                }
                let resultCode = self.parseJSON(data, key: "result_code")
                completion(resultCode)
            })
        }

        task.resume()
        return task
    }

    func parseJSON(data: NSData, key: String) -> String? {
        if let jsonObject = (try? NSJSONSerialization.JSONObjectWithData(data, options: [])) as? [String: AnyObject] {
            return jsonObject["\(key)"] as? String
        }
        return nil
    }
}
