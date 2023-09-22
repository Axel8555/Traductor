"use client";
import React, { useState } from 'react';
import Header from '../components/Header';
import Main from '../components/Main';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchTermChange = (term) => {
    setSearchTerm(term);
  };

  return (
    <div>
      <Header onSearchTermChange={handleSearchTermChange} />
      <Main searchTerm={searchTerm} onSearchTermChange={handleSearchTermChange} />
    </div>
  );
}

export default Home;
