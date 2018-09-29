var table = document.querySelector("table");
allCells = new Array();
var xhr = new XMLHttpRequest();
xhr.addEventListener("load", function(){
	//TSV読み込み完了時の処理
	//テーブルの作成
	var thead = table.appendChild(document.createElement("thead"));
	thead.className = "vSticky";
	var tbody = table.appendChild(document.createElement("tbody"));
	var rows = xhr.responseText.split("\n");

	for(var i=0; i < rows.length; i++){
		var cells = rows[i].split("\t");
		
		//空行が存在した場合は次の行へ（最終行に空行が残る対策）
		if(cells.length==1) {
			continue;
		}

		//行の作成
		if(i<3) {
			var row = thead.appendChild(document.createElement("tr"));
		} else {
			var row = tbody.appendChild(document.createElement("tr"));
		}

		for(var j=0; j < cells.length; j++){
			//セルを作成
			if(i==0){
				var cell = row.appendChild(document.createElement("th"));
			}else if(i==1){
				row.remove();
				continue;
			}else{
				var cell = row.appendChild(document.createElement("td"));
			}

			//タグとテキストを構築
			if(cells[j].startsWith("/images")){
				var img = cell.appendChild(document.createElement("img"));
				img.setAttribute("src", cells[j]);
			}else if(cells[j].startsWith("link:")){
				var link = cells[j].replace("link:", "").split(",");
				var a = cell.appendChild(document.createElement("a"));
				a.innerText = link[0];
				a.setAttribute("href", link[1]);
				a.setAttribute("target", "_blank");
			}else{
				cell.innerText = cells[j].replace(/\\n/g, "\n");
				if(cells[j].startsWith("-") || cells[j].startsWith("?")){
					cell.style.backgroundColor = "rgba(0, 0, 0, 0.15)";
					cell.style.color = "rgba(0, 0, 0, 0.5)";
				}
			}

			//スタイルを設定
			if(j == 0){
				cell.style.width = "90px";
				cell.style.fontWeight = "bold";
				cell.className = "hSticky";
			}else if(j == 1){
				cell.style.width = "130px";
				cell.style.fontWeight = "bold";
				cell.className = "hSticky";
				cell.style.left = "108px";
			}else{
				cell.style.width = "260px";
			}

			//タグを設定
			cell.setAttribute ("data-tag", rows[1].split ("\t")[j]);

			//フィルタの準備
			if(j > 1)
				allCells.push (cell);
		}
	}
});
xhr.open ("get", "headset.tsv");
xhr.setRequestHeader('Pragma', 'no-cache');
xhr.setRequestHeader('Cache-Control', 'no-cache');
xhr.send ();

var statusElem = document.getElementById("status");

function ShowAll() {
	//ボタンを unchecked にする
	for (let item of document.querySelectorAll ("input[type=checkbox]")) {
		item.checked = false;
	}

	//全てを表示する
	for (let item of allCells) {
		item.style.display = "";
	}

	//検索用配列をクリアする
	queries.length = 0;
	inputBox.value = "";
	
	//ステータステキストを更新
	UpdateStatus();
}

//検索クエリを保持
var queries = new Array();

//方針としては、string 配列を作成して、そこに入っているもので順にフィルタしていくことで、絞り込みを実現する。
function OnCheck (cb) {
	//cb.getAttribute の string が true なら配列に追加、false なら配列を走査して削除
	if (cb.checked) {
		queries.push (cb.getAttribute ("data-query"));
	} else {
		queries = queries.filter (function (item) {
			return item !== cb.getAttribute ("data-query");
		})
	}

	//フィルタリング
	FilterCheckbox();
	FilterText();
}

//テキストフィルタ
var inputBox = document.getElementById("textFilter");
inputBox.addEventListener("input", FilterCheckbox);
inputBox.addEventListener("input", FilterText);
var rows = document.getElementsByTagName("tr");
function FilterText () {
	//テーブルのリフローを避けるため一時的に none
	table.style.display = "none";
	
	//テキストでフィルタ
	var reg = new RegExp(inputBox.value, "i");
	var names = rows[0].children;
	for(var i=2; i < names.length; i++) {
		if (names[i].innerText.match (reg) == null) {
			for (var item of rows) {
				item.children[i].style.display = "none";
			}
		}
	}
	
	//まとめてリフロー開始
	table.style.display = "";
	
	//ステータステキストを更新
	UpdateStatus();
}

function FilterCheckbox () {
	//全てを一度表示
	for (let item of allCells) {
		item.style.display = "";
	}

	//配列にマッチしなかった要素を非表示にしていく
	for (let query of queries) {
		for (let item of allCells) {
			if (item.getAttribute ("data-tag").match (query) == null) {
				item.style.display = "none";
			}
		}
	}
	
	//ステータステキストを更新
	UpdateStatus();
}

//渡された配列にマッチするようにフィルタを変更
function ApplyFilterSet (filterSet) {
	//一度全てのフィルタを解除
	ShowAll ();

	//渡されたフィルタをクエリにセット
	queries = filterSet;

	//クエリに合わせてボタンをチェック
	for (let item of queries) {
		document.querySelector ("input[data-query=" + item + "]").checked = true;
	}

	//フィルタ実行
	FilterCheckbox ();
}

//ステータステキストに現在のヒット数を表示
function UpdateStatus () {
	var count = 0;
	var list = document.querySelector("tr").children;
	
	//Edge 対策で通常の for
	for (var i=0; i < list.length; i++) {
		if (list[i].style.display == "") {
			++count;
		}
	}
	
	//ヘッダを除外
	count -= 2;
	
	if (count == 0) {
		statusElem.innerHTML = "条件に合うヘッドセットが見つかりませんでした"
	} else if (count == list.length - 2) {
		statusElem.innerHTML = "全てを表示中（" + (list.length - 2) +"件）";
	} else {
		statusElem.innerHTML = count + "件マッチしました";
	}
	
	ForceRepaint();
	
	SetQueries();
}

function ForceRepaint () {
	//強制リペイント（Safari 対策）
	statusElem.style.display = "none";
	statusElem.offsetHeight;
	statusElem.style.display = "block";
}

window.onload = function() {
	GetQueriesAndFilter();
}

function GetQueriesAndFilter() {
	let q = getUrlVars();
	if (q.toString()) {
		queries = q["r"] ? q["r"].split(",") : new Array();
		let checkboxes = document.querySelectorAll('input[type="checkbox"]');
		for (let checkbox of checkboxes) {
			if (queries.includes(checkbox.getAttribute("data-query"))) {
				checkbox.checked = true;
			}
		}
		inputBox.value = q["t"] ? q["t"] : "";
		FilterCheckbox();
		FilterText();
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

function getUrlVars() {
	var vars = [], max = 0, hash = "", array = "";
	var url = window.location.search;

	hash  = url.slice(1).split('&');
	max = hash.length;
	for (var i = 0; i < max; i++) {
		array = hash[i].split('=');
		vars.push(array[0]);
		vars[array[0]] = array[1];
	}

	return vars;
}

var timeout;
if(window.navigator.userAgent.includes("Safari") && window.navigator.userAgent.includes("Chrome") == false) {
	window.addEventListener("scroll", function(){
		clearTimeout(timeout);
		timeout = setTimeout(ForceRepaint, 50);
	});
	console.log("Repaint on Scroll");
} else {
	console.log("NOT Repaint on Scroll");
}

