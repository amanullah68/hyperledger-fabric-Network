var mysql = require('mysql');
const dbName = 'ethereum_api';

var connection;
module.exports = {
    connection: function () {
        connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'test',
            database: dbName,
            port: 3306
        });
        return connection;
    },
    closeConnection: function() {
        connection.end(function (err) {
            if(err) console.log(err);
            else console.log('ended');
        });
    }
}

