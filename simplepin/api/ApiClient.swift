import Foundation
import RxSwift

class APIClient {
    private let baseURL = URL(string: "https://api.pinboard.in/v1/")!

    func send<T: Codable>(apiRequest: ApiRequest) -> Observable<T> {
        return Observable<T>.create { [unowned self] observer in
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            let request = apiRequest.request(with: self.baseURL)
            let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
                do {
                    simplepinDebugPrint(request)
                    let model: T = try decoder.decode(T.self, from: data ?? Data())
                    observer.onNext(model)
                } catch let error {
                    observer.onError(error)
                }
                observer.onCompleted()
            }
            task.resume()

            return Disposables.create {
                task.cancel()
            }
        }
    }
}

func simplepinDebugPrint(_ text: Any, caller: String = #function) {
    let string = "Simplepin | \(caller) : \(text)"
    print(string)
}
