"use strict";
var _a;
//最新の CSS で上書き
const style = document.createElement("link");
style.setAttribute("rel", "stylesheet");
style.setAttribute("href", "/style.css?" + Date.now());
find("head").appendChild(style);
//モバイル Chrome のタブ色を変更する
const tabColor = document.createElement("meta");
tabColor.name = "theme-color";
tabColor.content = "black";
document.head.appendChild(tabColor);
//外部リンクに target="_blank" を自動で付加
const aTags = findAll("a");
for (let aTag of aTags) {
    if (((_a = aTag.getAttribute("href")) === null || _a === void 0 ? void 0 : _a.match(/http/)) != null) {
        aTag.setAttribute("target", "_blank");
        console.log(`added to: ${aTag.href}`);
    }
}
//ボタンのアニメーション
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
//アニメーションをボタンにセット
const buttons = findAll(".button");
for (let item of buttons) {
    createButton(item);
}
//フィルタ画面の準備
const optionsBackground = findAll(".options-background")[0];
const optionButton = find("#optionButton");
const textFilter = find("#textFilter");
//フィルタボタンをクリッカブルに
optionButton.addEventListener("click", () => {
    if (optionsBackground.style.display == "block") {
        CloseFilters();
    }
    else {
        OpenFilters();
    }
}, false);
//フィルタ背景をクリッカブルに
optionsBackground.addEventListener("click", () => {
    CloseFilters();
}, false);
//誤ってフィルタが閉じてしまうことを防ぐために、フィルタ画面から背景へのイベント伝播を停止
find(".options").addEventListener("click", (e) => {
    e.stopPropagation();
});
//フィルタ画面を開く
function OpenFilters() {
    optionsBackground.style.display = "block";
    optionButton.style.color = "#22ace8";
    if (navigator.userAgent.match("Mobile") == null)
        textFilter.focus();
}
//フィルタ画面を閉じる
function CloseFilters() {
    optionsBackground.style.display = "none";
    optionButton.style.color = "";
}
//ショートカットキー
document.onkeydown = function (e) {
    if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.keyCode == 70) {
        OpenFilters();
    }
    else if (e.keyCode == 27 || e.keyCode == 13) {
        CloseFilters();
    }
};
