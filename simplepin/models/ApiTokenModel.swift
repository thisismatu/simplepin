import Foundation

struct ApiTokenModel: Codable {
    let token: String

    private enum CodingKeys: String, CodingKey {
        case token = "result"
    }
}
