const contrase�a = 'Martin';

function verificarCliente(req, res, next) {

    const contrase�aCliente = req.headers['authorization'];
    console.log(req.headers)

    if(contrase�aCliente==contrase�a) {
        next();
    } else {
        res.sendStatus(403);

    }
}


module.exports = verificarCliente;