import Foundation

struct Environment {
    static let defaults = UserDefaults.standard

    static var apiToken: String {
        return defaults.string(forKey: "apiToken") ?? ""
    }

    static var baseUrl: URL {
        guard let url = URL(string: "https://api.pinboard.in/v1/") else {
            fatalError("No backend url")
        }
        return url
    }

    static var locale: String {
        return "en-US"
    }
}
