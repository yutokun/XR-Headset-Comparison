<script lang="ts">
	import { onMount } from "svelte";
	import Create from "./Create.svelte";
	import Header from "./Header.svelte";
	import { Queries } from "./libs/queries";
	import { applyFilters } from "./libs/table";
	import Options from "./Options.svelte";
	import Table from "./Table.svelte";

	let loadingMessageStyle: string;
	let creationMode: boolean;

	function onTableLoaded() {
		let queries = new Queries(window.location.search);
		if (!queries.isEmpty) {
			applyFilters(queries);
		}
		loadingMessageStyle = "display: none";
	}

	onMount(() => {
		// モバイル Chrome のタブ色を変更する
		const tabColor = document.createElement("meta");
		tabColor.name = "theme-color";
		tabColor.content = "black";
		document.head.appendChild(tabColor);
	});

	function onKeyDown(e) {
		if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.altKey && e.code === "KeyC") {
			creationMode = !creationMode;
		}
	}
</script>

<svelte:window on:keydown={onKeyDown} />

<svelte:head>
	<title>XR ヘッドセット比較表</title>
	<meta name="viewport" content="width=device-width,initial-scale=1.0" />
	<link rel="stylesheet" href="/dark-mode.css" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap" rel="stylesheet" />
	<link href="https://fonts.googleapis.com/css2?family=Kosugi&display=swap" rel="stylesheet" />
	<meta property="og:title" content="XR ヘッドセット比較表" />
	<meta property="og:description" content="XR ヘッドセットの比較表です。お手軽なフィルタや、製品名でのインクリメンタルサーチに対応しています。" />
	<meta property="og:image" content="https://xr-comparison.yutokun.com/OGP.jpg" />
	<meta property="og:image:src" content="https://xr-comparison.yutokun.com/OGP.jpg" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<main>
	{#if creationMode}
		<Create />
	{:else}
		<Header />
		<div id="loadingMessage" style={loadingMessageStyle}>読み込み中...</div>
		<Table on:tableLoaded={onTableLoaded} />
		<Options />
	{/if}
</main>

<style>
	#loadingMessage {
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: bold;
		font-size: 2em;
	}

	@media print {
		#loadingMessage {
			display: none;
		}
	}
</style>
