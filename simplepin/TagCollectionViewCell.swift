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
        tagLabel.textColor = Colors.Blue
        tagLabel.backgroundColor = Colors.LightBlue
        tagLabel.highlightedTextColor = Colors.Blue
        tagLabel.layer.masksToBounds = true
        tagLabel.layer.cornerRadius = 2
        tagLabel.layer.borderWidth = 0.5
        tagLabel.layer.borderColor = Colors.DarkBlue.colorWithAlphaComponent(0.12).CGColor
    }
}