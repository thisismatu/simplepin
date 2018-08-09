import UIKit
import RxSwift
import SnapKit

class LoginApiViewController: UIViewController {

    private let activityIndicator = UIActivityIndicatorView()
    private let apiClient = APIClient()
    private let disposeBag = DisposeBag()
    private let apiTokenUrl = "https://m.pinboard.in/settings/password"
    private let pasteboardString: String = UIPasteboard.general.string ?? ""

    override func viewDidLoad() {
        super.viewDidLoad()

        view.backgroundColor = .white
        self.title = NSLocalizedString("login.title", comment: "")

        let stackView = UIStackView()
        view.addSubview(stackView)
        stackView.axis = .vertical
        stackView.spacing = 12
        stackView.distribution = .fill
        stackView.alignment = .center
        stackView.snp.makeConstraints { make in
            make.top.equalTo(view.safeAreaLayoutGuide.snp.top).offset(24)
            make.centerX.equalToSuperview()
            make.width.equalToSuperview().inset(24)
        }

        let apiTokenField = InputField()
        stackView.addArrangedSubview(apiTokenField)
        apiTokenField.placeholder = NSLocalizedString("login.placeholder.api", comment: "")
        apiTokenField.returnKeyType = .done
        apiTokenField.enablesReturnKeyAutomatically = true
        apiTokenField.becomeFirstResponder()
        apiTokenField.text = pasteboardString.isApiToken ? pasteboardString : nil
        apiTokenField.snp.makeConstraints { make in
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

        stackView.addArrangedSubview(activityIndicator)
        activityIndicator.activityIndicatorViewStyle = .gray
        activityIndicator.hidesWhenStopped = true
        activityIndicator.isHidden = true

        let apiTokenString = apiTokenField.rx.text.orEmpty.asObservable()

        let apiTokenValid = apiTokenString
            .map { $0.count >= 1 }
            .share(replay: 1, scope: .forever)

        apiTokenValid
            .bind(to: loginButton.rx.isEnabled)
            .disposed(by: disposeBag)

        apiTokenField.rx.controlEvent(.editingDidEndOnExit)
            .bind { self.login(apiTokenString) }
            .disposed(by: disposeBag)

        loginButton.rx.tap
            .bind { self.login(apiTokenString) }
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

    private func login(_ token: Observable<String>) {
        self.activityIndicator.startAnimating()
        view.endEditing(true)
        token
            .map { ApiTokenRequest($0) }
            .flatMap { request -> Observable<ApiTokenModel> in
                return self.apiClient.send(apiRequest: request)
            }
            .observeOn(MainScheduler.instance)
            .subscribe(onNext: { [weak self] _ in
                self?.activityIndicator.stopAnimating()
                AppDelegate.instance.changeRootViewController(to: MainViewController(), animated: true)
            }, onError: { [weak self] error in
                self?.activityIndicator.stopAnimating()
                self?.showAlert(error.localizedDescription)
            })
            .disposed(by: disposeBag)
    }

    private func showAlert(_ message: String = "") {
        let alertView = UIAlertController(
            title: NSLocalizedString("login.incorrect.api", comment: ""),
            message: message,
            preferredStyle: UIAlertControllerStyle.alert)
        alertView.addAction(UIAlertAction.init(
            title: NSLocalizedString("common.ok", comment: ""),
            style: UIAlertActionStyle.default,
            handler: nil))
        self.present(alertView, animated: true, completion: nil)
    }
}

extension String {
    var isApiToken: Bool {
        if self.range(of: "\\w+:([A-Za-z])\\w{19}", options: .regularExpression, range: nil, locale: nil) != nil { return true }
        return false
    }
}
