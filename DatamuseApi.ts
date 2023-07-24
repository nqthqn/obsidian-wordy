import { Notice } from "obsidian";

export type SimilarWords = {
	relatedWords: string[];
};

// This uses WordNet and RhymeZone
// https://www.datamuse.com/api/
type QueryParam =
	| "rel_rhy" // Rhymes 									spade → aid
	| "rel_nry" // Approximate rhymes						forest → chorus
	| "rel_hom" // Homophones (sound-alike words)			course → coarse
	| "rel_cns" // Consonant match							sample → simple
	| "rel_ant" // Antonyms									late → early
	| "rel_syn" // Synonyms 								ocean → sea
	| "rel_spc" // "More general than" (direct hyponyms)	boat → gondola
	| "rel_gen" // "More general than" (direct hyponyms)	boat → gondola
	| "rel_com" // "Comprises" (direct holonyms)			car → accelerator
	| "rel_par" // "Part of" (direct meronyms)				trunk → tree
  | "ml";			// "Meaning like"

export class DatamuseApi {
	baseUrl = new URL("https://api.datamuse.com/words");

	async wordsSimilarTo(rootWord: string, extra = false): Promise<string[]> {
		const results: string[] = [];
		const urls: QueryParam[] = [
			"ml",
			"rel_syn",
			"rel_spc",
			"rel_gen",
			"rel_com",
			"rel_par",
		];
		await Promise.all(
			urls.map(async (queryParam: QueryParam) => {
				results.push(
					...(await this.relatedWords(queryParam, rootWord))
				);
			})
		);
		if (extra) {
			const extraResults: string[] = [];
			await Promise.all(
				results.map(async (similiarWord: string) => {
					extraResults.push(
						...(await this.relatedWords("rel_syn", similiarWord))
					);
				})
			);
			results.push(...extraResults);
		}
		return results;
	}

	async wordsOppositeTo(rootWord: string, extra = false): Promise<string[]> {
		const results: string[] = [];
		results.push(...(await this.relatedWords("rel_ant", rootWord)));

		// Get antonyms for synonyms as well
		const syns = await this.relatedWords("rel_syn", rootWord);
		Promise.all(
			syns.map(async (wordLikeRootWord: string) => {
				const data = await this.relatedWords(
					"rel_ant",
					wordLikeRootWord
				);
				results.push(...data);
			})
		);
		if (extra) {
			// Get antonyms for each synonym
			const extraResults: string[] = [];
			const synonyms = [...(await this.wordsSimilarTo(rootWord))];

			await Promise.all(
				synonyms.map(async (similiarWord: string) => {
					const antonyms = await this.relatedWords(
						"rel_ant",
						similiarWord
					);
					extraResults.push(...antonyms);
				})
			);
			results.push(...extraResults);
		}
		return this.cleanUp(results);
	}

	async wordsThatRhymeWith(rootWord: string): Promise<string[]> {
		const results: string[] = [];
		const urls: QueryParam[] = ["rel_rhy", "rel_nry", "rel_hom", "rel_cns"];
		await Promise.all(
			urls.map(async (queryParam: QueryParam) => {
				results.push(
					...(await this.relatedWords(queryParam, rootWord))
				);
			})
		);
		return this.cleanUp(results);
	}

	async alliterativeSynonyms(
		priorWord: string,
		rootWord: string
	): Promise<string[]> {
		const data = await this.wordsSimilarTo(rootWord, true);
		return [
			...data
				.filter((w) => w.startsWith(priorWord[0]))
				.map((syn) => `${priorWord} ${syn}`),
		];
	}

	private cleanUp(results: string[]) {
		return [...new Set(results.filter((el) => !!el))];
	}

	private async relatedWords(
		queryParam: QueryParam,
		rootWord: string
	): Promise<string[]> {
		const results = [];
		const url = `${this.baseUrl}?${queryParam}=${rootWord}`;
		try {
			const response = await fetch(url);
			const data = await response.json();
			results.push(...data.map((o: any) => o.word));
			return results;
		} catch (error) {
			new Notice(`DatamuseAPI — ${error}.`);
			return [];
		}
	}
}
