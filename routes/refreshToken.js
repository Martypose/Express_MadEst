const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
require('dotenv').config();

//logear usuario
router.get('/', async function(req, res) {
    console.log('peticion recibida de nuevo token,refreeshhhh')
    const token = req.header('refreshToken')
    console.log(token)
if (!token) return res.status(401).json({ error: 'Acceso denegado' })
try {
    const verified = jwt.verify(token, process.env.TOKEN_REFRESH_SECRET)
    req.user = verified
} catch (error) {
    res.status(400).json({error: 'token no es válido'})
    console.log("token no valido")
    console.log(error)
}
});

module.exports = router;