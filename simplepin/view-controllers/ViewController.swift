import UIKit
import RxSwift

class ViewController: UIViewController {
    
    private let disposeBag = DisposeBag()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .red
        AppDelegate.instance.changeRootViewController(to: LoginViewController(), animated: true)
    }
}
