import UIKit
import RxSwift
import SnapKit

class LoginViewController: UIViewController {

    private let disposeBag = DisposeBag()

    override func viewDidLoad() {
        super.viewDidLoad()

        let stackView = UIStackView()
        view.addSubview(stackView)
        stackView.axis = .vertical
        stackView.spacing = 16
        stackView.distribution = .fill
        stackView.alignment = .center
        stackView.snp.makeConstraints { make in
            make.centerX.equalToSuperview()
            make.centerY.equalToSuperview().multipliedBy(0.9)
            make.width.equalToSuperview().inset(24)
        }

        let iconView = UIImageView(image: UIImage(named: "art_pin"))
        iconView.tintColor = .simplepin_blue2
        stackView.addArrangedSubview(iconView)

        let titleLabel = UILabel()
        stackView.addArrangedSubview(titleLabel)
        titleLabel.numberOfLines = 0
        titleLabel.textAlignment = .center
        titleLabel.textColor = .simplepin_gray3
        titleLabel.text = NSLocalizedString("welcome.title", comment: "")
        titleLabel.font = .systemFont(ofSize: 21, weight: .semibold)

        let subtitleLabel = UILabel()
        stackView.addArrangedSubview(subtitleLabel)
        subtitleLabel.numberOfLines = 0
        subtitleLabel.textAlignment = .center
        subtitleLabel.textColor = .simplepin_gray2
        subtitleLabel.text = NSLocalizedString("welcome.subtitle", comment: "")
        subtitleLabel.font = .preferredFont(forTextStyle: .body)

        stackView.addArrangedSubview(UIView(frame: .zero))

        let passwordButton = RoundedButton()
        stackView.addArrangedSubview(passwordButton)
        passwordButton.setTitle(NSLocalizedString("welcome.button.password", comment: ""), for: .normal)
        passwordButton.snp.makeConstraints { make in
            make.width.equalToSuperview()
        }

        let apiButton = RoundedButton(style: .outline)
        stackView.addArrangedSubview(apiButton)
        apiButton.setTitle(NSLocalizedString("welcome.button.api", comment: ""), for: .normal)
        apiButton.snp.makeConstraints { make in
            make.width.equalToSuperview()
        }
    }
}
