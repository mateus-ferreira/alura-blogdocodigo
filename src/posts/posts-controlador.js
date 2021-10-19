const Post = require('./posts-modelo')
const { InvalidArgumentError } = require('../erros')
const { ConversorPost } = require('../conversores')

module.exports = {
  async adiciona (req, res) {
    try {
      req.body.autor = req.user.id
      const post = new Post(req.body)
      await post.adiciona()

      res.status(201).json(post)
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        return res.status(400).json({ erro: erro.message })
      }
      res.status(500).json({ erro: erro.message })
    }
  },

  async lista (req, res) {
    try {
      const posts = await Post.listarTodos()
      const conversor = new ConversorPost('json', req.acesso.todos.permitido 
      ? req.acesso.todos.atributos : req.acesso.apenasSeu.atributos)


      if(!req.estaAutorizado) {
        posts = posts.map(post =>{ 
          post.conteudo = post.conteudo.substr(0,10) + '....assine agora'
          return posts
        })
      }

      res.send(conversor.converter(posts))
    } catch (erro) {
      return res.status(500).json({ erro: erro.message })
    }
  },

  async obterDetalhes (req, res) {
    try {
      const post = await Post.buscaPorId(req.params.id, req.user.id)
      res.json(post)
    } catch (erro) {
      return res.status(500).json({ erro: erro.message })
    }
  },

  async remover (req, res) {
    try {
      const post = await Post.buscaPorId(req.params.id, req.user.id)
      post.remover()
      res.status(204)
      res.end()
    } catch (erro) {
      return res.status(500).json({ erro: erro.message })
    }
  }
}
