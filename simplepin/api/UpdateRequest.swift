import Foundation

class UpdateRequest: ApiRequest {
    var method = RequestType.GET
    var path = "posts/update"
    var parameters = [String: String]()

    init() {
        parameters["auth_token"] = Environment.apiToken
        parameters["format"] = "json"
    }
}
