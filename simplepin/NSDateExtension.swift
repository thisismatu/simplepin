//
//  DateExtension.swift
//  simplepin
//
//  Created by Mathias Lindholm on 4.4.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import Foundation

extension NSDate {

    func toString(format: String = "yyyy-MM-dd'T'HH:mm:ss'Z'") -> String{
        let formatter = NSDateFormatter()
        formatter.dateFormat = format
        return formatter.stringFromDate(self)
    }

    func timeAgo() -> String {
        let calendar = NSCalendar.currentCalendar()
        let now = NSDate()
        let unitFlags: NSCalendarUnit = [.Second, .Minute, .Hour, .Day, .WeekOfYear, .Month,]
        let components = calendar.components(unitFlags, fromDate: self, toDate: now, options: [])

        if components.month > 1 {
            let formatter = NSDateFormatter()
            formatter.dateFormat = "MMMM yyyy"
            return formatter.stringFromDate(self)
        }

        if components.weekOfYear > 0 {
            return "\(components.weekOfYear) week\(components.weekOfYear == 1 ? "" : "s") ago"
        }

        if components.day > 0 {
            return "\(components.day) day\(components.day == 1 ? "" : "s") ago"
        }

        if components.hour > 0 {
            return "\(components.hour) hour\(components.hour == 1 ? "" : "s") ago"
        }

        if components.minute > 0 {
            return "\(components.minute) minute\(components.minute == 1 ? "" : "s") ago"
        }

        if components.second > 0 {
            return "\(components.second) second\(components.second == 1 ? "" : "s") ago"
        }
        
        return "Just Now"
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

