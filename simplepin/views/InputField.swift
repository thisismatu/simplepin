import UIKit

class InputField: UITextField {

    let textInset = UIEdgeInsets(top: 13.5, left: 12, bottom: 13.5, right: 12)

    override init(frame: CGRect) {
        super.init(frame: .zero)
        self.layer.cornerRadius = 4
        self.layer.borderWidth = 1
        self.layer.borderColor = UIColor.simplepin_border.cgColor
        self.backgroundColor = .white
        self.textColor = .simplepin_gray3
        self.tintColor = .simplepin_blue2
        self.font = .preferredFont(forTextStyle: .body)
    }

    override func textRect(forBounds bounds: CGRect) -> CGRect {
        return UIEdgeInsetsInsetRect(bounds, textInset)
    }

    override func placeholderRect(forBounds bounds: CGRect) -> CGRect {
        return UIEdgeInsetsInsetRect(bounds, textInset)
    }

    override func editingRect(forBounds bounds: CGRect) -> CGRect {
        return UIEdgeInsetsInsetRect(bounds, textInset)
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}
