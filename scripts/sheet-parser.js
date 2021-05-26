"use strict";
let table = find("table");
let allCells = [];
let queries = [];
let selling = false;
function OnLoad(sheetPath) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => ParseSheet(xhr.responseText));
    xhr.open("get", sheetPath);
    xhr.setRequestHeader('Pragma', 'no-cache');
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.send();
}
function ParseSheet(sheetText) {
    //TSV読み込み完了時の処理
    //テーブルの作成
    let thead = table.appendChild(document.createElement("thead"));
    thead.className = "vSticky";
    let tbody = table.appendChild(document.createElement("tbody"));
    let columns = sheetText.split("\n");
    columns.pop();
    let rowLength = columns[0].split("\t").length;
    //二次元配列っぽいものの初期化
    let sheet = [];
    for (let i = 0; i < rowLength; i++) {
        sheet[i] = new Array(columns.length).fill(undefined);
    }
    //転置された配列作成
    for (let i = 0; i < columns.length; i++) {
        let row = columns[i].split("\t");
        for (let j = 0; j < rowLength; j++) {
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
            }
            else if (i == 1) {
                row.remove();
                continue;
            }
            else {
                cell = row.appendChild(document.createElement("td"));
            }
            let cellData = sheet[i][j];
            //タグとテキストを構築
            if (cellData.includes("\\image")) {
                let img = cell.appendChild(document.createElement("img"));
                let path = cellData.match(/\\image{(.+?)}/)[1];
                img.setAttribute("src", path);
            }
            else if (cellData.includes("\\link")) {
                // リンク
                // TODO 複数リンク・任意の位置への対応
                let linkData = cellData.match(/\\link{(.+?),(.+?)}/);
                let a = cell.appendChild(document.createElement("a"));
                if (linkData) {
                    a.innerText = linkData[1];
                    a.setAttribute("href", linkData[2]);
                }
                a.setAttribute("target", "_blank");
            }
            else {
                // 税込み価格計算
                // TODO 消費税率の変動に対応
                cellData = cellData.replace(/\\ct{(\d.+?)}/g, (all, num) => {
                    let price = Number(num) * 1.1; // 税率
                    price = Math.floor(price);
                    return price.toLocaleString();
                });
                // 改行
                cell.innerText = cellData.replace(/\\n/g, "\n");
                if (cellData.startsWith("-") || cellData.startsWith("?")) {
                    cell.className = "emptyCell";
                }
            }
            //スタイルを設定
            if (j === 0) {
                cell.className = "hSticky column1 bold";
            }
            else if (j == 1) {
                cell.className = "hSticky column2 bold";
            }
            else {
                cell.className = "normalCell";
            }
            //タグを設定
            cell.setAttribute("data-tag", sheet[1][j]);
            //フィルタの準備
            if (j > 1)
                allCells.push(cell);
        }
    }
    Initialize();
}
//確実に表がロードされた後に処理するため、
//LoadAndParseSheet から呼んでいる。
function Initialize() {
    SetAutomaticRepaint();
    GetQueriesAndFilter();
    let loadingMessage = find("#loadingMessage");
    if (loadingMessage)
        loadingMessage.style.display = "none";
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
let inputBox = find("#textFilter");
inputBox.addEventListener("input", ApplyFilters);
//テキストでフィルタ
// TODO NEED REFACTOR
function FilterText(rowTitle, searchText) {
    let reg = new RegExp(searchText, "i");
    let rows = findAll("tr");
    for (let row of rows) {
        if (row.innerText.startsWith(rowTitle)) {
            let searchTargets = row.children;
            for (let i = 2; i < searchTargets.length; i++) {
                if (searchTargets[i].innerText.match(reg) == null) {
                    for (let row of rows) {
                        row.children[i].style.display = "none";
                    }
                }
            }
        }
    }
}
function FilterCheckbox() {
    var _a;
    //配列にマッチしなかった要素を非表示にしていく
    for (let query of queries) {
        for (let cell of allCells) {
            if (((_a = cell.getAttribute("data-tag")) === null || _a === void 0 ? void 0 : _a.match(query)) == null) {
                cell.style.display = "none";
            }
        }
    }
}
function ShowAll() {
    //全てのボタンを unchecked にする
    if (location.href.includes("create"))
        return;
    for (let checkbox of findAll("input[type=checkbox]")) {
        checkbox.checked = false;
    }
    //全てのセルを表示する
    for (let cell of allCells) {
        cell.style.display = "";
    }
    //検索用配列をクリアする
    queries.length = 0;
    if (inputBox)
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
        find("input[data-query=" + query + "]").checked = true;
    }
    //フィルタ実行
    ApplyFilters();
}
//ステータステキストに現在のヒット数を表示
function UpdateStatus() {
    let count = 0;
    let list = find("tr").children;
    //Edge 対策で通常の for
    for (let i = 0; i < list.length; i++) {
        if (list[i].style.display === "")
            ++count;
    }
    //ヘッダを除外
    count -= 2;
    let statusElem = find("#status");
    if (statusElem) {
        if (count === 0) {
            statusElem.innerHTML = "条件に合うヘッドセットが見つかりませんでした";
        }
        else if (count == list.length - 2) {
            statusElem.innerHTML = "全てを表示中（" + (list.length - 2) + "件）";
        }
        else {
            statusElem.innerHTML = count + "件マッチしました";
        }
    }
    ForceRepaint();
    SetQueries();
}
//強制リペイント（Safari 対策）
function ForceRepaint() {
    let table = findAll("table")[0];
    table.classList.add("safari-repaint");
    setTimeout(() => table.classList.remove("safari-repaint"), 100);
}
//Safari でスクロール時に強制リペイント
function SetAutomaticRepaint() {
    let ua = window.navigator.userAgent;
    let isSafari = ua.includes("Safari") && !ua.includes("Chrome");
    if (isSafari) {
        let timeout;
        window.addEventListener("scroll", function () {
            clearTimeout(timeout);
            timeout = setTimeout(ForceRepaint, 50);
        });
        console.log("This browser need to repaint on Scroll");
    }
    else {
        console.log("This browser NOT need to repaint on Scroll");
    }
}
class Queries {
    constructor(query) {
        this.conditions = [];
        this.isSelling = false;
        this.searchWord = "";
        let hashes = decodeURI(query).slice(1).split('&');
        for (const hash of hashes) {
            let kv = hash.split('=');
            let key = kv[0];
            let value = kv[1];
            if (key == "r") {
                this.conditions = value.split(",");
            }
            else if (key == "s" && value == "true") {
                this.isSelling = true;
            }
            else if (key == "t") {
                this.searchWord = value;
            }
        }
    }
    get isEmpty() {
        return this.conditions.length == 0 && !this.isSelling && !this.searchWord;
    }
}
//クエリからフィルタリング
function GetQueriesAndFilter() {
    let q = new Queries(window.location.search);
    if (q.isEmpty) {
        // TODO Firefox で前回のチェック状態のみが残ってしまう問題の対策
        // ロード時に全件数を正しく計算する点でも必要
        ShowAll();
    }
    else {
        // チェックボックスの再現
        queries = q.conditions;
        let checkboxes = findAll('input[type="checkbox"]');
        for (let checkbox of checkboxes) {
            if (queries.includes(checkbox.getAttribute("data-query"))) {
                checkbox.checked = true;
            }
        }
        // 販売状況の再現
        selling = q.isSelling;
        find("#sellingInJapan").checked = selling;
        // 製品名検索の再現
        inputBox.value = q.searchWord;
        ApplyFilters();
    }
}
//クエリをアドレスバーに設定
function SetQueries() {
    let refines = queries.toString() ? "r=" + queries.toString() : "";
    let sell = selling ? "s=true" : "";
    let text = (inputBox === null || inputBox === void 0 ? void 0 : inputBox.value) ? "t=" + inputBox.value : "";
    let query = "?";
    if (text)
        query += text;
    if (sell)
        query += (text ? "&" : "") + sell;
    if (refines)
        query += (text || selling ? "&" : "") + refines;
    if (query == "?")
        query = location.pathname;
    query = encodeURI(query);
    history.replaceState(null, "", query);
}
//チェックボックスクリック時にフィルタリング
function OnCheck(cb) {
    //cb.getAttribute の string が true なら配列に追加、false なら配列を走査して削除
    if (cb.checked) {
        queries.push(cb.getAttribute("data-query"));
    }
    else {
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
function find(query) {
    let result = document.querySelector(query);
    if (result == null) {
        console.log(`オブジェクトが見つかりませんでした: ${query}`);
        throw new Error("エラー");
    }
    else {
        return result;
    }
}
function findAll(query) {
    let result = document.querySelectorAll(query);
    if (result == null) {
        console.log(`オブジェクトが見つかりませんでした: ${query}`);
        throw new Error("エラー");
    }
    else {
        return result;
    }
}
