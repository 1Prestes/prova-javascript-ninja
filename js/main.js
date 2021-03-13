;(function (win, doc) {
  'use strict'

  function app () {
    var $chooseGame = doc.querySelector('div[data-choose="game"]')
    var $chooseNumbers = doc.querySelector('section[data-choose="numbers"]')
    var $infoGame = doc.querySelector('p[data-game="info"]')
    var betHttpRequest = new XMLHttpRequest()

    var gameRules = []

    var gameTypes = {
      Lotofácil: 'lotofacil',
      'Mega-Sena': 'mega-sena',
      Quina: 'quina'
    }

    betHttpRequest.open('GET', '../games.json', true)
    betHttpRequest.send()

    function createButtonChooseGame (data) {
      data.map(function (item) {
        var button = doc.createElement('button')
        var buttonTextNode = doc.createTextNode(item.type)
        button.appendChild(buttonTextNode)

        button.setAttribute(
          'class',
          'button choose-game choose-game_' + gameTypes[item.type]
        )
        button.setAttribute('data-game-type', item.type)

        $chooseGame.appendChild(button)
      })
    }

    function removeChild (element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild)
      }
    }

    function getNumbersRange (range) {
      if ($chooseNumbers.firstChild) removeChild($chooseNumbers)
      for (var i = 1; i <= range; i++) {
        var number = doc.createElement('div')
        var numberContent = doc.createTextNode(i)
        number.setAttribute('class', 'game-number')
        number.setAttribute('data-number', i)
        number.appendChild(numberContent)
        $chooseNumbers.appendChild(number)
      }
    }

    function getNumbersRamdom (range) {
      for (var i = 0; i <= range; i++) {
        return console.log(Math.random() * (0, range))
      }
    }

    function setGameType (type) {
      gameRules.map(function (rule) {
        if (rule.type === type) {
          $infoGame.textContent = rule.description
          getNumbersRange(rule.range)
        }
      })
    }

    betHttpRequest.onreadystatechange = function () {
      if (betHttpRequest.readyState === 4) {
        gameRules = JSON.parse(betHttpRequest.response).types
        createButtonChooseGame(gameRules)
      }
    }

    doc.addEventListener(
      'click',
      function (e) {
        var element = e.target

        if (element.dataset.gameType) setGameType(element.dataset.gameType)
      },
      false
    )
  }

  app()
})(window, document)
