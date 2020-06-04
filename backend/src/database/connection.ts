import knex from 'knex';
import path from 'path';

// filename é o arquivo do sqlite
const connection = knex({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'database.sqlite'),
  },
  useNullAsDefault: true,
});

export default connection;