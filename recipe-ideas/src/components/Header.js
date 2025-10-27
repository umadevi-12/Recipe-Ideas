import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <div className="logo-image">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvv9O8abz5Udm_pDuIoNv4GnyK6wXsSDET1w&s" 
                alt="RecipeFinder Logo" 
                className="logo-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{display: 'none', fontSize: '24px'}}>🍳</div>
            </div>
            <h1>RecipeFinder</h1>
          </div>
          <p className="tagline">Turn ingredients into delicious meals</p>
        </div>
      </div>
    </header>
  );
};

export default Header;