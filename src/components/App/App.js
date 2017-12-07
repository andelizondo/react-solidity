// Libraries
import React, {Component} from 'react'
import getWeb3 from '../../utils/getWeb3'
// State
import AppState from './App.state'
// Components
import Token from '../Token/Token'
import Crowdsale from '../Crowdsale/Crowdsale'
import User from '../User/User'
// Styles
import '../../css/oswald.css'
import '../../css/open-sans.css'
import '../../css/segoe-ui.css'
import '../../css/pure-min.css'
import './App.css'

// TODO: Create state management library
// Contracts
import TokenFiets from '../../../build/contracts/TokenFiets.json'
import CrowdsaleFiets from '../../../build/contracts/CrowdsaleFiets.json'
import CrowdsaleVault from '../../../build/contracts/CrowdsaleVault.json'
const contract = require('truffle-contract')
const crowdsaleFiets = contract(CrowdsaleFiets)
const tokenFiets = contract(TokenFiets)
const crowdsaleVault = contract(CrowdsaleVault)

class App extends Component {
  // Component Constructor
  constructor(props) {
    super(props)
    // Default State
    this.state = AppState
    // Binding Methods
    this.approve = this.approve.bind(this)
    this.donate = this.donate.bind(this)
    this.close = this.close.bind(this)
    this.refund = this.refund.bind(this)
  }

  // Lifecycle Methods
  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3.then(results => {
      this.setAppState({web3: results.web3})
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
      var web3 = this.state.web3
      web3.eth.defaultAccount = accounts[1]
      this.setAppState({
        web3: web3,
        user: Object.assign({}, this.state.user, {
          address: web3.eth.defaultAccount || AppState.currentAddress
        })
      })

      // Defaults and Providers
      const contractDefaults = {
        from: this.state.user.address,
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
      this.instantiateCrowdsale().then(result => {
      this.instantiateToken().then(result => {
      this.instantiateVault().then(result => {
      this.updateState()})})})
      .catch(error => {
        this.setAppState({hasError: true})
        console.log(error)
      })
    })
  }
  instantiateCrowdsale() {
    return crowdsaleFiets.deployed().then(instance => {
      return this.setCrowdsaleState({instance: instance})
    })
  }
  instantiateToken() {
    return tokenFiets.deployed().then(instance => {
      return this.setTokenState({instance: instance})
    })
  }
  instantiateVault() {
    return this.state.crowdsale.instance.vault().then(result => {
      return crowdsaleVault.at(result).then(instance => {
        return this.setCrowdsaleState({vault: instance})
      })
    })
  }

  // UI Update
  updateState() {
    this.updateCrowdsale()
    this.updateToken()
    this.updateVault()
    this.updateUser()
  }
  updateCrowdsale() {
    this.setCrowdsaleState({
      address: this.state.crowdsale.instance.address
    })
    this.state.crowdsale.instance.owner().then(result => {
      this.setCrowdsaleState({owner: result})
    })
    this.state.crowdsale.instance.wallet().then(result => {
      this.setCrowdsaleState({wallet: result})
    })
    this.state.crowdsale.instance.amountRaised().then(result => {
      this.setCrowdsaleState({amountRaised: this.state.web3.fromWei(result.c.join(''), "ether")})
    })
    this.state.crowdsale.instance.goalReached().then(result => {
      this.setCrowdsaleState({goalReached: result})
    })
    this.state.crowdsale.instance.hasEnded().then(result => {
      this.setCrowdsaleState({ended: result})
    })
    this.state.crowdsale.instance.isClosed().then(result => {
      this.setCrowdsaleState({closed: result})
    })
    this.state.crowdsale.instance.vault().then(result => {
      this.setCrowdsaleState({vaultInstance: result})
    })
    this.state.token.instance.mintAgents(this.state.crowdsale.address).then(result => {
      this.setCrowdsaleState({approved: result})
    })
  }
  updateToken() {
    this.setTokenState({
      address: this.state.token.instance.address
    })
    this.state.token.instance.owner().then(result => {
      this.setTokenState({owner: result})
    })
    this.state.token.instance.totalSupply().then(result => {
      this.setTokenState({supply: result.c.join('')})
    })
    this.state.token.instance.tokenPrice().then(result => {
      this.setTokenState({tokenPrice: result.c.join('')})
    })
    this.state.token.instance.etherPrice().then(result => {
      this.setTokenState({etherPrice: result.c.join('')})
    })
  }
  updateVault() {
    this.state.crowdsale.vault.deposited(this.state.user.address).then((result) => {
      return this.setUserState({deposited: this.state.web3.fromWei(result.c.join(''), "ether")})
    })
  }
  updateUser(){
    this.state.web3.eth.getBalance(this.state.user.address, (error, result) => {
      this.setUserState({ethBalance: this.state.web3.fromWei(result.c.join(''), "ether")})
    })
    this.state.token.instance.balanceOf(this.state.user.address).then(result => {
      this.setUserState({balance: result.c.join('')})
    })
  }

  // UI EventHandlers
  approve() {
    if (!this.state.token.instance
    ||  !this.state.crowdsale.instance)
      return

    var _this = this
    this.state.token.instance.approveMintAgent(this.state.crowdsale.address, true)
    .then(result => {
      _this.updateState()
    })
    .catch(error => {
      console.log(error)
    })
  }
  donate() {
    if (!this.state.crowdsale.instance)
      return

    var _this = this
    this.state.crowdsale.instance.send(this.state.web3.toWei(this.state.user.amountToDonate, "ether"))
    .then(result => {
      _this.updateState()
    })
    .catch(error => {
      console.log(error)
    })
  }
  close() {
    if (!this.state.crowdsale.instance)
      return

    var _this = this
    this.state.crowdsale.instance.close()
    .then(result => {
      _this.updateState()
    })
    .catch(error => {
      console.log(error)
    })
  }
  refund() {
    if (!this.state.crowdsale.instance)
      return

    var _this = this
    this.state.crowdsale.instance.claimRefund()
    .then(result => {
      _this.updateState()
    })
    .catch(error => {
      console.log(error)
    })
  }

  // Boolean Getters
  get isApprovable() {
    return !this.state.crowdsale.ended
        && !this.state.crowdsale.approved
        &&  this.state.user.address === this.state.crowdsale.owner
        &&  this.state.user.address !== AppState.user.address
        &&  this.state.crowdsale.owner !== AppState.crowdsale.owner
  }
  get isDonable() {
    return !this.state.crowdsale.ended
        &&  this.state.crowdsale.approved
        &&  this.state.crowdsale.ended !== "Loading"
        &&  this.state.crowdsale.approved !== "Loading"
  }
  get isClosable() {
    return  this.state.crowdsale.ended
        && !this.state.crowdsale.closed
        &&  this.state.user.address === this.state.crowdsale.owner
        &&  this.state.user.address !== AppState.user.address
        &&  this.state.crowdsale.owner !== AppState.crowdsale.owner
  }
  get isRefundable() {
    return  this.state.crowdsale.ended
        &&  this.state.crowdsale.closed
        && !this.state.crowdsale.goalReached
        &&  this.state.crowdsale.ended !== "Loading"
        &&  this.state.crowdsale.closed !== "Loading"
        &&  this.state.crowdsale.goalReached !== "Loading"
        &&  this.state.user.deposited > 0
  }

  // State Management
  setAppState(newState){
    this.setState(Object.assign({}, this.state, newState))
  }
  setUserState(newState){
    this.setState(Object.assign({}, this.state, {
      user: Object.assign({}, this.state.user, newState)
    }))
  }
  setCrowdsaleState(newState){
    this.setState(Object.assign({}, this.state, {
      crowdsale: Object.assign({}, this.state.crowdsale, newState)
    }))
  }
  setTokenState(newState){
    this.setState(Object.assign({}, this.state, {
      token: Object.assign({}, this.state.token, newState)
    }))
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
      action: this.donate, className: "green-button", text: `Donate ${this.state.user.amountToDonate}Ξ`
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
              <User user={this.state.user} />
              {this.renderActionButton()}
              <Crowdsale crowdsale={this.state.crowdsale} />
              <Token token={this.state.token}/>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default App
