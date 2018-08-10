import Foundation

class BookmarkRequest: ApiRequest {
    var method = RequestType.GET
    var path = "posts/all"
    var parameters = [String: String]()

    init() {
        parameters["auth_token"] = Environment.apiToken
        parameters["format"] = "json"
    }
}
