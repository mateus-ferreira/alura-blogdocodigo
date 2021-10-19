class InvalidArgumentError extends Error {
  constructor (mensagem) {
    super(mensagem)
    this.name = 'InvalidArgumentError'
  }
}

class InternalServerError extends Error {
  constructor (mensagem) {
    super(mensagem)
    this.name = 'InternalServerError'
  }
}

class NaoEncontrado extends Error {
  construtor(entidade){
    const mensagem = `${entidade} nao foi encontrado`
    super(mensagem)
    this.name = 'NaoEncontrado'
  }
}

class NaoAutorizado extends Error {
  construtor(){
    const mensagem = `${entidade} nao foi autorizado`
    super(mensagem)
    this.name = 'NaoAutorizado'
  }
}

module.exports = { InvalidArgumentError, InternalServerError, NaoEncontrado, NaoAutorizado }
