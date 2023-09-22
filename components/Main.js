import React, { useEffect, useState } from 'react';

function Main({ searchTerm, onSearchTermChange }) {
  const [response, setResponse] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [errorResponse, setErrorResponse] = useState(null);

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

 // Función para renderizar las respuestas de error
const renderError = (errorType) => {
  const handleAddWordSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes manejar la lógica para agregar una nueva palabra
    // Accede a los valores de los inputs usando e.target.language y e.target.word
    const word_b = e.target.word_b.value;

    // Realiza una solicitud para agregar la palabra
    // Por ejemplo, podrías llamar a una función addNewWord(newLanguage, newWord)
    // Asegúrate de implementar addNewWord en tu aplicación

    // Limpia los campos del formulario después de agregar la palabra
    e.target.word_b.value = '';
  };

  return (
    <div>
      <h1>Quisiste decir:</h1>
      {response.suggestions.map((suggestion, index) => (
        <button key={index} onClick={() => { setSelectedSuggestion(suggestion); addError(suggestion); }}>
          {suggestion.word}
        </button>
      ))}
      {/*selectedSuggestion && (
        <div>
          <p>{JSON.stringify(selectedSuggestion)}</p>
        </div>
      )*/}
      {errorResponse && (
        <div>
          <p>Respuesta del servidor: {JSON.stringify(errorResponse)}</p>
        </div>
      )}

      {/* Formulario para agregar palabra */}
      <form onSubmit={handleAddWordSubmit}>
        <h2>Agregar palabra: "{searchTerm}", es-MX</h2>
        <label>
          Traducción en-US:
          <div >
            <input type="text" name="word_b" />
          </div>
        </label>
        <button type="submit">Enviar</button>
      </form>
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
