//
//  TagCollectionViewCell.swift
//  Simplepin
//
//  Created by Mathias Lindholm on 01.06.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit

class TagCollectionViewCell: UICollectionViewCell  {
    @IBOutlet var tagLabel: UILabel!

    override func layoutSubviews() {
        super.layoutSubviews()

        guard let string = tagLabel.text else { return }
        let index = string.startIndex.advancedBy(0)

        tagLabel.layer.masksToBounds = true
        tagLabel.layer.cornerRadius = 2
        tagLabel.layer.borderWidth = 0.5
        if string[index] == "." {
            tagLabel.textColor = UIColor.darkGrayColor()
            tagLabel.highlightedTextColor = UIColor.darkGrayColor()
            tagLabel.backgroundColor = UIColor.groupTableViewBackgroundColor()
            tagLabel.layer.borderColor = UIColor.blueColor().colorWithAlphaComponent(0.12).CGColor

        } else {
            tagLabel.textColor = Colors.Blue
            tagLabel.highlightedTextColor = Colors.Blue
            tagLabel.backgroundColor = Colors.LightBlue
            tagLabel.layer.borderColor = Colors.DarkBlue.colorWithAlphaComponent(0.12).CGColor
        }
    }
}