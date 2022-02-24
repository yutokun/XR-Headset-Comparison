<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { initializeTable, load } from "./libs/table";
    import { find } from "./libs/util";

    const dispatch = createEventDispatcher();

    onMount(() => {
        initializeTable(find("table"))
            .then(() => load("headset.tsv"))
            .then(() => dispatch("tableLoaded"));
    });
</script>

<div>
    <table />
    <style>
        table {
            display: table-cell;
            border-collapse: collapse;
            /*これをしないとtrにボーダーが効かない*/
            margin-bottom: 2em;
            width: 100%;
            font-size: 15px;
        }

        thead {
            display: grid;
        }

        tbody {
            display: grid;
            position: relative;
            top: 48px;
        }

        tr {
            display: inline-flex;
            border-top: 2px solid #c3c3c3;
            border-bottom: 2px solid #c3c3c3;
        }

        tr:not(:first-child) {
            border-top: none;
        }

        th {
            font-weight: bold;
            text-align: left;
        }

        td {
            font-family: -apple-system, BlinkMacSystemFont, Krub, "Kosugi";
        }

        td.hSticky {
            font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Krub, arial, "Hiragino Kaku Gothic Pro", "Noto Sans JP", Meiryo, sans-serif;
        }

        th,
        td {
            display: flex;
            align-items: center;
            padding: 8px;
            line-height: 1.5em;
            border-right: 2px solid #c3c3c3;
        }

        th:first-child,
        td:first-child {
            border-left: 2px solid #c3c3c3;
        }

        table img {
            object-fit: contain;
            height: 150px;
            border: none;
            border-radius: 0;
            margin-bottom: 0;
            vertical-align: bottom;
            width: 100%;
        }

        .vSticky {
            position: -webkit-sticky;
            position: sticky;
            top: 50px;
            z-index: 2;
            background-color: white;
        }

        .hSticky {
            position: -webkit-sticky;
            position: sticky;
            left: 0;
            z-index: 1;
            background-color: white;
        }

        .column1 {
            width: 90px;
        }

        .column2 {
            width: 130px;
            left: 110px;
        }

        .normalCell {
            width: 266px;
        }

        .emptyCell {
            background-color: rgba(0, 0, 0, 0.15);
            color: rgba(0, 0, 0, 0.5);
        }

        p {
            margin-bottom: 1.5em;
            line-height: 2em;
        }

        p + p {
            margin-top: 1.5em;
        }

        .bold {
            font-weight: bold;
        }

        @media screen and (max-width: 320px) {
            p {
                line-height: 1.8em;
            }
        }

        @media screen and (min-width: 761px) {
            p {
                line-height: 2em;
            }
        }

        @media print {
            .vSticky {
                position: relative;
                top: 50px;
            }
        }

        .safari-repaint {
            animation: repaint 1ms;
        }

        @keyframes repaint {
            from {
                width: 99.999%;
            }
            to {
                width: 100%;
            }
        }
    </style>
</div>
