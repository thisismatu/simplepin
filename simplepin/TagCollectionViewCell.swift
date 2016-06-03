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
        tagLabel.textColor = self.window?.tintColor
        tagLabel.highlightedTextColor = self.window?.tintColor
    }
}