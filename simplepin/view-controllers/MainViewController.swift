import UIKit
import RxSwift
import RxCocoa
import SnapKit
import SafariServices

class MainViewController: UIViewController {

    private let tableView = UITableView()
    private let cellIdentifier = "BookmarkCell"
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
        navigationController?.navigationBar.prefersLargeTitles = true

        view.addSubview(tableView)
        tableView.register(BookmarkCell.self, forCellReuseIdentifier: cellIdentifier)
        tableView.estimatedRowHeight = 100
        tableView.rowHeight = UITableViewAutomaticDimension
        tableView.separatorStyle = .none
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
                if result.updateTime != Environment.defaults.string(forKey: "lastUpdate") {
                    Environment.defaults.set(result.updateTime, forKey: "lastUpdate")
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
            .bind(to: tableView.rx.items(cellIdentifier: cellIdentifier, cellType: BookmarkCell.self)) { index, model, cell in
                cell.titleLabel.text = model.description
                cell.descriptionLabel.text = model.extended
                cell.tagLabel.text = model.tags
                cell.dateLabel.text = model.time.description
            }
            .disposed(by: disposeBag)
    }
}
