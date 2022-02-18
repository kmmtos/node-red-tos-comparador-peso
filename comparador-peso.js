"use strict";
module.exports = function (RED) {
  function comparadorPesoTOS(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var global = this.context().global;
    var flow = this.context().flow;
    var operador;
    var _msg;
    var variavel_peso;
    var peso_comparar;
    var intervalo_verificacao;
    var tentativas;
    var aux = 1;
    var contador = 0;
    var quantidade_amostra;
    var _done = false;
    var st;
    var auxoper = false;

    function ComparaPeso() {
      // primeira saida é done atendeu a regra
      // segunda saida é tempo execedido tentou a regra sem sucesso nas n tentativas informadas
      node.status({
        fill: "green",
        shape: "dot",
        text: `Verificando Peso ${aux} de ${tentativas} `,
      });
      //verifica se variavel peso atende condição  e incrementa contador
      switch (operador) {
        case ">":
          auxoper =
            parseFloat(global.get(variavel_peso)) > parseFloat(peso_comparar);
          break;
        case ">=":
          auxoper =
            parseFloat(global.get(variavel_peso)) >= parseFloat(peso_comparar);
          break;
        case "<":
          auxoper =
            parseFloat(global.get(variavel_peso)) < parseFloat(peso_comparar);
          break;
        case "<=":
          auxoper =
            parseFloat(global.get(variavel_peso)) <= parseFloat(peso_comparar);
          break;
        case "=":
          auxoper =
            parseFloat(global.get(variavel_peso)) == parseFloat(peso_comparar);
          break;
      }

      if (auxoper == true) {
        contador++;
      } else {
        contador = 0;
      }

      //se contador >= quantidade_amostra retorna done
      if (contador >= quantidade_amostra) {
        _done = true;
        _msg.payload = true;
        node.status({
          fill: "green",
          shape: "dot",
          text: "Conluido",
        });
        node.send([_msg, null, null]);
      }

      // se executou quantidade de vezes definida no contador
      if (aux >= tentativas) {
        node.status({
          fill: "green",
          shape: "dot",
          text: "Tentativas excedidas",
        });
        node.send([null, _msg, null]);
        _done = true;
      }
      //se !done chama recursivo
      if (!_done) {
        aux++;
        st = setTimeout(ComparaPeso, intervalo_verificacao);
      } else if (_done == true || aux >= tentativas) {
        clearTimeout(st);
      }
    }

    node.on("input", function (msg, send, done) {
      if (msg.operador) {
        try {
          //seta variaveis
          operador = msg.operador;
          variavel_peso = msg.variavel_peso;
          peso_comparar = msg.peso_comparar;
          intervalo_verificacao = msg.intervalo_verificacao;
          tentativas = msg.tentativas;
          quantidade_amostra = msg.quantidade_amostra;
          contador = 0;
          _msg = msg;
          aux = 1;
          _done = false;
          clearTimeout(st);
          ComparaPeso();
        } catch (error) {
          msg.payload = error;
          //terceira saida error
          node.send([null, null, msg]);
          done(error);
        }
      } else {
        msg.payload = "msg.operador nao informado";
        node.send([null, null, msg]);
      }
    });
    this.on("close", function (removed, done) {
      // removed not used

      clearTimeout(st);
      node.status({});

      done();
    });
  }
  RED.nodes.registerType("comparador peso TOS", comparadorPesoTOS);
};
