//
//  BookmarkTableViewCell.swift
//  simplepin
//
//  Created by Mathias Lindholm on 29.2.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit

class BookmarkTableViewCell: UITableViewCell {
    var defaults = NSUserDefaults.standardUserDefaults()

    @IBOutlet var titleLabel: UILabel!
    @IBOutlet var descriptionLabel: UILabel!
    @IBOutlet var dateLabel: UILabel!
    @IBOutlet var unreadIndicator: UIImageView!
    @IBOutlet var privateIndicator: UIImageView!
    @IBOutlet weak var collectionView: UICollectionView!

    override func layoutSubviews() {
        super.layoutSubviews()

        privateIndicator.image = privateIndicator.image?.imageWithRenderingMode(.AlwaysTemplate)
        privateIndicator.tintColor = UIColor.grayColor()

        unreadIndicator.image = unreadIndicator.image?.imageWithRenderingMode(.AlwaysTemplate)
        unreadIndicator.tintColor = self.window?.tintColor

        if defaults.boolForKey("boldTitleFont") == true {
            titleLabel.font = UIFont.preferredFontForTextStyle(UIFontTextStyleHeadline)
        }
    }

    func setCollectionViewDataSourceDelegate
        <D: protocol<UICollectionViewDataSource, UICollectionViewDelegate>>
        (dataSourceDelegate: D, forRow row: Int) {

        collectionView.delegate = dataSourceDelegate
        collectionView.dataSource = dataSourceDelegate
        collectionView.tag = row
        collectionView.reloadData()
    }

}