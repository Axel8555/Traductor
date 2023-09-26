import React, { useEffect, useState } from 'react';

function Main({ searchTerm, onSearchTermChange }) {
  const [response, setResponse] = useState(null);
  const [errorResponse, setErrorResponse] = useState(null);
  const [translationResponse, setTranslationResponse] = useState(null);
  const [isFetching, setIsFetching] = useState(false); // Nuevo estado para controlar las solicitudes

  useEffect(() => {
    if (searchTerm) {
      setIsFetching(true); // Inicia la solicitud
      // Realiza la solicitud a 'lookForWord'
      fetch('http://localhost:5000/lookForWord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: searchTerm, language: null }),
      })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setResponse(data);
        setIsFetching(false); // Finaliza la solicitud
        // Restablece errorResponse y translationResponse
        setErrorResponse(null);
        setTranslationResponse(null);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsFetching(false); // Finaliza la solicitud en caso de error
      });
    }
  }, [searchTerm]);

  const addError = (suggestion) => {
    if (suggestion) {
      setErrorResponse(null); // Restablece errorResponse
      // Realiza la solicitud para agregar un error
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
        onSearchTermChange(suggestion.word);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  };

  const addTranslation = (word_b) => {
    if (word_b) {
      setTranslationResponse(null); // Restablece translationResponse
      // Realiza la solicitud para agregar una traducción
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
      .then(response => response.json())
      .then(data => {
        setTranslationResponse(data);
        onSearchTermChange(word_b);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  };

  const renderSuggestion = () => (
    <div className='genericContainer'>
      <h1>Quisiste decir:</h1>
      {response.suggestions.map((suggestion, index) => (
        <button className='suggestionButton' key={index} onClick={() => {addError(suggestion); }}>
          {suggestion.word}
        </button>
      ))}
      {errorResponse && (
        <p>Respuesta del servidor: {JSON.stringify(errorResponse)}</p>
      )}
    </div>
  );

  const renderForm = () => (
    <form className='genericContainer' onSubmit={(e) => {
      e.preventDefault();
      const word_b = e.target.word_b.value;
      addTranslation(word_b);
      e.target.word_b.value = '';
    }}>
      <h2>Agregar palabra: "{searchTerm}", es-MX</h2>
      <label>
        Traducción en-US:
        <div className='inputTextContainer'>
          <input type="text" name="word_b" />
          <button type="submit">Agregar</button>
        </div>
      </label>
    </form>
  );

  const renderResponse = () => {
    if (response?.words) {
      return (
        <div className='genericContainer'>
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
        case 'both':
        case 'common_error':
        case 'levenshtein_error':
          return (
            <>
              {renderSuggestion()}
              {renderForm()}
            </>
          );
        case 'not_founded':
          return (
            <>
              {renderForm()}
            </>
          );
        default:
          return null;
      }
    }
  };

  return (
    <main>
      {isFetching && <p>Cargando...</p>}
      {!isFetching && renderResponse()}
      {!isFetching && errorResponse && <p>Respuesta del servidor: {JSON.stringify(errorResponse)}</p>}
      {!isFetching && translationResponse && (
        <div className='genericContainer'>
          <h2>Respuesta de la traducción:</h2>
          <pre>{JSON.stringify(translationResponse, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}

export default Main;
