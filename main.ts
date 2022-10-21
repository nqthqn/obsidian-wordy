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
		this.datamuseApi = "https://api.datamuse.com/words?rel_syn="
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('quote-glyph', 'Wordy', (evt: MouseEvent) => {

			// Called when the user clicks the icon.
			new Notice(`Greetings, ${this.settings.mySetting}`);
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('WORDY BABY');

		// This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new SynonymsModal(this.app).open();
		// 	}
		// });
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'wordy-syn',
			name: 'Synonyms',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const rootWord = editor.getSelection();
				fetch(this.datamuseApi + rootWord)
					.then((response) => response.json())
					.then((data) => {
						console.log(data)
						const syns = data.map((o: any) => o.word);
						new SynonymsModal(this.app, rootWord, syns).open();
					});

				console.log(editor.getSelection());
				// editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex',
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				// new SynonymsModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	}
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new WordyPluginSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

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
		contentEl.setText(this.synonyms.join(' '));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class WordyPluginSettingTab extends PluginSettingTab {
	plugin: WordyPlugin;

	constructor(app: App, plugin: WordyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

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
