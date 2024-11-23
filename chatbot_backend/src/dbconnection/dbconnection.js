const logError = require('../utilities/errorLogger');
const { Pool } = require('pg');

let pool = null;

class getDbConnection {
  async getConnection() {
    try {
      if (pool === null) {
        pool = new Pool({
          user: 'postgres',
          host: 'localhost', // usually 'localhost' if your database is hosted locally
          database: 'Keep your database name',
          password: 'keep your database password',
          port: '5432', // usually 5432 for PostgreSQL
        });

        pool.on('error', (err, client) => {
          logError("Error occurred in Pool");
          logError(err);
        });
      }

      console.log("In DB connect try block");
      const client = await pool.connect();
      return client;
    } catch (err) {
      logError("Error in connecting to database");
      logError(err);
      throw err; // re-throw the error to handle it in the calling function
    }
  }
}

module.exports = getDbConnection;
