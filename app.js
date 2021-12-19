const serverUrl = 'https://drp9lbdwphg0.usemoralis.com:2053/server'
const appId = 'xgjTIuzc0LS6VifRvTZkXZLCkFNJ7VUmiDMSVCCC'
Moralis.start({ serverUrl, appId })

async function login() {
  let user = Moralis.User.current()
  if (!user) {
    user = await Moralis.authenticate()
  }
  document.getElementById('logged-in-user').innerText = `Welcome ${user.id}`
  getStats()
}
async function logout() {
  await Moralis.User.logOut()
  document.getElementById('logged-in-user').innerText =
    'user logged out successfully'
  document.getElementById('gas-stats').innerText = ``
  setTimeout(() => {
    document.getElementById('logged-in-user').innerText = ''
  }, 5000)
}
async function getUserTransactions(user) {
  const query = new Moralis.Query('EthTransactions')
  query.equalTo('from_address', user.get('ethAddress'))
  const subscription = await query.subscribe()
  handleNewTransaction(subscription)
  const results = await query.find()
  console.log('user transactions', results)
}
async function handleNewTransaction(subscription) {
  subscription.on('create', function (data) {
    console.log('new transaction', data)
  })
}
async function getAverageGasPrices() {
  const results = await Moralis.Cloud.run('getAvgGas')
  console.log('average user gas prices', results)
  renderGasStats(results)
}
function getStats() {
  const user = Moralis.User.current()
  if (user) {
    getUserTransactions(user)
  }
  getAverageGasPrices()
}
function renderGasStats(data) {
  const container = document.getElementById('gas-stats')
  if (!data.length) {
    container.innerHTML = `No Data yet`
  } else {
    container.innerHTML = data
      .map(function (row, rank) {
        return `<li>#${rank + 1}: ${Math.round(row.avgGas)} gwei</li>`
      })
      .join('')
  }
}

window.addEventListener('DOMContentLoaded', getStats)
document.getElementById('btn-login').addEventListener('click', login)
document.getElementById('btn-logout').addEventListener('click', logout)
document.getElementById('btn-get-status').addEventListener('click', getStats)
