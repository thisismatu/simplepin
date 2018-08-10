import Foundation

class BookmarkRequest: ApiRequest {
    var method = RequestType.GET
    var path = "posts/all"
    var parameters = [String: String]()

    init() {
        parameters["auth_token"] = UserDefaults.standard.string(forKey: "apiToken")
        parameters["format"] = "json"
    }
}
