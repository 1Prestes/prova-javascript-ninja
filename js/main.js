;(function (win, doc) {
  'use strict'

  function createElement (element) {
    return doc.createElement(element)
  }

  function app () {
    var $chooseGame = doc.querySelector('div[data-choose="game"]')
    var $chooseNumbers = doc.querySelector('section[data-choose="numbers"]')
    var $infoGame = doc.querySelector('p[data-game="info"]')
    var betHttpRequest = new XMLHttpRequest()

    var gameRules = []
    var currentType = ''
    var gameTypes = {
      Lotofácil: 'lotofacil',
      'Mega-Sena': 'mega-sena',
      Quina: 'quina'
    }

    betHttpRequest.open('GET', '../games.json', true)
    betHttpRequest.send()

    function createButtonChooseGame (data) {
      data.map(function (item) {
        var button = createElement('button')
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

    function numberExists (arr, number) {
      return arr.some(function (currentValue) {
        return currentValue === number
      })
    }

    function getRandomNumbers (max) {
      return Math.ceil(Math.random() * max)
    }

    function clearGame () {
      var element = doc.querySelector('div.game-number_selected')
      if (element) {
        element.classList.remove('game-number_selected')
        clearGame()
      }
    }

    function completeGame () {
      var rangeNumbers = []
      var amount
      var range

      if (doc.querySelector('div.game-number_selected')) return

      gameRules.map(function (rule) {
        if (rule.type === currentType) {
          amount = rule['max-number']
          range = rule.range
        }
      })

      for (var i = 1; i <= amount; i++) {
        var newNumber = getRandomNumbers(range)
        if (i > 1 && numberExists(rangeNumbers, newNumber)) {
          newNumber = getRandomNumbers(range)
          i--
        } else {
          var element = doc.querySelector(
            'div[data-number="' + newNumber + '"]'
          )
          element.classList.add('game-number_selected')
          rangeNumbers.push(newNumber)
        }
      }
    }

    function setGameType (type) {
      gameRules.map(function (rule) {
        if (rule.type === type) {
          currentType = rule.type
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
        if (element.dataset.button === 'complete-game') completeGame()
        if (element.dataset.button === 'clear-game') clearGame()
      },
      false
    )
  }

  app()
})(window, document)
