import {
	App,
	Editor,
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab,
	SuggestModal,
} from "obsidian";

import type { MarkdownFileInfo, PluginManifest }from "obsidian";

import { DatamuseApi } from "./DatamuseApi";

interface WordyPluginSettings {
	enumeratedWords: boolean;
}

const DEFAULT_SETTINGS: WordyPluginSettings = {
	enumeratedWords: true,
};

export default class WordyPlugin extends Plugin {
	settings: WordyPluginSettings = {
		enumeratedWords: true,
	};
	datamuseApi: DatamuseApi;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.datamuseApi = new DatamuseApi();
	}

	// Initial plugin setup, configure all the resources needed by the plugin
	async onload() {
		await this.loadSettings();

		this.registerView(
			VIEW_ID,
			(leaf) => new WordyView(leaf)
		);
		this.addRibbonIcon("pilcrow", "Wordy view", () => {
			this.activateView();
		});

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "wordy-syn",
			name: "Synonyms",
			editorCallback: async (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
				const rootWord = editor.getSelection();
				if (rootWord != "") {
					const similarWords = await this.datamuseApi.wordsSimilarTo(
						rootWord
					);
					if (similarWords.length == 0) {
						new Notice(`Oops — No synonyms found.`);
						return;
					}
					new SearchableWordsModal(
						this.app,
						similarWords,
						(selectedWord: string) => {
							editor.replaceSelection(selectedWord);
						}
					).open();
				} else {
					new Notice(`Oops — Select a word first.`);
				}
			},
		});

		this.addCommand({
			id: "wordy-ant",
			name: "Antonyms",
			editorCallback: async (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
				const rootWord = editor.getSelection();
				if (rootWord != "") {
					const oppositeWords =
						await this.datamuseApi.wordsOppositeTo(rootWord, true);
					if (oppositeWords.length == 0) {
						new Notice(`Oops — No antonyms found.`);
						return;
					}
					new SearchableWordsModal(
						this.app,
						oppositeWords,
						(selectedWord: string) => {
							editor.replaceSelection(selectedWord);
						}
					).open();
				} else {
					new Notice(`Oops — Select a word first.`);
				}
			},
		});

		this.addCommand({
			id: "wordy-rhy",
			name: "Rhymes",
			editorCallback: async (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
				const rootWord = editor.getSelection();
				if (rootWord != "") {
					const rhymes = await this.datamuseApi.wordsThatRhymeWith(
						rootWord
					);
					if (rhymes.length == 0) {
						new Notice(`Oops — No rhymes found.`);
						return;
					}
					new SearchableWordsModal(
						this.app,
						rhymes,
						(selectedWord: string) => {
							editor.replaceSelection(selectedWord);
						}
					).open();
				} else {
					new Notice(`Oops — Select a word first.`);
				}
			},
		});

		this.addCommand({
			id: "wordy-asyn",
			name: "Alliterative Synonyms",
			editorCallback: async (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
				const [priorWord, rootWord] = editor.getSelection().split(" ");
				if (rootWord != "") {
					const alliterativeSynonyms =
						await this.datamuseApi.alliterativeSynonyms(
							priorWord,
							rootWord
						);
					if (alliterativeSynonyms.length == 0) {
						new Notice(`Oops — No rhymes found.`);
						return;
					}
					new SearchableWordsModal(
						this.app,
						alliterativeSynonyms,
						(selectedWord: string) => {
							editor.replaceSelection(`${selectedWord}`);
						}
					).open();
				} else {
					new Notice(`Oops — Select a word first.`);
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new WordyPluginSettingTab(this.app, this));

	}
	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_ID);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_ID,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_ID)[0]
		);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// Wordy View
import { ItemView, WorkspaceLeaf } from "obsidian";
import Component from "./Component.svelte";

export const VIEW_ID = "wordy-view";

export class WordyView extends ItemView {
	component: Component;
	
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_ID;
	}

	getDisplayText() {
		return "Wordy";
	}

	async onOpen() {
	// const container = this.containerEl.children[1];
		// container.empty();
		// container.createEl("h4", { text: "Wordy" });
		// debugger;
		this.component = new Component({
			target: this.containerEl.children[1],
			props: {
				variable: 42
			}
		})
	}

	async onClose() {
		// Kill the svelte app
		this.component.$destroy();
	}
}

// Suggestion modal
type Word = string;
export class SearchableWordsModal extends SuggestModal<Word> {
	words: string[];
	replaceFn: any;

	constructor(app: App, words: string[], replaceFn: any) {
		super(app);
		this.words = words;
		this.replaceFn = replaceFn;
		if (words.length == 0) {
			return;
		}
	}

	// Returns all available suggestions.
	getSuggestions(query: string): Word[] {
		return this.words.filter((word: string) =>
			word.toLowerCase().includes(query.toLowerCase())
		);
	}

	// Renders each suggestion item.
	renderSuggestion(word: Word, el: HTMLElement) {
		el.createEl("div", { text: word });
	}

	// Perform action on the selected suggestion.
	onChooseSuggestion(word: Word, evt: MouseEvent | KeyboardEvent) {
		this.replaceFn(word);
	}
}

/**
 * Setting Pane
 */

class WordyPluginSettingTab extends PluginSettingTab {
	plugin: WordyPlugin;

	constructor(app: App, plugin: WordyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "Settings" });
		containerEl.createEl("p").setText("Nothing to configure yet!");
	}
}
