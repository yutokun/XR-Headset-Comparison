export class Queries {
    constructor(query: string) {
        let hashes = decodeURI(query).slice(1).split("&");
        for (const hash of hashes) {
            let kv = hash.split("=");
            let key = kv[0];
            let value = kv[1];
            if (key == "r") {
                this.tags = value.split(",");
            } else if (key == "s" && value == "true") {
                this.isSelling = true;
            } else if (key == "t") {
                this.searchWord = value;
            }
        }
    }

    public tags: string[] = [];
    public isSelling: boolean = false;
    searchWord: string = "";

    get isEmpty(): boolean {
        return (
            !this.hasConditions && !this.isSelling && !this.hasSearchWord
        );
    }

    get hasConditions(): boolean {
        return this.tags.length != 0;
    }

    get hasSearchWord(): boolean {
        return !!this.searchWord;
    }

    get queryString(): string {
        let conditions = this.hasConditions
            ? `r=${this.tags.toString()}`
            : "";
        let isSelling = this.isSelling ? "s=true" : "";
        let searchWord = this.searchWord ? `t=${this.searchWord}` : "";
        // TODO NEED REFACTOR
        let queryString = `?${conditions}&${isSelling}&${searchWord}`;
        queryString = queryString.replace(/&+/g, "&");
        queryString = queryString.replace("?&", "?");
        queryString = queryString.replace(/&$/, "");
        if (queryString == "?") queryString = "";
        return queryString;
    }

    clear() {
        this.tags.length = 0;
        this.isSelling = false;
        this.searchWord = "";
    }
}