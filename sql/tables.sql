DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firstname character varying(255) NOT NULL,
    lastname character varying(255) NOT NULL,
    email character varying(255) NOT NULL
);


DROP TABLE IF EXISTS project CASCADE;
CREATE TABLE project (
    id integer DEFAULT nextval('untitled_table_id_seq'::regclass) PRIMARY KEY,
    projectname character varying(255) NOT NULL
);


DROP TABLE IF EXISTS issue CASCADE;
CREATE TABLE issues (
    id integer DEFAULT nextval('untitled_table_id_seq1'::regclass) PRIMARY KEY UNIQUE,
    description text NOT NULL,
    severity character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    createdby integer REFERENCES users(id),
    assignedproject integer REFERENCES project(id),
    assignedto integer REFERENCES users(id)
);
