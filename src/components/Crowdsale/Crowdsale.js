import React from 'react'

class Crowdsale extends React.Component {
  render() {
    return (
      <div className="app-section">
        <h2>Crowdsale Contract</h2>
        <p>Address: {this.props.crowdsale.address}</p>
        <p>Owner: {this.props.crowdsale.owner}</p>
        <p>Wallet: {this.props.crowdsale.wallet}</p>
        <p>Amount Raised: {this.props.crowdsale.amountRaised}Ξ</p>
        <p>Goal Reached: {this.props.crowdsale.goalReached.toString()}</p>
        <p>Approved: {this.props.crowdsale.approved.toString()}</p>
        <p>Ended: {this.props.crowdsale.ended.toString()}</p>
        <p>Closed: {this.props.crowdsale.closed.toString()}</p>
      </div>
    )
  }
}

export default Crowdsale;
