import UIKit

enum RoundedButtonStyle {
    case fill
    case outline
}

class RoundedButton: UIButton {

    private let style: RoundedButtonStyle

    override var isHighlighted: Bool {
        didSet {
            switch style {
            case .fill:
                backgroundColor = isHighlighted ? .simplepin_blue3 : .simplepin_blue2
            case .outline:
                let color = isHighlighted ? UIColor.simplepin_blue3 : UIColor.simplepin_blue2
                setTitleColor(color, for: .normal)
                layer.borderColor = color.cgColor
            }
        }
    }

    override var isEnabled: Bool {
        didSet {
            alpha = isEnabled ? 1.0 : 0.3
        }
    }

    init(style: RoundedButtonStyle = .fill) {
        self.style = style
        super.init(frame: .zero)
        titleLabel?.font = UIFont.systemFont(ofSize: 16, weight: .semibold)
        contentEdgeInsets = UIEdgeInsets(top: 14, left: 16, bottom: 14, right: 16)

        switch style {
        case .fill:
            setTitleColor(.white, for: .normal)
            backgroundColor = .simplepin_blue2
        case .outline:
            setTitleColor(.simplepin_blue2, for: .normal)
            backgroundColor = .clear
            layer.borderWidth = 1
            layer.borderColor = UIColor.simplepin_blue2.cgColor
        }
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        layer.cornerRadius = 4
    }
}
