document.addEventListener('DOMContentLoaded', function () {
    // Initialisation des éléments DOM
    const addItemForm = document.getElementById('add-item-form');
    const itemList = document.getElementById('item-list');
    const categoryList = document.getElementById('category-list');
    const itemCategorySelect = document.getElementById('itemCategory');
    const addCategoryButton = document.getElementById('add-category-button');
    const newCategoryNameInput = document.getElementById('newCategoryName');
    const editItemSection = document.getElementById('edit-item');
    const editItemForm = document.getElementById('edit-item-form');
    const editItemNameInput = document.getElementById('editItemName');
    const editItemCategorySelect = document.getElementById('editItemCategory');
    const editItemLocationSelect = document.getElementById('editItemLocation');
    const editItemQuantityInput = document.getElementById('editItemQuantity');
    const editItemCommentInput = document.getElementById('itemComment');
    const editItemIdInput = document.getElementById('editItemId');
    const cancelEditItemButton = document.getElementById('cancel-edit-item');
    const editCategorySection = document.getElementById('edit-category');
    const editCategoryForm = document.getElementById('edit-category-form');
    const editCategoryNameInput = document.getElementById('editCategoryName');
    const editCategoryIdInput = document.getElementById('editCategoryId');
    const cancelEditCategoryButton = document.getElementById('cancel-edit-category');
    const editItemCommentEdit = document.getElementById('editItemComment');
    const locationFilterContainer = document.getElementById('location-filter-container');
    const categoryFilterContainer = document.getElementById('category-filter-container');
 
    const steinUrl = 'https://api.steinhq.com/v1/storages/679756d5c0883333656cba15';
 
    let items = [];
    let categories = [];
    let selectedLocation = '';
    let selectedCategory = '';
 
    async function fetchData() {
        try {
            const itemsResponse = await fetch(`${steinUrl}/articles`);
            items = await itemsResponse.json();
            const categoriesResponse = await fetch(`${steinUrl}/categories`);
            categories = await categoriesResponse.json();
            renderCategories();
            renderItems();
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }
 
    function renderCategories() {
        if (categoryList) {
            categoryList.innerHTML = '';
        }
        if (itemCategorySelect) {
            itemCategorySelect.innerHTML = '<option value="">Choisir une catégorie</option>';
        }
        if (editItemCategorySelect) {
            editItemCategorySelect.innerHTML = '<option value="">Choisir une catégorie</option>';
        }
 
        if (categoryFilterContainer) {
            categoryFilterContainer.innerHTML = '<button class="filter-button" data-category="">Toutes les catégories</button>';
            categories.forEach(category => {
                const button = document.createElement('button');
                button.classList.add('filter-button');
                button.dataset.category = category.name;
                button.textContent = category.name;
                categoryFilterContainer.appendChild(button);
            });
        }
 
        categories.forEach(category => {
            if (categoryList) {
                const li = document.createElement('li');
                const categoryInfo = document.createElement('div');
                categoryInfo.textContent = category.name;
                li.appendChild(categoryInfo);
 
                const buttonContainer = document.createElement('div');
                buttonContainer.classList.add('button-container');
 
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteButton.addEventListener('click', () => deleteCategory(category.id));
                buttonContainer.appendChild(deleteButton);
 
                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editButton.addEventListener('click', () => showEditCategoryForm(category.id));
                buttonContainer.appendChild(editButton);
                
                li.appendChild(buttonContainer);
                categoryList.appendChild(li);
            }
            if (itemCategorySelect) {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                itemCategorySelect.appendChild(option);
            }
            if (editItemCategorySelect) {
                const editOption = document.createElement('option');
                editOption.value = category.name;
                editOption.textContent = category.name;
                editItemCategorySelect.appendChild(editOption);
            }
        });
    }
 
    function renderItems() {
        if (!itemList) return;
        
        itemList.innerHTML = '';
        const filteredItems = items.filter(item => {
            const locationMatch = !selectedLocation || item.location === selectedLocation;
            const categoryMatch = !selectedCategory || item.category === selectedCategory;
            return locationMatch && categoryMatch;
        });
        
        filteredItems.forEach(item => {
            const li = document.createElement('li');
            const itemInfo = document.createElement('div');
            
            const commentDiv = document.createElement('div');
            commentDiv.setAttribute('data-comment', item.comment || '');
            commentDiv.textContent = item.comment || '';
            
            itemInfo.innerHTML = `
                <span class="item-name">${item.name}</span> 
                (${item.category}) - ${item.location} - 
                Quantité : ${item.quantity}`;
            
            itemInfo.appendChild(commentDiv);
            li.appendChild(itemInfo);
 
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container');
 
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.addEventListener('click', () => deleteItem(item.id));
            
            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.addEventListener('click', () => showEditItemForm(item.id));
            
            const transferButton = document.createElement('button');
            transferButton.textContent = item.transfer ? 'à transférer' : 'Transférer';
            transferButton.classList.add('transfer-button');
            if (item.transfer) transferButton.classList.add('transferred');
            transferButton.addEventListener('click', () => toggleTransfer(item.id));
 
            buttonContainer.append(deleteButton, editButton, transferButton);
            li.appendChild(buttonContainer);
            itemList.appendChild(li);
        });
    }
 
    async function saveItems(item, isNew = false) {
        try {
            const options = {
                method: isNew ? 'POST' : 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(isNew ? [item] : {
                    condition: { id: item.id },
                    set: item
                })
            };
            
            const response = await fetch(`${steinUrl}/articles`, options);
            return await response.json();
        } catch (error) {
            console.error('Error saving items:', error);
        }
    }
 
    async function saveCategories(category) {
        try {
            const response = await fetch(`${steinUrl}/categories`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify([category])
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving categories:', error);
        }
    }
 
    function generateId() {
        return Math.random().toString(36).substring(2, 15);
    }
 
    async function deleteCategory(categoryId) {
        try {
            const category = categories.find(cat => cat.id === categoryId);
            // Supprimer la catégorie
            await fetch(`${steinUrl}/categories`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    condition: { id: categoryId }
                })
            });
            
            // Mettre à jour les items associés
            const itemsToUpdate = items.filter(item => item.category === category.name);
            for (const item of itemsToUpdate) {
                await fetch(`${steinUrl}/articles`, {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        condition: { id: item.id }
                    })
                });
            }
            
            items = items.filter(item => item.category !== category.name);
            categories = categories.filter(cat => cat.id !== categoryId);
            renderCategories();
            renderItems();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    }
 
    async function deleteItem(itemId) {
        try {
            const response = await fetch(`${steinUrl}/articles`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    condition: { id: itemId }
                })
            });
            if (!response.ok) throw new Error('Erreur lors de la suppression');
            items = items.filter(item => item.id !== itemId);
            renderItems();
        } catch (error) {
            console.error('Erreur:', error);
        }
    }
 
    function showEditItemForm(itemId) {
        const item = items.find(item => item.id === itemId);
        if (item) {
            editItemIdInput.value = item.id;
            editItemNameInput.value = item.name;
            editItemCategorySelect.value = item.category;
            editItemLocationSelect.value = item.location;
            editItemQuantityInput.value = item.quantity;
            editItemCommentEdit.value = item.comment;
            editItemSection.style.display = 'block';
        }
    }
 
    function showEditCategoryForm(categoryId) {
        const category = categories.find(category => category.id === categoryId);
        if (category) {
            editCategoryIdInput.value = category.id;
            editCategoryNameInput.value = category.name;
            editCategorySection.style.display = 'block';
        }
    }
 
    async function toggleTransfer(itemId) {
        const item = items.find(item => item.id === itemId);
        if (item) {
            item.transfer = !item.transfer;
            await saveItems(item);
            renderItems();
        }
    }
 
    // Event Listeners
    if (addCategoryButton) {
        addCategoryButton.addEventListener('click', () => {
            newCategoryNameInput.style.display = 'inline-block';
            addCategoryButton.textContent = "Ajouter une catégorie";
        });
    }
 
    if (addItemForm) {
        addItemForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const newItem = {
                id: generateId(),
                name: document.getElementById('itemName').value,
                category: document.getElementById('itemCategory').value,
                location: document.getElementById('itemLocation').value,
                quantity: parseInt(document.getElementById('itemQuantity').value),
                comment: document.getElementById('itemComment').value,
                transfer: false
            };
            items.push(newItem);
            await saveItems(newItem, true);
            renderItems();
            addItemForm.reset();
            addItemForm.querySelector('button[type="submit"]').textContent = "Ajouter l'article";
        });
    }
 
    const addCategoryForm = document.getElementById('add-category-form');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const newCategory = {
                id: generateId(),
                name: document.getElementById('categoryName').value,
            };
            categories.push(newCategory);
            await saveCategories(newCategory);
            renderCategories();
            addCategoryForm.reset();
        });
    }
 
    if (editItemForm) {
        editItemForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const itemId = editItemIdInput.value;
            const itemIndex = items.findIndex(item => item.id === itemId);
            
            if (itemIndex !== -1) {
                items[itemIndex] = {
                    ...items[itemIndex],
                    name: editItemNameInput.value,
                    category: editItemCategorySelect.value,
                    location: editItemLocationSelect.value,
                    quantity: parseInt(editItemQuantityInput.value),
                    comment: editItemCommentEdit.value
                };
                await saveItems(items[itemIndex]);
                renderItems();
                editItemSection.style.display = 'none';
            }
        });
    }
 
    if (editCategoryForm) {
        editCategoryForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const categoryId = editCategoryIdInput.value;
            const newName = editCategoryNameInput.value;
            const oldCategory = categories.find(cat => cat.id === categoryId);
            
            // Mettre à jour la catégorie
            await fetch(`${steinUrl}/categories`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    condition: { id: categoryId },
                    set: { name: newName }
                })
            });
            
            // Mettre à jour tous les articles associés
            const itemsToUpdate = items.filter(item => item.category === oldCategory.name);
            for (const item of itemsToUpdate) {
                item.category = newName;
                await saveItems(item);
            }
            
            categories = categories.map(cat => 
                cat.id === categoryId ? {...cat, name: newName} : cat
            );
            
            renderCategories();
            renderItems();
            editCategorySection.style.display = 'none';
        });
    }
 
    if (cancelEditItemButton) {
        cancelEditItemButton.addEventListener('click', () => {
            editItemSection.style.display = 'none';
        });
    }
 
    if (cancelEditCategoryButton) {
        cancelEditCategoryButton.addEventListener('click', () => {
            editCategorySection.style.display = 'none';
        });
    }
 
    if (locationFilterContainer) {
        locationFilterContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('filter-button')) {
                selectedLocation = event.target.dataset.location;
                locationFilterContainer.querySelectorAll('.filter-button')
                    .forEach(button => button.classList.remove('active'));
                event.target.classList.add('active');
                renderItems();
            }
        });
    }
 
    if (categoryFilterContainer) {
        categoryFilterContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('filter-button')) {
                selectedCategory = event.target.dataset.category;
                categoryFilterContainer.querySelectorAll('.filter-button')
                    .forEach(button => button.classList.remove('active'));
                event.target.classList.add('active');
                renderItems();
            }
        });
    }
 
    // Chargement initial des données
    fetchData();
});
