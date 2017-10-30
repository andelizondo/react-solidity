import React, { Component } from 'react'
import TokenFiets from '../build/contracts/TokenFiets.json'
import CrowdsaleFiets from '../build/contracts/CrowdsaleFiets.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

// TODO: Create state management library
const contract = require('truffle-contract')
const crowdsaleFiets = contract(CrowdsaleFiets)
const tokenFiets = contract(TokenFiets)

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      // App
      etherSent: false,
      // User
      currentAddress: "Loading",
      currentBalance: "Loading",
      // Crowdsale
      crowdsaleFiets: null,
      crowdsaleAddress: "Loading",
      crowdsaleOwner: "Loading",
      crowdsaleWallet: "Loading",
      crowdsaleAmountRaised: "Loading",
      crowdsaleGoalReached: "Loading",
      crowdsaleEnded: "Loading",
      crowdsaleClosed: "Loading",
      // Token
      tokenFiets: null,
      tokenAddress: "Loading",
      tokenOwner: "Loading",
      // Utils
      web3: null
    }

    this.donate = this.donate.bind(this);
    this.processDonation = this.processDonation.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3.then(results => {
      this.setState({
        web3: results.web3
      })
      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      var web3 = this.state.web3;
      web3.eth.defaultAccount = accounts[0]
      this.setState({
        web3: web3,
        currentAddress: accounts[0]
      })

      this.instantiateCrowdsale()
      this.instantiateToken()
    })
  }

  instantiateCrowdsale() {
    crowdsaleFiets.setProvider(this.state.web3.currentProvider)
    crowdsaleFiets.deployed().then((instance) => {
      this.setState({ crowdsaleFiets: instance })
      this.updateCrowdsale()
    })
  }
  updateCrowdsale() {
    var crowdsaleFietsInstance = this.state.crowdsaleFiets
    this.setState({ crowdsaleAddress: crowdsaleFietsInstance.address })
    crowdsaleFietsInstance.owner().then((result) => {
      return this.setState({ crowdsaleOwner: result })
    })
    crowdsaleFietsInstance.wallet().then((result) => {
      return this.setState({ crowdsaleWallet: result })
    })
    crowdsaleFietsInstance.amountRaised().then((result) => {
      return this.setState({ crowdsaleAmountRaised: result.c[0] })
    })
    crowdsaleFietsInstance.goalReached().then((result) => {
      return this.setState({ crowdsaleGoalReached: result.toString() })
    })
    crowdsaleFietsInstance.hasEnded().then((result) => {
      return this.setState({ crowdsaleEnded: result.toString() })
    })
    crowdsaleFietsInstance.isClosed().then((result) => {
      return this.setState({ crowdsaleClosed: result.toString() })
    })
  }

  instantiateToken() {
    tokenFiets.setProvider(this.state.web3.currentProvider)
    tokenFiets.deployed().then((instance) => {
      this.setState({ tokenFiets: instance })
      this.updateToken()
    })
  }
  updateToken() {
    var tokenFietsInstance = this.state.tokenFiets
    this.setState({ tokenAddress: tokenFietsInstance.address })
    tokenFietsInstance.balanceOf(this.state.currentAddress).then((result) => {
      return this.setState({ currentBalance: result.c[0] })
    })
    tokenFietsInstance.owner().then((result) => {
      return this.setState({ tokenOwner: result })
    })
  }

  donate(accounts) {
    var state = this.state
    if (state.etherSent) return

    this.state.tokenFiets.mintAgents(this.state.crowdsaleFiets.address).then((isMintingAgent) => {
      if (isMintingAgent) {
        this.processDonation()
      }
      else {
        this.state.tokenFiets.approveMintAgent(this.state.crowdsaleFiets.address, true).then((result) => {
          this.processDonation()
        })
      }
    })
  }
  processDonation() {
    var _this = this
    this.state.crowdsaleFiets.buyTokens(this.state.currentAddress, {
      value: this.state.web3.toWei(12, "ether"),
      gas: 3000000
    }).then(function(result) {
      _this.setState({ etherSent: true })
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" onClick={this.donate} className="pure-menu-heading pure-menu-link">Fiets Crowdsale - { !this.state.etherSent ? 'Donate 10ETH' : 'Thanks for donating!' }</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h2>User Information</h2>
              <p>Your Address: {this.state.currentAddress}</p>
              <p>Your Token Balance: {this.state.currentBalance}</p>

              <h2>Crowdsale Contract</h2>
              <p>Address: {this.state.crowdsaleAddress}</p>
              <p>Owner: {this.state.crowdsaleOwner}</p>
              <p>Wallet: {this.state.crowdsaleWallet}</p>
              <p>Amount Raised: {this.state.crowdsaleAmountRaised}</p>
              <p>Goal Reached: {this.state.crowdsaleGoalReached}</p>
              <p>Finished: {this.state.crowdsaleEnded}</p>
              <p>Closed: {this.state.crowdsaleClosed}</p>

              <h2>Crowdsale Token</h2>
              <p>Address: {this.state.tokenAddress}</p>
              <p>Owner: {this.state.tokenOwner}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
