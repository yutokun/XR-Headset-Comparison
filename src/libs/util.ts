export function find<T extends HTMLElement>(query: string) {
	let result = document.querySelector<T>(query);
	if (result == null) {
		throw new Error(`オブジェクトが見つかりませんでした: ${query}`);
	} else {
		return result;
	}
}

export function findAll<T extends HTMLElement>(query: string) {
	let result = document.querySelectorAll<T>(query);
	if (result == null) {
		throw new Error(`オブジェクトが見つかりませんでした: ${query}`);
	} else {
		return result;
	}
}

export function addBlankToExternalLinks() {
	const aTags = findAll<HTMLAnchorElement>("a");
	for (let aTag of aTags) {
		if (aTag.getAttribute("href")?.match(/http/) != null) {
			aTag.setAttribute("target", "_blank");
		}
	}
}