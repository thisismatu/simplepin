import UIKit

class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        showMainApp()
    }

    private func showMainApp() {
        if UserDefaults.standard.string(forKey: "apiToken") != nil {
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
