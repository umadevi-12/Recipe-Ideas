
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import SearchFilters from './components/SearchFilters';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    maxCookingTime: 60,
    category: '',
    difficulty: '',
    ingredientsOnly: false
  });

  // Load favorites and history from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('recipeFavorites');
    const savedHistory = localStorage.getItem('searchHistory');

    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error loading favorites:', e);
        setFavorites([]);
      }
    }
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading history:', e);
        setSearchHistory([]);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Error saving favorites:', e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    } catch (e) {
      console.error('Error saving history:', e);
    }
  }, [searchHistory]);

  // Enhanced recipe search with better error handling
  const searchRecipes = async (ingredient) => {
    const cleanIngredient = ingredient.trim();
    if (!cleanIngredient) {
      setError('Please enter at least one ingredient');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      // Use the first ingredient for initial search
      const primaryIngredient = cleanIngredient.split(',')[0].trim();

      const response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${primaryIngredient}`,
        { timeout: 10000 }
      );

      if (response.data.meals) {
        // Update search history
        const updatedHistory = [
          cleanIngredient,
          ...searchHistory.filter(item => item !== cleanIngredient)
        ].slice(0, 8);
        setSearchHistory(updatedHistory);

        // Fetch detailed recipes with error handling for individual requests
        const recipePromises = response.data.meals.slice(0, 20).map(async (meal) => {
          try {
            const detailResponse = await axios.get(
              `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`,
              { timeout: 8000 }
            );
            return detailResponse.data.meals[0];
          } catch (err) {
            console.warn(`Failed to fetch details for meal ${meal.idMeal}:`, err);
            return null;
          }
        });

        const detailedRecipes = (await Promise.all(recipePromises)).filter(recipe => recipe !== null);

        if (detailedRecipes.length === 0) {
          setError('Found recipes but failed to load details. Please try again.');
          setRecipes([]);
          setFilteredRecipes([]);
        } else {
          setRecipes(detailedRecipes);
          setFilteredRecipes(detailedRecipes);
        }
      } else {
        setRecipes([]);
        setFilteredRecipes([]);
        setError(`No recipes found with "${cleanIngredient}". Try different ingredients like chicken, beef, or vegetables.`);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (err.response) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to fetch recipes. Please check your internet connection.');
      }
      setRecipes([]);
      setFilteredRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced filtering with better ingredient matching
  useEffect(() => {
    let filtered = [...recipes];

    if (filters.maxCookingTime) {
      filtered = filtered.filter(recipe => {
        const estimatedTime = getCookingTimeEstimate(recipe);
        return estimatedTime <= filters.maxCookingTime;
      });
    }

    if (filters.category) {
      filtered = filtered.filter(recipe =>
        recipe.strCategory?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter(recipe => {
        const difficulty = getDifficulty(recipe);
        return difficulty.level.toLowerCase() === filters.difficulty;
      });
    }

    if (filters.ingredientsOnly && searchInput) {
      const searchIngredients = searchInput.split(',').map(ing => ing.trim().toLowerCase());
      filtered = filtered.filter(recipe => {
        // Check if recipe contains any of the searched ingredients
        return searchIngredients.some(ingredient =>
          recipeHasIngredient(recipe, ingredient)
        );
      });
    }

    setFilteredRecipes(filtered);
  }, [recipes, filters, searchInput]);

  // Helper function to check if recipe has specific ingredient
  const recipeHasIngredient = (recipe, ingredient) => {
    // Check in ingredients list
    for (let i = 1; i <= 20; i++) {
      const recipeIngredient = recipe[`strIngredient${i}`];
      if (recipeIngredient && recipeIngredient.toLowerCase().includes(ingredient)) {
        return true;
      }
    }

    // Check in instructions
    if (recipe.strInstructions?.toLowerCase().includes(ingredient)) {
      return true;
    }

    // Check in meal name
    if (recipe.strMeal?.toLowerCase().includes(ingredient)) {
      return true;
    }

    return false;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchRecipes(searchInput);
  };

  const openRecipeDetail = async (recipeId) => {
    try {
      const response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`,
        { timeout: 8000 }
      );
      setSelectedRecipe(response.data.meals[0]);
      setIsModalOpen(true);
    } catch (err) {
      setError('Failed to load recipe details. Please try again.');
      console.error('Error fetching recipe details:', err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
  };

  // Improved cooking time estimation
  const getCookingTimeEstimate = (recipe) => {
    if (!recipe) return 30;

    let time = 30; // base time

    // Adjust based on instructions complexity
    if (recipe.strInstructions) {
      const instructionLength = recipe.strInstructions.length;
      const wordCount = recipe.strInstructions.split(/\s+/).length;

      if (wordCount > 300) time += 30;
      else if (wordCount > 150) time += 15;
    }

    // Adjust based on number of ingredients
    const ingredientCount = Object.keys(recipe)
      .filter(key => key.startsWith('strIngredient') && recipe[key] && recipe[key].trim())
      .length;

    if (ingredientCount > 10) time += 25;
    else if (ingredientCount > 6) time += 15;

    // Cap between 15-120 minutes
    return Math.max(15, Math.min(time, 120));
  };

  const getDifficulty = (recipe) => {
    if (!recipe) return { level: 'Medium', color: 'medium' };

    const ingredientCount = Object.keys(recipe)
      .filter(key => key.startsWith('strIngredient') && recipe[key] && recipe[key].trim())
      .length;

    const instructionLength = recipe.strInstructions?.length || 0;

    let score = ingredientCount;
    if (instructionLength > 1000) score += 3;
    else if (instructionLength > 500) score += 2;

    if (score > 10) return { level: 'Hard', color: 'hard' };
    if (score > 6) return { level: 'Medium', color: 'medium' };
    return { level: 'Easy', color: 'easy' };
  };

  const toggleFavorite = (recipe) => {
    if (favorites.some(fav => fav.idMeal === recipe.idMeal)) {
      setFavorites(favorites.filter(fav => fav.idMeal !== recipe.idMeal));
    } else {
      setFavorites([...favorites, recipe]);
    }
  };

  const isFavorite = (recipeId) => {
    return favorites.some(fav => fav.idMeal === recipeId);
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const quickSearch = (ingredient) => {
    setSearchInput(ingredient);
    searchRecipes(ingredient);
  };

  const clearSearch = () => {
    setSearchInput('');
    setRecipes([]);
    setFilteredRecipes([]);
    setError('');
    setHasSearched(false);
  };

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        {/* Search Section */}
        <section className="search-section">
          <div className="container">
            <div className="search-container">
              <h2>What's in your kitchen?</h2>
              <p className="search-subtitle">Enter ingredients separated by commas to discover recipes</p>

              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-group">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="e.g., chicken, rice, tomatoes, garlic..."
                    className="search-input"
                  />
                  <button type="submit" className="search-button" disabled={loading}>
                    {loading ? 'Searching...' : 'Find Recipes'}
                  </button>
                  {hasSearched && (
                    <button type="button" onClick={clearSearch} className="clear-button">
                      Clear
                    </button>
                  )}
                </div>
              </form>

              {/* Quick Search Suggestions */}
              <div className="quick-search">
                <p>Quick ideas: </p>
                <div className="quick-search-tags">
                  {['chicken', 'beef', 'rice', 'vegetables', 'fish', 'eggs', 'cheese'].map((item) => (
                    <button
                      key={item}
                      className="quick-search-tag"
                      onClick={() => quickSearch(item)}
                      disabled={loading}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="search-history">
                  <div className="history-header">
                    <span>Recent searches:</span>
                    <button onClick={clearHistory} className="clear-history">Clear All</button>
                  </div>
                  <div className="history-tags">
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        className="history-tag"
                        onClick={() => quickSearch(item)}
                        disabled={loading}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <section className="favorites-section">
            <div className="container">
              <div className="section-header">
                <h2>⭐ Your Favorite Recipes ({favorites.length})</h2>
                <p>Your saved recipes for quick access</p>
              </div>
              <div className="recipes-grid">
                {favorites.map(recipe => (
                  <RecipeCard
                    key={recipe.idMeal}
                    recipe={recipe}
                    onClick={() => openRecipeDetail(recipe.idMeal)}
                    getCookingTimeEstimate={getCookingTimeEstimate}
                    getDifficulty={getDifficulty}
                    isFavorite={true}
                    onToggleFavorite={() => toggleFavorite(recipe)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Filters Section */}
        {recipes.length > 0 && (
          <SearchFilters filters={filters} setFilters={setFilters} />
        )}

        {/* Results Section */}
        <section className="results-section">
          <div className="container">
            {loading && <LoadingSpinner />}

            {error && (
              <div className="error-message">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && filteredRecipes.length > 0 && (
              <>
                <div className="results-header">
                  <h2>🍳 Found {filteredRecipes.length} Recipe{filteredRecipes.length !== 1 ? 's' : ''}</h2>
                  <p>Click on any recipe card to view full instructions and ingredients</p>
                  {filteredRecipes.length < recipes.length && (
                    <p className="filter-notice">
                      (Showing {filteredRecipes.length} of {recipes.length} recipes after filters)
                    </p>
                  )}
                </div>

                <div className="recipes-grid">
                  {filteredRecipes.map(recipe => (
                    <RecipeCard
                      key={recipe.idMeal}
                      recipe={recipe}
                      onClick={() => openRecipeDetail(recipe.idMeal)}
                      getCookingTimeEstimate={getCookingTimeEstimate}
                      getDifficulty={getDifficulty}
                      isFavorite={isFavorite(recipe.idMeal)}
                      onToggleFavorite={() => toggleFavorite(recipe)}
                    />
                  ))}
                </div>
              </>
            )}

            {!loading && !error && hasSearched && filteredRecipes.length === 0 && recipes.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>No Recipes Found</h3>
                <p>We couldn't find any recipes with those ingredients. Try something else!</p>
                <div className="empty-state-tips">
                  <p><strong>Search Tips:</strong></p>
                  <ul>
                    <li>Try single ingredients first (e.g., "chicken" instead of "chicken breast")</li>
                    <li>Check spelling or try more common ingredients</li>
                    <li>Use the quick search buttons for popular ingredients</li>
                    <li>Some ingredients might not be in our database yet</li>
                  </ul>
                </div>
              </div>
            )}

            {!loading && !error && hasSearched && filteredRecipes.length === 0 && recipes.length > 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12C22 13.3132 21.7413 14.6136 21.2388 15.8268C20.7362 17.0401 19.9997 18.1425 19.0711 19.0711C18.1425 19.9997 17.0401 20.7362 15.8268 21.2388C14.6136 21.7413 13.3132 22 12 22C10.6868 22 9.38642 21.7413 8.17317 21.2388C6.95991 20.7362 5.85752 19.9997 4.92893 19.0711C4.00035 18.1425 3.26375 17.0401 2.7612 15.8268C2.25866 14.6136 2 13.3132 2 12C2 10.6868 2.25866 9.38642 2.7612 8.17317C3.26375 6.95991 4.00035 5.85752 4.92893 4.92893C5.85752 4.00035 6.95991 3.26375 8.17317 2.7612C9.38642 2.25866 10.6868 2 12 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>No Recipes Match Your Filters</h3>
                <p>Try adjusting your filters to see more recipes.</p>
                <button
                  onClick={() => setFilters({
                    maxCookingTime: 60,
                    category: '',
                    difficulty: '',
                    ingredientsOnly: false
                  })}
                  className="search-button"
                  style={{ marginTop: '1rem' }}
                >
                  Reset All Filters
                </button>
              </div>
            )}
            {!loading && !error && !hasSearched && (
              <div className="empty-state">
                <div className="empty-image">
                  <img
                    src="https://img.freepik.com/premium-photo/chef-preparing-food-restaurant-kitchen-realistic-photo_1088041-41682.jpg?w=360"
                    alt="Chef preparing food"
                  />
                </div>

                <h3>Ready to Cook Something Delicious?</h3>
                <p>Enter the ingredients you have to discover amazing recipes!</p>

                <div className="empty-state-tips">
                  <p><strong>Getting Started:</strong></p>
                  <ul>
                    <li>Enter ingredients separated by commas (e.g., "chicken, rice, tomatoes")</li>
                    <li>Be specific about what you have in your fridge and pantry</li>
                    <li>Use the quick search buttons for popular ingredients</li>
                    <li>Save your favorite recipes for later</li>
                    <li>Filter results by cooking time, difficulty, or category</li>
                  </ul>
                </div>
              </div>
            )}

          </div>
        </section>
      </main>

      {/* Recipe Detail Modal */}
      {isModalOpen && selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={closeModal}
          getCookingTimeEstimate={getCookingTimeEstimate}
          getDifficulty={getDifficulty}
          isFavorite={isFavorite(selectedRecipe.idMeal)}
          onToggleFavorite={() => toggleFavorite(selectedRecipe)}
        />
      )}

      {/* Simple Footer */}
      <footer className="app-footer">
        <div className="container">
          <p>RecipeFinder - Turn ingredients into delicious meals</p>
        </div>
      </footer>
    </div>
  );
}

export default App;