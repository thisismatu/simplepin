import UIKit
import RxSwift
import SnapKit

class LoginViewController: UIViewController {

    private let disposeBag = DisposeBag()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .green

        let label = UILabel()
        view.addSubview(label)
        label.text = "LoginViewController"
        label.snp.makeConstraints { make in
            make.center.equalToSuperview()
        }
    }
}

