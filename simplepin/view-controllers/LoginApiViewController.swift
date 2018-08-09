import UIKit
import RxSwift
import SnapKit

class LoginApiViewController: UIViewController {

    private let disposeBag = DisposeBag()
    private let apiTokenUrl = "https://m.pinboard.in/settings/password"

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

        let apitokenField = InputField()
        stackView.addArrangedSubview(apitokenField)
        apitokenField.placeholder = NSLocalizedString("login.placeholder.api", comment: "")
        apitokenField.returnKeyType = .done
        apitokenField.enablesReturnKeyAutomatically = true
        apitokenField.becomeFirstResponder()
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

        let apiTokenButton = UIButton()
        stackView.addArrangedSubview(apiTokenButton)
        apiTokenButton.setTitle(NSLocalizedString("login.show-api", comment: ""), for: .normal)
        apiTokenButton.setTitleColor(.simplepin_gray3, for: .normal)
        apiTokenButton.titleLabel?.font = .preferredFont(forTextStyle: .subheadline)

        let apitokenValid = apitokenField.rx.text.orEmpty
            .map { $0.count >= 1 }
            .share(replay: 1, scope: .forever)

        apitokenValid
            .bind(to: loginButton.rx.isEnabled)
            .disposed(by: disposeBag)

        loginButton.rx.tap
            .bind { self.login() }
            .disposed(by: disposeBag)

        apitokenField.rx.controlEvent(.editingDidEndOnExit)
            .subscribe(onNext: { self.login() })
            .disposed(by: disposeBag)

        apiTokenButton.rx.tap
            .bind {
                guard let url = URL(string: self.apiTokenUrl) else { return }
                UIApplication.shared.open(url, options: [:])
            }
            .disposed(by: disposeBag)
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.navigationController?.setNavigationBarHidden(false, animated: false)
    }

    private func login() {
        self.view.endEditing(true)
        print("todo: log in")
    }
}
