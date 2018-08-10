import Foundation

struct BookmarkModel: Codable {
    let href: URL
    let description: String
    let extended: String
    let time: Date
    let tags: String
    let shared: String
    let toread: String

    private enum CodingKeys: String, CodingKey {
        case href
        case description
        case extended
        case time
        case tags
        case shared
        case toread
    }

    var tagss: [String] {
        return tags.components(separatedBy: " ").filter { !$0.isEmpty }
    }
}
