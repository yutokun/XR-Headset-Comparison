let table = document.querySelector("table");
let allCells = [];
let queries = [];
let selling = false;

window.onload = function () {
	LoadAndParseSheet();
};

function LoadAndParseSheet() {
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", function () {
		//TSV読み込み完了時の処理
		//テーブルの作成
		var thead = table.appendChild(document.createElement("thead"));
		thead.className = "vSticky";
		var tbody = table.appendChild(document.createElement("tbody"));
		let columns = xhr.responseText.split("\n");
		columns.pop();
		let rowLength = columns[0].split("\t").length;

		//二次元配列っぽいものの初期化
		let sheet = [];
		for(let i = 0; i < rowLength; i++){
			sheet[i] = new Array(columns.length).fill();
		}

		//転置された配列作成
		for(let i = 0; i < columns.length; i++){
			let row = columns[i].split("\t");
			for(let j = 0; j < rowLength; j++){
				sheet[j][i] = row[j];
			}
		}

		for (var i = 0; i < rowLength; i++) {
			//行要素の作成
			let rowFrom = i < 3 ? thead : tbody;
			let row = rowFrom.appendChild(document.createElement("tr"));

			for (var j = 0; j < sheet[i].length; j++) {
				//セル要素を作成
				let cell;
				if (i === 0) {
					cell = row.appendChild(document.createElement("th"));
				} else if (i == 1) {
					row.remove();
					continue;
				} else {
					cell = row.appendChild(document.createElement("td"));
				}
				let cellData = sheet[i][j];

				//タグとテキストを構築
				if (cellData.startsWith("/images")) {
					var img = cell.appendChild(document.createElement("img"));
					img.setAttribute("src", cellData);
				} else if (cellData.startsWith("link:")) {
					var link = cellData.replace("link:", "").split(",");
					var a = cell.appendChild(document.createElement("a"));
					a.innerText = link[0];
					a.setAttribute("href", link[1]);
					a.setAttribute("target", "_blank");
				} else {
					// 消費税率の変動に対応
					cellData = cellData.replace(/\\ct{(\d.+?)}/g, (all, num)=>{
						let price = Number(num) * 1.1; // 税率
						price = Math.floor(price);
						return price.toLocaleString();
					});
					cell.innerText = cellData.replace(/\\n/g, "\n");
					if (cellData.startsWith("-") || cellData.startsWith("?")) {
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
				cell.setAttribute("data-tag", sheet[1][j]);

				//フィルタの準備
				if (j > 1)
					allCells.push(cell);
			}
		}
		Initialize();
	});
	xhr.open("get", "headset.tsv");
	xhr.setRequestHeader('Pragma', 'no-cache');
	xhr.setRequestHeader('Cache-Control', 'no-cache');
	xhr.send();
}

//確実に表がロードされた後に処理するため、
//LoadAndParseSheet から呼んでいる。
function Initialize() {
	SetAutomaticRepaint();
	GetQueriesAndFilter();
	document.getElementById("loadingMessage").style.display = "none";
}

function ApplyFilters() {
	//全てを一度表示
	for (let cell of allCells) {
		cell.style.display = "";
	}

	//テーブルのリフローを避けるため一時的に none
	table.style.display = "none";

	FilterCheckbox();
	FilterText("製品名", inputBox.value);
	FilterText("日本国内", selling ? "◯" : "");

	//まとめてリフロー開始
	table.style.display = "";

	UpdateStatus();
}

//フィルタの準備
let inputBox = document.getElementById("textFilter");
inputBox.addEventListener("input", ApplyFilters);

//テキストでフィルタ
function FilterText(rowTitle, searchText) {
	let reg = new RegExp(searchText, "i");
	let rows = document.getElementsByTagName("tr");
	for (currentRow of rows) {
		if (currentRow.innerText.startsWith(rowTitle)){
			var row = currentRow;
			break;
		}
	}
	
	let searchTargets = row.children;
	for (let i = 2; i < searchTargets.length; i++) {
		if (searchTargets[i].innerText.match(reg) == null) {
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
	let elems = document.getElementsByTagName("tr");
	for (let i = 0; i < 2; i++) {
		elems[i].style.display = "none";
		/*jshint ignore:start*/
		elems[i].offsetHeight;
		/*jshint ignore:end*/
		elems[i].style.display = "";
	}
}

//Safari でスクロール時に強制リペイント
function SetAutomaticRepaint() {
	let ua = window.navigator.userAgent;
	let isSafari = ua.includes("Safari") && (ua.includes("Chrome") === false);
	if (isSafari) {
			let timeout;
		window.addEventListener("scroll", function () {
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
		// チェックボックスの再現
		queries = q.r ? q.r.split(",") : [];
		let checkboxes = document.querySelectorAll('input[type="checkbox"]');
		for (let checkbox of checkboxes) {
			if (queries.includes(checkbox.getAttribute("data-query"))) {
				checkbox.checked = true;
			}
		}
		
		// 販売状況の再現
		selling = q.s == "true" ? true : false;
		document.querySelector("#sellingInJapan").checked = selling;
		
		// 製品名検索の再現
		inputBox.value = q.t ? decodeURI(q.t) : "";
		
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
	let sell = selling ? "s=true" : "";
	let text = inputBox.value ? "t=" + inputBox.value : "";
	let query = "?";
	if (text) query += text;
	if (sell) query += (text ? "&" : "") + sell;
	if (refines) query += (text||selling ? "&" : "") + refines;
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

function OnCheckTextFilter(cb) {
	selling = cb.checked;
	ApplyFilters();
}
