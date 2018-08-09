import UIKit

class ViewController: UIViewController {
    
    private let userLoggedIn = false

    override func viewDidLoad() {
        super.viewDidLoad()
        showMainApp()
    }

    private func showMainApp() {
        if userLoggedIn {
            DispatchQueue.main.async {
                AppDelegate.instance.changeRootViewController(to: MainViewController(), animated: true)
            }
        } else {
            DispatchQueue.main.async {
                AppDelegate.instance.changeRootViewController(to: LoginViewController(), animated: true)
            }
        }
    }
}
