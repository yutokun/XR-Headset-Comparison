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
const aTags = findAll<HTMLAnchorElement>("a");
for (let aTag of aTags) {
	if (aTag.getAttribute("href")?.match(/http/) != null) {
		aTag.setAttribute("target", "_blank");
	}
}

//ボタンのアニメーション
function createButton(el: HTMLElement) {
	function over() {
		let isModifiedSize = !(el.style.transform == "scale(1)" || el.style.transform == "");
		if (isModifiedSize) return;
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
const buttons = findAll<HTMLElement>(".button");
for (let item of buttons) {
	createButton(item);
}

//フィルタ画面の準備
const optionsBackground = findAll(".options-background")[0];
const optionButton = find("#optionButton");
const textFilter = find<HTMLInputElement>("#textFilter");

//フィルタボタンをクリッカブルに
optionButton.addEventListener("click", () => {
	if (optionsBackground.style.display == "block") {
		closeFilterDialog();
	} else {
		openFilterDialog();
	}
}, false);

//フィルタ背景をクリッカブルに
optionsBackground.addEventListener("click", () => {
	closeFilterDialog();
}, false);

//誤ってフィルタが閉じてしまうことを防ぐために、フィルタ画面から背景へのイベント伝播を停止
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

//ショートカットキー
document.onkeydown = function (e) {
	if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.keyCode == 70) {
		openFilterDialog();
	} else if (e.keyCode == 27 || e.keyCode == 13) {
		closeFilterDialog();
	}
};