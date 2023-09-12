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
      <Main searchTerm={searchTerm}/>
      {/* Opcional: Puedes utilizar el searchTerm en tu componente Main también, si es necesario */}
      {/* <Main searchTerm={searchTerm} /> */}
    </div>
  );
}

export default Home;
