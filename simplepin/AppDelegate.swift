//
//  AppDelegate.swift
//  simplepin
//
//  Created by Mathias Lindholm on 29.2.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit
import Fabric
import Crashlytics

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    var storyboard: UIStoryboard?
    var navigation: UINavigationController?
    let defaults = NSUserDefaults.init(suiteName: "group.ml.simplepin")!

    func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {

        self.window?.tintColor = Colors.Blue
        UINavigationBar.appearance().tintColor = Colors.Blue
        UITabBar.appearance().tintColor = Colors.Blue

        self.storyboard = UIStoryboard(name: "Main", bundle: NSBundle.mainBundle())
        if defaults.stringForKey("userToken") == nil {
            self.showLoginScreen(false)
        }

        Fabric.with([Crashlytics.self])

        return true
    }

    func showLoginScreen(animated: Bool) {
        self.storyboard = UIStoryboard(name: "Main", bundle: NSBundle.mainBundle())
        if let vc = self.storyboard?.instantiateViewControllerWithIdentifier("login") {
            self.window?.makeKeyAndVisible()
            self.window?.rootViewController?.presentViewController(vc, animated: animated, completion: nil)
        }
    }

    func logOut() {
        let appDomain = NSBundle.mainBundle().bundleIdentifier!
        let root = self.window?.rootViewController as! UINavigationController

        if let vc = root.topViewController as? BookmarksTableViewController {
            vc.bookmarksArray.removeAll()
            vc.filteredBookmarks.removeAll()
            vc.tableView.reloadData()
        }

        defaults.removePersistentDomainForName(appDomain)
        defaults.removeObjectForKey("userToken")
        Answers.logCustomEventWithName("Log Out", customAttributes: nil)
        self.showLoginScreen(true)
    }

    func applicationWillResignActive(application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(application: UIApplication) {
        // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }
}

enum UIUserInterfaceIdiom : Int {
    case Unspecified

    case Phone // iPhone and iPod touch style UI
    case Pad // iPad style UI
}