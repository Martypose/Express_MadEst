const express = require('express');
const seguridad = require('../lib/seguridad')
const router = express.Router();
const dbConn  = require('../lib/db')
const mysql = require("mysql")
const bcrypt = require("bcrypt")

//postalogin
router.post('/', async function(req, res) {
  
    const username = req.body.name
    const password = req.body.password

    const sqlSearch = "Select * from usuarios where username = ?"
    const search_query = mysql.format(sqlSearch,[username])
    console.log(username)

    await dbConn.query (search_query, async (err, result) => {
     
     if (err) throw (err)
     if (result.length == 0) {
      console.log("--------> User does not exist")
      res.sendStatus(404)
     }else {
        const hashedPassword = result[0].password
        //get the hashedPassword from result
       if (await bcrypt.compare(password, hashedPassword)) {
       console.log("---------> Login Successful")
       res.send(`${username} is logged in!`)
       } 
       else {
       console.log("---------> Password Incorrect")
       res.send("Password incorrect!")
       } //end of bcrypt.compare()
     }//end of User exists i.e. results.length==0

    });
});




  module.exports = router;