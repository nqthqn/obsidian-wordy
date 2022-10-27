import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginManifest, PluginSettingTab, Setting } from 'obsidian';
import { DatamuseApi, RelKey, SimilarWords } from './DatamuseApi';

// Remember to rename these classes and interfaces!

// interface WordyPluginSettings {
// 	mySetting: string;
// }

// const DEFAULT_SETTINGS: WordyPluginSettings = {
// 	mySetting: 'default'
// }

export default class WordyPlugin extends Plugin {
	// settings: WordyPluginSettings;
	datamuseApi: DatamuseApi;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.datamuseApi = new DatamuseApi();
	}
	// constructor() {

	// }

	// Initial plugin setup, configure all the resources needed by the plugin
	async onload() {
		// await this.loadSettings();

		// This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('quote-glyph', 'Wordy', (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// 	new Notice(`Greetings, ${this.settings.mySetting}`);
		// });

		// Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'wordy-syn',
			name: 'Synonyms',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const rootWord = editor.getSelection();
				console.log(rootWord);

				if (rootWord != "") {
					const similarWords = await this.datamuseApi.wordsSimilarTo(rootWord);
					new SynonymsModal(this.app, rootWord, similarWords, (selectedWord: string) => { editor.replaceSelection(selectedWord) }).open();
				} else {
					new Notice(`Oops — Select a word first.`);
				}
				// console.log(editor.getSelection());
				// editor.replaceSelection('Sample Editor Command');
			}
		});

		// this.addCommand({
		// 	id: 'wordy-rhy',
		// 	name: 'Rhymes',
		// 	editorCallback: async (editor: Editor, view: MarkdownView) => {
		// 		const rootWord = editor.getSelection();
		// 		if (rootWord != "") {
		// 			const syns = await this.datamuseApi.wordsThatRhymeWith(rootWord)
		// 			new SynonymsModal(this.app, rootWord, syns, editor.replaceSelection).open();
		// 		}
		// 		// console.log(editor.getSelection());
		// 		// editor.replaceSelection('Sample Editor Command');
		// 	}
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		// this.addSettingTab(new WordyPluginSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		// this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		// await this.saveData(this.settings);
	}
}


/**
 * Setting Pane
 */

// class WordyPluginSettingTab extends PluginSettingTab {
// 	plugin: WordyPlugin;

// 	constructor(app: App, plugin: WordyPlugin) {
// 		super(app, plugin);
// 		this.plugin = plugin;
// 	}

// 	display(): void {
// 		const { containerEl } = this;

// 		containerEl.empty();

// 		containerEl.createEl('h2', { text: 'Wordy Settings' });

// 		new Setting(containerEl)
// 			.setName('SETTING FANCY B LBLA')
// 			.setDesc('Change the modal greeting')
// 			.addText(text => text
// 				.setPlaceholder('Enter your secret')
// 				.setValue(this.plugin.settings.mySetting)
// 				.onChange(async (value) => {
// 					console.log('Secret: ' + value);
// 					this.plugin.settings.mySetting = value;
// 					await this.plugin.saveSettings();
// 				}));
// 	}
// }


/**
 * Modals
 */
class SynonymsModal extends Modal {
	rootWord: string;
	similarWords: any;
	replaceFn: any

	constructor(app: App, rootWord: string, similarWords: SimilarWords, replaceFn: any) {
		super(app);
		this.rootWord = rootWord;
		this.similarWords = similarWords;
		this.replaceFn = replaceFn;
	}

	onOpen() {
		const { contentEl, titleEl } = this;
		// Set the title and contents of the modal
		titleEl.setText(`${this.rootWord}`)
		console.log(this.similarWords);
		const that = this;
		// this.similarWords.keys().forEach((k: RelKey) => {
		this.similarWords["rel_syn"]["relatedWords"].forEach((word: string) => {
			const btn = contentEl.createEl("button")
			btn.setAttr("style", "margin: 4px; cursor: pointer;")
			btn.setText(word)
			btn.onclick = (e) => {
				this.replaceFn(btn.innerText)
				that.close()
			}
		});
		// });



		// this.replaceFn("HELLO");
		// TODO: on click replace stuff
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
