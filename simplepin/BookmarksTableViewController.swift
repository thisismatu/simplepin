//
//  BookmarksTableViewController.swift
//  simplepin
//
//  Created by Mathias Lindholm on 29.2.2016.
//  Copyright © 2016 Mathias Lindholm. All rights reserved.
//

import UIKit

class BookmarksTableViewController: UITableViewController, NSXMLParserDelegate {

    @IBOutlet var tableData: UITableView!

    struct PinboardItem {
        let title: String
        let description: String
        let date: String
        let link: String
    }

    var posts = [PinboardItem]()
    var parser = NSXMLParser()
    var element = String()
    var postTitle = String()
    var postDescription = String()
    var postDate = String()
    var postLink = String()

    func beginParsing() {
        parser = NSXMLParser(contentsOfURL: NSURL(string: "https://feeds.pinboard.in/rss/u:mlindholm/")!)!
        parser.delegate = self
        parser.parse()
        tableData.reloadData()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        self.beginParsing()

        tableView.estimatedRowHeight = 96.0
        tableView.rowHeight = UITableViewAutomaticDimension

        // Uncomment the following line to preserve selection between presentations
        // self.clearsSelectionOnViewWillAppear = false

        // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
        // self.navigationItem.rightBarButtonItem = self.editButtonItem()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    //MARK: - XMLParser Methods

    func parser(parser: NSXMLParser, didStartElement elementName: String, namespaceURI: String?, qualifiedName qName: String?, attributes attributeDict: [String : String]) {
        element = elementName
        if elementName == "item" {
            postTitle = String()
            postDescription = String()
            postDate = String()
            postLink = String()
        }
    }

    func parser(parser: NSXMLParser, foundCharacters string: String) {
        let data = string.stringByTrimmingCharactersInSet(NSCharacterSet.whitespaceAndNewlineCharacterSet())
        if (!data.isEmpty) {
            if element == "title" {
                postTitle += data
            } else if element == "description" {
                postDescription += data
            } else if element == "dc:date" {
                postDate += data
            } else if element == "link" {
                postLink += data
            }
        }
    }

    func parser(parser: NSXMLParser, didEndElement elementName: String, namespaceURI: String?, qualifiedName qName: String?) {
        if elementName == "item" {
            let post = PinboardItem(title: postTitle, description: postDescription, date: postDate, link: postLink)
            posts.append(post)
        }
    }

    // MARK: - Table view data source

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return posts.count
    }

    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("BookmarkCell", forIndexPath: indexPath) as! BookmarkTableViewCell
        cell.descriptionLabel.text = posts[indexPath.row].title
        cell.extendedLabel.text = posts[indexPath.row].description
        cell.timeLabel.text = posts[indexPath.row].date
        return cell
    }


    /*
    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCellWithIdentifier("reuseIdentifier", forIndexPath: indexPath)

        // Configure the cell...

        return cell
    }
    */

    /*
    // Override to support conditional editing of the table view.
    override func tableView(tableView: UITableView, canEditRowAtIndexPath indexPath: NSIndexPath) -> Bool {
        // Return false if you do not want the specified item to be editable.
        return true
    }
    */

    /*
    // Override to support editing the table view.
    override func tableView(tableView: UITableView, commitEditingStyle editingStyle: UITableViewCellEditingStyle, forRowAtIndexPath indexPath: NSIndexPath) {
        if editingStyle == .Delete {
            // Delete the row from the data source
            tableView.deleteRowsAtIndexPaths([indexPath], withRowAnimation: .Fade)
        } else if editingStyle == .Insert {
            // Create a new instance of the appropriate class, insert it into the array, and add a new row to the table view
        }    
    }
    */

    /*
    // Override to support rearranging the table view.
    override func tableView(tableView: UITableView, moveRowAtIndexPath fromIndexPath: NSIndexPath, toIndexPath: NSIndexPath) {

    }
    */

    /*
    // Override to support conditional rearranging of the table view.
    override func tableView(tableView: UITableView, canMoveRowAtIndexPath indexPath: NSIndexPath) -> Bool {
        // Return false if you do not want the item to be re-orderable.
        return true
    }
    */

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
