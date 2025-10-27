import React from 'react';

const SearchFilters = ({ filters, setFilters }) => {
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <section className="filters-section">
      <div className="container">
        <h3 className="filters-title">Filter Recipes</h3>
        <div className="filters-grid">
          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <input
              type="text"
              placeholder="e.g., vegetarian, dessert, seafood..."
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="text-input"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="filter-group">
            <label className="filter-label">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => updateFilter('difficulty', e.target.value)}
              className="select-input"
            >
              <option value="">Any Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Cooking Time Filter */}
          <div className="filter-group">
            <label className="filter-label">
              Max Cooking Time: {filters.maxCookingTime} min
            </label>
            <input
              type="range"
              min="15"
              max="120"
              step="15"
              value={filters.maxCookingTime}
              onChange={(e) => updateFilter('maxCookingTime', parseInt(e.target.value))}
              className="slider"
            />
          </div>

          {/* Ingredients Only Toggle */}
          <div className="filter-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.ingredientsOnly}
                onChange={(e) => updateFilter('ingredientsOnly', e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              Only show recipes with my ingredients
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchFilters;