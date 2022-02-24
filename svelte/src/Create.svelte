<script lang="ts">
    import { onMount } from "svelte";
    import { initializeTable, parse } from "./libs/table";
    import { find, findAll } from "./libs/util";

    let data;

    onMount(() => {
        initializeTable(find("table"));
        let inputs = document.querySelectorAll("input[type=text],textarea,select");
        for (let prop of inputs) prop.addEventListener("input", generateAndReload);
        findAll<HTMLElement>("button[data-tag]").forEach((toggle) => {
            toggle.addEventListener("click", () => {
                toggle.toggleAttribute("data-checked");
                generateAndReload();
            });
        });
        generate();
        reloadSheet();
    });

    function generateAndReload() {
        generate();
        let old = document.getElementById("preview");
        while (old.lastChild) old.removeChild(old.lastChild);
        reloadSheet();
    }

    function generate() {
        let form = document.forms.inputs;
        data = "";
        addLine(form.title.value);
        addLine(getQueries());
        addLine("\\image{/images/headsets/" + encodeURIComponent(form.image.value) + "}");
        addLine(form.type.value);
        addLine(form.description.value);
        addLine(form.platform.value);
        addLine(form.head.value);
        addLine(form.hand.value);
        addLine(form.trackingArea.value);
        addLine(form.comfortability.value);
        addLine(form.input.value);
        addLine(form.processor.value);
        addLine(form.storage.value);
        addLine(form.ipd.value);
        addLine(form.visionAcuityAdjustment.value);
        addLine(getDensityText());
        addLine(getDisplayText());
        addLine(getFovText());
        addLine(form.headphone.value);
        addLine(form.microphone.value);
        addLine(form.headphonePlug.value);
        addLine(form.salesStatus.value);
        addLine(form.salesStatusJP.value);
        addLine(form.priceInUSD.value);
        addLine(form.priceInJPY.value);
        addLine(form.ageLimitation.value);
        addLine(form.ageLimitationName.value && form.ageLimitationUrl.value ? `\\link{${form.ageLimitationName.value},${form.ageLimitationUrl.value}}` : "-");
        addLine(form.link1Name.value && form.link1Url.value ? `\\link{${form.link1Name.value},${form.link1Url.value}}` : "-");
        addLine(form.link2Name.value && form.link2Url.value ? `\\link{${form.link2Name.value},${form.link2Url.value}}` : "-");
        addLine(form.link3Name.value && form.link3Url.value ? `\\link{${form.link3Name.value},${form.link3Url.value}}` : "-");

        data = data.slice(0, -1);
        document.forms.result.result.textContent = data;
    }

    function addLine(text) {
        if (text == "") {
            data += "-\t";
        } else {
            text = text.replace(/\n/g, "\\n");
            data += text + "\t";
        }
    }

    function getQueries() {
        let text = "";
        let toggles = document.querySelectorAll("button");
        for (let toggle of toggles) {
            if (toggle.hasAttribute("data-checked")) {
                text += toggle.getAttribute("data-tag") + " ";
            }
        }
        return text;
    }

    function getDensityText() {
        // 左右の辺を2乗したものを足して、その平方根を視野角で割る
        let form = document.forms.inputs;
        let horizontal = form.horizontalPixelCount.value;
        let vertical = form.verticalPixelCount.value;
        let fov = form.fov.value;

        let density = Math.sqrt(horizontal ** 2 + vertical ** 2) / fov;

        if (isNaN(density) || density == Infinity) return "-";

        return density.toFixed(2) + "px";
    }

    function getDisplayText() {
        let form = document.forms.inputs;
        let horizontal = form.horizontalPixelCount.value;
        let vertical = form.verticalPixelCount.value;
        let fps = form.refreshRate.value;

        let result = "";
        if (isNumber(horizontal) && isNumber(vertical)) result += horizontal + " × " + vertical;
        if (fps) {
            if (result != "") result += " @ ";
            result += fps + "fps";
        }
        return result;
    }

    function getFovText() {
        let form = document.forms.inputs;
        let fov = form.fov.value;
        return fov != "" ? fov + "度" : "-";
    }

    function isNumber(candidate) {
        return !isNaN(candidate) && candidate != undefined && candidate != "";
    }

    function reloadSheet() {
        let sheet = "\t\t概要\t\t\tソフトウェア\tトラッキング\t\t\t\t入力\t基礎能力\t\tレンズ\t\tビジュアル\t\t\tオーディオ\t\t\t発売状況\t\t価格※込み込み\t\tメーカー推奨年齢\t\t参考情報\t\t\n製品名\ttag\t写真\tタイプ\t所感\tプラットフォーム\tヘッドトラッキング\tハンドトラッキング\tエリア\t快適さ（トラッキングの完成度）\t入力\tプロセッサ\t内蔵ストレージ\tIPD\t視度調節\t画素密度（斜辺のピクセル数を視野角で割った値。参考に留めて下さい。）\tディスプレイ\t視野角\tヘッドフォン\tマイク\tヘッドフォン端子\t海外\t日本国内\t海外価格（税込み）断りがなければ米ドル\t国内価格（税込）\t概要と抜粋\t情報源\tリンク1\tリンク2\tリンク3\n" + data + "\n";
        parse(sheet);
    }
</script>

<svelte:head>
    <title>データ作成</title>
</svelte:head>

<header>
    <span>比較表用データ作成</span>
</header>
<div class="columns">
    <section id="inputs">
        <section>
            <form name="inputs" action="">
                <div>
                    <label for="title">製品名</label>
                    <input type="text" name="title" />
                </div>
                <div>
                    <label for="queries">検索クエリ</label>

                    <div>
                        <p>XR タイプ</p>
                        <button type="button" class="toggle" data-tag="virtual">VR</button>
                        <button type="button" class="toggle" data-tag="augmented">AR</button>
                        <button type="button" class="toggle" data-tag="smartglass">スマートグラス</button>

                        <p>ソフトウェアプラットフォームで絞り込み</p>
                        <button type="button" class="toggle" data-tag="oculus">Oculus</button>
                        <button type="button" class="toggle" data-tag="steam">SteamVR</button>
                        <button type="button" class="toggle" data-tag="winmr">Windows MR</button>
                        <button type="button" class="toggle" data-tag="psvr">PlayStation VR</button>
                        <button type="button" class="toggle" data-tag="daydream">Daydream</button>
                        <button type="button" class="toggle" data-tag="pico">Pico</button>

                        <p>フォームファクタで絞り込み</p>
                        <button type="button" class="toggle" data-tag="pc">PC</button>
                        <button type="button" class="toggle" data-tag="standalone">スタンドアロン</button>
                        <button type="button" class="toggle" data-tag="smartphone">スマートフォン</button>
                        <button type="button" class="toggle" data-tag="console">コンソール</button>

                        <p>ヘッドトラッキングで絞り込み</p>
                        <button type="button" class="toggle" data-tag="head6DoF">6DoF</button>
                        <button type="button" class="toggle" data-tag="head3DoF">3DoF</button>

                        <p>ハンドトラッキングで絞り込み</p>
                        <button type="button" class="toggle" data-tag="bothhands6DoF">両手6DoF</button>
                        <button type="button" class="toggle" data-tag="onehand6DoF">片手6DoF</button>
                        <button type="button" class="toggle" data-tag="onehand3DoF">片手3DoF</button>

                        <p>トラッキングのタイプで絞り込み（6DoF ヘッドセットのみに絞られます）</p>
                        <button type="button" class="toggle" data-tag="withSensor">外部センサーを利用</button>
                        <button type="button" class="toggle" data-tag="withoutSensor">内蔵センサーで処理</button>
                    </div>
                </div>

                <div>
                    <label for="image">画像ファイル名</label>
                    <input type="text" name="image" placeholder="Oculus Rift CV1.png" />
                </div>
                <div>
                    <label for="type">タイプ</label>
                    <select name="type" id="">
                        <option value="PC">PC</option>
                        <option value="スタンドアロン">スタンドアロン</option>
                        <option value="モバイル">モバイル</option>
                        <option value="コンソール">コンソール</option>
                        <option value="スマホ（高）">スマホ（高）</option>
                        <option value="PC、スタンドアロン両用">PC、スタンドアロン両用</option>
                        <option value="HDMI 入力">HDMI 入力</option>
                    </select>
                </div>
                <div>
                    <label for="description">所感</label>
                    <textarea name="description" id="" cols="30" rows="10" />
                </div>
                <div>
                    <label for="platform">プラットフォーム</label>
                    <textarea name="platform" id="" cols="30" rows="5" placeholder="Oculus" />
                </div>
                <div>
                    <label for="head">ヘッドトラッキング</label>
                    <input type="text" name="head" placeholder="6DoF（Constellation）" />
                </div>
                <div>
                    <label for="hand">ハンドトラッキング</label>
                    <input type="text" name="hand" placeholder="両手6DoF" />
                </div>
                <div>
                    <label for="trackingArea">トラッキングエリア</label>
                    <textarea name="trackingArea" id="" cols="30" rows="3" placeholder="最大1.5m四方（2センサー）" />
                </div>
                <div>
                    <label for="comfortability">快適さ</label>
                    <select name="comfortability" id="">
                        <option value="◎">◎</option>
                        <option value="◯">◯</option>
                        <option value="△">△</option>
                        <option value="😱">😱</option>
                        <option value="筆者未体験">筆者未体験</option>
                    </select>
                </div>
                <div>
                    <label for="input">入力方法</label>
                    <textarea name="input" id="" cols="30" rows="5" placeholder="Oculus Touch" />
                </div>
                <div>
                    <label for="processor">プロセッサ</label>
                    <input type="text" name="processor" placeholder="PC依存" />
                </div>
                <div>
                    <label for="storage">内臓ストレージ</label>
                    <textarea name="storage" id="" cols="30" rows="3" placeholder="64GB" />
                </div>
                <div>
                    <label for="ipd">IPD</label>
                    <input type="text" name="ipd" placeholder="59 - 70mm, 固定など" />
                </div>
                <div>
                    <label for="visionAcuityAdjustment">視度調整</label>
                    <input type="text" name="visionAcuityAdjustment" />
                </div>
                <div>
                    <label for="display">ディスプレイ</label>
                    <input type="text" name="horizontalPixelCount" placeholder="2160" style="width: 50px;" />
                    &nbsp;×&nbsp;
                    <input type="text" name="verticalPixelCount" placeholder="1200" style="width: 50px;" />
                    &nbsp;@&nbsp;
                    <input type="text" name="refreshRate" placeholder="90" style="width: 50px;" />
                    &nbsp;fps
                </div>
                <div>
                    <label for="fov">視野角</label>
                    <input type="text" name="fov" placeholder="110" />
                    &nbsp;度
                </div>
                <div>
                    <label for="headphone">ヘッドフォン</label>
                    <input type="text" name="headphone" placeholder="ヘッドフォン備え付け" />
                </div>
                <div>
                    <label for="microphone">マイク</label>
                    <input type="text" name="microphone" placeholder="マイク内蔵" />
                </div>
                <div>
                    <label for="headphonePlug">ヘッドフォン端子</label>
                    <input type="text" name="headphonePlug" placeholder="ヘッドフォン端子なし" />
                </div>
                <div>
                    <label for="salesStatus">海外販売状況</label>
                    <select name="salesStatus" id="">
                        <option value="◯">◯</option>
                        <option value="◯（○年後半）">◯（○年後半）</option>
                        <option value="△">△</option>
                        <option value="△（○年後半）">△（○年後半）</option>
                        <option value="×">×</option>
                        <option value="販売終了">販売終了</option>
                        <option value="販売終了（○年○月〇日）">販売終了（○年○月〇日）</option>
                        <option value="発売中止">発売中止</option>
                        <option value="開発中">開発中</option>
                    </select>
                </div>
                <div>
                    <label for="salesStatusJP">国内販売状況</label>
                    <select name="salesStatusJP" id="">
                        <option value="◯">◯</option>
                        <option value="◯（○年後半）">◯（○年後半）</option>
                        <option value="△">△</option>
                        <option value="△（○年後半）">△（○年後半）</option>
                        <option value="×">×</option>
                        <option value="販売終了">販売終了</option>
                        <option value="販売終了（○年○月〇日）">販売終了（○年○月〇日）</option>
                        <option value="発売中止">発売中止</option>
                        <option value="開発中">開発中</option>
                    </select>
                </div>
                <div>
                    <label for="priceInUSD">米ドル（税込み）</label>
                    <textarea name="priceInUSD" id="" cols="30" rows="3" placeholder="$399" />
                </div>
                <div>
                    <label for="priceInJPY">日本円（税込み）<br />ex. ¥\ct{49800}</label>
                    <textarea name="priceInJPY" id="" cols="30" rows="3" placeholder="¥50,000 or ¥\ct{49800}" />
                </div>
                <div>
                    <label for="ageLimitation">年齢制限の概要</label>
                    <textarea name="ageLimitation" id="" cols="30" rows="10" />
                </div>
                <div>
                    <label for="link1-name">年齢制限の情報源</label>
                    <div>
                        <input type="text" name="ageLimitationName" placeholder="" />
                        <input type="text" name="ageLimitationUrl" placeholder="https://" />
                    </div>
                </div>
                <div>
                    <label for="link1-name">リンク1</label>
                    <div>
                        <input type="text" name="link1Name" placeholder="公式サイト" />
                        <input type="text" name="link1Url" placeholder="https://" />
                    </div>
                </div>
                <div>
                    <label for="link2Name">リンク2</label>
                    <div>
                        <input type="text" name="link2Name" placeholder="Mogura VR さんの記事" />
                        <input type="text" name="link2Url" placeholder="https://" />
                    </div>
                </div>
                <div>
                    <label for="link3Name">リンク3</label>
                    <div>
                        <input type="text" name="link3Name" placeholder="PANORA さんの記事" />
                        <input type="text" name="link3Url" placeholder="https://" />
                    </div>
                </div>
            </form>
        </section>
        <section>
            <form name="result">
                <div>
                    <label for="result">Result</label>
                    <textarea name="result" id="result" cols="30" rows="30" />
                </div>
            </form>
        </section>
    </section>
    <section>
        <table id="preview" />
    </section>
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

        /* プレビューのスタイル */

        table {
            display: table-cell;
            border-collapse: collapse;
            /*これをしないとtrにボーダーが効かない*/
            position: relative;
            top: 50px;
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
            top: -2px;
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
    </style>
</div>

<style>
    header {
        position: fixed;
        min-height: 50px;
        width: 100%;
        padding-left: 1em;
        background-color: black;
        display: flex;
        align-items: center;
        color: #dadada;
        font-weight: bold;
        z-index: 100;
    }

    #inputs {
        padding: 70px 2em;
    }

    label {
        display: inline-block;
        width: 10em;
        font-weight: bold;
    }

    form > div {
        margin-bottom: 1em;
        display: flex;
        align-items: center;
    }

    p {
        margin: 1em 0 0 0;
        font-weight: bold;
    }

    .columns {
        display: flex;
        justify-content: flex-start;
        width: 1420px;
        margin: 0 auto;
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
</style>
