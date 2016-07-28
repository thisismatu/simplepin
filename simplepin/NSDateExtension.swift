//
//  NSDateExtension.swift
//  simplepin
//
//  Created by Mathias Lindholm on 4.4.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import Foundation

extension NSDate {
    var dateToString: String {
        let formatter = NSDateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss'Z'"
        return formatter.stringFromDate(self)
    }

    func timeAgo() -> String {
        let calendar = NSCalendar.currentCalendar()
        let now = NSDate()
        let unitFlags: NSCalendarUnit = [.Minute, .Hour, .Day]
        let components = calendar.components(unitFlags, fromDate: self, toDate: now, options: [])

        let componentsFormatter = NSDateComponentsFormatter()
        componentsFormatter.calendar?.locale = NSLocale(localeIdentifier: "en")

        let formatter = NSDateFormatter()
        formatter.locale = NSLocale(localeIdentifier: "en")
        formatter.dateFormat = "MMMM yyyy"

        func formatTimeAgo(unit: NSCalendarUnit) -> String {
            componentsFormatter.allowedUnits = unit
            componentsFormatter.unitsStyle = .Full
            guard let string = componentsFormatter.stringFromDate(self, toDate: now) else { return "" }
            return string + " ago"
        }

        if components.day > 90 {
            return formatter.stringFromDate(self)
        }

        if components.day > 21 {
            return formatTimeAgo(.WeekOfMonth)
        }

        if components.day > 0 {
            return formatTimeAgo(.Day)
        }

        if components.hour > 0 {
            return formatTimeAgo(.Hour)
        }

        if components.minute > 0 {
            return formatTimeAgo(.Minute)
        }

        return "Just now"
    }

}

extension NSDate: Comparable {}

public func >(lhs: NSDate, rhs: NSDate) -> Bool {
    return lhs.compare(rhs) == .OrderedDescending
}

public func ==(lhs: NSDate, rhs: NSDate) -> Bool {
    return lhs === rhs || lhs.compare(rhs) == .OrderedSame
}

public func <(lhs: NSDate, rhs: NSDate) -> Bool {
    return lhs.compare(rhs) == .OrderedAscending
}

