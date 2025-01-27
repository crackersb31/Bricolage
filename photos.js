document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const steinUrl = 'https://api.steinhq.com/v1/storages/679756d5c0883333656cba15';
    const cloudinaryConfig = {
        cloudName: 'duwnsfvyy',
        apiKey: '479196226286929',
        uploadPreset: 'ml_default'
    };

    // Éléments DOM
    const searchInput = document.getElementById('search-input');
    const articlesList = document.getElementById('articles-list');
    const selectedArticle = document.getElementById('selected-article');
    const uploadButton = document.getElementById('upload-photo');

    let articles = [];
    let selectedArticleId = null;

    // Récupération des articles
    async function fetchArticles() {
        try {
            const response = await fetch(`${steinUrl}/articles`);
            articles = await response.json();
            displayArticles(articles);
        } catch (error) {
            console.error('Erreur lors de la récupération des articles:', error);
            articlesList.innerHTML = '<div class="no-results">Erreur de chargement des articles</div>';
        }
    }

    // Affichage des articles
    function displayArticles(articlesToShow) {
        articlesList.innerHTML = articlesToShow.length ? '' : 
            '<div class="no-results">Aucun article trouvé</div>';

        articlesToShow.forEach(article => {
            const div = document.createElement('div');
            div.className = `article-item ${article.id === selectedArticleId ? 'selected' : ''}`;
            div.innerHTML = `
                <strong>${article.name}</strong> 
                (${article.category} - ${article.location})
            `;
            div.addEventListener('click', () => selectArticle(article));
            articlesList.appendChild(div);
        });
    }

    // Sélection d'un article
    function selectArticle(article) {
        selectedArticleId = article.id;
        selectedArticle.style.display = 'block';
        uploadButton.style.display = 'block';

        selectedArticle.innerHTML = `
            <div class="article-details">
                <h3>${article.name}</h3>
                <p>Catégorie: ${article.category}</p>
                <p>Emplacement: ${article.location}</p>
                <p>Quantité: ${article.quantity}</p>
            </div>
            ${article.image_url ? 
                `<img src="${article.image_url}" alt="${article.name}" class="article-image">` : 
                '<p>Pas de photo</p>'}
        `;

        // Mettre à jour l'affichage de la liste
        displayArticles(articles);
    }

    // Recherche d'articles
    function searchArticles(query) {
        const filteredArticles = articles.filter(article =>
            article.name.toLowerCase().includes(query.toLowerCase()) ||
            article.category.toLowerCase().includes(query.toLowerCase())
        );
        displayArticles(filteredArticles);
    }

    // Mise à jour de l'image dans Stein
    async function updateArticleImage(articleId, imageUrl) {
        try {
            const response = await fetch(`${steinUrl}/articles`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    condition: { id: articleId },
                    set: { image_url: imageUrl }
                })
            });

            if (!response.ok) throw new Error('Erreur de mise à jour');

            // Mise à jour locale des données
            const article = articles.find(a => a.id === articleId);
            if (article) {
                article.image_url = imageUrl;
                selectArticle(article); // Rafraîchir l'affichage
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'image:', error);
            alert('Erreur lors de la sauvegarde de l\'image');
        }
    }

    // Configuration du widget Cloudinary
    const uploadWidget = cloudinary.createUploadWidget({
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: cloudinaryConfig.uploadPreset,
        apiKey: cloudinaryConfig.apiKey,
        maxFileSize: 2000000,
        maxImageWidth: 800,
        maxImageHeight: 800,
        sources: ['local', 'camera'],
        multiple: false
    }, (error, result) => {
        if (!error && result && result.event === "success") {
            updateArticleImage(selectedArticleId, result.info.secure_url);
        }
        if (error) {
            console.error('Erreur upload:', error);
            alert('Erreur lors du téléchargement de l\'image');
        }
    });

    // Event Listeners
    searchInput.addEventListener('input', (e) => searchArticles(e.target.value));
    uploadButton.addEventListener('click', () => uploadWidget.open());

    // Chargement initial
    fetchArticles();
});
