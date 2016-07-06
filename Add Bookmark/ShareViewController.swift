//
//  ShareViewController.swift
//  Add Bookmark
//
//  Created by Mathias Lindholm on 04.07.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit
import Social

class ShareViewController: SLComposeServiceViewController {
    let defaults = NSUserDefaults(suiteName: "group.ml.simplepin")!
    var addBookmarkTask: NSURLSessionTask?

    override func isContentValid() -> Bool {
        if contentText.isEmpty {
            return false
        }
        return true
    }

    override func didSelectPost() {
        if let item = extensionContext?.inputItems.first as? NSExtensionItem {
            if let itemProvider = item.attachments?.first as? NSItemProvider {
                if itemProvider.hasItemConformingToTypeIdentifier("public.url") {
                    itemProvider.loadItemForTypeIdentifier("public.url", options: nil, completionHandler: { (url, error) -> Void in
                        if let shareURL = url as? NSURL {

                            self.addBookmarkTask = self.addBookmark(shareURL, title: self.contentText) { resultCode in
                                if resultCode == "done" {
                                    NSNotificationCenter.defaultCenter().postNotificationName("bookmarkAdded", object: nil)
                                    self.extensionContext?.completeRequestReturningItems([], completionHandler:nil)
                                } else {
                                    let alert = UIAlertController(title: "Something Went Wrong", message: resultCode, preferredStyle: UIAlertControllerStyle.Alert)
                                    alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.Cancel, handler: nil))
                                    self.presentViewController(alert, animated: true, completion: nil)
                                }
                            }

                        }
                    })
                }
            }
        }
    }

    override func configurationItems() -> [AnyObject]! {
        return []
    }

    override func viewDidDisappear(animated: Bool) {
        super.viewDidDisappear(animated)
        addBookmarkTask?.cancel()
    }

    func addBookmark(bookmarkUrl: NSURL, title: String, description: String = "", tags: [String] = [], dt: NSDate? = nil, replace: String = "yes", shared: String = "yes", toread: String = "no", completion: (String?) -> Void) -> NSURLSessionTask? {
        let userToken = defaults.stringForKey("userToken")! as String
        let urlString = bookmarkUrl.absoluteString

        let urlQuery = NSURLComponents()
        urlQuery.scheme = "https"
        urlQuery.host = "api.pinboard.in"
        urlQuery.path = "/v1/posts/add"
        urlQuery.queryItems = [
            NSURLQueryItem(name: "url", value: urlString),
            NSURLQueryItem(name: "description", value: title),
            NSURLQueryItem(name: "auth_token", value: userToken),
            NSURLQueryItem(name: "format", value: "json"),
        ]

        guard let url = urlQuery.URL else {
            completion(nil)
            return nil
        }

        print(urlQuery.URL)

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