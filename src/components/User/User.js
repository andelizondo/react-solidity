import React from 'react'

class User extends React.Component {
  render() {
    return (
      <div className="app-section">
        <h2>User Information</h2>
        <p>Your Address: {this.props.user.address}</p>
        <p>Your Token Balance: {this.props.user.balance}</p>
        <p>Your Ether Balance: {this.props.user.ethBalance}Ξ</p>
        <p>Currently Deposited: {this.props.user.deposited}Ξ</p>
      </div>
    )
  }
}

export default User;
