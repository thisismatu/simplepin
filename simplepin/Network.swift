//
//  Network.swift
//  simplepin
//
//  Created by Mathias Lindholm on 29.3.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import Foundation

struct Network {

    // MARK: Fetch posts
    static func fetchAllPosts(completion: ([BookmarkItem]) -> Void) -> NSURLSessionTask? {
        let defaults = NSUserDefaults.standardUserDefaults()
        let userToken = defaults.stringForKey("userToken")! as String
        defaults.setObject(NSDate(), forKey: "lastUpdateDate")

        guard let url = NSURL(string: "https://api.pinboard.in/v1/posts/all?auth_token=\(userToken)&format=json") else {
            completion([])
            return nil
        }

        let task = NSURLSession.sharedSession().dataTaskWithURL(url) { (data, httpResponse, error) -> Void in
            dispatch_async(dispatch_get_main_queue(), { () -> Void in
                guard let data = data where error == nil else {
                    completion([])
                    return
                }
                let optionalBookmarks = parseJSONData(data)
                completion(optionalBookmarks)
            })
        }

        task.resume()
        return task
    }

    static func parseJSONData(data: NSData) -> [BookmarkItem] {
        var bookmarks = [BookmarkItem]()
        do {
            if let jsonObject = try NSJSONSerialization.JSONObjectWithData(data, options: []) as? [AnyObject] {
                for item in jsonObject {
                    guard let bookmarkDict = item as? [String: AnyObject],
                        let bookmark = BookmarkItem(json: bookmarkDict)
                        else { continue }
                    bookmarks.append(bookmark)
                }
            }
        } catch {
            debugPrint("Error parsing JSON")
        }
        return bookmarks
    }

    // MARK: Fetch API Token
    static func fetchApiToken(username: String, _ password: String, completion: (String?) -> Void) -> NSURLSessionTask? {
        guard let url = NSURL(string: "https://\(username):\(password)@api.pinboard.in/v1/user/api_token/?format=json") else {
            completion(nil)
            return nil
        }
        let task = NSURLSession.sharedSession().dataTaskWithURL(url) { (data, httpResponse, error) -> Void in
            dispatch_async(dispatch_get_main_queue(), { () -> Void in
                guard let data = data where error == nil else {
                    completion(nil)
                    return
                }
                let userToken = parseAPIToken(data)
                completion(userToken)
            })
        }

        task.resume()
        return task
    }

    static func parseAPIToken(data: NSData) -> String? {
        if let jsonObject = (try? NSJSONSerialization.JSONObjectWithData(data, options: [])) as? [String: AnyObject] {
            return jsonObject["result"] as? String
        }
        return nil
    }

    // MARK: Check for updates
    static func checkForUpdates(completion: (NSDate?) -> Void) -> NSURLSessionTask? {
        let defaults = NSUserDefaults.standardUserDefaults()
        let userToken = defaults.stringForKey("userToken")! as String

        guard let url = NSURL(string: "https://api.pinboard.in/v1/posts/update?auth_token=\(userToken)&format=json") else {
            completion(nil)
            return nil
        }
        let task = NSURLSession.sharedSession().dataTaskWithURL(url) { (data, httpResponse, error) -> Void in
            dispatch_async(dispatch_get_main_queue(), { () -> Void in
                guard let data = data where error == nil else {
                    completion(nil)
                    return
                }
                let updateDate = parseUpdate(data)
                completion(updateDate)
            })
        }

        task.resume()
        return task
    }

    static func parseUpdate(data: NSData) -> NSDate? {
        if let jsonObject = (try? NSJSONSerialization.JSONObjectWithData(data, options: [])) as? [String: AnyObject] {
            let formatter = NSDateFormatter()
            formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:SSZ"
            let dateString = jsonObject["update_time"] as? String
            return formatter.dateFromString(dateString!)
        }
        return nil
    }

    // MARK: Delete bookmark
    static func deleteBookmark(bookmarkUrl: NSURL, completion: (String?) -> Void) -> NSURLSessionTask? {
        let defaults = NSUserDefaults.standardUserDefaults()
        let userToken = defaults.stringForKey("userToken")! as String
        let urlString = bookmarkUrl.absoluteString

        guard let urlEncode = urlString.stringByAddingPercentEncodingWithAllowedCharacters(.URLHostAllowedCharacterSet()),
            let url = NSURL(string: "https://api.pinboard.in/v1/posts/delete?auth_token=\(userToken)&url=\(urlEncode)&format=json") else {
            completion(nil)
            return nil
        }

        let task = NSURLSession.sharedSession().dataTaskWithURL(url) { (data, httpResponse, error) -> Void in
            dispatch_async(dispatch_get_main_queue(), { () -> Void in
                guard let data = data where error == nil else {
                    completion(nil)
                    return
                }
                let resultCode = parseDeleteBookmark(data)
                completion(resultCode)
            })
        }

        task.resume()
        return task
    }

    static func parseDeleteBookmark(data: NSData) -> String? {
        if let jsonObject = (try? NSJSONSerialization.JSONObjectWithData(data, options: [])) as? [String: AnyObject] {
            return jsonObject["result_code"] as? String
        }
        return nil
    }

    // MARK: Add bookmark
    static func addBookmark(bookmarkUrl: NSURL, title: String, description: String, tags: [String], dt: NSDate, toread: String, completion: (String?) -> Void) -> NSURLSessionTask? {
        let defaults = NSUserDefaults.standardUserDefaults()
        let userToken = defaults.stringForKey("userToken")! as String
        let urlString = bookmarkUrl.absoluteString
        let tagsString = tags.joinWithSeparator(" ")
        let formatter = NSDateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:SSZ"
        let dateString = formatter.stringFromDate(dt)

        guard let urlEncode = urlString.stringByAddingPercentEncodingWithAllowedCharacters(.URLHostAllowedCharacterSet()),
            let titleEncode = title.stringByAddingPercentEncodingWithAllowedCharacters(.URLHostAllowedCharacterSet()),
            let descriptionEncode = description.stringByAddingPercentEncodingWithAllowedCharacters(.URLHostAllowedCharacterSet()),
            let tagsEncode = tagsString.stringByAddingPercentEncodingWithAllowedCharacters(.URLHostAllowedCharacterSet()),
            let url = NSURL(string: "https://api.pinboard.in/v1/posts/add?auth_token=\(userToken)&url=\(urlEncode)&description=\(titleEncode)&extended=\(descriptionEncode)&tags=\(tagsEncode)&dt=\(dateString)&toread=\(toread)&format=json") else {
                completion(nil)
                return nil
        }

        let task = NSURLSession.sharedSession().dataTaskWithURL(url) { (data, httpResponse, error) -> Void in
            dispatch_async(dispatch_get_main_queue(), { () -> Void in
                guard let data = data where error == nil else {
                    completion(nil)
                    return
                }
                let resultCode = parseAddBookmark(data)
                completion(resultCode)
            })
        }

        task.resume()
        return task
    }

    static func parseAddBookmark(data: NSData) -> String? {
        if let jsonObject = (try? NSJSONSerialization.JSONObjectWithData(data, options: [])) as? [String: AnyObject] {
            return jsonObject["result_code"] as? String
        }
        return nil
    }

}