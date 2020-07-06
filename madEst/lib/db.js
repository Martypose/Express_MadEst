const mysql = require('mysql');
const connection = mysql.createConnection({
	host:'db5000588253.hosting-data.io',
	user:'dbu689444',
	password:'Usuarionumero23!',
	database:'dbs567482',
	port: 3306
});
connection.connect(function(error){
	if(!!error) {
		console.log(error);
	} else {
		console.log('Connectedo a base de datos!');
	}
});

module.exports = connection;