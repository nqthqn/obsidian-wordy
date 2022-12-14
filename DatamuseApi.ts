export type SimilarWords = {
    relatedWords: string[]
}

export class DatamuseApi {
    baseUrl = new URL("https://api.datamuse.com/words");

    async wordsSimilarTo(rootWord: string): Promise<SimilarWords> {
        const similarWords: SimilarWords =
        {
            relatedWords: []
        }
        const urls = ["rel_syn", "rel_spc", "rel_gen", "rel_com", "rel_par"];
        await Promise.all(urls.map(async (queryParam: string) => {
            const url = `${this.baseUrl}?${queryParam}=${rootWord}`;
            const resp = await fetch(url);
            const data = await resp.json();
            similarWords.relatedWords.push(...data.map((o: any) => o.word))
        }));
        return similarWords;
    }

	async wordsOppositeTo(rootWord: string): Promise<string[]> {
        const results: string[] = [];
		const urls = ["rel_ant"];
        await Promise.all(urls.map(async (queryParam: string) => {
            const url = `${this.baseUrl}?${queryParam}=${rootWord}`;
            const resp = await fetch(url);
            const data = await resp.json();
            results.push(...data.map((o: any) => o.word))
        }));
        return results;
    }

}
