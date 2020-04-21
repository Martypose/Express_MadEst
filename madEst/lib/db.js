const mysql = require('mysql');
const connection = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'contra',
	database:'madeirasestanqueiro'
});
connection.connect(function(error){
	if(!!error) {
		console.log(error);
	} else {
		console.log('Connectedo a base de datos!');
	}
});

module.exports = connection;