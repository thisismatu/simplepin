import UIKit
import RxSwift
import RxCocoa
import SnapKit
import SafariServices

class MainViewController: UIViewController {

    private let tableView = UITableView()
    private let cellIdentifier = "cellIdentifier"
    private let apiClient = APIClient()
    private let disposeBag = DisposeBag()
    private let update = Observable.just(UpdateRequest())
    private let items = Observable.just(BookmarkRequest())

    private let searchController: UISearchController = {
        let searchController = UISearchController(searchResultsController: nil)
        searchController.searchBar.placeholder = NSLocalizedString("main.search", comment: "")
        searchController.dimsBackgroundDuringPresentation = false
        return searchController
    }()

    override func viewDidLoad() {
        super.viewDidLoad()

        navigationItem.searchController = searchController
        navigationItem.title = NSLocalizedString("main.all", comment: "")
        navigationItem.hidesSearchBarWhenScrolling = true
        navigationItem.leftBarButtonItem = UIBarButtonItem(barButtonSystemItem: UIBarButtonSystemItem.bookmarks, target: nil, action: nil)
        navigationItem.rightBarButtonItem = UIBarButtonItem(barButtonSystemItem: UIBarButtonSystemItem.add, target: nil, action: nil)

        view.addSubview(tableView)
        tableView.register(TableViewCell.self, forCellReuseIdentifier: cellIdentifier)
        tableView.snp.makeConstraints { make in
            make.left.right.bottom.equalToSuperview()
            make.top.equalTo(view.safeAreaLayoutGuide.snp.top)
        }

        checkUpdate()

        tableView.rx.modelSelected(BookmarkModel.self)
            .map {
                let config = SFSafariViewController.Configuration()
                config.entersReaderIfAvailable = true
                return SFSafariViewController(url: $0.href, configuration: config)
            }
            .subscribe(onNext: { [weak self] safariViewController in
                self?.present(safariViewController, animated: true)
            })
            .disposed(by: disposeBag)
    }

    private func checkUpdate() {
        update
            .flatMap { request -> Observable<UpdateModel> in
                return self.apiClient.send(apiRequest: request)
            }
            .observeOn(MainScheduler.instance)
            .subscribe(onNext: { [weak self] result in
                if result.updateTime != UserDefaults.standard.string(forKey: "lastUpdate") {
                    UserDefaults.standard.set(result.updateTime, forKey: "lastUpdate")
                    self?.fetchBookmarks()
                }
            })
            .disposed(by: disposeBag)
    }

    private func fetchBookmarks() {
         items
            .flatMap { request -> Observable<[BookmarkModel]> in
                return self.apiClient.send(apiRequest: request)
            }
            .observeOn(MainScheduler.instance)
            .bind(to: tableView.rx.items(cellIdentifier: cellIdentifier)) { index, model, cell in
                cell.textLabel?.text = model.description
                cell.detailTextLabel?.text = model.extended
            }
            .disposed(by: disposeBag)
    }
}
