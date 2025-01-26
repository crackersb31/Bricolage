document.addEventListener('DOMContentLoaded', function () {
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
 
    const sheetDbUrl = 'https://sheetdb.io/api/v1/1k257tbetudz2';
 
    let items = [];
    let categories = [];
 
    let selectedLocation = '';
    let selectedCategory = '';
 
    async function fetchData() {
        try {
            const itemsResponse = await fetch(`${sheetDbUrl}?sheet=articles`);
            items = await itemsResponse.json()
                .catch(error => {
                    console.error('Error parsing JSON:', error);
                    return [];
                });
 
            const categoriesResponse = await fetch(`${sheetDbUrl}?sheet=categories`);
            categories = await categoriesResponse.json()
                .catch(error => {
                    console.error('Error parsing JSON:', error);
                    return [];
                });
 
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
                deleteButton.addEventListener('click', () => {
                    deleteCategory(category.id);
                });
                buttonContainer.appendChild(deleteButton);
 
                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editButton.addEventListener('click', () => {
                    showEditCategoryForm(category.id);
                });
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
        if (itemList) {
            itemList.innerHTML = '';
            const filteredItems = items.filter(item => {
                const locationMatch = selectedLocation === '' || item.location === selectedLocation;
                const categoryMatch = selectedCategory === '' || item.category === selectedCategory;
                return locationMatch && categoryMatch;
            });
            filteredItems.forEach(item => {
                const li = document.createElement('li');
 
                const itemInfo = document.createElement('div');
                const itemNameSpan = `<span class="item-name">${item.name}</span>`;
                itemInfo.innerHTML = `${itemNameSpan} (${item.category}) - ${item.location} - Quantité : ${item.quantity} - Commentaire: ${item.comment || ''}`;
                li.appendChild(itemInfo);
 
                const buttonContainer = document.createElement('div');
                buttonContainer.classList.add('button-container');
 
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteButton.addEventListener('click', () => {
                    deleteItem(item.id);
                });
                buttonContainer.appendChild(deleteButton);
 
                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editButton.addEventListener('click', () => {
                    showEditItemForm(item.id);
                });
                buttonContainer.appendChild(editButton);
 
                const transferButton = document.createElement('button');
                transferButton.textContent = item.transfer ? 'à transférer' : 'Transférer';
                transferButton.classList.add('transfer-button');
                if (item.transfer) {
                    transferButton.classList.add('transferred');
                }
                transferButton.addEventListener('click', () => {
                    toggleTransfer(item.id);
                });
                buttonContainer.appendChild(transferButton);
 
                li.appendChild(buttonContainer);
                itemList.appendChild(li);
            });
        }
    }
 
    async function saveItems(item, isNew = false) {
        try {
            if (isNew) {
                const response = await fetch(sheetDbUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "sheet": "articles",
                        data: [item]
                    })
                });
                return await response.json();
            } else {
                const response = await fetch(`${sheetDbUrl}/id/${item.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "sheet": "articles",
                        data: [item]
                    })
                });
                return await response.json();
            }
        } catch (error) {
            console.error('Error saving items:', error);
        }
    }
 
    async function saveCategories(newData) {
        try {
            const response = await fetch(sheetDbUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "sheet": "categories",
                    data: [newData]
                })
            });
            const data = await response.json();
            console.log('saveCategories response', data);
        } catch (error) {
            console.error('Error saving categories:', error);
        }
    }
 
    function generateId() {
        return Math.random().toString(36).substring(2, 15);
    }
 
    async function deleteCategory(categoryId) {
        const category = categories.find(cat => cat.id === categoryId);
        items = items.filter(item => item.category !== category.name);
        categories = categories.filter(cat => cat.id !== categoryId);
        await saveCategories();
        await saveItems();
        renderCategories();
        renderItems();
    }
 
    async function deleteItem(itemId) {
        try {
            const response = await fetch(`${sheetDbUrl}/id/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
 
            if (!response.ok) {
                throw new Error('Erreur lors de la suppression de l\'article dans SheetDB');
            }
 
            items = items.filter(item => item.id !== itemId);
            renderItems();
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'article:', error);
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
        items = items.map(item => {
            if (item.id === itemId) {
                item.transfer = !item.transfer;
            }
            return item;
        });
 
        const updatedItem = items.find(item => item.id === itemId);
 
        if (updatedItem) {
            await saveItems(updatedItem);
        }
 
        renderItems();
    }
 
    if (addCategoryButton) {
        addCategoryButton.addEventListener('click', function () {
            newCategoryNameInput.style.display = 'inline-block';
        });
        addCategoryButton.textContent = "Ajouter une catégorie";
    }
 
    const addCategoryForm = document.getElementById('add-category-form');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const categoryName = document.getElementById('categoryName').value;
            const newCategory = {
                id: generateId(),
                name: categoryName,
            };
            categories.push(newCategory);
            await saveCategories(newCategory);
            renderCategories();
            addCategoryForm.reset();
        });
    }
 
    if (addItemForm) {
        addItemForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const itemName = document.getElementById('itemName').value;
            let itemCategory = document.getElementById('itemCategory').value;
            const itemLocation = document.getElementById('itemLocation').value;
            const itemQuantity = document.getElementById('itemQuantity').value;
            const itemComment = document.getElementById('itemComment').value;
 
            const newItem = {
                id: generateId(),
                name: itemName,
                category: itemCategory,
                location: itemLocation,
                quantity: parseInt(itemQuantity),
                comment: itemComment,
                transfer: false
            };
            items.push(newItem);
            await saveItems(newItem, true);
            renderItems();
            addItemForm.reset();
            addItemForm.querySelector('button[type="submit"]').textContent = "Ajouter l'article";
        });
        addItemForm.querySelector('button[type="submit"]').textContent = "Ajouter l'article";
    }
 
    if (editItemForm) {
        editItemForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const itemId = editItemIdInput.value;
            const itemName = editItemNameInput.value;
            const itemCategory = editItemCategorySelect.value;
            const itemLocation = editItemLocationSelect.value;
            const itemQuantity = parseInt(editItemQuantityInput.value);
            const itemComment = document.getElementById('editItemComment').value;
 
            const itemIndex = items.findIndex(item => item.id === itemId);
 
            if (itemIndex !== -1) {
                items[itemIndex] = {
                    ...items[itemIndex],
                    name: itemName,
                    category: itemCategory,
                    location: itemLocation,
                    quantity: itemQuantity,
                    comment: itemComment
                };
 
                await saveItems(items[itemIndex]);
                renderItems();
                editItemSection.style.display = 'none';
            }
        });
    }
 
    if (cancelEditItemButton) {
        cancelEditItemButton.addEventListener('click', function () {
            editItemSection.style.display = 'none';
        });
    }
 
    if (editCategoryForm) {
        editCategoryForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const categoryId = editCategoryIdInput.value;
            const categoryName = editCategoryNameInput.value;
 
            const oldCategory = categories.find(cat => cat.id === categoryId);
            categories = categories.map(category => {
                if (category.id === categoryId) {
                    category.name = categoryName;
                }
                return category;
            });
 
            items = items.map(item => {
                if (item.category === oldCategory.name) {
                    item.category = categoryName;
                }
                return item;
            });
            await saveCategories();
            await saveItems();
            renderCategories();
            renderItems();
            editCategorySection.style.display = 'none';
        });
    }
 
    if (cancelEditCategoryButton) {
        cancelEditCategoryButton.addEventListener('click', function () {
            editCategorySection.style.display = 'none';
        });
    }
 
    if (locationFilterContainer) {
        locationFilterContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('filter-button')) {
                selectedLocation = event.target.dataset.location;
                locationFilterContainer.querySelectorAll('.filter-button').forEach(button => button.classList.remove('active'));
                event.target.classList.add('active');
                renderItems();
            }
        });
    }
 
    if (categoryFilterContainer) {
        categoryFilterContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('filter-button')) {
                selectedCategory = event.target.dataset.category;
                categoryFilterContainer.querySelectorAll('.filter-button').forEach(button => button.classList.remove('active'));
                event.target.classList.add('active');
                renderItems();
            }
        });
    }
 
    fetchData();
 });