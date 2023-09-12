"use client";
import React, { useState, useEffect } from 'react';

function Header({ onSearchTermChange }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    console.log('Buscando:', searchTerm);
    onSearchTermChange(searchTerm);
  };

  return (
    <header className="header">
      <div className="searchContainer">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className="searchInput"
        />
        <button onClick={handleSearch} className="searchButton">
          Traducir
        </button>
      </div>
    </header>
  );
}

export default Header;
