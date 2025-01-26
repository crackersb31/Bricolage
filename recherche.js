document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const sheetDbUrl = 'https://sheetdb.io/api/v1/1k257tbetudz2';
    let items = [];

    async function fetchItems() {
        try {
            const response = await fetch(`${sheetDbUrl}?sheet=articles`);
            items = await response.json();
        } catch (error) {
            console.error("Erreur:", error);
        }
    }

    function displayResults(filteredItems) {
        searchResults.innerHTML = '';
        
        if (filteredItems.length === 0) {
            searchResults.innerHTML = '<p>Aucun résultat trouvé</p>';
            return;
        }

        const ul = document.createElement('ul');
        filteredItems.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <span class="item-name">${item.name}</span>
                    (${item.category}) - 
                    <span class="location-${item.location.toLowerCase()}">${item.location}</span> - 
                    Quantité: ${item.quantity}
                    <div class="item-comment" data-comment="${item.comment}">${item.comment || ''}</div>
                </div>
            `;
            ul.appendChild(li);
        });
        searchResults.appendChild(ul);
    }

    function search(query) {
        if (!query) {
            searchResults.innerHTML = '';
            return;
        }
        const filtered = items.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase())
        );
        displayResults(filtered);
    }

    searchInput.addEventListener('input', (e) => search(e.target.value));
    fetchItems();
});