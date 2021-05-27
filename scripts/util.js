"use strict";
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
