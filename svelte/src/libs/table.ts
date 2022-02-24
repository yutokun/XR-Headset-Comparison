import { readable } from "svelte/store";
import type { Queries } from "./queries";
import { addBlankToExternalLinks, find, findAll } from "./util";

let table: HTMLElement;
let allCells: HTMLElement[];
let setCount: Function;
export const count = readable(-2, (set) => {
    setCount = set;
    return () => { };
});

let headsets: HTMLCollectionOf<HTMLElement>;
export let headsetsCount: Number;


export async function initializeTable(tableInstance: HTMLElement): Promise<void> {
    table = tableInstance;
    table.innerHTML = ""; // TODO 速くできそう
    allCells = [];
}

export async function load(tsvPath: string) {
    return fetch(tsvPath).then(async (data) => {
        parse(await data.text());
        addBlankToExternalLinks();
        countActiveHeadset();
        setAutomaticRepaint();
    });
}

export function parse(sheetText: string) {
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
            let cell: HTMLElement;
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
            if (cellData.includes("\\image")) {
                let img = cell.appendChild(document.createElement("img"));
                let path = cellData.match(/\\image{(.+?)}/)[1];
                img.setAttribute("src", path);
            } else if (cellData.includes("\\link")) {
                // リンク
                // TODO 複数リンク・任意の位置への対応
                let linkData = cellData.match(/\\link{(.+?),(.+?)}/);
                let a = cell.appendChild(document.createElement("a"));
                if (linkData) {
                    a.innerText = linkData[1];
                    a.setAttribute("href", linkData[2]);
                }
                a.setAttribute("target", "_blank");
            } else {
                // 税込み価格計算
                // TODO 消費税率の変動に対応
                cellData = cellData.replace(
                    /\\ct{(\d.+?)}/g,
                    (all: string, num: string) => {
                        let price = Number(num) * 1.1; // 税率
                        price = Math.floor(price);
                        return price.toLocaleString();
                    }
                );

                // 改行
                cell.innerText = cellData.replace(/\\n/g, "\n");
                if (cellData.startsWith("-") || cellData.startsWith("?")) {
                    cell.className = "emptyCell";
                }
            }

            //スタイルを設定
            if (j === 0) {
                cell.className = "hSticky column1 bold";
            } else if (j == 1) {
                cell.className = "hSticky column2 bold";
            } else {
                cell.className = "normalCell";
            }

            //タグを設定
            cell.setAttribute("data-tag", sheet[1][j]);

            //フィルタの準備
            if (j > 1) allCells.push(cell);
        }
    }

    headsets = find("tr").children as HTMLCollectionOf<HTMLElement>;
    headsetsCount = headsets.length - 2; // ヘッダの2列を減らしている
}

function countActiveHeadset() {
    let innerCount = -2; // 初期値でヘッダの2列を除外しておく

    //Edge 対策で通常の for
    for (let i = 0; i < headsets.length; i++) {
        if (headsets[i].style.display === "") ++innerCount;
    }

    setCount(innerCount);
    forceRepaint();
}

export function showAll(): void {
    if (location.href.includes("create")) return;

    for (let checkbox of findAll<HTMLInputElement>("input[type=checkbox]")) {
        checkbox.checked = false;
    }

    for (let cell of allCells) {
        cell.style.display = "";
    }

    countActiveHeadset();
}

export function applyFilters(queries: Queries): void {
    for (let cell of allCells) {
        cell.style.display = "";
    }

    //テーブルのリフローを避けるため一時的に none
    table.style.display = "none";

    filterByTag(allCells, queries);
    filterByText("製品名", queries.searchWord);
    filterByText("日本国内", queries.isSelling ? "◯" : "");

    //まとめてリフロー開始
    table.style.display = "";

    countActiveHeadset();
}

function filterByTag(allCells: HTMLElement[], queries: Queries) {
    for (let condition of queries.tags) {
        for (let cell of allCells) {
            if (!cell.getAttribute("data-tag")?.match(condition)) {
                cell.style.display = "none";
            }
        }
    }
}

function filterByText(rowTitle: string, searchText: string) {
    let reg = new RegExp(searchText, "i");
    let rows = Array.from(findAll("tr"));
    let targetRow = rows.find(r => r.innerText.startsWith(rowTitle)) as HTMLElement;
    let cells = targetRow.children;
    for (let i = 2; i < cells.length; i++) {
        if (!cells[i].textContent?.match(reg)) {
            for (let row of rows) {
                (row.children[i] as HTMLElement).style.display = "none";
            }
        }
    }
}

//Safari でスクロール時に強制リペイント
function setAutomaticRepaint() {
    let ua = window.navigator.userAgent;
    let isSafari = ua.includes("Safari") && !ua.includes("Chrome");
    if (!isSafari) return;

    let timeout: NodeJS.Timeout;
    window.addEventListener("scroll", function () {
        clearTimeout(timeout);
        timeout = setTimeout(forceRepaint, 50);
    });
    console.log("Safari needs to repaint on Scroll");
}

//強制リペイント（Safari 対策）
function forceRepaint() {
    let ua = window.navigator.userAgent;
    let isSafari = ua.includes("Safari") && !ua.includes("Chrome");
    if (!isSafari) return;

    table.classList.add("safari-repaint");
    setTimeout(() => table.classList.remove("safari-repaint"), 100);
}

