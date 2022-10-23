import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface WordyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: WordyPluginSettings = {
	mySetting: 'default'
}


export default class WordyPlugin extends Plugin {
	settings: WordyPluginSettings;
	datamuseApi: string;

	// Initial plugin setup, configure all the resources needed by the plugin
	async onload() {
		this.datamuseApi = "https://api.datamuse.com/words?"
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('quote-glyph', 'Wordy', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice(`Greetings, ${this.settings.mySetting}`);
		});

		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'wordy-syn',
			name: 'Synonyms',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const rootWord = editor.getSelection();
				if (rootWord != "") {
					fetch(this.datamuseApi + "rel_syn=" + rootWord)
						.then((response) => response.json())
						.then((data) => {
							console.log(data)
							const syns = data.map((o: any) => o.word);
							new SynonymsModal(this.app, rootWord, syns).open();
						});
				}
				// console.log(editor.getSelection());
				// editor.replaceSelection('Sample Editor Command');
			}
		});

		this.addCommand({
			id: 'wordy-rhy',
			name: 'Rhymes',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const rootWord = editor.getSelection();
				if (rootWord != "") {
					fetch(this.datamuseApi + "rel_rhy=" + rootWord)
						.then((response) => response.json())
						.then((data) => {
							console.log(data)
							const syns = data.map((o: any) => o.word);
							new SynonymsModal(this.app, rootWord, syns).open();
						});
				}
				// console.log(editor.getSelection());
				// editor.replaceSelection('Sample Editor Command');
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new WordyPluginSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
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

		containerEl.createEl('h2', { text: 'Wordy Settings' });

		new Setting(containerEl)
			.setName('Greeting')
			.setDesc('Change the modal greeting')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}


/**
 * Modals
 */
class SynonymsModal extends Modal {
	synonyms: Array<string>
	rootWord: string;

	constructor(app: App, rootWord: string, synonyms: Array<string>) {
		super(app);
		this.rootWord = rootWord;
		this.synonyms = synonyms;
	}

	onOpen() {
		const { contentEl, titleEl } = this;
		// Set the title and contents of the modal
		titleEl.setText(`Synonyms for ${this.rootWord}`)
		contentEl.setText(this.synonyms.join(' ') ? this.synonyms.join(' ') : "No synonyms found");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
