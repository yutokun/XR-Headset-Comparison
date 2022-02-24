<script lang="ts">
    import anime from "animejs";
    import { onMount } from "svelte";
    import { showAll, applyFilters } from "./libs/table";
    import { Queries } from "./libs/queries";
    import { addBlankToExternalLinks, find, findAll } from "./libs/util";
    import { filterWindowIsActive } from "./libs/filterWindow";

    let queries: Queries;
    let textbox: HTMLInputElement;
    let filterText: string;

    onMount(() => {
        textbox = find<HTMLInputElement>("#textFilter");

        loadQueries();

        const panel = find<HTMLElement>(".background");
        filterWindowIsActive.subscribe((isActive) => {
            panel.style.display = isActive ? "" : "none";
            if (isActive && navigator.userAgent.match("Mobile") == null) textbox.focus();
        });

        findAll<HTMLElement>("button[data-tag]").forEach((toggle) => {
            toggle.addEventListener("click", () => onCheckTagToggle(toggle));
        });

        const sellingInJapanToggle = find<HTMLElement>("#sellingInJapan");
        sellingInJapanToggle.addEventListener("click", () => onCheckSellingToggle(sellingInJapanToggle));

        const buttons = findAll<HTMLElement>("button");
        for (let item of buttons) {
            setButtonAnimation(item);
        }

        document.onkeydown = function (e) {
            if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.code === "KeyF") {
                filterWindowIsActive.set(true);
            } else if (e.code === "Enter" || e.code === "Escape") {
                filterWindowIsActive.set(false);
            }
        };

        addBlankToExternalLinks();
        // filterWindowIsActive.set(false);
    });

    function onClickBackground() {
        filterWindowIsActive.set(false);
    }

    function onClickShowAll() {
        showAll();
        filterText = "";
        findAll(".toggle").forEach((t) => t.removeAttribute("data-checked"));
        queries.clear();
        writeQueries();
    }

    function onInputTextFilter() {
        queries.searchWord = filterText;
        applyFilters(queries);
        writeQueries();
    }

    function SetQuickFilter(tagSet: string[]) {
        onClickShowAll();
        queries.tags = tagSet;
        for (let tag of queries.tags) {
            find<HTMLElement>(`button[data-tag=${tag}]`).toggleAttribute("data-checked");
        }
        applyFilters(queries);
        writeQueries();
    }

    function onCheckTagToggle(toggle: HTMLElement) {
        toggle.toggleAttribute("data-checked");
        if (toggle.hasAttribute("data-checked")) {
            queries.tags.push(toggle.getAttribute("data-tag") as string);
        } else {
            queries.tags = queries.tags.filter((item) => item !== toggle.getAttribute("data-tag"));
        }

        applyFilters(queries);
        writeQueries();
    }

    function onCheckSellingToggle(toggle: HTMLElement) {
        toggle.toggleAttribute("data-checked");
        queries.isSelling = toggle.hasAttribute("data-checked");
        applyFilters(queries);
        writeQueries();
    }

    function loadQueries() {
        queries = new Queries(window.location.search);
        if (queries.isEmpty) return;

        let checkboxes = findAll<HTMLElement>("button[data-tag]");
        for (let checkbox of checkboxes) {
            let tag = checkbox.getAttribute("data-tag") as string;
            if (queries.tags.includes(tag)) checkbox.toggleAttribute("data-checked");
        }

        if (queries.isSelling) find<HTMLElement>("#sellingInJapan").toggleAttribute("data-checked");

        filterText = queries.searchWord;
    }

    function writeQueries() {
        let queryString = queries.queryString != "" ? queries.queryString : location.pathname;
        history.replaceState(null, "", queryString);
    }

    function setButtonAnimation(el: HTMLElement) {
        function over() {
            let isModifiedSize = !(el.style.transform == "scale(1)" || el.style.transform == "");
            if (isModifiedSize) return;
            anime.remove(el);
            anime({
                targets: el,
                easing: "easeOutElastic",
                borderRadius: "10px",
                scale: 1.1,
                duration: 400,
            });
        }

        function leave() {
            anime.remove(el);
            anime({
                targets: el,
                easing: "linear",
                borderRadius: "5px",
                scale: 1,
                duration: 100,
            });
        }

        el.onmouseover = over;
        el.onmouseleave = leave;
        el.addEventListener("touchstart", over);
        el.addEventListener("touchend", leave);
    }
</script>

<div class="background" on:click={onClickBackground}>
    <div class="options" on:click|stopPropagation>
        <button on:click={onClickShowAll}>全て表示</button>

        <p>製品名で検索</p>
        <input type="text" id="textFilter" placeholder="例：oculus" bind:value={filterText} on:input={onInputTextFilter} />

        <p>おすすめ</p>
        <button on:click={() => SetQuickFilter(["virtual", "standalone"])}>VR のスタンドアロン</button>
        <button on:click={() => SetQuickFilter(["augmented", "standalone"])}>AR のスタンドアロン</button>
        <button on:click={() => SetQuickFilter(["virtual", "head6DoF", "bothhands6DoF"])}>自由自在に仮想世界を動きたい</button>
        <button on:click={() => SetQuickFilter(["head3DoF", "onehand3DoF"])}>写真・動画に向いてる</button>

        <style>
            .toggle {
                padding-left: 42px !important;
                background-position: top 50% left 7px;
                background-repeat: no-repeat;
                background-size: 30px;
            }
            .toggle {
                background-image: url(/images/unchecked.svg);
            }
            .toggle[data-checked] {
                background-image: url(/images/checked.svg);
            }
        </style>

        <p>XR タイプで絞り込み</p>
        <button class="toggle" data-tag="virtual">VR</button>
        <button class="toggle" data-tag="augmented">AR</button>
        <button class="toggle" data-tag="smartglass">スマートグラス</button>

        <p>ソフトウェアプラットフォームで絞り込み</p>
        <button class="toggle" data-tag="oculus">Oculus</button>
        <button class="toggle" data-tag="steam">SteamVR</button>
        <button class="toggle" data-tag="winmr">Windows MR</button>
        <button class="toggle" data-tag="psvr">PlayStation VR</button>
        <button class="toggle" data-tag="daydream">Daydream</button>
        <button class="toggle" data-tag="pico">Pico</button>

        <p>フォームファクタで絞り込み</p>
        <button class="toggle" data-tag="pc">PC</button>
        <button class="toggle" data-tag="standalone">スタンドアロン</button>
        <button class="toggle" data-tag="smartphone">スマートフォン</button>
        <button class="toggle" data-tag="console">コンソール</button>

        <p>ヘッドトラッキングで絞り込み</p>
        <button class="toggle" data-tag="head6DoF">6DoF</button>
        <button class="toggle" data-tag="head3DoF">3DoF</button>

        <p>ハンドトラッキングで絞り込み</p>
        <button class="toggle" data-tag="bothhands6DoF">両手6DoF</button>
        <button class="toggle" data-tag="onehand6DoF">片手6DoF</button>
        <button class="toggle" data-tag="onehand3DoF">片手3DoF</button>

        <p>トラッキングのタイプで絞り込み（6DoF ヘッドセットのみに絞られます）</p>
        <button class="toggle" data-tag="withSensor">外部センサーを利用</button>
        <button class="toggle" data-tag="withoutSensor">内蔵センサーで処理</button>

        <p>販売状況で絞り込み</p>
        <button class="toggle" id="sellingInJapan">現在または将来、日本から購入可能</button>

        <p style="text-align: right">
            <a href="https://github.com/yutokun/XR-Headset-Comparison/blob/master/LICENSE.md">ライセンス情報</a>
        </p>
    </div>
</div>

<style>
    .background {
        position: fixed;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 3;
    }
    button {
        box-sizing: unset;
        align-items: center;
        height: 17px;
        padding: 12px;
        margin: 5px auto;
        color: white;
        background-color: #59a5ff;
        border: 1px solid white;
        border-radius: 5px;
        font-weight: bold;
        font-size: 0.9rem;
        cursor: pointer;
    }
    button:hover {
        color: white;
    }
    .options {
        position: fixed;
        top: calc(50px + 50% - 45vh);
        left: calc(50% - 450px);
        max-height: 75vh;
        overflow-y: scroll;
        padding: 1em;
        width: 900px;
        border: 2px solid #c3c3c3;
        background-color: white;
        z-index: 4;
        font-weight: bold;
        scrollbar-color: #c3c3c3 white;
        scrollbar-width: thin; /*Firefox 用*/
    }

    .options::-webkit-scrollbar {
        width: 10px;
    }

    .options::-webkit-scrollbar-thumb {
        background-color: #c3c3c3;
    }
    .options p {
        margin: 1em 0 0 0;
    }
    input[type="text"] {
        border-radius: 5px;
        border: 2px solid #c3c3c3;
        padding: 5px;
    }
    input[type="text"]:focus {
        outline: 0;
        border-color: #59a5ff !important;
        /* TODO なんで important いるんだろ */
    }

    @media screen and (max-width: 1100px) {
        .options {
            width: 600px;
            left: calc(50% - 300px);
        }
    }

    @media screen and (max-width: 760px) {
        .options {
            width: calc(100% - 32px);
            left: auto;
            height: calc(100vh - 82px);
            max-height: none;
            top: calc(50px);
        }
    }
</style>
