# Wordy

Connect to the Datamuse API



# `/words?constraint=word`

## Examples

rhymes with forgetful
https://api.datamuse.com/words?rel_rhy=forgetful

synonyms of happy
https://api.datamuse.com/words?rel_syn=happy

antonyms of bad
https://api.datamuse.com/words?rel_ant=bad


| constraint | description                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ml`       | Means like constraint: reverse dictionary.  require that the results have a meaning related to this string value, which can be any word or sequence of words.                                                                                                                                                                                                                                                                                                                                             |
| `sl`       | Sounds like constraint: require that the results are pronounced similarly to this string of characters. (If the string of characters doesn't have a known pronunciation, the system will make its best guess using a text-to-phonemes algorithm.)                                                                                                                                                                                                                                    |
| `sp`       | Spelled like constraint: require that the results are spelled similarly to this string of characters, or that they match this wildcard pattern. A pattern can include any combination of alphanumeric characters and the symbols described on that page. The most commonly used symbols are * (a placeholder for any number of characters) and ? (a placeholder for exactly one character). Please be sure that your parameters are properly URL encoded when you form your request. |
| `rel_CODE` | Related word constraints: require that the results, when paired with the word in this parameter, are in a predefined lexical relation indicated by **CODE**. Any number of these parameters may be specified any number of times. An assortment of semantic, phonetic, and corpus-statistics-based relations are available. At this time, these relations are available for English-language vocabularies only. ==CODE== is a three-letter identifier from the list below.           |
|            |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |


what if you had a poetry writing interface where you could type and on the side bar it would automatically show you results from different datamuse queries?

what if we queried synonyms at a depth of 2? and showed results as queries completed?

## words with similiar meanings
`rel_syn` Synonyms (words contained within the same WordNet synset) ocean → sea
`rel_spc` "Kind of" (direct hypernyms, per WordNet) gondola → boat
`rel_gen` "More general than" (direct hyponyms, per WordNet) boat → gondola
`rel_com` "Comprises" (direct holonyms, per WordNet) car → accelerator
`rel_par` "Part of" (direct meronyms, per WordNet) trunk → tree

## maybe fun for poetry
`rel_trg` "Triggers" (words that are statistically associated with the query word in the same piece of text.) cow → milking
`rel_bga` Frequent followers (w′ such that P(w′|w) ≥ 0.001, per Google Books Ngrams) wreak → havoc
`rel_bgb` Frequent predecessors (w′ such that P(w|w′) ≥ 0.001, per Google Books Ngrams) havoc → wreak
`rel_jja` Popular nouns modified by the given adjective, per Google Books Ngrams gradual → increase
`rel_jjb` Popular adjectives used to modify the given noun, per Google Books Ngrams beach → sandy
`rel_ant` Antonyms (per WordNet) late → early

## rhyming shit
`rel_rhy` Rhymes ("perfect" rhymes, per RhymeZone) spade → aid
`rel_nry` Approximate rhymes (per RhymeZone) forest → chorus
`rel_hom` Homophones (sound-alike words) course → coarse
`rel_cns` Consonant match sample → simple






This is a sample plugin for Obsidian (https://obsidian.md).

This project uses Typescript to provide type checking and documentation.
The repo depends on the latest plugin API (obsidian.d.ts) in Typescript Definition format, which contains TSDoc comments describing what it does.

**Note:** The Obsidian API is still in early alpha and is subject to change at any time!

This sample plugin demonstrates some of the basic functionality the plugin API can do.
- Changes the default font color to red using `styles.css`.
- Adds a ribbon icon, which shows a Notice when clicked.
- Adds a command "Open Sample Modal" which opens a Modal.
- Adds a plugin setting tab to the settings page.
- Registers a global click event and output 'click' to the console.
- Registers a global interval which logs 'setInterval' to the console.

## First time developing plugins?

Quick starting guide for new plugin devs:

- Check if [someone already developed a plugin for what you want](https://obsidian.md/plugins)! There might be an existing plugin similar enough that you can partner up with.
- Make a copy of this repo as a template with the "Use this template" button (login to GitHub if you don't see it).
- Clone your repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins/your-plugin-name` folder.
- Install NodeJS, then run `npm i` in the command line under your repo folder.
- Run `npm run dev` to compile your plugin from `main.ts` to `main.js`.
- Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.
- Reload Obsidian to load the new version of your plugin.
- Enable plugin in settings window.
- For updates to the Obsidian API run `npm update` in the command line under your repo folder.

## Releasing new releases

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

## Adding your plugin to the community plugin list

- Check https://github.com/obsidianmd/obsidian-releases/blob/master/plugin-review.md
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at https://github.com/obsidianmd/obsidian-releases to add your plugin.

## How to use

- Clone this repo.
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Improve code quality with eslint (optional)
- [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code. 
- To use eslint with this project, make sure to install eslint from terminal:
  - `npm install -g eslint`
- To use eslint to analyze this project use this command:
  - `eslint main.ts`
  - eslint will then create a report with suggestions for code improvement by file and line number.
- If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that folder:
  - `eslint .\src\`


## API Documentation

See https://github.com/obsidianmd/obsidian-api
