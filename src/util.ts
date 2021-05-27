function find<T extends HTMLElement>(query: string) {
	let result = document.querySelector<T>(query);
	if (result == null) {
		console.log(`オブジェクトが見つかりませんでした: ${query}`);
		throw new Error("エラー");
	} else {
		return result;
	}
}

function findAll<T extends HTMLElement>(query: string) {
	let result = document.querySelectorAll<T>(query);
	if (result == null) {
		console.log(`オブジェクトが見つかりませんでした: ${query}`);
		throw new Error("エラー");
	} else {
		return result;
	}
}