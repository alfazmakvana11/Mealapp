// Get references to HTML elements
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const favouritesList = document.getElementById('favourites-list');
const mealDetailsContainer = document.getElementById('meal-details');

// Add event listener to search input with debouncing
searchInput.addEventListener('input', debounce(searchMeals, 300));

// Function to perform a search for meals using the API
async function searchMeals() {
    searchResults.innerHTML = '';

    const searchTerm = searchInput.value.trim();

    if (searchTerm === '') {
        return;
    }

    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
    const data = await response.json();

    if (data.meals) {
        data.meals.forEach(meal => {
            // Create a new meal div for each search result
            const mealDiv = document.createElement('div');
            mealDiv.classList.add('meal');
            mealDiv.dataset.id = meal.idMeal;
            mealDiv.innerHTML = `
                <h3>${meal.strMeal}</h3>
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <button class="favourite-button">Add to Favourites</button>
            `;

            // Add event listener to favourite button to add meal to favourites
            const favouriteButton = mealDiv.querySelector('.favourite-button');
            favouriteButton.addEventListener('click', () => addToFavourites(meal));

            // Append the meal div to search results container
            searchResults.appendChild(mealDiv);
        });
    }
}

// Function to add a meal to favourites
function addToFavourites(meal) {
    const storedFavourites = JSON.parse(localStorage.getItem('favourites')) || [];
    const existingIndex = storedFavourites.findIndex(item => item.idMeal === meal.idMeal);

    if (existingIndex === -1) {
        storedFavourites.push(meal);
        localStorage.setItem('favourites', JSON.stringify(storedFavourites));
        addToFavouritesUI(meal);
        alert('Meal added to favourites!');
    } else {
        alert('Meal is already in favourites.');
    }
}

// Function to populate favourites list on page load
window.addEventListener('DOMContentLoaded', () => {
    const storedFavourites = JSON.parse(localStorage.getItem('favourites')) || [];
    for (const meal of storedFavourites) {
        addToFavouritesUI(meal);
    }
});

// Function to add a meal to the favourites list UI
function addToFavouritesUI(meal) {
    const mealDiv = document.createElement('div');
    mealDiv.classList.add('meal');
    mealDiv.dataset.id = meal.idMeal;
    mealDiv.innerHTML = `
        <h3>${meal.strMeal}</h3>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <button class="favourite-button">Remove from Favourites</button>
    `;

    // Add event listener to remove button to remove meal from favourites
    const favouriteButton = mealDiv.querySelector('.favourite-button');
    favouriteButton.addEventListener('click', () => removeFromFavourites(meal.idMeal));

    // Append the meal div to favourites list container
    favouritesList.appendChild(mealDiv);
}

// Function to remove a meal from favourites
function removeFromFavourites(mealId) {
    const storedFavourites = JSON.parse(localStorage.getItem('favourites')) || [];
    const removeIndex = storedFavourites.findIndex(item => item.idMeal === mealId);

    if (removeIndex !== -1) {
        storedFavourites.splice(removeIndex, 1);
        localStorage.setItem('favourites', JSON.stringify(storedFavourites));

        // Remove the meal div from favourites list UI
        const mealDiv = document.querySelector(`.meal[data-id="${mealId}"]`);
        if (mealDiv) {
            mealDiv.remove();
        }
    }
}

// Function to implement debounce for input events
function debounce(func, delay) {
    let timer;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(func, delay);
    };
}

// Function to fetch and display meal details on the meal details page
async function getMealDetails(mealId) {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
    const data = await response.json();

    if (data.meals && data.meals.length > 0) {
        const meal = data.meals[0];
        showMealDetails(meal);
    }
}

// Function to display meal details on the meal details page
function showMealDetails(meal) {
    mealDetailsContainer.innerHTML = `
        <h2>${meal.strMeal}</h2>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h3>Ingredients</h3>
        <ul>
            ${getIngredientsList(meal)}
        </ul>
        <h3>Instructions</h3>
        <p>${meal.strInstructions}</p>
    `;
}

// Function to generate a list of ingredients for a meal
function getIngredientsList(meal) {
    let ingredientsList = '';
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
            ingredientsList += `<li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>`;
        }
    }
    return ingredientsList;
}
