import UIKit
import RxSwift
import SnapKit

class LoginPasswordViewController: UIViewController {

    private let disposeBag = DisposeBag()
    private let forgotUrl = "https://m.pinboard.in/password_reset"

    override func viewDidLoad() {
        super.viewDidLoad()

        view.backgroundColor = .white
        self.title = NSLocalizedString("login.title", comment: "")

        let stackView = UIStackView()
        view.addSubview(stackView)
        stackView.axis = .vertical
        stackView.spacing = 16
        stackView.distribution = .fill
        stackView.alignment = .center
        stackView.snp.makeConstraints { make in
            make.top.equalTo(view.safeAreaLayoutGuide.snp.top).offset(24)
            make.centerX.equalToSuperview()
            make.width.equalToSuperview().inset(24)
        }

        let usernameField = InputField()
        stackView.addArrangedSubview(usernameField)
        usernameField.placeholder = NSLocalizedString("login.placeholder.username", comment: "")
        usernameField.snp.makeConstraints { make in
            make.width.equalToSuperview()
        }

        let passwordField = InputField()
        stackView.addArrangedSubview(passwordField)
        passwordField.placeholder = NSLocalizedString("login.placeholder.password", comment: "")
        passwordField.snp.makeConstraints { make in
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

        let footerLabel = UILabel()
        stackView.addArrangedSubview(footerLabel)
        footerLabel.numberOfLines = 0
        footerLabel.textAlignment = .center
        footerLabel.textColor = .simplepin_gray2
        footerLabel.text = NSLocalizedString("login.footer", comment: "")
        footerLabel.font = .preferredFont(forTextStyle: .subheadline)

        let forgotButton = UIButton()
        stackView.addArrangedSubview(forgotButton)
        forgotButton.setTitle(NSLocalizedString("login.forgot-password", comment: ""), for: .normal)
        forgotButton.setTitleColor(.simplepin_gray2, for: .normal)
        forgotButton.titleLabel?.font = .preferredFont(forTextStyle: .subheadline)

        forgotButton.rx.tap.bind {
            if let url = URL(string: self.forgotUrl) {
                UIApplication.shared.open(url, options: [:])
            }
        }.disposed(by: disposeBag)
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.navigationController?.setNavigationBarHidden(false, animated: false)
    }
}
