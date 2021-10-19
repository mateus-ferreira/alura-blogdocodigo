const Usuario = require('./usuarios-modelo')
const { InvalidArgumentError, NaoEncontrado } = require('../erros')

const tokens = require('./tokens')
const { EmailVerificacao, EmailRedefinicaoSenha } = require('./emails')
const { ConversorUsuario } = require('../conversores')

function geraEndereco (rota, token) {
  const baseURL = process.env.BASE_URL
  return `${baseURL}${rota}${token}`
}

module.exports = {
  async adiciona (req, res, proximo) {
    const { nome, email, senha, cargo } = req.body

    try {
      const usuario = new Usuario({
        nome,
        email,
        emailVerificado: false,
        cargo
      })
      await usuario.adicionaSenha(senha)
      await usuario.adiciona()

      const token = tokens.verificacaoEmail.cria(usuario.id)
      const endereco = geraEndereco('/usuario/verifica_email/', token)
      const emailVerificacao = new EmailVerificacao(usuario, endereco)
      emailVerificacao.enviaEmail().catch(console.log)

      res.status(201).json()
    } catch (erro) {
      proximo(erro)
    }
  },

  async login (req, res, proximo) {
    try {
      const accessToken = tokens.access.cria(req.user.id)
      const refreshToken = await tokens.refresh.cria(req.user.id)
      res.set('Authorization', accessToken)
      res.status(200).json({ refreshToken })
    } catch (erro) {
      proximo(erro)
    }
  },

  async logout (req, res, proximo) {
    try {
      const token = req.token
      await tokens.access.invalida(token)
      res.status(204).json()
    } catch (erro) {
      proximo(erro)
    }
  },

  async lista (req, res, proximo) {
    try {
      const usuarios = await Usuario.lista()
      const conversor = new ConversorUsuario(
        'json',
        req.acesso.todos.permitido ? req.acesso.todos.atributos : req.acesso.apenasSeu.atributos
      )
      res.send(conversor.converter(usuarios))
    } catch (erro) {
      proximo(erro)
    }
  },

  async verificaEmail (req, res, proximo) {
    try {
      const usuario = req.user
      await usuario.verificaEmail()
      res.status(200).json()
    } catch (erro) {
      proximo(erro)
    }
  },

  async deleta (req, res, proximo) {
    try {
      const usuario = await Usuario.buscaPorId(req.params.id)
      await usuario.deleta()
      res.status(200).json()
    } catch (erro) {
      proximo(erro)
    }
  },

  async esqueciMinhaSenha (requisicao, resposta, proximo) {
    const respostaPadrao = { mensagem: 'n sei se tem ou n, se tiver da boa' }
    try {
      const usuario = await Usuario.buscaPorEmail(requisicao.body.email)
      const token = await tokens.redefinicaoDeSenha.criarToken(usuario.id)
      const email = new EmailRedefinicaoSenha(usuario, token)
      email.enviaEmail()
      resposta.send(respostaPadrao).end()
    }catch(erro){
      if (erro instanceof NaoEncontrado){
        resposta.send(respostaPadrao)
      }
    }
    proximo()
  },

  async trocarSenha (requisicao, resposta, proximo) {
    try{
      if (typeof requisicao.body.token !== 'string' || requisicao.body.token.length === 0){
        throw new InvalidArgumentError('token invalido')
      }
      const id = await tokens.redefinicaoDeSenha.verifica(requisicao.body.token)
      const usuario = await Usuario.buscaPorId(id)
      await usuario.adicionaSenha(requisicao.body.senha)
      await usuario.atualizarSenha()
      resposta.send({ mensagem: 'senha atualizada' })
    }catch(erro){
      proximo(erro)
    }
  }
}