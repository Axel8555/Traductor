import React, { useEffect, useState } from 'react';

function Main({ searchTerm, onSearchTermChange }) {
  const [response, setResponse] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [errorResponse, setErrorResponse] = useState(null);
  const [showForm, setShowForm] = useState(true); // Nuevo estado para controlar la visibilidad del formulario
  const [translationResponse, setTranslationResponse] = useState(null); // Nuevo estado para almacenar la respuesta de la traducción
  useEffect(() => {
    if (searchTerm) {
      fetch('http://localhost:5000/lookForWord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: searchTerm, language: null }),
      })
        .then(response => response.json())
        .then(data => {
          setResponse(data);
          setSelectedSuggestion(null);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }, [searchTerm]);

  // Función para manejar la solicitud de agregar un error
  const addError = (suggestion) => {
    if (suggestion) {
      fetch('http://localhost:5000/addError', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: searchTerm, wordId: suggestion.wordId }),
      })
        .then(response => response.json())
        .then(data => {
          setErrorResponse(data);
          // Actualizar searchTerm con el valor de suggestion.word
          onSearchTermChange(suggestion.word);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  };
  
  // Función para manejar la solicitud de agregar un error

  const addTranslation = (word_b) => {
    if (word_b) {
      fetch('http://localhost:5000/addTranslation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word_a: searchTerm,
          language_a: "es-MX",
          word_b: word_b,
          language_b: "en-US",
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setTranslationResponse(data); // Almacenar la respuesta
          setShowForm(false); // Ocultar el formulario
          onSearchTermChange(word_b);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  };

 // Función para renderizar las respuestas de error
 const renderError = (errorType) => {
  const handleAddWordSubmit = (e) => {
    e.preventDefault();
    const word_b = e.target.word_b.value;
    e.target.word_b.value = '';
  };

  return (
    <> 
      {response.suggestions.length > 0 && (
        <div>
          <h1>Quisiste decir:</h1>
          {response.suggestions.map((suggestion, index) => (
            <button key={index} onClick={() => { setSelectedSuggestion(suggestion); addError(suggestion); }}>
              {suggestion.word}
            </button>
          ))}
          {errorResponse && (
            <p>Respuesta del servidor: {JSON.stringify(errorResponse)}</p>
          )}
        </div>
      )}
      {showForm ? (
        <form onSubmit={(e) => {
          e.preventDefault();
          const word_b = e.target.word_b.value;
          addTranslation(word_b);
          e.target.word_b.value = '';
        }}>
          <h2>Agregar palabra: "{searchTerm}", es-MX</h2>
          <label>
            Traducción en-US:
            <div>
              <input type="text" name="word_b" />
            </div>
          </label>
          <button type="submit">Enviar</button>
        </form>
      ) : (
        <div>
          <h2>Respuesta de la traducción:</h2>
          <pre>{JSON.stringify(translationResponse, null, 2)}</pre>
        </div>
      )}
    </>
  );
};



  // Función para renderizar la respuesta
  const renderResponse = () => {
    if (response?.words) {
      return (
        <div>
          <h2>Palabras encontradas:</h2>
          {response.words.map((element, index) => (
            <div key={index}>
              <h3>Palabra principal:</h3>
              <p>{JSON.stringify(element.mainword)}</p>
              <h3>Traducciones:</h3>
              <p>{JSON.stringify(element.translations)}</p>
            </div>
          ))}
        </div>
      );
    } else if (response?.type) {
      switch (response.type) {
        case 'common_error':
        case 'levenshtein_error':
        case 'not_founded':
          return renderError(response.type);
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
