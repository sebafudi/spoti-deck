function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    options = Object.assign(
      {
        method: 'GET',
        contentType: 'application/json',
        payload: '',
        authorization: '',
      },
      options
    )
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        resolve(xhr.response)
      }
    }
    xhr.open(options.method, url, true)
    xhr.setRequestHeader('Content-Type', options.contentType)
    xhr.setRequestHeader('Authorization', options.authorization)
    xhr.send(options.payload)
  })
}

async function getToken() {
  let payload = JSON.stringify({
    uuid: sessionStorage.getItem('uuid'),
    login: sessionStorage.getItem('login'),
  })
  let response = await makeRequest('api/token', {
    method: 'POST',
    payload,
  })
  if (response === 'no user') {
    console.log('no user')
    sessionStorage.setItem('token', '')
    document.querySelector('.tokenInput').value = ''
  } else if (response) {
    console.log(response)
    sessionStorage.setItem('token', response)
    document.querySelector('.tokenInput').value = response
  } else console.log('Already registered')
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

async function pause() {
  let response = await makeRequest('api/playback/pause', {
    method: 'POST',
    authorization: 'Bearer ' + sessionStorage.getItem('token'),
  })
  document.querySelector('.playbackStatus').innerHTML = response
  if (response) {
  } else {
    document.querySelector('.playbackStatus').innerHTML = 'error'
  }
}

async function play() {
  let response = await makeRequest('api/playback/play', {
    method: 'POST',
    authorization: 'Bearer ' + sessionStorage.getItem('token'),
  })
  document.querySelector('.playbackStatus').innerHTML = response
  if (response) {
  } else {
    document.querySelector('.playbackStatus').innerHTML = 'error'
  }
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
