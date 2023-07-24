<script lang="ts">
	// Import the 'debounce' function from lodash
	import { debounce } from "lodash";

	import { DatamuseApi } from "./DatamuseApi";

	interface SearchResult {
		term: string;
		definition: string;
	}

	const toSearchResult = (term: string): SearchResult => ({
		term,
		definition: "",
	});

	let searchTerm: string = "";
	let searchResults: SearchResult[] = [];

	// Debounce the search input with a delay of 300 milliseconds
	const debouncedSearch = debounce(async () => {
		const dm = new DatamuseApi();
		searchResults = (await dm.wordsSimilarTo(searchTerm)).map(toSearchResult);
	}, 300);

	// Function to handle the input change event
	function handleInputChange(event: Event) {
		searchTerm = (event.target as HTMLInputElement).value;
		debouncedSearch();
	}
</script>

<div class="search-container">
	<input
		type="text"
		class="search-input"
		placeholder="Search"
		bind:value={searchTerm}
		on:input={handleInputChange}
	/>

	{#if searchResults.length > 0}
		<div class="search-results">
			{#each searchResults as result}
				<div class="search-result">
					<strong>{result.term}</strong> 
					{result.definition}
				</div>
			{/each}
		</div>
	{:else}
		<p>...</p>
	{/if}
</div>

<style>
	/* Add your custom styles here */
	.search-container {
		margin: 8px;
	}

	.search-input {
		width: 100%;
	}

	.search-results {
		margin-top: 16px;
		display: grid;
		gap: 4px;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
	}

	.search-result {
		padding: 4px;
		border: 1px solid #ccc;
		border-radius: 4px;
		display: grid;
		align-items: center;
		justify-content: center;
	}
</style>
