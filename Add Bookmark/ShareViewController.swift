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
    var shared: Bool
    var toread: Bool

    init() {
        self.url = NSURL()
        self.description = ""
        self.tags = []
        self.shared = NSUserDefaults(suiteName: "group.ml.simplepin")!.boolForKey("privateByDefault")
        self.toread = false
    }
}

class ShareViewController: SLComposeServiceViewController, OptionsTableViewDelegate {
    let defaults = NSUserDefaults(suiteName: "group.ml.simplepin")!
    var addBookmarkTask: NSURLSessionTask?
    var bookmark = Bookmark()

    override func viewDidLoad() {
        super.viewDidLoad()
        getUrl()
        bookmark.shared = defaults.boolForKey("privateByDefault")
    }

    override func viewDidDisappear(animated: Bool) {
        super.viewDidDisappear(animated)
        addBookmarkTask?.cancel()
    }

    override func isContentValid() -> Bool {
        if contentText.isEmpty {
            return false
        }
        return true
    }

    override func didSelectPost() {
        let sharedValue = self.bookmark.shared == true ? "no" : "yes"
        let toreadValue = self.bookmark.toread == true ? "yes" : "no"

        self.addBookmarkTask = self.addBookmark(self.bookmark.url, title: self.contentText, description: self.bookmark.description, tags: self.bookmark.tags, shared: sharedValue, toread: toreadValue) { resultCode in
            if resultCode == "done" {
                self.extensionContext?.completeRequestReturningItems([], completionHandler:nil)
            } else {
                let alert = UIAlertController(title: "Something Went Wrong", message: resultCode, preferredStyle: UIAlertControllerStyle.Alert)
                alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.Cancel, handler: nil))
                self.presentViewController(alert, animated: true, completion: nil)
            }
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

    func addBookmark(url: NSURL, title: String, description: String = "", tags: [String] = [], shared: String = "yes", toread: String = "no", completion: (String?) -> Void) -> NSURLSessionTask? {
        guard let userToken = defaults.stringForKey("userToken") else { return nil }
        let urlString = url.absoluteString
        let tagsString = tags.joinWithSeparator(" ")

        let urlQuery = NSURLComponents()
        urlQuery.scheme = "https"
        urlQuery.host = "api.pinboard.in"
        urlQuery.path = "/v1/posts/add"
        urlQuery.queryItems = [
            NSURLQueryItem(name: "url", value: urlString),
            NSURLQueryItem(name: "description", value: title),
            NSURLQueryItem(name: "extended", value: description),
            NSURLQueryItem(name: "tags", value: tagsString),
            NSURLQueryItem(name: "shared", value: shared),
            NSURLQueryItem(name: "toread", value: toread),
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