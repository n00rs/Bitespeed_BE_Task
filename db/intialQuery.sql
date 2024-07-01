CREATE TABLE contact (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) NULL,
  email VARCHAR(100) NULL,
  linked_id INTEGER NULL,
  link_precedence VARCHAR(10) NULL CHECK(link_precedence IN ('secondary', 'primary')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
