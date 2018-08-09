import Foundation

class ApiTokenRequest: ApiRequest {
    var method = RequestType.GET
    var path = "user/api_token"
    var parameters = [String: String]()

    init(_ authToken: String) {
        parameters["auth_token"] = authToken
        parameters["format"] = "json"
    }
}
