const express = require('express')
const router = express.Router()
const db = require('../lib/db');
const mysql = require("mysql")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

const tokenList = {}

//logear usuario
router.post('/', async function (req, res) {

  console.log('hola')
  const username = req.body.name
  const password = req.body.password

  const sqlSearch = "Select * from usuarios where username = ?"
  const search_query = mysql.format(sqlSearch, [username])
  console.log(username)

  await db.query(search_query, async (err, result) => {

    if (err) throw (err)
    if (result.length == 0) {
      console.log("--------> User does not exist")
      res.header().json({
        message: 'Usuario no existe!',
      })
    } else {
      const hashedPassword = result[0].password
      //get the hashedPassword from result
      if (await bcrypt.compare(password, hashedPassword)) {
        // create accesstoken
        const accessToken = jwt.sign({
          name: username
        }, process.env.TOKEN_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRATION })

        const refreshToken = jwt.sign({
          name: username
        }, process.env.TOKEN_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRATION })

        console.log("---------> Login Successful")
        console.log("LOGIN RESPONSE ENVIADO:", {
          accessToken: { accessToken },
          refreshToken: { refreshToken },
          message: 'Bienvenido ' + username + '!',
          username: username
        });
        res.header('autorizado').json({
          accessToken: { accessToken },
          refreshToken: { refreshToken },
          message: 'Bienvenido ' + username + '!',
          username: username
        })
      } else {
        console.log("---------> Password Incorrect")
        res.header().json({
          message: 'Password incorrecta!',
        })
      } //end of bcrypt.compare()
    }//end of User exists i.e. results.length==0

  });
});




module.exports = router;