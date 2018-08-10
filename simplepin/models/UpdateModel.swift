import Foundation

struct UpdateModel: Codable {
    let updateTime: String

    private enum CodingKeys: String, CodingKey {
        case updateTime = "update_time"
    }
}
