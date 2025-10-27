// RecipeCard.js (Updated)
import React from 'react';

const RecipeCard = ({ recipe, onClick, getCookingTimeEstimate, getDifficulty, isFavorite, onToggleFavorite }) => {
  const cookingTime = getCookingTimeEstimate(recipe);
  const difficulty = getDifficulty(recipe);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  return (
    <div className="recipe-card" onClick={onClick}>
      <div className="recipe-image">
        <img 
          src={recipe.strMealThumb} 
          alt={recipe.strMeal}
          loading="lazy"
        />
        <div className="recipe-overlay">
          <button className="view-recipe-btn">
            View Recipe
          </button>
        </div>
        <button 
          className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
          onClick={handleFavoriteClick}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className="recipe-content">
        <h3 className="recipe-title">{recipe.strMeal}</h3>
        <p className="recipe-category">{recipe.strCategory}</p>
        
        <div className="recipe-meta">
          <div className="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {cookingTime} min
          </div>
          <div className="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8M14 2L20 8M14 2V8H20M12 18V12M12 18H9M12 18H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={difficulty.color}>{difficulty.level}</span>
          </div>
        </div>
        
        <div className="recipe-ingredients">
          <h4>Key Ingredients:</h4>
          <div className="ingredients-list">
            {Array.from({ length: 20 }, (_, i) => i + 1)
              .map(i => recipe[`strIngredient${i}`])
              .filter(ingredient => ingredient && ingredient.trim())
              .slice(0, 4)
              .map((ingredient, index) => (
                <span key={index} className="ingredient-tag">
                  {ingredient}
                </span>
              ))
            }
            {Array.from({ length: 20 }, (_, i) => i + 1)
              .map(i => recipe[`strIngredient${i}`])
              .filter(ingredient => ingredient && ingredient.trim()).length > 4 && 
              <span className="ingredient-tag more">+ more</span>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;