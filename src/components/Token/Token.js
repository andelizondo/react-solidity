import React from 'react'

class Token extends React.Component {
  render() {
    return (
      <div className="app-section">
        <h2>Crowdsale Token</h2>
        <p>Address: {this.props.token.address}</p>
        <p>Owner: {this.props.token.owner}</p>
        <p>Token Price: €{this.props.token.tokenPrice}</p>
        <p>Ether Price: €{this.props.token.etherPrice}</p>
        <p>Total Supply: {this.props.token.supply}</p>
      </div>
    )
  }
}

export default Token;
