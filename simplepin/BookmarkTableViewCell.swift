//
//  BookmarkTableViewCell.swift
//  simplepin
//
//  Created by Mathias Lindholm on 29.2.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit

class BookmarkTableViewCell: UITableViewCell {
    @IBOutlet var titleLabel: UILabel!
    @IBOutlet var descriptionLabel: UILabel!
    @IBOutlet var dateLabel: UILabel!
    @IBOutlet var tagsLabel: UILabel!
    @IBOutlet var unreadIndicator: UIImageView!
    @IBOutlet var privateIndicator: UIImageView!

    override func layoutSubviews() {
        super.layoutSubviews()

        privateIndicator.image = privateIndicator.image?.imageWithRenderingMode(.AlwaysTemplate)
        privateIndicator.tintColor = UIColor.grayColor()

        unreadIndicator.image = unreadIndicator.image?.imageWithRenderingMode(.AlwaysTemplate)
        unreadIndicator.tintColor = self.window?.tintColor
    }
}