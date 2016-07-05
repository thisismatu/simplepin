//
//  ShareViewController.swift
//  Add Bookmark
//
//  Created by Mathias Lindholm on 04.07.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit
import Social

class ShareViewController: SLComposeServiceViewController {

    override func isContentValid() -> Bool {
        if contentText.isEmpty {
            return false
        }
        return true
    }

    override func didSelectPost() {
        if let item = extensionContext?.inputItems.first as? NSExtensionItem {
            if let itemProvider = item.attachments?.first as? NSItemProvider {
                if itemProvider.hasItemConformingToTypeIdentifier("public.url") {
                    itemProvider.loadItemForTypeIdentifier("public.url", options: nil, completionHandler: { (url, error) -> Void in
                        if let shareURL = url as? NSURL {
                            print(shareURL)
                            print(self.contentText)
                        }
                        self.extensionContext?.completeRequestReturningItems([], completionHandler:nil)
                    })
                }
            }
        }
    }

    override func configurationItems() -> [AnyObject]! {
        // To add configuration options via table cells at the bottom of the sheet, return an array of SLComposeSheetConfigurationItem here.
        return []
    }
}