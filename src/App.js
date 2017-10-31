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
  tokenSupply: "Loading",
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
    this.state.web3.eth.getAccounts((error, accounts) => {
      // Get accounts, set web3 and currentAddress
      var web3 = this.state.web3;
      web3.eth.defaultAccount = accounts[0]
      this.setState({
        web3: web3,
        currentAddress: web3.eth.defaultAccount || defaultState.currentAddress
      })

      // Defaults and Providers
      const contractDefaults = {
        from: this.state.currentAddress,
        gas: 3000000,
        gasPrice: web3.toWei(1, "gwei")
      }
      tokenFiets.defaults(contractDefaults)
      crowdsaleFiets.defaults(contractDefaults)
      crowdsaleVault.defaults(contractDefaults)
      tokenFiets.setProvider(this.state.web3.currentProvider)
      crowdsaleFiets.setProvider(this.state.web3.currentProvider)
      crowdsaleVault.setProvider(this.state.web3.currentProvider)

      // Instantiation
      this.instantiateCrowdsale()
    })
  }
  instantiateCrowdsale() {
    crowdsaleFiets.deployed().then((instance) => {
      this.setState({crowdsaleFiets: instance})
      this.updateCrowdsale()
      this.instantiateToken()
      this.instantiateVault()
    }).catch(error => {
      this.setState({hasError: true})
      console.log(error)
    })
  }
  instantiateToken() {
    tokenFiets.deployed().then((instance) => {
      this.setState({tokenFiets: instance})
      this.updateToken()
    }).catch(error => {
      this.setState({hasError: true})
      console.log(error)
    })
  }
  instantiateVault() {
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
    this.setState({
      crowdsaleAddress: this.state.crowdsaleFiets.address
    })
    this.state.crowdsaleFiets.owner().then((result) => {
      return this.setState({crowdsaleOwner: result})
    })
    this.state.crowdsaleFiets.wallet().then((result) => {
      return this.setState({crowdsaleWallet: result})
    })
    this.state.crowdsaleFiets.amountRaised().then((result) => {
      return this.setState({crowdsaleAmountRaised: this.state.web3.fromWei(result.c.join(''), "ether")})
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
    this.setState({
      tokenAddress: this.state.tokenFiets.address
    })
    this.state.tokenFiets.owner().then((result) => {
      return this.setState({tokenOwner: result})
    })
    this.state.tokenFiets.totalSupply().then((result) => {
      return this.setState({tokenSupply: result.c.join('')})
    })
    this.state.tokenFiets.balanceOf(this.state.currentAddress).then((result) => {
      return this.setState({currentBalance: result.c.join('')})
    })
    this.state.tokenFiets.mintAgents(this.state.crowdsaleAddress).then((isMintingAgent) => {
      this.setState({crowdsaleApproved: isMintingAgent.toString()})
    })
  }
  updateVault() {
    this.state.crowdsaleVault.deposited(this.state.currentAddress).then((result) => {
      return this.setState({currentlyDeposited: this.state.web3.fromWei(result.c.join(''), "ether")})
    })
  }

  // UI EventHandlers
  approve() {
    if (!this.state.tokenFiets
    ||  !this.state.crowdsaleFiets)
      return

    var _this = this
    this.state.tokenFiets.approveMintAgent(this.state.crowdsaleFiets.address, true)
    .then(result => {
      _this.updateContract()
    })
    .catch(error => {
      console.log(error)
    })
  }
  donate() {
    if (!this.state.tokenFiets
    ||  !this.state.crowdsaleFiets)
      return

    var _this = this
    this.state.crowdsaleFiets.send(this.state.web3.toWei(this.state.amountToDonate, "ether"))
    .then(result => {
      _this.updateContract()
    })
    .catch(error => {
      console.log(error)
    })
  }
  close() {
    if (!this.state.crowdsaleFiets)
      return

    var _this = this
    this.state.crowdsaleFiets.close()
    .then(result => {
      _this.updateContract()
    })
    .catch(error => {
      console.log(error)
    })
  }
  refund() {
    if (!this.state.crowdsaleFiets)
      return

    var _this = this
    this.state.crowdsaleFiets.claimRefund()
    .then(result => {
      _this.updateContract()
    })
    .catch(error => {
      console.log(error)
    })
  }

  // Boolean Getters
  get isApprovable() {
    return this.state.crowdsaleEnded === 'false'
        && this.state.crowdsaleApproved === 'false'
        && this.state.currentAddress === this.state.crowdsaleOwner;
  }
  get isDonable() {
    return this.state.crowdsaleEnded === 'false'
        && this.state.crowdsaleApproved === 'true'
  }
  get isClosable() {
    return this.state.crowdsaleEnded === 'true'
        && this.state.crowdsaleClosed === 'false'
        && this.state.currentAddress === this.state.crowdsaleOwner;
  }
  get isRefundable() {
    return this.state.crowdsaleEnded === 'true'
        && this.state.crowdsaleClosed === 'true'
        && this.state.crowdsaleGoalReached === 'false'
        && this.state.currentlyDeposited > 0;
  }

  // Render Methods
  renderActionButton() {
    const buttonData = this.getButtonData()
    return buttonData && (
      <a href="#" onClick={buttonData.action} className={`pure-menu-link ${buttonData.className}`}>
        {buttonData.text}
      </a>
    )
  }
  getButtonData() {
    return this.isApprovable ? {
      action: this.approve, className: "green-button", text: "Approve Crowdsale"
    } :
    this.isDonable ? {
      action: this.donate, className: "green-button", text: `Donate Ξ${this.state.amountToDonate}`
    } :
    this.isClosable ? {
      action: this.close, className: "red-button", text: "Close Crowdsale"
    } :
    this.isRefundable ? {
      action: this.refund, className: "red-button", text: "Get Refund"
    } : null
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <h4>Fiets Crowdsale {this.state.hasError && '- Error!'}</h4>
        </nav>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1 crowdsale-details">
              <h2>User Information</h2>
              <p>Your Address: {this.state.currentAddress}</p>
              <p>Your Token Balance: {this.state.currentBalance}</p>
              <p>Currently Deposited: Ξ{this.state.currentlyDeposited}</p>
              {this.renderActionButton()}

              <h2>Crowdsale Contract</h2>
              <p>Address: {this.state.crowdsaleAddress}</p>
              <p>Owner: {this.state.crowdsaleOwner}</p>
              <p>Wallet: {this.state.crowdsaleWallet}</p>
              <p>Amount Raised: Ξ{this.state.crowdsaleAmountRaised}</p>
              <p>Goal Reached: {this.state.crowdsaleGoalReached}</p>
              <p>Approved: {this.state.crowdsaleApproved}</p>
              <p>Ended: {this.state.crowdsaleEnded}</p>
              <p>Closed: {this.state.crowdsaleClosed}</p>

              <h2>Crowdsale Token</h2>
              <p>Address: {this.state.tokenAddress}</p>
              <p>Owner: {this.state.tokenOwner}</p>
              <p>Total Supply: {this.state.tokenSupply}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
