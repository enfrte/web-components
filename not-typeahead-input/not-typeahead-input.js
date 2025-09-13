/* 
  - Works with data (static array) OR api (remote fetch) OR both.
  - Only triggers when typing 2 or more characters.

  ## Example usages

  Static data only
 
  <not-typeahead-input data='["Alabama","Alaska","Arizona","Arkansas","California","Colorado"]'></not-typeahead-input>

  Remote API only
  
  <not-typeahead-input api="https://api.example.com/search"></not-typeahead-input>
  
  Both static data and remote API

  <not-typeahead-input 
    data='["Apple","Banana","Orange"]'
    api="https://api.example.com/search">
  </not-typeahead-input>
*/

class NotTypeaheadInput extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.debounceTimer = null;
		this.debounceWait = 300; // debounce wait time
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = `
		<style>
			input {
				width: 250px;
				padding: 8px;
				font-size: 16px;
			}
		</style>
		
		<div style="position: relative;">
			<input type="text" placeholder="Search...">
			<div class="suggestions" style="display:none;"></div>
		</div>
		`;

		this.inputEl = this.shadowRoot.querySelector("input");
		this.suggestionsEl = this.shadowRoot.querySelector(".suggestions");

		// Parse attributes
		this.staticData = [];
		
		if (this.getAttribute("data")) {
			try {
			this.staticData = JSON.parse(this.getAttribute("data"));
			} catch (e) {
			console.warn("Invalid JSON in data attribute", e);
			}
		}
		
		this.apiUrl = this.getAttribute("api") || null;

		this.inputEl.addEventListener("input", () => this.debounce(() => this.onInput(), this.debounceWait));
	}

	// Debounce utility
	debounce(func, wait) {
		clearTimeout(this.debounceTimer);
		this.debounceTimer = setTimeout(func, wait);
	}

	async onInput() {
		const query = this.inputEl.value.trim().toLowerCase();

		if (query.length < 2) {
			this.suggestionsEl.style.display = "none";
			return;
		}

		let results = [];

		// Static data filtering
		if (this.staticData.length > 0) {
			results = this.staticData.filter(item =>
			item.toLowerCase().includes(query)
			);
		}

		// Remote API fetching
		if (this.apiUrl) {
			try {
			const res = await fetch(this.apiUrl);
			if (res.ok) {
				const apiResults = await res.json();
				results = [...results, ...apiResults]; // Merge results
			}
			} catch (err) {
			console.error("API fetch error:", err);
			}
		}

		this.showSuggestions(results);
	}

	showSuggestions(results) {
		this.suggestionsEl.innerHTML = "";
		
		if (results.length === 0) {
			this.suggestionsEl.style.display = "none";
			return;
		}

		results.forEach(item => {
			const div = document.createElement("div");
			div.textContent = item;
			div.className = "suggestion";
			div.addEventListener("click", () => {
				this.inputEl.value = item;
				this.suggestionsEl.style.display = "none";
			});
			this.suggestionsEl.appendChild(div);
		});

		this.suggestionsEl.style.display = "block";
	}
}

customElements.define("not-typeahead-input", NotTypeaheadInput);
