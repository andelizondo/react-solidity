import React, {Component} from 'react'
import TokenFiets from '../build/contracts/TokenFiets.json'
import CrowdsaleFiets from '../build/contracts/CrowdsaleFiets.json'
import CrowdsaleVault from '../build/contracts/CrowdsaleVault.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/segoe-ui.css'
import './css/pure-min.css'
import './App.css'

// TODO: Create state management library
const contract = require('truffle-contract')
const crowdsaleFiets = contract(CrowdsaleFiets)
const tokenFiets = contract(TokenFiets)
const crowdsaleVault = contract(CrowdsaleVault)

const defaultState = {
  // App
  hasError: false,
  etherSent: false,
  amountToDonate: 12,
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
  crowdsaleApproved: "Loading",
  // Token
  tokenFiets: null,
  tokenAddress: "Loading",
  tokenOwner: "Loading",
  // Vault
  crowdsaleVault: null,
  currentlyDeposited: "Loading",
  // Utils
  web3: null
}

class App extends Component {
  // Component Constructor
  constructor(props) {
    super(props)
    // Default State
    this.state = defaultState
    // Binding Methods
    this.approve = this.approve.bind(this);
    this.donate = this.donate.bind(this);
    this.close = this.close.bind(this);
    this.refund = this.refund.bind(this);
  }

  // Lifecycle Methods
  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3.then(results => {
      this.setState({web3: results.web3})
      // Instantiate contract once web3 provided.
      this.instantiateContracts()
    }).catch(() => {
      console.log('Error finding web3.')
    })
  }

  // Contract Instantiation
  instantiateContracts() {
    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      var web3 = this.state.web3;
      web3.eth.defaultAccount = accounts[0]
      this.setState({
        web3: web3,
        currentAddress: web3.eth.defaultAccount || defaultState.currentAddress
      })

      this.instantiateCrowdsale()
      this.instantiateToken()
    })
  }
  instantiateCrowdsale() {
    crowdsaleFiets.defaults({from: this.state.currentAddress, gas: 3000000})
    crowdsaleFiets.setProvider(this.state.web3.currentProvider)
    crowdsaleFiets.deployed().then((instance) => {
      this.setState({crowdsaleFiets: instance})
      this.instantiateVault()
      this.updateCrowdsale()
    }).catch(error => {
      this.setState({hasError: true})
      console.log(error)
    })
  }
  instantiateToken() {
    tokenFiets.defaults({from: this.state.currentAddress, gas: 3000000})
    tokenFiets.setProvider(this.state.web3.currentProvider)
    tokenFiets.deployed().then((instance) => {
      this.setState({tokenFiets: instance})
      this.updateToken()
    }).catch(error => {
      this.setState({hasError: true})
      console.log(error)
    })
  }
  instantiateVault() {
    crowdsaleVault.setProvider(this.state.web3.currentProvider)
    // Existing instance of the contract
    this.state.crowdsaleFiets.vault().then(result => {
      crowdsaleVault.at(result).then(instance => {
        this.setState({crowdsaleVault: instance})
        this.updateVault()
      }).catch(error => {
        this.setState({hasError: true})
        console.log(error)
      })
    })
  }

  // UI Update
  updateContract() {
    this.updateCrowdsale()
    this.updateToken()
    this.updateVault()
  }
  updateCrowdsale() {
    this.setState({crowdsaleAddress: this.state.crowdsaleFiets.address})
    this.state.crowdsaleFiets.owner().then((result) => {
      return this.setState({crowdsaleOwner: result})
    })
    this.state.crowdsaleFiets.wallet().then((result) => {
      return this.setState({crowdsaleWallet: result})
    })
    this.state.crowdsaleFiets.amountRaised().then((result) => {
      return this.setState({crowdsaleAmountRaised: result.c[0]})
    })
    this.state.crowdsaleFiets.goalReached().then((result) => {
      return this.setState({crowdsaleGoalReached: result.toString()})
    })
    this.state.crowdsaleFiets.hasEnded().then((result) => {
      return this.setState({crowdsaleEnded: result.toString()})
    })
    this.state.crowdsaleFiets.isClosed().then((result) => {
      return this.setState({crowdsaleClosed: result.toString()})
    })
    this.state.crowdsaleFiets.vault().then((result) => {
      return this.setState({crowdsaleVault: result.toString()})
    })
  }
  updateToken() {
    this.setState({tokenAddress: this.state.tokenFiets.address})
    this.state.tokenFiets.mintAgents(this.state.crowdsaleAddress).then((isMintingAgent) => {
      this.setState({crowdsaleApproved: isMintingAgent.toString()})
    })
    this.state.tokenFiets.balanceOf(this.state.currentAddress).then((result) => {
      return this.setState({currentBalance: result.c[0]})
    })
    this.state.tokenFiets.owner().then((result) => {
      return this.setState({tokenOwner: result})
    })
  }
  updateVault() {
    this.state.crowdsaleVault.deposited(this.state.currentAddress).then((result) => {
      return this.setState({currentlyDeposited: result.c[0]})
    })
  }

  // UI EventHandlers
  approve() {
    if (!this.state.tokenFiets
    ||  !this.state.crowdsaleFiets) return

    var _this = this
    this.state.tokenFiets.approveMintAgent(this.state.crowdsaleFiets.address, true).then((result) => {
      _this.updateContract()
    })
  }
  donate() {
    if (this.state.etherSent
    || !this.state.tokenFiets
    || !this.state.crowdsaleFiets)
      return

    var _this = this
    this.state.crowdsaleFiets.buyTokens(this.state.currentAddress, {
      value: this.state.web3.toWei(this.state.amountToDonate, "ether")
    })
    .then(function(result) {
      _this.setState({etherSent: true})
      _this.updateContract()
    })
    .catch(error => {
      this.setState({hasError: true})
      console.log(error)
    })
  }
  close() {
    var _this = this
    if (!this.state.crowdsaleFiets)
      return

    this.state.crowdsaleFiets.close().then(function(result) {
      _this.updateContract()
    }).catch(error => {
      this.setState({hasError: true})
      console.log(error)
    })
  }
  refund() {
    var _this = this
    if (!this.state.crowdsaleFiets)
      return

    this.state.crowdsaleFiets.claimRefund().then(function(result) {
      _this.updateContract()
    }).catch(error => {
      this.setState({hasError: true})
      console.log(error)
    })
  }

  // Helpers
  isApprovable() {
    return this.state.crowdsaleEnded === 'false'
        && this.state.crowdsaleApproved === 'false'
        && this.state.currentAddress === this.state.crowdsaleOwner;
  }
  isDonable() {
    return this.state.crowdsaleEnded === 'false'
        && this.state.crowdsaleApproved === 'true'
  }
  isClosable() {
    return this.state.crowdsaleEnded === 'true'
        && this.state.crowdsaleClosed === 'false'
        && this.state.currentAddress === this.state.crowdsaleOwner;
  }
  isRefundable() {
    return this.state.crowdsaleEnded === 'true'
        && this.state.crowdsaleClosed === 'true'
        && this.state.crowdsaleGoalReached === 'false'
        && this.state.currentlyDeposited > 0;
  }

  // Render Method
  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">
            Fiets Crowdsale {this.state.hasError && '- Error!'}
          </a>
        </nav>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1 crowdsale-details">
              <h2>User Information</h2>
              <p>Your Address: {this.state.currentAddress}</p>
              <p>Your Token Balance: {this.state.currentBalance}</p>
              <p>Currently Deposited: {this.state.currentlyDeposited}</p>
              {
                this.isApprovable() &&
                <a href="#" onClick={this.approve} className="green-button pure-menu-link">
                  Approve Crowdsale
                </a>
              }
              {
                this.isDonable() &&
                <a href="#" onClick={this.donate} className="green-button pure-menu-link">
                  {!this.state.etherSent ? `Donate ${this.state.amountToDonate}ETH` : 'Thanks for donating!'}
                </a>
              }
              {
                this.isClosable() &&
                <a href="#" onClick={this.close} className="red-button pure-menu-link">
                  Close Crowdsale
                </a>
              }
              {
                this.isRefundable() &&
                <a href="#" onClick={this.refund} className="red-button pure-menu-link">
                  Claim Refund
                </a>
              }

              <h2>Crowdsale Contract</h2>
              <p>Address: {this.state.crowdsaleAddress}</p>
              <p>Owner: {this.state.crowdsaleOwner}</p>
              <p>Wallet: {this.state.crowdsaleWallet}</p>
              <p>Amount Raised: {this.state.crowdsaleAmountRaised}</p>
              <p>Goal Reached: {this.state.crowdsaleGoalReached}</p>
              <p>Approved: {this.state.crowdsaleApproved}</p>
              <p>Ended: {this.state.crowdsaleEnded}</p>
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
