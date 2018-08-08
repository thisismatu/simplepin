import UIKit
import RxSwift
import SnapKit

class LoginApiViewController: UIViewController {

    private let disposeBag = DisposeBag()

    override func viewDidLoad() {
        super.viewDidLoad()

        self.title = NSLocalizedString("login.title", comment: "")

        let stackView = UIStackView()
        view.addSubview(stackView)
        stackView.axis = .vertical
        stackView.spacing = 16
        stackView.distribution = .fill
        stackView.alignment = .center
        stackView.snp.makeConstraints { make in
            make.top.equalToSuperview().inset(24)
            make.centerX.equalToSuperview()
            make.width.equalToSuperview().inset(24)
        }

        let apitokenField = InputField()
        stackView.addArrangedSubview(apitokenField)
        apitokenField.placeholder = NSLocalizedString("login.placeholder.api", comment: "")
        apitokenField.snp.makeConstraints { make in
            make.width.equalToSuperview()
        }

        stackView.addArrangedSubview(UIView(frame: .zero))

        let loginButton = RoundedButton()
        stackView.addArrangedSubview(loginButton)
        loginButton.setTitle(NSLocalizedString("login.button", comment: ""), for: .normal)
        loginButton.snp.makeConstraints { make in
            make.width.equalToSuperview()
        }

        stackView.addArrangedSubview(UIView(frame: .zero))

        let forgotButton = UIButton()
        stackView.addArrangedSubview(forgotButton)
        forgotButton.setTitle(NSLocalizedString("login.show-api", comment: ""), for: .normal)
        forgotButton.setTitleColor(.simplepin_gray2, for: .normal)
        forgotButton.titleLabel?.font = .preferredFont(forTextStyle: .subheadline)
    }
}
