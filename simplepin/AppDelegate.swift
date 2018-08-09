import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    static var instance: AppDelegate {
        // swiftlint:disable:next force_cast
        return UIApplication.shared.delegate as! AppDelegate
    }

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.backgroundColor = .white
        window?.tintColor = .simplepin_blue2
        window?.rootViewController = ViewController()
        window?.makeKeyAndVisible()
        return true
    }

    func changeRootViewController(to newRootViewController: UIViewController, animated: Bool) {
        guard window?.rootViewController != nil, animated else {
            window?.rootViewController = newRootViewController
            return
        }

        let navigationController = UINavigationController()
        navigationController.viewControllers = [newRootViewController]

        let snapshot = window?.snapshotView(afterScreenUpdates: true)

        if let snapshot = snapshot {
            newRootViewController.view.addSubview(snapshot)
        }

        window?.rootViewController = navigationController

        UIView.animate(withDuration: 0.2, animations: {
            snapshot?.layer.opacity = 0
        }, completion: { _ in
            snapshot?.removeFromSuperview()
        })
    }
}
