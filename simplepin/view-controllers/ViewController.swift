import UIKit
import RxSwift

class ViewController: UIViewController {
    
    private let disposeBag = DisposeBag()
    private let userLoggedIn = false

    private func showMainApp() {
        if userLoggedIn {
            AppDelegate.instance.changeRootViewController(to: MainViewController(), animated: true)
        } else {
            AppDelegate.instance.changeRootViewController(to: LoginViewController(), animated: true)
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .red
        showMainApp()
    }
}
