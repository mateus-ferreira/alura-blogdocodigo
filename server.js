require('dotenv').config()

const app = require('./app')
const port = 3000
require('./database')
require('./redis/blocklist-access-token')
require('./redis/allowlist-refresh-token')
const jwt = require('jsonwebtoken')
const { InvalidArgumentError, NaoEncontrado, NaoAutorizado } = require('./src/erros')
const routes = require('./rotas')
routes(app)

app.use((requisicao, resposta, proximo)=>{
    resposta.set({
        'Content-Type:' : 'application/json'
    })
})

app.use((erro, requisicao, resposta, proximo) => {
    let status = 500
    const corpo = {
        mensagem: erro.message
    }

    if(erro instanceof NaoEncontrado) {
        status = 404
    }

    if(erro instanceof NaoAutorizado) {
        status = 401
    }

    if(erro instanceof InvalidArgumentError){
        status = 400
    }

    if (erro instanceof jwt.JsonWebTokenError){
        status = 401
    }

    if (erro instanceof jwt.TokenExpiredError){
        status = 401
        corpo.expiradoEm = erro.expiredAt
    }

    resposta.status(status)
    resposta.json(corpo)
})

app.listen(port, () => console.log('A API está funcionando!'))
