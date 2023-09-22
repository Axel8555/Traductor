-- Creación de la tabla Languages
CREATE TABLE Languages (
    language VARCHAR(5) PRIMARY KEY
);

-- Creación de la tabla Words
CREATE TABLE Words (
    id SERIAL PRIMARY KEY,
    word VARCHAR(25) NOT NULL,
    language VARCHAR(5) NOT NULL REFERENCES Languages(language) ON DELETE CASCADE,
    UNIQUE(word, language)
);


-- Creación de la tabla WordRelationships
CREATE TABLE WordRelationships (
    id SERIAL PRIMARY KEY,
    wordId1 INTEGER NOT NULL,
    wordId2 INTEGER NOT NULL,
    FOREIGN KEY (wordId1) REFERENCES Words(id) ON DELETE CASCADE,
    FOREIGN KEY (wordId2) REFERENCES Words(id) ON DELETE CASCADE,
    UNIQUE(wordId1, wordId2)
);

-- Creación de la tabla CommonErrors
CREATE TABLE CommonErrors (
    errorId SERIAL PRIMARY KEY,
    word VARCHAR(25) NOT NULL,
    wordId INTEGER NOT NULL REFERENCES Words(id) ON DELETE CASCADE,
    times INTEGER NOT NULL,
    UNIQUE (word, wordId)
);

-- Creación de la función addLanguage
CREATE OR REPLACE FUNCTION addLanguage(p_language VARCHAR(5)) 
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    BEGIN
        INSERT INTO Languages (language) VALUES (p_language);
    EXCEPTION WHEN unique_violation THEN
        -- No hacer nada si ocurre una violación de restricción única
        RETURN;
    END;
END;
$$;

-- Creación de la función addWord
CREATE OR REPLACE FUNCTION addWord(p_word VARCHAR, p_language VARCHAR) 
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    BEGIN
        INSERT INTO Words (word, language) VALUES (p_word, p_language);
    EXCEPTION WHEN unique_violation THEN
        -- No hacer nada si ocurre una violación de restricción única
        RETURN;
    END;
END;
$$;

-- Creación de la función addWordRelationship
CREATE OR REPLACE FUNCTION addWordRelationship(p_wordId1 INTEGER, p_wordId2 INTEGER) 
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_wordId1 INTEGER;
    v_wordId2 INTEGER;
BEGIN
    -- Asegúrate de que wordId1 sea siempre menor que wordId2
    IF p_wordId1 > p_wordId2 THEN
        v_wordId1 := p_wordId2;
        v_wordId2 := p_wordId1;
    ELSE
        v_wordId1 := p_wordId1;
        v_wordId2 := p_wordId2;
    END IF;

    -- Intenta insertar la nueva relación de palabras
    BEGIN
        INSERT INTO WordRelationships (wordId1, wordId2) VALUES (v_wordId1, v_wordId2);
    EXCEPTION WHEN unique_violation THEN
        -- No hacer nada si ocurre una violación de restricción única
        RETURN;
    END;
END;
$$;

CREATE OR REPLACE FUNCTION addWordAndRelationship(relatedWordId INTEGER, word VARCHAR, language VARCHAR)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    new_word_id INTEGER;
BEGIN
    -- Agregando la nueva palabra a la tabla Words
    CALL addWord(word, language);

    -- Recuperando el ID de la nueva palabra agregada
    SELECT id INTO new_word_id FROM Words WHERE word = word AND language = language;

    -- Creando una nueva relación en la tabla WordRelationships
    CALL addWordRelationship(new_word_id, relatedWordId);
END;
$$;


-- Creación de la función addError
CREATE OR REPLACE FUNCTION addError(p_word VARCHAR, p_wordId INTEGER)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO CommonErrors (word, wordId, times)
    VALUES (p_word, p_wordId, 1)
    ON CONFLICT (word, wordId)
    DO UPDATE SET times = CommonErrors.times + 1;
END;
$$;

-- Creación de la función getWordRelationships
CREATE OR REPLACE FUNCTION getWordRelationships(p_wordId INTEGER)
RETURNS TABLE (
    relationshipId INTEGER,
    wordId INTEGER,
    word VARCHAR,
    language VARCHAR
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wr.id AS relationshipId,
        w1.id AS wordId,
        w1.word,
        w1.language
    FROM 
        WordRelationships wr
    JOIN 
        Words w1 ON wr.wordId2 = w1.id
    WHERE 
        wr.wordId1 = p_wordId
    UNION
    SELECT 
        wr.id AS relationshipId,
        w2.id AS wordId,
        w2.word,
        w2.language
    FROM 
        WordRelationships wr
    JOIN 
        Words w2 ON wr.wordId1 = w2.id
    WHERE 
        wr.wordId2 = p_wordId;
END;
$$;


-- Creación de la función getAllErrors
CREATE OR REPLACE FUNCTION getAllErrors()
RETURNS TABLE (
    errorId INTEGER,
    word VARCHAR,
    wordId INTEGER,
    times INTEGER,
    language VARCHAR,
    id INTEGER,
    WordData VARCHAR
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.errorId,
        ce.word,
        ce.wordId,
        ce.times,
        w.language,
        w.id,
        w.word AS WordData
    FROM 
        CommonErrors ce
    JOIN 
        Words w ON ce.wordId = w.id
    ORDER BY 
        ce.times DESC;
END;
$$;

-- Creación de la función getErrorsByStr
CREATE OR REPLACE FUNCTION getErrorsByStr(p_word VARCHAR)
RETURNS TABLE (
    errorId INTEGER,
    word VARCHAR,
    wordId INTEGER,
    times INTEGER,
    language VARCHAR,
    id INTEGER,
    WordData VARCHAR
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.errorId,
        ce.word,
        ce.wordId,
        ce.times,
        w.language,
        w.id,
        w.word AS WordData
    FROM 
        CommonErrors ce
    JOIN 
        Words w ON ce.wordId = w.id
    WHERE 
        ce.word = p_word
    ORDER BY 
        ce.times DESC;
END;
$$;

-- Creación de la función restartDictionary
CREATE OR REPLACE FUNCTION restartDictionary()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    -- Eliminar todos los registros y reiniciar los contadores de identidad
    TRUNCATE WordRelationships RESTART IDENTITY CASCADE;
    TRUNCATE CommonErrors RESTART IDENTITY CASCADE;
    TRUNCATE Words RESTART IDENTITY CASCADE;
    TRUNCATE Languages RESTART IDENTITY CASCADE;
END;
$$;


-- Ejemplos de inserciones
INSERT INTO Languages (language) VALUES ('es-MX'), ('en-US'), ('fr-FR');

INSERT INTO Words (word, language) VALUES 
('casa', 'es-MX'), 
('house', 'en-US'), 
('maison', 'fr-FR');

INSERT INTO Words (word, language) VALUES 
('gato', 'es-MX'), 
('cat', 'en-US'), 
('chat', 'fr-FR');

-- Insertando relaciones
INSERT INTO WordRelationships (wordId1, wordId2) VALUES (1, 2); -- Esta inserción debería ser válida
INSERT INTO WordRelationships (wordId1, wordId2) VALUES (3, 1); -- Esta inserción debería ser válida
INSERT INTO WordRelationships (wordId1, wordId2) VALUES (2, 3); -- Esta inserción debería ser válida

-- Insersiones no válidas
-- INSERT INTO Words (word, language) VALUES ('casa', 'es-MX'); -- Esta inserción debería fallar porque 'casa' ya existe en español
-- INSERT INTO Languages (language) VALUES ('es-MX'); -- Esta inserción debería fallar porque el idioma 'es' ya existe
-- INSERT INTO WordRelationships (wordId1, wordId2) VALUES (2, 1); -- Esta inserción debería fallar debido a la restricción UNIQUE


--SELECT restartDictionary();
