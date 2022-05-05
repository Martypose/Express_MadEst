const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
require('dotenv').config();

//logear usuario
router.get('/', async function(req, res) {
    console.log('peticion recibida de nuevo token,refreeshhhh')
    const refreshtoken = req.header('refreshToken')
    const username = req.header('username')
    console.log(refreshtoken)
if (!refreshtoken) return res.status(401).json({ error: 'Acceso denegado' })
try {
    console.log(process.env.TOKEN_REFRESH_SECRET)
    const verified = jwt.verify(refreshtoken, process.env.TOKEN_REFRESH_SECRET)
    req.user = verified
    //enviamos accesToken, refreshToken y username
    const accessToken = jwt.sign({
        name: username
      }, process.env.TOKEN_SECRET, {expiresIn: process.env.JWT_ACCESS_EXPIRATION})
  
      const refreshToken = jwt.sign({
        name: username
      }, process.env.TOKEN_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRATION})
  
         console.log("reenviamosTokensfrescos")
         res.header('autorizado').json({
          accessToken: {accessToken},
          refreshToken: {refreshToken},
          username: username
        })

} catch (error) {
    res.status(400).json({error: 'refreshToken no es válido'})
    console.log(error)
}
});

module.exports = router;