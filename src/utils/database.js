const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

class Database {
    query(sql, args) {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    return reject(err);
                }
                connection.beginTransaction(err => {
                    if (err) {
                        connection.release();
                        return reject(err);
                    }
                    connection.query(sql, args, (err, rows) => {
                        if (err) {
                            reject(err);
                        }
                        connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(err);
                                });
                            }
                            connection.release();
                            resolve(rows);
                        });
                    });
                });
            });
        });
    }
}

module.exports = { Database };
