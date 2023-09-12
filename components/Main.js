import React, { useEffect, useState } from 'react';


function Main({ searchTerm }) {
  const [response, setResponse] = useState(null);

  useEffect(() => {
    if (searchTerm) {
      fetch('http://localhost:5000/lookForWord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: searchTerm, language: "es-MX" }), // Ajusta el lenguaje según sea necesario
      })
        .then(response => response.json())
        .then(data => {
          setResponse(data);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }, [searchTerm]);

  return (
    <div>
      {response && (
        <p>
          Respuesta del servidor: {JSON.stringify(response)}
        </p>
      )}
    </div>
  );
}

export default Main;
