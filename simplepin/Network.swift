//
//  Network.swift
//  simplepin
//
//  Created by Mathias Lindholm on 29.3.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import Foundation
import SystemConfiguration

struct Network {

    // MARK: - Fetch API Token
    static func fetchApiToken(username: String, _ password: String, completion: (String?) -> Void) -> NSURLSessionTask? {

        // TODO: url query item for fetching
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

    // MARK: - Fetch posts
    static func fetchAllPosts(fromdt: NSDate? = nil, completion: ([BookmarkItem]) -> Void) -> NSURLSessionTask? {
        let defaults = NSUserDefaults.standardUserDefaults()
        let userToken = defaults.stringForKey("userToken")! as String

        let urlQuery = NSURLComponents()
        urlQuery.scheme = "https"
        urlQuery.host = "api.pinboard.in"
        urlQuery.path = "/v1/posts/all"
        urlQuery.queryItems = [
            NSURLQueryItem(name: "fromdt", value: fromdt?.toString()),
            NSURLQueryItem(name: "auth_token", value: userToken),
            NSURLQueryItem(name: "format", value: "json"),
        ]

        guard let url = urlQuery.URL else {
            completion([])
            return nil
        }

        let task = NSURLSession.sharedSession().dataTaskWithURL(url) { (data, httpResponse, error) -> Void in
            dispatch_async(dispatch_get_main_queue(), { () -> Void in
                guard let data = data where error == nil else {
                    if error?.code ==  NSURLErrorTimedOut {
                        NSNotificationCenter.defaultCenter().postNotificationName("handleRequestError", object: nil, userInfo: ["title": "Connection Timed Out", "message": "Try again when you're back online."])
                    } else if error?.code == 429 {
                        NSNotificationCenter.defaultCenter().postNotificationName("handleRequestError", object: nil, userInfo: ["message": "Too Many Requests", "message": "Try again in a couple of minutes"])
                    }
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
        let defaults = NSUserDefaults.standardUserDefaults()
        var bookmarks = [BookmarkItem]()
        do {
            if let jsonObject = try NSJSONSerialization.JSONObjectWithData(data, options: []) as? [AnyObject] {
                defaults.setObject(jsonObject.count, forKey: "bookmarkCount")
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

    // MARK: - Check for updates
    static func checkForUpdates(completion: (NSDate?) -> Void) -> NSURLSessionTask? {
        let defaults = NSUserDefaults.standardUserDefaults()
        let userToken = defaults.stringForKey("userToken")! as String

        let urlQuery = NSURLComponents()
        urlQuery.scheme = "https"
        urlQuery.host = "api.pinboard.in"
        urlQuery.path = "/v1/posts/update"
        urlQuery.queryItems = [
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
                let updateDate = parseUpdate(data)
                completion(updateDate)
            })
        }

        task.resume()
        return task
    }

    static func parseUpdate(data: NSData) -> NSDate? {
        if let jsonObject = (try? NSJSONSerialization.JSONObjectWithData(data, options: [])) as? [String: AnyObject] {
            let dateString = jsonObject["update_time"] as? String
            return dateString?.toDate()
        }
        return nil
    }

    // MARK: - Delete bookmark
    static func deleteBookmark(bookmarkUrl: NSURL, completion: (String?) -> Void) -> NSURLSessionTask? {
        let defaults = NSUserDefaults.standardUserDefaults()
        let userToken = defaults.stringForKey("userToken")! as String
        let urlString = bookmarkUrl.absoluteString

        let urlQuery = NSURLComponents()
        urlQuery.scheme = "https"
        urlQuery.host = "api.pinboard.in"
        urlQuery.path = "/v1/posts/delete"
        urlQuery.queryItems = [
            NSURLQueryItem(name: "url", value: urlString),
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

    // MARK: - Add bookmark
    static func addBookmark(bookmarkUrl: NSURL, title: String, description: String = "", tags: [String] = [], dt: NSDate? = nil, replace: String = "yes", shared: String = "yes", toread: String = "no", completion: (String?) -> Void) -> NSURLSessionTask? {
        let defaults = NSUserDefaults.standardUserDefaults()
        let userToken = defaults.stringForKey("userToken")! as String
        let urlString = bookmarkUrl.absoluteString
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
            NSURLQueryItem(name: "dt", value: dt?.toString()),
            NSURLQueryItem(name: "replace", value: replace),
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

    //MARK: - Get tags
    static func fetchTags(completion: ([String])? -> Void) -> NSURLSessionTask? {
        let defaults = NSUserDefaults.standardUserDefaults()
        let userToken = defaults.stringForKey("userToken")! as String

        let urlQuery = NSURLComponents()
        urlQuery.scheme = "https"
        urlQuery.host = "api.pinboard.in"
        urlQuery.path = "/v1/tags/get"
        urlQuery.queryItems = [
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
                let userTags = parseTags(data)
                completion(userTags)
            })
        }

        task.resume()
        return task
    }

    static func parseTags(data: NSData) -> [String]? {
        if let jsonObject = (try? NSJSONSerialization.JSONObjectWithData(data, options: [])) as? [String: AnyObject] {
            var tagsArray: [String] = []
            for item in jsonObject {
                tagsArray.append(item.0)
            }
            tagsArray.sortInPlace()
            return tagsArray
        }
        return nil
    }
}

//MARK: - Network reachability
public class Reachability {

    class func isConnectedToNetwork() -> Bool {
        var zeroAddress = sockaddr_in()
        zeroAddress.sin_len = UInt8(sizeofValue(zeroAddress))
        zeroAddress.sin_family = sa_family_t(AF_INET)
        let defaultRouteReachability = withUnsafePointer(&zeroAddress) {
            SCNetworkReachabilityCreateWithAddress(nil, UnsafePointer($0))
        }
        var flags = SCNetworkReachabilityFlags()
        if !SCNetworkReachabilityGetFlags(defaultRouteReachability!, &flags) {
            return false
        }
        let isReachable = (flags.rawValue & UInt32(kSCNetworkFlagsReachable)) != 0
        let needsConnection = (flags.rawValue & UInt32(kSCNetworkFlagsConnectionRequired)) != 0
        return (isReachable && !needsConnection)
    }

}