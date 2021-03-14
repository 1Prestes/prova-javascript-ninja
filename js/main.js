;(function (win, doc) {
  'use strict'

  function createElement (element) {
    return doc.createElement(element)
  }

  function app () {
    var $chooseGame = doc.querySelector('div[data-choose="game"]')
    var $chooseNumbers = doc.querySelector('section[data-choose="numbers"]')
    var $infoGame = doc.querySelector('p[data-game="info"]')
    var $cart = doc.querySelector('div[data-cart="cart"]')
    var $cartTotal = doc.querySelector('span[data-cart="total"]')
    var betHttpRequest = new XMLHttpRequest()

    var gameRules = []
    var currentType = ''
    var gameNumbers = []
    var gambles = []
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
      gameNumbers = []
      var element = doc.querySelector('div.game-number_selected')
      if (element) {
        element.classList.remove('game-number_selected')
        clearGame()
      }
    }

    function completeGame () {
      gameNumbers = []
      var amount
      var range

      if (doc.querySelector('div.game-number_selected')) {
        return
      }

      gameRules.map(function (rule) {
        if (rule.type === currentType) {
          amount = rule['max-number']
          range = rule.range
        }
      })

      for (var i = 1; i <= amount; i++) {
        var newNumber = getRandomNumbers(range)
        if (i > 1 && numberExists(gameNumbers, newNumber)) {
          newNumber = getRandomNumbers(range)
          i--
        } else {
          var element = doc.querySelector(
            'div[data-number="' + newNumber + '"]'
          )
          element.classList.add('game-number_selected')
          gameNumbers.push(newNumber)
        }
      }
    }

    function createCartItem (rule, numbers) {
      var cartItem = createElement('div')
      var cartButtonDelete = createElement('button')
      var cartItemInfo = createElement('div')
      var textNumbers = createElement('p')
      var textBetType = createElement('p')
      var textPurple = createElement('span')
      var textLight = createElement('span')

      cartItem.setAttribute('class', 'cart-item')
      cartButtonDelete.setAttribute('class', 'cart-button-delete')
      cartButtonDelete.setAttribute('data-button', 'delete')
      cartItemInfo.setAttribute(
        'class',
        'cart-item-info cart-item-info_' + gameTypes[rule.type]
      )
      textNumbers.setAttribute('class', 'text text_bold')
      textBetType.setAttribute('class', 'text text_bold text_normal')
      textPurple.setAttribute('class', 'text_' + gameTypes[rule.type])
      textLight.setAttribute('class', 'text_light')

      cartItem.appendChild(cartButtonDelete)

      textNumbers.textContent = numbers.join(', ')
      textPurple.textContent = rule.type
      textLight.textContent = ' R$' + rule.price.toFixed(2)
      textBetType.appendChild(textPurple)
      textBetType.appendChild(textLight)
      cartItemInfo.appendChild(textNumbers)
      cartItemInfo.appendChild(textBetType)
      cartItem.appendChild(cartItemInfo)
      return cartItem
    }

    function addToCart (gameNumbers) {
      if (gameNumbers.length === 0) {
        return false
      }
      $cartTotal
      var cartItem
      gameRules.map(function (rule) {
        if (rule.type === currentType) {
          gambles.push(rule)

          cartItem = createCartItem(rule, gameNumbers)
        }
      })
      cartTotal()
      $cart.appendChild(cartItem)
    }

    function cartTotal () {
      var total = 0
      gambles.map(function (gamble) {
        return (total += gamble.price)
      })
      $cartTotal.textContent = total
        .toFixed(2)
        .split('.')
        .join(',')
    }

    function removeGambleFromCart (item) {
      console.log(item.parentElement)
      $cart.removeChild(item.parentElement)
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

        if (element.dataset.gameType)
          return setGameType(element.dataset.gameType)
        if (element.dataset.button === 'complete-game') return completeGame()
        if (element.dataset.button === 'clear-game') return clearGame()
        if (element.dataset.button === 'add-to-cart')
          return addToCart(gameNumbers)
        if (element.dataset.button === 'delete') return removeGambleFromCart(element)
      },
      true
    )
  }

  app()
})(window, document)
