const { Client } = require("pg");
const db = new Client(
  process.env.DATABASE_URL ||
    "postgres:postgres:postgres@localhost:5432/bug-tracker"
);
