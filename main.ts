import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginManifest, PluginSettingTab, Setting, SuggestModal } from 'obsidian';
import { DatamuseApi } from './DatamuseApi';

interface WordyPluginSettings {
	enumeratedWords: boolean;
}

const DEFAULT_SETTINGS: WordyPluginSettings = {
	enumeratedWords: true
}

export default class WordyPlugin extends Plugin {
	settings: WordyPluginSettings;
	datamuseApi: DatamuseApi;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.datamuseApi = new DatamuseApi();
	}

	// Initial plugin setup, configure all the resources needed by the plugin
	async onload() {
		await this.loadSettings();


		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'wordy-syn',
			name: 'Synonyms',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const rootWord = editor.getSelection();
				if (rootWord != "") {
					const similarWords = await this.datamuseApi.wordsSimilarTo(rootWord);
					if (similarWords.relatedWords.length == 0) {
						new Notice(`Oops — No synonyms found.`);
						return;
					}
					new SearchableWordsModal(this.app,
						similarWords.relatedWords,
						(selectedWord: string) => {
							editor.replaceSelection(selectedWord)
						}).open();
				} else {
					new Notice(`Oops — Select a word first.`);
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new WordyPluginSettingTab(this.app, this));
	}


	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
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
		this.replaceFn(word)
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
		containerEl.createEl('h2', { text: 'Settings' });
		containerEl.createEl('p').setText('Nothing to configure yet!');
	}
}
