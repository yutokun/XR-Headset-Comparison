<script lang="ts">
    import { onMount } from "svelte";
    import { filterWindowIsActive } from "./libs/filterWindow";
    import { count, headsetsCount } from "./libs/table";
    import { find } from "./libs/util";

    let filterButton: HTMLElement;
    let status: string;

    count.subscribe((count) => {
        if (count < 0) {
            status = "";
        } else if (count === 0) {
            status = "条件に合うヘッドセットが見つかりませんでした";
        } else if (count === headsetsCount) {
            status = `全てを表示中（${count}件）`;
        } else {
            status = `${count}件マッチしました`;
        }
    });

    onMount(() => {
        filterButton = find("#filterButton");
        filterWindowIsActive.subscribe(() => {
            filterButton.style.color = $filterWindowIsActive ? "#22ace8" : "";
        });
    });

    function switchFilterWindow() {
        filterWindowIsActive.set(!$filterWindowIsActive);
    }
</script>

<header>
    <span id="title">XR ヘッドセット比較表</span>
    <span id="status">{status}</span>
    <span id="filterButton" on:click={switchFilterWindow}>フィルタ</span>
</header>

<style>
    header {
        position: fixed;
        min-height: 50px;
        width: 100%;
        background-color: black;
        display: flex;
        align-items: center;
        color: #dadada;
        font-weight: bold;
        z-index: 100;
    }
    header span {
        position: absolute;
    }
    #title {
        left: 1em;
    }
    #status {
        left: 50%;
        transform: translateX(-50%);
        font-weight: normal;
        font-family: -apple-system, BlinkMacSystemFont, "Kosugi";
    }
    #filterButton {
        display: flex;
        align-items: center;
        right: 0;
        height: 50px;
        padding: 0 1em;
        transition: 0.25s;
        cursor: pointer;
    }
    #filterButton:hover {
        color: #22ace8;
        background-color: rgba(255, 255, 255, 0.15);
    }

    @media screen and (max-width: 760px) {
        header {
            height: 50px;
            align-items: flex-start;
            line-height: 50px;
        }
    }

    @media screen and (max-width: 550px) {
        #title {
            display: none;
        }
        #status {
            left: 1em;
            transform: translateX(0%);
        }
    }

    @media print {
        header {
            position: absolute;
        }
        #filterButton {
            display: none;
        }
        #status {
            left: auto;
            right: 1em;
            transform: translateX(0);
        }
    }
</style>
