import UIKit
import RxSwift
import SnapKit

class LoginPasswordViewController: UIViewController {

    private let activityIndicator = UIActivityIndicatorView()
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
        usernameField.returnKeyType = .next
        usernameField.becomeFirstResponder()
        usernameField.snp.makeConstraints { make in
            make.width.equalToSuperview()
        }

        let passwordField = InputField()
        stackView.addArrangedSubview(passwordField)
        passwordField.placeholder = NSLocalizedString("login.placeholder.password", comment: "")
        passwordField.isSecureTextEntry = true
        passwordField.returnKeyType = .done
        passwordField.enablesReturnKeyAutomatically = true
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
        footerLabel.textColor = .simplepin_gray3
        footerLabel.text = NSLocalizedString("login.footer", comment: "")
        footerLabel.font = .preferredFont(forTextStyle: .subheadline)

        let forgotButton = UIButton()
        stackView.addArrangedSubview(forgotButton)
        forgotButton.setTitle(NSLocalizedString("login.forgot-password", comment: ""), for: .normal)
        forgotButton.setTitleColor(.simplepin_gray3, for: .normal)
        forgotButton.titleLabel?.font = .preferredFont(forTextStyle: .subheadline)

        stackView.addArrangedSubview(activityIndicator)
        activityIndicator.activityIndicatorViewStyle = .gray
        activityIndicator.hidesWhenStopped = true
        activityIndicator.isHidden = true

        let usernameValid = usernameField.rx.text.orEmpty
            .map { $0.count >= 1 }
            .share(replay: 1, scope: .forever)

        let passwordValid = passwordField.rx.text.orEmpty
            .map { $0.count >= 1 }
            .share(replay: 1, scope: .forever)

        let everythingValid = Observable.combineLatest(usernameValid, passwordValid) { $0 && $1}
            .share(replay: 1, scope: .forever)

        everythingValid
            .bind(to: loginButton.rx.isEnabled)
            .disposed(by: disposeBag)

        usernameField.rx.controlEvent(.editingDidEndOnExit)
            .subscribe(onNext: { passwordField.becomeFirstResponder() })
            .disposed(by: disposeBag)

        passwordField.rx.controlEvent(.editingDidEndOnExit)
            .subscribe(onNext: { self.login() })
            .disposed(by: disposeBag)

        loginButton.rx.tap
            .bind { self.login() }
            .disposed(by: disposeBag)

        forgotButton.rx.tap
            .bind {
                guard let url = URL(string: self.forgotUrl) else { return }
                UIApplication.shared.open(url, options: [:])
            }
            .disposed(by: disposeBag)
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.navigationController?.setNavigationBarHidden(false, animated: false)
    }

    private func login() {
        self.activityIndicator.startAnimating()
        view.endEditing(true)
//        showAlert()
//        AppDelegate.instance.changeRootViewController(to: MainViewController(), animated: true)
    }

    private func showAlert() {
        let alertView = UIAlertController(
            title: NSLocalizedString("login.incorrect.password", comment: ""),
            message: nil,
            preferredStyle: UIAlertControllerStyle.alert)
        alertView.addAction(UIAlertAction.init(
            title: NSLocalizedString("common.ok", comment: ""),
            style: UIAlertActionStyle.default,
            handler: nil))
        self.present(alertView, animated: true, completion: nil)
    }
}
