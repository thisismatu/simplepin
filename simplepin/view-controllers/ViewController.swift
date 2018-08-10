import UIKit

class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        showMainApp()
    }

    private func showMainApp() {
        if Environment.apiToken != "" {
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
