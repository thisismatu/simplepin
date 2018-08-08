import UIKit
import RxSwift
import SnapKit

class MainViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .yellow

        let label = UILabel()
        view.addSubview(label)
        label.text = "MainViewController"
        label.snp.makeConstraints { make in
            make.center.equalToSuperview()
        }
    }
}
