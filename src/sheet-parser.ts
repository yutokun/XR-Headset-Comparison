let table = find("table");
let allCells: HTMLElement[] = [];
let queries: Queries;

window.onload = function () {
	find("#show-all").addEventListener("click", () => showAll());
	textFilter.addEventListener("input", () => {
		queries.searchWord = textFilter.value;
		applyFilters();
	});
	findAll<HTMLInputElement>("input[data-tag]").forEach(cb => {
		cb.addEventListener("click", () => onCheck(cb));
	});
	let sellingInJapan = find<HTMLInputElement>("#sellingInJapan");
	sellingInJapan.addEventListener("click", () => onCheckSellingFilter(sellingInJapan));

	fetch("headset.tsv")
		.then(async data => {
			parse(await data.text());
			initialize();
		});
};

function parse(sheetText: string) {
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
				cellData = cellData.replace(/\\ct{(\d.+?)}/g, (all: string, num: string) => {
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
			} else if (j == 1) {
				cell.className = "hSticky column2 bold";
			} else {
				cell.className = "normalCell";
			}

			//タグを設定
			cell.setAttribute("data-tag", sheet[1][j]);

			//フィルタの準備
			if (j > 1)
				allCells.push(cell);
		}
	}
}

function initialize() {
	setAutomaticRepaint();
	readQueries();
	if (queries.isEmpty) {
		showAll();
	} else {
		applyFilters();
	}
	find("#loadingMessage").style.display = "none";
}

function showAll() {
	if (location.href.includes("create")) return;

	for (let checkbox of findAll<HTMLInputElement>("input[type=checkbox]")) {
		checkbox.checked = false;
	}

	for (let cell of allCells) {
		cell.style.display = "";
	}

	textFilter.value = "";
	queries.clear();
	updateStatus();
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

// HTML から呼んでる
function SetQuickFilter(tagSet: string[]) {
	showAll();
	queries.tags = tagSet;
	for (let tag of queries.tags) {
		find<HTMLInputElement>(`input[data-tag=${tag}]`).checked = true;
	}
	applyFilters();
}

function filterByTag() {
	for (let condition of queries.tags) {
		for (let cell of allCells) {
			if (!cell.getAttribute("data-tag")?.match(condition)) {
				cell.style.display = "none";
			}
		}
	}
}

function onCheck(cb: HTMLInputElement) {
	if (cb.checked) {
		queries.tags.push(cb.getAttribute("data-tag") as string);
	} else {
		queries.tags = queries.tags.filter(item => item !== cb.getAttribute("data-tag"));
	}

	applyFilters();
}

function onCheckSellingFilter(cb: HTMLInputElement) {
	queries.isSelling = cb.checked;
	applyFilters();
}

function applyFilters() {
	for (let cell of allCells) {
		cell.style.display = "";
	}

	//テーブルのリフローを避けるため一時的に none
	table.style.display = "none";

	filterByTag();
	filterByText("製品名", queries.searchWord);
	filterByText("日本国内", queries.isSelling ? "◯" : "");

	//まとめてリフロー開始
	table.style.display = "";

	updateStatus();
}

function updateStatus() {
	let count = -2; // 初期値でヘッダを除外しておく
	let list = find("tr").children as HTMLCollectionOf<HTMLElement>;

	//Edge 対策で通常の for
	for (let i = 0; i < list.length; i++) {
		if (list[i].style.display === "") ++count;
	}

	let statusElem = find("#status");

	if (statusElem) {
		if (count === 0) {
			statusElem.innerHTML = "条件に合うヘッドセットが見つかりませんでした";
		} else if (count == list.length - 2) {
			statusElem.innerHTML = `全てを表示中（${count}件）`;
		} else {
			statusElem.innerHTML = `${count}件マッチしました`;
		}
	}

	forceRepaint();
	WriteQueries();
}

//強制リペイント（Safari 対策）
function forceRepaint() {
	let ua = window.navigator.userAgent;
	let isSafari = ua.includes("Safari") && !ua.includes("Chrome");
	if (!isSafari) return;

	let table = findAll("table")[0];
	table.classList.add("safari-repaint");
	setTimeout(() => table.classList.remove("safari-repaint"), 100);
}

//Safari でスクロール時に強制リペイント
function setAutomaticRepaint() {
	let ua = window.navigator.userAgent;
	let isSafari = ua.includes("Safari") && !ua.includes("Chrome");
	if (!isSafari) return;

	let timeout: number;
	window.addEventListener("scroll", function () {
		clearTimeout(timeout);
		timeout = setTimeout(forceRepaint, 50);
	});
	console.log("Safari needs to repaint on Scroll");
}

class Queries {
	constructor(query: string) {
		let hashes = decodeURI(query).slice(1).split('&');
		for (const hash of hashes) {
			let kv = hash.split('=');
			let key = kv[0];
			let value = kv[1];
			if (key == "r") {
				this.tags = value.split(",");
			} else if (key == "s" && value == "true") {
				this.isSelling = true;
			} else if (key == "t") {
				this.searchWord = value;
			}
		}
	}

	public tags: string[] = [];
	public isSelling: boolean = false;
	searchWord: string = "";

	get isEmpty(): boolean {
		return !this.hasConditions && !this.isSelling && !this.hasSearchWord;
	}

	get hasConditions(): boolean {
		return this.tags.length != 0;
	}

	get hasSearchWord(): boolean {
		return !!this.searchWord;
	}

	get queryString(): string {
		let conditions = this.hasConditions ? `r=${this.tags.toString()}` : "";
		let isSelling = this.isSelling ? "s=true" : "";
		let searchWord = this.searchWord ? `t=${this.searchWord}` : "";
		// TODO NEED REFACTOR
		let queryString = `?${conditions}&${isSelling}&${searchWord}`;
		queryString = queryString.replace(/&+/g, "&");
		queryString = queryString.replace("?&", "?");
		queryString = queryString.replace(/&$/, "");
		if (queryString == "?") queryString = "";
		return queryString;
	}

	clear() {
		this.tags.length = 0;
		this.isSelling = false;
		this.searchWord = "";
	}
}

function readQueries() {
	queries = new Queries(window.location.search);
	if (!queries.isEmpty) {
		let checkboxes = findAll<HTMLInputElement>('input[type="checkbox"]');
		for (let checkbox of checkboxes) {
			let tag = checkbox.getAttribute("data-tag") as string;
			checkbox.checked = queries.tags.includes(tag);
		}

		find<HTMLInputElement>("#sellingInJapan").checked = queries.isSelling;

		textFilter.value = queries.searchWord;
	}
}

function WriteQueries() {
	let queryString = queries.queryString != "" ? queries.queryString : location.pathname;
	history.replaceState(null, "", queryString);
}