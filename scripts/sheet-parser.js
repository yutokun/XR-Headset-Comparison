let table = document.querySelector("table");
let allCells = [];
let queries = [];

LoadAndParseSheet();

window.onload = function () {
	SetAutomaticRepaint();
	GetQueriesAndFilter();
};

function LoadAndParseSheet() {
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", function () {
		//TSV読み込み完了時の処理
		//テーブルの作成
		var thead = table.appendChild(document.createElement("thead"));
		thead.className = "vSticky";
		var tbody = table.appendChild(document.createElement("tbody"));
		let rows = xhr.responseText.split("\n");

		for (var i = 0; i < rows.length; i++) {
			var cells = rows[i].split("\t");

			//空行が存在した場合は次の行へ（最終行に空行が残る対策）
			if (cells.length == 1) continue;

			//行要素の作成
			let rowFrom = i < 3 ? thead : tbody;
			var row = rowFrom.appendChild(document.createElement("tr"));

			for (var j = 0; j < cells.length; j++) {
				//セルを作成
				let cell;
				if (i === 0) {
					cell = row.appendChild(document.createElement("th"));
				} else if (i == 1) {
					row.remove();
					continue;
				} else {
					cell = row.appendChild(document.createElement("td"));
				}

				//タグとテキストを構築
				if (cells[j].startsWith("/images")) {
					var img = cell.appendChild(document.createElement("img"));
					img.setAttribute("src", cells[j]);
				} else if (cells[j].startsWith("link:")) {
					var link = cells[j].replace("link:", "").split(",");
					var a = cell.appendChild(document.createElement("a"));
					a.innerText = link[0];
					a.setAttribute("href", link[1]);
					a.setAttribute("target", "_blank");
				} else {
					cell.innerText = cells[j].replace(/\\n/g, "\n");
					if (cells[j].startsWith("-") || cells[j].startsWith("?")) {
						cell.style.backgroundColor = "rgba(0, 0, 0, 0.15)";
						cell.style.color = "rgba(0, 0, 0, 0.5)";
					}
				}

				//スタイルを設定
				if (j === 0) {
					cell.style.width = "90px";
					cell.style.fontWeight = "bold";
					cell.className = "hSticky";
				} else if (j == 1) {
					cell.style.width = "130px";
					cell.style.fontWeight = "bold";
					cell.className = "hSticky";
					cell.style.left = "108px";
				} else {
					cell.style.width = "260px";
				}

				//タグを設定
				cell.setAttribute("data-tag", rows[1].split("\t")[j]);

				//フィルタの準備
				if (j > 1)
					allCells.push(cell);
			}
		}
	});
	xhr.open("get", "headset.tsv");
	xhr.setRequestHeader('Pragma', 'no-cache');
	xhr.setRequestHeader('Cache-Control', 'no-cache');
	xhr.send();
}

function ApplyFilters() {
	//全てを一度表示
	for (let cell of allCells) {
		cell.style.display = "";
	}

	//テーブルのリフローを避けるため一時的に none
	table.style.display = "none";

	FilterCheckbox();
	FilterText();

	//まとめてリフロー開始
	table.style.display = "";

	UpdateStatus();
}

//フィルタの準備
let inputBox = document.getElementById("textFilter");
inputBox.addEventListener("input", ApplyFilters);

//テキストでフィルタ
function FilterText() {
	let reg = new RegExp(inputBox.value, "i");
	let rows = document.getElementsByTagName("tr");
	let names = rows[0].children;
	for (let i = 2; i < names.length; i++) {
		if (names[i].innerText.match(reg) == null) {
			for (let row of rows) {
				row.children[i].style.display = "none";
			}
		}
	}
}

function FilterCheckbox() {
	//配列にマッチしなかった要素を非表示にしていく
	for (let query of queries) {
		for (let cell of allCells) {
			if (cell.getAttribute("data-tag").match(query) == null) {
				cell.style.display = "none";
			}
		}
	}
}

function ShowAll() {
	//全てのボタンを unchecked にする
	for (let checkbox of document.querySelectorAll("input[type=checkbox]")) {
		checkbox.checked = false;
	}

	//全てのセルを表示する
	for (let cell of allCells) {
		cell.style.display = "";
	}

	//検索用配列をクリアする
	queries.length = 0;
	inputBox.value = "";

	//ステータステキストを更新
	UpdateStatus();
}

//渡された配列にマッチするようにフィルタを変更
function SetQuickFilter(filterSet) {
	//一度全てのフィルタを解除
	ShowAll();

	//渡されたフィルタをクエリにセット
	queries = filterSet;

	//クエリに合わせてボタンをチェック
	for (let query of queries) {
		document.querySelector("input[data-query=" + query + "]").checked = true;
	}

	//フィルタ実行
	ApplyFilters();
}

//ステータステキストに現在のヒット数を表示
function UpdateStatus() {
	let count = 0;
	let list = document.querySelector("tr").children;

	//Edge 対策で通常の for
	for (let i = 0; i < list.length; i++) {
		if (list[i].style.display === "") ++count;
	}

	//ヘッダを除外
	count -= 2;

	let statusElem = document.getElementById("status");

	if (count === 0) {
		statusElem.innerHTML = "条件に合うヘッドセットが見つかりませんでした";
	} else if (count == list.length - 2) {
		statusElem.innerHTML = "全てを表示中（" + (list.length - 2) + "件）";
	} else {
		statusElem.innerHTML = count + "件マッチしました";
	}

	ForceRepaint();
	SetQueries();
}

//強制リペイント（Safari 対策）
function ForceRepaint() {
	document.body.style.display = "none";
	document.body.offsetHeight = 0; //参照のみで十分だが、JSHint のエラーを避けるため0を代入
	document.body.style.display = "";
}

//Safari でスクロール時に強制リペイント
function SetAutomaticRepaint() {
	let ua = window.navigator.userAgent;
	let isSafari = ua.includes("Safari") && (ua.includes("Chrome") === false);
	if (isSafari) {
		window.addEventListener("scroll", function () {
			let timeout;
			clearTimeout(timeout);
			timeout = setTimeout(ForceRepaint, 50);
		});
		console.log("This browser need to repaint on Scroll");
	} else {
		console.log("This browser NOT need to repaint on Scroll");
	}
}

//クエリからフィルタリング
function GetQueriesAndFilter() {
	let q = GetQueries();
	if (q.toString()) {
		queries = q.r ? q.r.split(",") : [];
		let checkboxes = document.querySelectorAll('input[type="checkbox"]');
		for (let checkbox of checkboxes) {
			if (queries.includes(checkbox.getAttribute("data-query"))) {
				checkbox.checked = true;
			}
		}
		inputBox.value = q.t ? q.t : "";
		ApplyFilters();
	} else {
		//Firefox で前回のチェック状態のみが残ってしまう問題の対策
		//ロード時に全件数を正しく計算する点でも必要
		ShowAll();
	}
}

//クエリをアドレスバーに設定
function SetQueries() {
	let refines = queries.toString() ? "r=" + queries.toString() : "";
	let text = inputBox.value ? "t=" + inputBox.value : "";
	let query = "?";
	if (text) query += text;
	if (refines) query += (text ? "&" : "") + refines;
	history.replaceState(null, null, query);
}

//クエリをアドレスバーから取得
function GetQueries() {
	let vars = [],
		max = 0,
		hash = "",
		array = "";
	let url = window.location.search;

	hash = url.slice(1).split('&');
	max = hash.length;
	for (var i = 0; i < max; i++) {
		array = hash[i].split('=');
		vars.push(array[0]);
		vars[array[0]] = array[1];
	}

	return vars;
}

//チェックボックスクリック時にフィルタリング
function OnCheck(cb) {
	//cb.getAttribute の string が true なら配列に追加、false なら配列を走査して削除
	if (cb.checked) {
		queries.push(cb.getAttribute("data-query"));
	} else {
		queries = queries.filter(function (item) {
			return item !== cb.getAttribute("data-query");
		});
	}

	//フィルタリング
	ApplyFilters();
}
