import TokenState from '../Token/Token.state'
import UserState from '../User/User.state'
import CrowdsaleState from '../Crowdsale/Crowdsale.state'

const AppState = {
  web3: null,
  hasError: false,
  user: UserState,
  crowdsale: CrowdsaleState,
  token: TokenState,
}

export default AppState
