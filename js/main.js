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
    var $errorActions = getElement('span[data-message="actions-error"]')
    var $successActions = getElement('span[data-message="actions-success"]')
    var $cartStatus = getElement('span[data-message="cart-status"]')
    var $cartMessage = getElement('span[data-message="cart-message"]')

    var betHttpRequest = new XMLHttpRequest()

    var allGames = []
    var currentGame = []
    var gambleNumbers = []
    var gambles = []

    betHttpRequest.open('GET', '../games.json', true)
    betHttpRequest.send()

    function createButtonChooseGame (data) {
      data.map(function (item) {
        var button = createElement('button')
        var buttonTextNode = doc.createTextNode(item.type)
        button.appendChild(buttonTextNode)

        button.setAttribute('class', 'button choose-game')
        button.style.border = 'solid ' + item.color
        button.style.color = item.color

        button.setAttribute('data-game-type', item.type)
        button.setAttribute('data-game-type-selected', 'false')

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

    function clearGame (isClicked) {
      if (gambleNumbers.length === 0)
        return showMessage($errorActions, 'Nenhum numero selecionado.')

      var element = getElement('.game-number_selected')
      if (element) {
        element.classList.remove('game-number_selected')
        clearGame()
      }
      gambleNumbers = []

      if (isClicked) return showMessage($successActions, 'Numeros Limpos')
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
      // $errorActions.textContent = ''
      // $successActions.textContent = ''

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

      if (gambleNumbers.length >= game['max-number']) {
        showMessage($errorActions, 'O jogo já está completo!')

        return false
      }

      generateGameNumbers(game['max-number'] - gambleNumbers.length, game.range)
      paintNumbers()
      showMessage($successActions, 'Jogo completado com sucesso!')
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
      cartButtonDelete.setAttribute('data-value', game.id)
      cartItemInfo.setAttribute('class', 'cart-item-info')
      cartItemInfo.style.borderLeft = '4px ' + game.color + ' solid'
      textNumbers.setAttribute('class', 'text text_bold')
      textBetType.setAttribute('class', 'text text_bold text_normal')
      textPurple.style.color = game.color
      textLight.setAttribute('class', 'text_light')

      cartItem.appendChild(cartButtonDelete)

      textNumbers.textContent = numbers.join(', ')
      textPurple.textContent = game.type
      textLight.textContent =
        ' R$ ' +
        game.price
          .toFixed(2)
          .split('.')
          .join(',')
      textBetType.appendChild(textPurple)
      textBetType.appendChild(textLight)
      cartItemInfo.appendChild(textNumbers)
      cartItemInfo.appendChild(textBetType)
      cartItem.appendChild(cartItemInfo)
      return cartItem
    }

    function removeMessage (element) {
      setTimeout(function () {
        element.textContent = ''
      }, 5000)
    }

    function showMessage (element, message) {
      element.textContent = message
      removeMessage(element)
    }

    function generateId () {
      var millisecunds = Date.now().toString()
      return millisecunds
    }

    function addToCart (gambleNumbers) {
      $cartStatus.textContent = ''
      if (gambleNumbers.length !== currentGame['max-number']) {
        var messageError = ($errorActions.textContent =
          gambleNumbers.length +
          ' numero(s) selecionado, selecione mais ' +
          (Number(currentGame['max-number']) - gambleNumbers.length) +
          ' numero(s) para completar sua aposta*')
        return showMessage($errorActions, messageError)
      }
      var cartItem

      allGames.map(function (game) {
        if (game.type === currentGame.type) {
        
          game.id = generateId()
          console.log(game)
          cartItem = createCartItem(game, gambleNumbers)
          gambles.push(game)
          $cart.appendChild(cartItem)
        }
      })
      cartTotal()
      showMessage($successActions, 'Jogo adicionado ao carrinho!')
      clearGame()
    }

    function cartTotal () {
      var total = 0
      gambles.map(function (gamble) {
        return (total += gamble.price)
      })
      $cartTotal.textContent =
        'Total: R$ ' +
        total
          .toFixed(2)
          .split('.')
          .join(',')
    }

    function removeGambleFromCart (item) {
      showMessage($cartMessage, 'Jogo removido do carrinho.')
      gambles.map(function (game) {
        console.log(game.id, item.dataset.value)
        if (game.id === item.dataset.value.toString) {
          console.log('game')
        }
      })
      console.log(gambles)
      $cart.removeChild(item.parentElement)
    }

    function getCurrentGameType (type) {
      return allGames.filter(function (game) {
        return game.type === type
      })
    }

    function getPreviousKindOfGame () {
      return getElement('[data-game-type-selected="true"]')
    }

    function getCurrentKindOfGame (type) {
      return getElement('button[data-game-type="' + type + '"]')
    }

    function changeButtonGameType (type, current) {
      if (getPreviousKindOfGame()) {
        getPreviousKindOfGame().style.background = '#FFF'
        getPreviousKindOfGame().style.color = currentGame.color
        getPreviousKindOfGame().setAttribute('data-game-type-selected', 'false')
      }
      allGames.map(function (game) {
        if (game.type === type) {
          getCurrentKindOfGame(type).style.background = game.color
          getCurrentKindOfGame(type).style.color = '#FFF'
          getCurrentKindOfGame(type).setAttribute(
            'data-game-type-selected',
            'true'
          )
        }
      })
    }

    function setGameType (type) {
      gambleNumbers = []

      showMessage($successActions, '')
      showMessage($errorActions, '')
      changeButtonGameType(type, currentGame.type)
      currentGame = getCurrentGameType(type)[0]

      getElement('span[data-game="game-selected"]').textContent =
        'FOR ' + currentGame.type.toUpperCase()
      getElement('p[data-game="info"]').textContent = currentGame.description
      getNumbersRange(currentGame.range)
    }

    function cleanGamesData (games) {
      allGames = games.map(function (game, index) {
        game.type = game.type.split(' ').join('-')
        return game
      })
    }

    betHttpRequest.onreadystatechange = function () {
      if (betHttpRequest.readyState === 4) {
        cleanGamesData(JSON.parse(betHttpRequest.response).types)
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
        if (element.dataset.button === 'clear-game') return clearGame('clicked')
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
