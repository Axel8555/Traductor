import React, { useEffect, useState } from 'react';

function Main({ searchTerm }) {
  const [response, setResponse] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  useEffect(() => {
    if (searchTerm) {
      fetch('http://localhost:5000/lookForWord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: searchTerm, language: null }), // Ajusta el lenguaje según sea necesario
      })
        .then(response => response.json())
        .then(data => {
          setResponse(data);
          // Inicialmente, no se selecciona ninguna sugerencia
          setSelectedSuggestion(null);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }, [searchTerm]);

  // Función para renderizar las respuestas de error
  const renderError = (errorType) => {
    return (
      <div>
        <h1>Quisiste decir:</h1>
        {response.suggestions.map((suggestion, index) => (
          <button key={index} onClick={() => setSelectedSuggestion(suggestion)}>
            {suggestion.word}
          </button>
        ))}
        {selectedSuggestion && (
          <p>{JSON.stringify(selectedSuggestion)}</p>
        )}
      </div>
    );
  };

  // Función para renderizar la respuesta
  const renderResponse = () => {
    if (response?.words) {
      return (
        <div>
          <h2>Palabras encontradas:</h2>
          {response.words.map((element, index) => (
            <p key={index}>{JSON.stringify(element)}</p>
          ))}
        </div>
      );
    } else if (response?.type) {
      switch (response.type) {
        case 'common_error':
        case 'levenshtein_error':
          return renderError(response.type);
        case 'not_founded':
          return (
            <div>
              <h1>Palabra no encontrada</h1>
            </div>
          );
        default:
          return null;
      }
    }
  };

  return (
    <div>
      {response && renderResponse()}
    </div>
  );
}

export default Main;
