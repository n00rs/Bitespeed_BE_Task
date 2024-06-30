CREATE TABLE Contact (
    id SERIAL PRIMARY KEY,
    phoneNumber VARCHAR(20),
    email VARCHAR(50),
    linkedId SMALLINT,
    linkPrecedence VARCHAR(10) NOT NULL CHECK CONSTRAINT(LINKPRECEDENCE IN('secondary', 'primary')),
    createdAt TIMESTAMP NOT NULL,
    updateAt TIMESTAMP NOT NULL,
    deletedAt TIMESTAMP DEFAULT NULL
);
