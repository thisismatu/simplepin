//
//  DateExtension.swift
//  simplepin
//
//  Created by Mathias Lindholm on 4.4.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import Foundation

extension NSDate {
    func toString(format: String = "yyyy-MM-dd'T'HH:mm:SSZ") -> String{
        let formatter = NSDateFormatter()
        formatter.dateFormat = format
        return formatter.stringFromDate(self)
    }
}

extension String {
    func toDate(format: String = "yyyy-MM-dd'T'HH:mm:SSZ") -> NSDate{
        let formatter = NSDateFormatter()
        formatter.dateFormat = format
        return formatter.dateFromString(self)!
    }
}