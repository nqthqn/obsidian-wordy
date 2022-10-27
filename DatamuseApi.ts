/*

commands:

Wordy: Full Query
Wordy: Synonyms
    rel_syn
    rel_spc
    rel_gen
    rel_com
    rel_par
Wordy: Antonyms
    rel_ant  
Wordy: Rhymes
    rel_rhy
    rel_nry
Wordy: Definition
*/
export type RelKey = "rel_syn" | "rel_spc" | "rel_gen" | "rel_com" | "rel_par";
export type SimilarWords = {
    [key in RelKey]: {
        title: string,
        relatedWords: string[]
    }
}


export class DatamuseApi {
    baseUrl = new URL("https://api.datamuse.com/words");
    // constructor() {
    //     console.log("got cccc here!!!!");
    // }

    async wordsSimilarTo(rootWord: string): Promise<SimilarWords> {
        console.log("got here!!!!");

        const similarWords: SimilarWords =
        {
            "rel_syn": {
                title: "Synonyms",
                relatedWords: []
            },
            "rel_spc": {
                title: "Hypernyms",
                relatedWords: []
            },
            "rel_gen": {
                title: "Hyponyms",
                relatedWords: []
            },
            "rel_com": {
                title: "Holonyms",
                relatedWords: []
            },
            "rel_par": {
                title: "Meronyms",
                relatedWords: []
            },
        }
        const urls = Object.keys(similarWords);
        console.log(urls);

        await Promise.all(urls.map(async (queryParam: RelKey) => {
            const url = `${this.baseUrl}?${queryParam}=${rootWord}`;
            console.log(url);
            const resp = await fetch(url);
            const data = await resp.json();
            similarWords[queryParam]["relatedWords"] = data.map((o: any) => o.word)
        }));
        return similarWords;
    }

    async wordsThatRhymeWith(rootWord: string): Promise<string[]> {
        fetch(this.baseUrl + "?rel_rhy=" + rootWord)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                return data.map((o: any) => o.word);
            });
        return ["fuck"];
    }


}
// type validParam = "rel_syn" | "rel_spc";

// BUILDER PATTERN
/*
var search = new DatamuseApi();
search.wordsSimilarTo("bare")
search.soundsLike("empty")

await search.execute()
*/

// INTERPRETER PATTERN
// type SimilarTo = { kind: "rel_syn", value: string, cont: expr }
// type Homophones = { kind: "rel_hom", value: string, cont: expr }
// type expr = SimilarTo | Homophones
// type validParams = expr["kind"];
// function worldSimilarTo(expr: expr, word: string): expr {
//     return { kind: "rel_syn", value: word, cont: expr };
// }

// function homophones(expr: expr, word: string): expr {

// }

// var searchExpr = homonyn(wordsSimilarTo({}, "bare"), "empty");



// function exprToUrl(expr: expr, baseUrl: URL): URL {
//     let curExpr = expr;
//     while (curExpr != undefined) {
//         switch (curExpr.kind) {
//             case "rel_syn":
//                 baseUrl.searchParams.append(curExpr.kind, curExpr.value);
//                 break;
//             case "rel_hom":
//                 baseUrl.searchParams.append(curExpr.kind, curExpr.value);
//                 break;

//         }
//         curExpr = curExpr.cont;
//     }

// }
