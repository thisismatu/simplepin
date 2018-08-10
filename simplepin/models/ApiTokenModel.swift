import Foundation

struct ApiTokenModel: Codable {
    let result: String

    private enum CodingKeys: String, CodingKey {
        case result
    }
}
