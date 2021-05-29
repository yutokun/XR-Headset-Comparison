"use strict";
var _a;
const style = document.createElement("link");
style.setAttribute("rel", "stylesheet");
style.setAttribute("href", "/style.css?" + Date.now());
find("head").appendChild(style);
const tabColor = document.createElement("meta");
tabColor.name = "theme-color";
tabColor.content = "black";
document.head.appendChild(tabColor);
const aTags = findAll("a");
for (let aTag of aTags) {
    if (((_a = aTag.getAttribute("href")) === null || _a === void 0 ? void 0 : _a.match(/http/)) != null) {
        aTag.setAttribute("target", "_blank");
    }
}
function createButton(el) {
    function over() {
        let isModifiedSize = !(el.style.transform == "scale(1)" || el.style.transform == "");
        if (isModifiedSize)
            return;
        anime.remove(el);
        anime({
            targets: el,
            easing: 'easeOutElastic',
            borderRadius: '10px',
            scale: 1.1,
            duration: 400
        });
    }
    function leave() {
        anime.remove(el);
        anime({
            targets: el,
            easing: 'linear',
            borderRadius: '5px',
            scale: 1,
            duration: 100
        });
    }
    el.onmouseover = over;
    el.onmouseleave = leave;
    el.addEventListener('touchstart', over);
    el.addEventListener('touchend', leave);
}
const buttons = findAll(".button");
for (let item of buttons) {
    createButton(item);
}
const optionsBackground = findAll(".options-background")[0];
const optionButton = find("#optionButton");
const textFilter = find("#textFilter");
optionButton.addEventListener("click", () => {
    if (optionsBackground.style.display == "block") {
        closeFilterDialog();
    }
    else {
        openFilterDialog();
    }
}, false);
optionsBackground.addEventListener("click", () => {
    closeFilterDialog();
}, false);
find(".options").addEventListener("click", (e) => {
    e.stopPropagation();
});
function openFilterDialog() {
    optionsBackground.style.display = "block";
    optionButton.style.color = "#22ace8";
    if (navigator.userAgent.match("Mobile") == null)
        textFilter.focus();
}
function closeFilterDialog() {
    optionsBackground.style.display = "none";
    optionButton.style.color = "";
}
document.onkeydown = function (e) {
    if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.keyCode == 70) {
        openFilterDialog();
    }
    else if (e.keyCode == 27 || e.keyCode == 13) {
        closeFilterDialog();
    }
};
let table = find("table");
let allCells = [];
let queries;
window.onload = function () {
    find("#show-all").addEventListener("click", () => showAll());
    textFilter.addEventListener("input", () => {
        queries.searchWord = textFilter.value;
        applyFilters();
    });
    findAll("input[data-tag]").forEach(cb => {
        cb.addEventListener("click", () => onCheck(cb));
    });
    let sellingInJapan = find("#sellingInJapan");
    sellingInJapan.addEventListener("click", () => onCheckSellingFilter(sellingInJapan));
    fetch("headset.tsv")
        .then(async (data) => {
        parse(await data.text());
        initialize();
    });
};
function parse(sheetText) {
    let thead = table.appendChild(document.createElement("thead"));
    thead.className = "vSticky";
    let tbody = table.appendChild(document.createElement("tbody"));
    let columns = sheetText.split("\n");
    columns.pop();
    let rowLength = columns[0].split("\t").length;
    let sheet = [];
    for (let i = 0; i < rowLength; i++) {
        sheet[i] = new Array(columns.length).fill(undefined);
    }
    for (let i = 0; i < columns.length; i++) {
        let row = columns[i].split("\t");
        for (let j = 0; j < rowLength; j++) {
            sheet[j][i] = row[j];
        }
    }
    for (var i = 0; i < rowLength; i++) {
        let rowFrom = i < 3 ? thead : tbody;
        let row = rowFrom.appendChild(document.createElement("tr"));
        for (var j = 0; j < sheet[i].length; j++) {
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
            if (cellData.includes("\\image")) {
                let img = cell.appendChild(document.createElement("img"));
                let path = cellData.match(/\\image{(.+?)}/)[1];
                img.setAttribute("src", path);
            }
            else if (cellData.includes("\\link")) {
                let linkData = cellData.match(/\\link{(.+?),(.+?)}/);
                let a = cell.appendChild(document.createElement("a"));
                if (linkData) {
                    a.innerText = linkData[1];
                    a.setAttribute("href", linkData[2]);
                }
                a.setAttribute("target", "_blank");
            }
            else {
                cellData = cellData.replace(/\\ct{(\d.+?)}/g, (all, num) => {
                    let price = Number(num) * 1.1;
                    price = Math.floor(price);
                    return price.toLocaleString();
                });
                cell.innerText = cellData.replace(/\\n/g, "\n");
                if (cellData.startsWith("-") || cellData.startsWith("?")) {
                    cell.className = "emptyCell";
                }
            }
            if (j === 0) {
                cell.className = "hSticky column1 bold";
            }
            else if (j == 1) {
                cell.className = "hSticky column2 bold";
            }
            else {
                cell.className = "normalCell";
            }
            cell.setAttribute("data-tag", sheet[1][j]);
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
    }
    else {
        applyFilters();
    }
    find("#loadingMessage").style.display = "none";
}
function showAll() {
    if (location.href.includes("create"))
        return;
    for (let checkbox of findAll("input[type=checkbox]")) {
        checkbox.checked = false;
    }
    for (let cell of allCells) {
        cell.style.display = "";
    }
    textFilter.value = "";
    queries.clear();
    updateStatus();
}
function filterByText(rowTitle, searchText) {
    var _a;
    let reg = new RegExp(searchText, "i");
    let rows = Array.from(findAll("tr"));
    let targetRow = rows.find(r => r.innerText.startsWith(rowTitle));
    let cells = targetRow.children;
    for (let i = 2; i < cells.length; i++) {
        if (!((_a = cells[i].textContent) === null || _a === void 0 ? void 0 : _a.match(reg))) {
            for (let row of rows) {
                row.children[i].style.display = "none";
            }
        }
    }
}
function SetQuickFilter(tagSet) {
    showAll();
    queries.tags = tagSet;
    for (let tag of queries.tags) {
        find(`input[data-tag=${tag}]`).checked = true;
    }
    applyFilters();
}
function filterByTag() {
    var _a;
    for (let condition of queries.tags) {
        for (let cell of allCells) {
            if (!((_a = cell.getAttribute("data-tag")) === null || _a === void 0 ? void 0 : _a.match(condition))) {
                cell.style.display = "none";
            }
        }
    }
}
function onCheck(cb) {
    if (cb.checked) {
        queries.tags.push(cb.getAttribute("data-tag"));
    }
    else {
        queries.tags = queries.tags.filter(item => item !== cb.getAttribute("data-tag"));
    }
    applyFilters();
}
function onCheckSellingFilter(cb) {
    queries.isSelling = cb.checked;
    applyFilters();
}
function applyFilters() {
    for (let cell of allCells) {
        cell.style.display = "";
    }
    table.style.display = "none";
    filterByTag();
    filterByText("製品名", queries.searchWord);
    filterByText("日本国内", queries.isSelling ? "◯" : "");
    table.style.display = "";
    updateStatus();
}
function updateStatus() {
    let count = -2;
    let list = find("tr").children;
    for (let i = 0; i < list.length; i++) {
        if (list[i].style.display === "")
            ++count;
    }
    let statusElem = find("#status");
    if (statusElem) {
        if (count === 0) {
            statusElem.innerHTML = "条件に合うヘッドセットが見つかりませんでした";
        }
        else if (count == list.length - 2) {
            statusElem.innerHTML = `全てを表示中（${count}件）`;
        }
        else {
            statusElem.innerHTML = `${count}件マッチしました`;
        }
    }
    forceRepaint();
    WriteQueries();
}
function forceRepaint() {
    let ua = window.navigator.userAgent;
    let isSafari = ua.includes("Safari") && !ua.includes("Chrome");
    if (!isSafari)
        return;
    let table = findAll("table")[0];
    table.classList.add("safari-repaint");
    setTimeout(() => table.classList.remove("safari-repaint"), 100);
}
function setAutomaticRepaint() {
    let ua = window.navigator.userAgent;
    let isSafari = ua.includes("Safari") && !ua.includes("Chrome");
    if (isSafari) {
        let timeout;
        window.addEventListener("scroll", function () {
            clearTimeout(timeout);
            timeout = setTimeout(forceRepaint, 50);
        });
        console.log("Safari needs to repaint on Scroll");
    }
}
class Queries {
    constructor(query) {
        this.tags = [];
        this.isSelling = false;
        this.searchWord = "";
        let hashes = decodeURI(query).slice(1).split('&');
        for (const hash of hashes) {
            let kv = hash.split('=');
            let key = kv[0];
            let value = kv[1];
            if (key == "r") {
                this.tags = value.split(",");
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
        return !this.hasConditions && !this.isSelling && !this.hasSearchWord;
    }
    get hasConditions() {
        return this.tags.length != 0;
    }
    get hasSearchWord() {
        return !!this.searchWord;
    }
    get queryString() {
        let conditions = this.hasConditions ? `r=${this.tags.toString()}` : "";
        let isSelling = this.isSelling ? "s=true" : "";
        let searchWord = this.searchWord ? `t=${this.searchWord}` : "";
        let queryString = `?${conditions}&${isSelling}&${searchWord}`;
        queryString = queryString.replace(/&+/g, "&");
        queryString = queryString.replace("?&", "?");
        queryString = queryString.replace(/&$/, "");
        if (queryString == "?")
            queryString = "";
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
        let checkboxes = findAll('input[type="checkbox"]');
        for (let checkbox of checkboxes) {
            let tag = checkbox.getAttribute("data-tag");
            checkbox.checked = queries.tags.includes(tag);
        }
        find("#sellingInJapan").checked = queries.isSelling;
        textFilter.value = queries.searchWord;
    }
}
function WriteQueries() {
    let queryString = queries.queryString != "" ? queries.queryString : location.pathname;
    history.replaceState(null, "", queryString);
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
