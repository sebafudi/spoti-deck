function getToken() {
  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.response === 'no user') {
        console.log('no user')
        sessionStorage.setItem('token', '')
        document.querySelector('.tokenInput').value = ''
      } else if (xhr.response) {
        console.log(xhr.response)
        sessionStorage.setItem('token', xhr.response)
        document.querySelector('.tokenInput').value = xhr.response
      } else console.log('Already registered')
    }
  }
  xhr.open('POST', '/api/token', true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(
    JSON.stringify({
      uuid: sessionStorage.getItem('uuid'),
      login: sessionStorage.getItem('login'),
    })
  )
}

function setToken() {
  sessionStorage.setItem('token', document.querySelector('.tokenInput').value)
}

function setUuid() {
  sessionStorage.setItem('uuid', document.querySelector('.uuidInput').value)
}

function setLogin() {
  sessionStorage.setItem('login', document.querySelector('.loginInput').value)
  if (document.querySelector('.loginInput').value) {
    document.querySelector('.registerButton').disabled = false
  } else {
    document.querySelector('.registerButton').disabled = true
  }
}

function pause() {
  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      document.querySelector('.playbackStatus').innerHTML = xhr.response
      if (xhr.response) {
      } else {
        document.querySelector('.playbackStatus').innerHTML = 'error'
      }
    }
  }
  xhr.open('POST', '/api/playback/pause', true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.setRequestHeader('Authorization', 'Bearer ' + sessionStorage.getItem('token'))
  xhr.send()
}

function play() {
  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      document.querySelector('.playbackStatus').innerHTML = xhr.response
      if (xhr.response) {
      } else {
        document.querySelector('.playbackStatus').innerHTML = 'error'
      }
    }
  }
  xhr.open('POST', '/api/playback/play', true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.setRequestHeader('Authorization', 'Bearer ' + sessionStorage.getItem('token'))
  xhr.send()
}

let uuid = sessionStorage.getItem('uuid')

if (uuid) document.querySelector('.uuidInput').value = uuid
else {
  let random = Math.random().toString(36).substr(2, 4)
  sessionStorage.setItem('uuid', random)
  document.querySelector('.uuidInput').value = random
}

let token = sessionStorage.getItem('token')
if (token) document.querySelector('.tokenInput').value = token

let login = sessionStorage.getItem('login')
if (login) {
  document.querySelector('.loginInput').value = login
  document.querySelector('.registerButton').disabled = false
}
