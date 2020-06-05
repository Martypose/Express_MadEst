const contraseña = 'Martin';

function verificarCliente(req, res, next) {

    const contraseñaCliente = req.headers['authorization'];
    console.log(req.headers)

    if(contraseñaCliente==contraseña) {
        next();
    } else {
        res.sendStatus(403);

    }
}


module.exports = verificarCliente;