// RecipeModal.js (Updated)
import React from 'react';

const RecipeModal = ({ recipe, onClose, getCookingTimeEstimate, getDifficulty, isFavorite, onToggleFavorite }) => {
  const cookingTime = getCookingTimeEstimate(recipe);
  const difficulty = getDifficulty(recipe);

  const ingredients = Array.from({ length: 20 }, (_, i) => i + 1)
    .map(i => ({
      ingredient: recipe[`strIngredient${i}`],
      measure: recipe[`strMeasure${i}`]
    }))
    .filter(item => item.ingredient && item.ingredient.trim());

  const instructions = recipe.strInstructions
    ?.split('\n')
    .filter(step => step.trim());

  const handleFavoriteClick = () => {
    onToggleFavorite();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="modal-header">
          <img src={recipe.strMealThumb} alt={recipe.strMeal} className="modal-image" />
          <div className="modal-title-section">
            <h2>{recipe.strMeal}</h2>
            <div className="recipe-details">
              <span className="detail-badge">{recipe.strCategory}</span>
              <span className="detail-badge">{recipe.strArea}</span>
              <span className="detail-badge">{cookingTime} min</span>
              <span className={`detail-badge ${difficulty.color}`}>{difficulty.level}</span>
              <button 
                className={`favorite-btn large ${isFavorite ? 'favorited' : ''}`}
                onClick={handleFavoriteClick}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isFavorite ? 'Saved' : 'Save Recipe'}
              </button>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <div className="ingredients-section">
            <h3>Ingredients</h3>
            <div className="ingredients-grid">
              {ingredients.map((item, index) => (
                <div key={index} className="ingredient-item">
                  <span className="ingredient-name">{item.ingredient}</span>
                  <span className="ingredient-measure">{item.measure}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="instructions-section">
            <h3>Instructions</h3>
            <div className="instructions-list">
              {instructions?.map((step, index) => (
                <div key={index} className="instruction-step">
                  <span className="step-number">{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>

          {recipe.strYoutube && (
            <div className="video-section">
              <h3>Video Tutorial</h3>
              <a 
                href={recipe.strYoutube} 
                target="_blank" 
                rel="noopener noreferrer"
                className="video-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.4981 4.80824 21.0708 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92925 4.59318 2.50193 4.84824 2.1613 5.19941C1.82067 5.55057 1.57879 5.98541 1.46 6.46C1.14521 8.20556 0.991236 9.97631 1 11.75C0.991236 13.5237 1.14521 15.2944 1.46 17.04C1.59096 17.5158 1.8383 17.9507 2.17814 18.3003C2.51799 18.6499 2.93884 18.9028 3.4 19.04C5.12 19.5 12 19.5 12 19.5C12 19.5 18.88 19.5 20.6 19.04C21.0708 18.9068 21.4981 18.6518 21.8387 18.3006C22.1793 17.9494 22.4212 17.5146 22.54 17.04C22.852 15.2944 23.0059 13.5237 23 11.75C23.0059 9.97631 22.852 8.20556 22.54 6.42Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.75 15.02L15.5 11.75L9.75 8.48V15.02Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Watch on YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;