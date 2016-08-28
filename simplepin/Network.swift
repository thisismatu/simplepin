//
//  Network.swift
//  simplepin
//
//  Created by Mathias Lindholm on 29.3.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import Foundation
import SystemConfiguration

//MARK: - Network

private let defaults = NSUserDefaults(suiteName: "group.ml.simplepin")!

struct Network {
    static let config = NSURLSessionConfiguration.defaultSessionConfiguration()
    static let urlQuery = NSURLComponents()
    static let userToken = defaults.stringForKey("userToken")

    static func session() -> NSURLSession {
        config.timeoutIntervalForRequest = 20.0
        return NSURLSession(configuration: config)
    }

    static func checkHttpResponse(response: NSURLResponse) -> Bool {
        let notification = NSNotificationCenter.defaultCenter()
        let statusCode = (response as? NSHTTPURLResponse)?.statusCode

        if statusCode == 401 {
            if defaults.stringForKey("userToken") != nil {
                notification.postNotificationName("tokenChanged", object: nil)
            }
            return false
        } else if statusCode == 429 {
            notification.postNotificationName("handleRequestError", object: nil, userInfo: ["title": "Too Many Requests", "message": "Try again in a couple of minutes"])
            return false
        } else if response.MIMEType == "text/html" {
            notification.postNotificationName("handleRequestError", object: nil, userInfo: ["title": "Trouble Connecting to Pinboard", "message": "Pinboard might be down. Try again in a while."])
            return false
        }

        return true
    }

    static func checkError(error: NSError) -> Bool {
        let notification = NSNotificationCenter.defaultCenter()
        if error.code == NSURLErrorTimedOut {
            notification.postNotificationName("handleRequestError", object: nil, userInfo: ["title": "Connection Timed Out", "message": "Try again later."])
            return false
        }
        return true
    }

    // MARK: - Login with Username and Password
    static func loginWithUsernamePassword(username: String, _ password: String, completion: (String?) -> Void) -> NSURLSessionTask? {
        urlQuery.scheme = "https"
        urlQuery.host = "api.pinboard.in"
        urlQuery.path = "/v1/user/api_token/"

        let userPasswordString = username + ":" + password
        let userPasswordData = userPasswordString.dataUsingEncoding(NSUTF8StringEncoding)
        let base64EncodedCredential = userPasswordData!.base64EncodedStringWithOptions([])
        let authString = "Basic \(base64EncodedCredential)"
        config.HTTPAdditionalHeaders = ["Authorization" : authString]
        urlQuery.queryItems = [
            NSURLQueryItem(name: "format", value: "json")
        ]

        guard let url = urlQuery.URL else {
            completion(nil)
            return nil
        }

        let task = Network.session().dataTaskWithURL(url) { (data, httpResponse, error) -> Void in
            dispatch_async(dispatch_get_main_queue(), { () -> Void in

                if let response = httpResponse {
                    if checkHttpResponse(response) == false {
                        completion(nil)
                        return
                    }
                }

                if let err = error {
                    if checkError(err) == false {
                        completion(nil)
                        return
                    }
                }

                guard let data = data where error == nil else {
                    completion(nil)
                    return
                }

                let userToken = ParseJSON.string(data, key: "result")
                completion(userToken)
            })
        }

        task.resume()
        return task
    }

    // MARK: - Login with API Token
    static func loginWithApiToken(token: String, completion: (String?) -> Void) -> NSURLSessionTask? {
        urlQuery.scheme = "https"
        urlQuery.host = "api.pinboard.in"
        urlQuery.path = "/v1/user/api_token/"

        urlQuery.queryItems = [
            NSURLQueryItem(name: "auth_token", value: token.removeExcessiveSpaces),
            NSURLQueryItem(name: "format", value: "json")
        ]

        guard let url = urlQuery.URL else {
            completion(nil)
            return nil
        }

        let task = Network.session().dataTaskWithURL(url) { (data, httpResponse, error) -> Void in
            dispatch_async(dispatch_get_main_queue(), { () -> Void in

                if let response = httpResponse {
                    if checkHttpResponse(response) == false {
                        completion(nil)
                        return
                    }
                }

                if let err = error {
                    if checkError(err) == false {
                        completion(nil)
                        return
                    }
                }

                guard let data = data where error == nil else {
                    completion(nil)
                    return
                }

                let userToken = ParseJSON.string(data, key: "result")
                completion(userToken)
            })
        }

        task.resume()
        return task
    }

    // MARK: - Fetch posts
    static func fetchAllPosts(fromdt: NSDate? = nil, completion: ([BookmarkItem]) -> Void) -> NSURLSessionTask? {
        urlQuery.scheme = "https"
        urlQuery.host = "api.pinboard.in"
        urlQuery.path = "/v1/posts/all"
        urlQuery.queryItems = [
            NSURLQueryItem(name: "fromdt", value: fromdt?.dateToString),
            NSURLQueryItem(name: "auth_token", value: userToken),
            NSURLQueryItem(name: "format", value: "json"),
        ]

        guard let url = urlQuery.URL else {
            completion([])
            return nil
        }

        let task = Network.session().dataTaskWithURL(url) { (data, httpResponse, error) -> Void in
            dispatch_async(dispatch_get_main_queue(), { () -> Void in

                if let response = httpResponse {
                    if checkHttpResponse(response) == false {
                        completion([])
                        return
                    }
                }

                if let err = error {
                    if checkError(err) == false {
                        completion([])
                        return
                    }
                }

                guard let data = data where error == nil else {
                    completion([])
                    return
                }

                let optionalBookmarks = ParseJSON.bookmarks(data)
                completion(optionalBookmarks)
            })
        }

        task.resume()
        return task
    }

    // MARK: - Check for updates
    static func checkForUpdates(completion: (NSDate?) -> Void) -> NSURLSessionTask? {
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

        let task = Network.session().dataTaskWithURL(url) { (data, httpResponse, error) -> Void in
            dispatch_async(dispatch_get_main_queue(), { () -> Void in

                if let response = httpResponse {
                    if checkHttpResponse(response) == false {
                        completion(nil)
                        return
                    }
                }

                if let err = error {
                    if checkError(err) == false {
                        completion(nil)
                        return
                    }
                }

                guard let data = data where error == nil else {
                    completion(nil)
                    return
                }
                let updateDate = ParseJSON.date(data, key: "update_time")
                completion(updateDate)
            })
        }

        task.resume()
        return task
    }

    // MARK: - Delete bookmark
    static func deleteBookmark(url: NSURL, completion: (String?) -> Void) -> NSURLSessionTask? {
        let urlString = url.absoluteString

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

        let task = Network.session().dataTaskWithURL(url) { (data, httpResponse, error) -> Void in
            dispatch_async(dispatch_get_main_queue(), { () -> Void in
                guard let data = data where error == nil else {
                    completion(nil)
                    return
                }
                let resultCode = ParseJSON.string(data, key: "result_code")
                completion(resultCode)
            })
        }

        task.resume()
        return task
    }

    // MARK: - Add bookmark
    static func addBookmark(url: NSURL, title: String, shared: Bool, description: String = "", tags: [String] = [], dt: NSDate? = nil, toread: Bool = false, completion: (String?) -> Void) -> NSURLSessionTask? {
        let urlString = url.absoluteString
        let tagsString = tags.joinWithSeparator(" ")
        let shared = !shared

        urlQuery.scheme = "https"
        urlQuery.host = "api.pinboard.in"
        urlQuery.path = "/v1/posts/add"
        urlQuery.queryItems = [
            NSURLQueryItem(name: "url", value: urlString),
            NSURLQueryItem(name: "description", value: title),
            NSURLQueryItem(name: "extended", value: description),
            NSURLQueryItem(name: "tags", value: tagsString),
            NSURLQueryItem(name: "dt", value: dt?.dateToString),
            NSURLQueryItem(name: "shared", value: shared.boolToString),
            NSURLQueryItem(name: "toread", value: toread.boolToString),
            NSURLQueryItem(name: "auth_token", value: userToken),
            NSURLQueryItem(name: "format", value: "json"),
        ]

        guard let url = urlQuery.URL else {
            completion(nil)
            return nil
        }

        let task = Network.session().dataTaskWithURL(url) { (data, httpResponse, error) -> Void in
            dispatch_async(dispatch_get_main_queue(), { () -> Void in
                guard let data = data where error == nil else {
                    completion(nil)
                    return
                }

                let resultCode = ParseJSON.string(data, key: "result_code")
                completion(resultCode)
            })
        }

        task.resume()
        return task
    }

    // MARK: - Get tags
    static func fetchTags(completion: ([TagItem]) -> Void) -> NSURLSessionTask? {
        urlQuery.scheme = "https"
        urlQuery.host = "api.pinboard.in"
        urlQuery.path = "/v1/tags/get"
        urlQuery.queryItems = [
            NSURLQueryItem(name: "auth_token", value: userToken),
            NSURLQueryItem(name: "format", value: "json"),
        ]

        guard let url = urlQuery.URL else {
            completion([])
            return nil
        }

        let task = Network.session().dataTaskWithURL(url) { (data, httpResponse, error) -> Void in
            dispatch_async(dispatch_get_main_queue(), { () -> Void in

                guard let data = data where error == nil else {
                    completion([])
                    return
                }

                let optionalTags = ParseJSON.tags(data)
                completion(optionalTags)
            })
        }

        task.resume()
        return task
    }
}

//MARK: - Parse JSON

struct ParseJSON {
    static func string(data: NSData, key: String) -> String? {
        if let jsonObject = (try? NSJSONSerialization.JSONObjectWithData(data, options: [])) as? [String: AnyObject] {
            return jsonObject["\(key)"] as? String
        }
        return nil
    }

    static func date(data: NSData, key: String) -> NSDate? {
        if let jsonObject = (try? NSJSONSerialization.JSONObjectWithData(data, options: [])) as? [String: AnyObject] {
            let dateString = jsonObject["\(key)"] as? String
            return dateString?.stringToDate
        }
        return nil
    }

    static func tags(data: NSData) -> [TagItem] {
        var tags = [TagItem]()
        do {
            if let jsonObject = try NSJSONSerialization.JSONObjectWithData(data, options: []) as? [String: String] {
                for item in jsonObject {
                    guard let tag = TagItem(key: item.0, value: item.1) else { continue }
                    tags.append(tag)
                }
            }
        } catch {
            debugPrint("Error parsing tags JSON")
        }
        return tags
    }

    static func bookmarks(data: NSData) -> [BookmarkItem] {
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
            debugPrint("Error parsing bookmarks JSON")
        }
        return bookmarks
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