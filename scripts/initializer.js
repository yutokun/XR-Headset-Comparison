//最新の CSS で上書き
var style = document.createElement("link");
style.setAttribute("rel", "stylesheet");
style.setAttribute("href", "/style.css?" + Date.now());
document.getElementsByTagName("head")[0].appendChild(style);

var header = document.getElementsByTagName("header")[0];

//モバイル Chrome のタブ色を変更する
var tabColor = document.createElement("meta");
tabColor.name = "theme-color";
tabColor.content = "black";
document.head.appendChild(tabColor);

//外部リンクに target="_blank" を自動で付加
var aTag = document.getElementsByTagName("a");
for (var i = 0; i < aTag.length; ++i) {
	if(aTag[i].getAttribute("href").match(/http/) != null) {
		aTag[i].setAttribute("target", "_blank");
		console.log("added to: " + aTag[i].href);
	}
}

//ボタンのアニメーション
function createButton (el) {
	function enter () {
		anime.remove(el);
		anime({
			targets: el,
			easing: 'easeOutElastic',
			borderRadius: '10px',
			scale: 1.1,
			duration: 400
		});
	}
	function out () {
		anime.remove(el);
		anime({
			targets: el,
			easing: 'linear',
			borderRadius: '5px',
			scale: 1,
			duration: 100
		});
	}
	el.onmouseenter = enter;
	el.onmouseout = out;
	el.onmouseleave = out;
	el.addEventListener('touchstart', enter);
	el.addEventListener('touchend', out);
}

//アニメーションをボタンにセット
var buttons = document.querySelectorAll(".button");
for (let item of buttons) {
	createButton(item);
}

//フィルタ画面の準備
var optionsBackground = document.getElementsByClassName("options-background")[0];
var optionButton = document.getElementById("optionButton");
var textFilter = document.getElementById("textFilter");

//フィルタボタンをクリッカブルに
optionButton.addEventListener("click", () => {
	if(optionsBackground.style.display == "block"){
		CloseFilters();
	}else{
		OpenFilters();
	}
}, false);

//フィルタ背景をクリッカブルに
optionsBackground.addEventListener("click", () => {
	CloseFilters();
}, false);

//誤ってフィルタが閉じてしまうことを防ぐために、フィルタ画面から背景へのイベント伝播を停止
document.getElementsByClassName("options")[0].addEventListener("click", (e) => {
	e.stopPropagation();
});

//フィルタ画面を開く
function OpenFilters () {
	optionsBackground.style.display = "block";
	optionButton.style.color = "#22ace8";
	if(navigator.userAgent.match("Mobile") == null)
		textFilter.focus();
}

//フィルタ画面を閉じる
function CloseFilters () {
	optionsBackground.style.display = "none";
	optionButton.style.color = "";
}

//ショートカットキー
document.onkeydown = function(e) {
	if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.keyCode == 70) {
		OpenFilters();
	} else if (e.keyCode == 27 || e.keyCode == 13) {
		CloseFilters();
	}
};