;(function (win, doc) {
  'use strict'

  function createElement (element) {
    return doc.createElement(element)
  }

  function getElement (selector) {
    return doc.querySelector(selector)
  }

  function app () {
    var $chooseGame = getElement('div[data-choose="game"]')
    var $chooseNumbers = getElement('section[data-choose="numbers"]')
    var $cart = getElement('div[data-cart="cart"]')
    var $cartTotal = getElement('span[data-cart="total"]')

    var betHttpRequest = new XMLHttpRequest()

    var allGames = []
    var currentGame = []
    var gambleNumbers = []
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
      if (element.firstChild) {
        element.removeChild(element.firstChild)
        removeChild(element)
      }
    }

    function getNumbersRange (range) {
      if ($chooseNumbers.firstChild) removeChild($chooseNumbers)
      for (var i = 1; i <= range; i++) {
        var number = doc.createElement('div')

        var numberContent = doc.createTextNode(i < 10 ? '0' + i : i)
        number.setAttribute('class', 'game-number')
        number.setAttribute('data-number', i < 10 ? '0' + i : i)
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
      gambleNumbers = []
      var element = getElement('.game-number_selected')
      if (element) {
        element.classList.remove('game-number_selected')
        clearGame()
      }
    }

    function generateGameNumbers (amount, range) {
      for (var i = 1; i <= amount; i++) {
        var newNumber = getRandomNumbers(range)
        if (
          i > 1 &&
          numberExists(
            gambleNumbers,
            newNumber < 10 ? '0' + newNumber : newNumber
          )
        ) {
          newNumber = getRandomNumbers(range)
          i--
        } else {
          gambleNumbers.push(newNumber < 10 ? '0' + newNumber : newNumber)
        }
      }
    }

    function paintNumbers () {
      gambleNumbers.map(function (number) {
        var element = getElement('div[data-number="' + number + '"]')
        element.classList.add('game-number_selected')
      })
    }

    function removeNumber (arr, currentNumber) {
      return (arr = arr.filter(function (number) {
        return number != currentNumber
      }))
    }

    function removeOneNumber (number) {
      var element = getElement('div[data-number="' + number + '"]')

      element.classList.remove('game-number_selected')
    }

    function selectNumber (currentNumber) {
      var game = allGames.filter(function (game) {
        return game.type === currentGame.type
      })[0]

      if (numberExists(gambleNumbers, currentNumber)) {
        gambleNumbers = removeNumber(gambleNumbers, currentNumber)
        removeOneNumber(currentNumber)
        paintNumbers()
        return
      }

      if (gambleNumbers.length < game['max-number']) {
        gambleNumbers.push(currentNumber)
        paintNumbers()
      }
    }

    function completeGame () {
      var game = allGames.filter(function (game) {
        return game.type === currentGame.type
      })[0]

      if (gambleNumbers.length >= game['max-number']) return false

      generateGameNumbers(game['max-number'] - gambleNumbers.length, game.range)
      paintNumbers()
    }

    function createCartItem (game, numbers) {
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
      cartButtonDelete.setAttribute('data-value', game.price)
      cartItemInfo.setAttribute(
        'class',
        'cart-item-info cart-item-info_' + gameTypes[game.type]
      )
      textNumbers.setAttribute('class', 'text text_bold')
      textBetType.setAttribute('class', 'text text_bold text_normal')
      textPurple.setAttribute('class', 'text_' + gameTypes[game.type])
      textLight.setAttribute('class', 'text_light')

      cartItem.appendChild(cartButtonDelete)

      textNumbers.textContent = numbers.join(', ')
      textPurple.textContent = game.type
      textBetType.appendChild(textPurple)
      textBetType.appendChild(textLight)
      cartItemInfo.appendChild(textNumbers)
      cartItemInfo.appendChild(textBetType)
      cartItem.appendChild(cartItemInfo)
      return cartItem
    }

    function addToCart (gambleNumbers) {
      if (gambleNumbers.length === 0) return false

      var cartItem

      allGames.map(function (game, i) {
        if (game.type === currentGame.type) {
          gambles.push(game)
          cartItem = createCartItem(game, gambleNumbers)
        }
      })
      cartTotal()
      $cart.appendChild(cartItem)
      clearGame()
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
      $cart.removeChild(item.parentElement)
    }

    function getCurrentGameType (type) {
      return allGames.filter(function (game) {
        return game.type === type
      })
    }

    function getPreviousKindOfGame () {
      return getElement('.choose-game_select_' + gameTypes[currentGame.type])
    }

    function getCurrentKindOfGame (type) {
      return getElement('button[data-game-type="' + type + '"]')
    }

    function changeButtonGameType (type, previousType) {
      if (getPreviousKindOfGame()) {
        getPreviousKindOfGame().classList.toggle(
          'choose-game_select_' + gameTypes[currentGame.type]
        )
      }
      getCurrentKindOfGame(type).classList.toggle(
        'choose-game_select_' + gameTypes[type]
      )
    }

    function setGameType (type) {
      gambleNumbers = []
      changeButtonGameType(type, currentGame.type)
      currentGame = getCurrentGameType(type)[0]

      getElement('span[data-game="game-selected"]').textContent =
        'FOR ' + currentGame.type.toUpperCase()
      getElement('p[data-game="info"]').textContent = currentGame.description
      getNumbersRange(currentGame.range)
    }

    betHttpRequest.onreadystatechange = function () {
      if (betHttpRequest.readyState === 4) {
        allGames = JSON.parse(betHttpRequest.response).types
        createButtonChooseGame(allGames)
        setGameType(allGames[1].type)
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
          return addToCart(gambleNumbers)
        if (element.dataset.button === 'delete')
          return removeGambleFromCart(element)
        if (element.dataset.number) return selectNumber(element.dataset.number)
      },
      true
    )
  }

  app()
})(window, document)
