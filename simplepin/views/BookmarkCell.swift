import UIKit
import RxSwift
import SnapKit

class BookmarkCell: UITableViewCell {

    let titleLabel = UILabel()
    let descriptionLabel = UILabel()
    let tagLabel = UILabel()
    let dateLabel = UILabel()
    private let stackView = UIStackView()

    override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)

        contentView.layoutMargins = UIEdgeInsets(top: 12, left: 28, bottom: 12, right: 12)

        contentView.addSubview(stackView)
        stackView.axis = .vertical
        stackView.spacing = 8
        stackView.distribution = .fill
        stackView.alignment = .top
        stackView.snp.makeConstraints { make in
            make.top.right.left.bottom.equalToSuperview().inset(contentView.layoutMargins)
        }

        stackView.addArrangedSubview(titleLabel)
        titleLabel.numberOfLines = 0
        titleLabel.font = .preferredFont(forTextStyle: .headline)
        titleLabel.textColor = .simplepin_gray4

        stackView.addArrangedSubview(descriptionLabel)
        descriptionLabel.numberOfLines = 0
        descriptionLabel.font = .preferredFont(forTextStyle: .subheadline)
        descriptionLabel.textColor = .simplepin_gray3

        stackView.addArrangedSubview(tagLabel)
        tagLabel.numberOfLines = 0
        tagLabel.font = .preferredFont(forTextStyle: .subheadline)
        tagLabel.textColor = .simplepin_gray3

        stackView.addArrangedSubview(dateLabel)
        dateLabel.numberOfLines = 0
        dateLabel.font = .preferredFont(forTextStyle: .subheadline)
        dateLabel.textColor = .simplepin_gray3

        let separatorView = UIView()
        contentView.addSubview(separatorView)
        separatorView.backgroundColor = .simplepin_border
        separatorView.snp.makeConstraints { make in
            make.width.equalToSuperview()
            make.height.equalTo(1)
            make.bottom.equalToSuperview()
            make.left.equalTo(contentView.layoutMargins.left)
        }
    }

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
}
