import React from 'react'
import styles from './styles/Home.module.css'

const defaultState = {
  buyInValue: 200,
  buyInAmount: 50,
  players: []
}

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      buyInValue: parseInt(localStorage.getItem('buyInValue')) || defaultState['buyInValue'], // Amount of chips
      buyInAmount: parseInt(localStorage.getItem('buyInAmount')) || defaultState['buyInAmount'], // Dollar amount
      players: JSON.parse(localStorage.getItem('players')) || defaultState['players']
    }

    this.addNewPlayer = this.addNewPlayer.bind(this)
    this.updateStateField = this.updateStateField.bind(this)
    this.deletePlayer = this.deletePlayer.bind(this)
    this.updatePlayerRecord = this.updatePlayerRecord.bind(this)
    this.clearAllState = this.clearAllState.bind(this)
  }

  blankPlayer() {
    return {
      id: crypto.randomUUID(),
      name: '',
      paymentMethod: '',
      buyIns: 1,
      chips: this.state.buyInValue,
      finalAmount: this.state.buyInAmount
    }
  }

  clearAllState() {
    if(!window.confirm(`Are you sure you want to clear all current data?`))return;

    this.setState(defaultState, () => { localStorage.clear() })
  }

  updateStateField(event) {
    const newValue = event.target.value;
    const fieldName = event.target.name;

    this.setState({
      [fieldName]: newValue
    }, () => { localStorage.setItem(fieldName, newValue) })
  }

  updatePlayersStorage() {
    localStorage.setItem('players', JSON.stringify(this.state.players))
  }

  deletePlayer(player) {
    if(!window.confirm(`Are you sure you want to delete player ${player.name}?`))return;

    let players = this.state.players;

    players.splice(players.findIndex(function(arrayPlayer){
        return arrayPlayer.id === player.id;
    }), 1);

    this.setState({ players: players }, this.updatePlayersStorage)
  }

  addPlayerBuyIn(player) {
    player.buyIns = player.buyIns + 1
    this.updatePlayerRecord(player)
  }

  updatePlayerRecord(player) {
    let players = this.state.players;

    players.splice(players.findIndex(function(arrayPlayer){
        return arrayPlayer.id === player.id;
    }), 1);

    this.setState({players: [...players, player]}, this.updatePlayersStorage)
  }

  updatePlayerField(player, event) {
    let newValue = event.target.value;
    const fieldName = event.target.name;

    if (fieldName === 'chips' || fieldName === 'buyIns') { newValue = parseInt(newValue) }

    player[fieldName] = newValue

    this.updatePlayerRecord(player)
  }

  playerField(name, type, player) {
    return <input className={styles.tableInputField} name={name} type={type} value={player[name]} onChange={(e) => { this.updatePlayerField(player, e) }} />
  }

  addNewPlayer() {
    this.setState(previous => ({players: [...previous.players, this.blankPlayer()]}), this.updatePlayersStorage)
  }

  calculateBalance(player) {
    const chipValue = (this.state.buyInValue / this.state.buyInAmount).toFixed(2) // Force float
    return (player.chips - (player.buyIns * this.state.buyInValue)) / chipValue
  }

  playersList() {
    return [...this.state.players].sort((a, b) => { return a.id.localeCompare(b.id); })
  }

  errorsWell() {
    let errors = []
    const totalBuyIns = this.state.players.map(p => p.buyIns).reduce((a, b) => a + b, 0)
    const totalChipsBought = totalBuyIns * this.state.buyInValue
    const totalChips = this.state.players.map(p => p.chips).reduce((a, b) => a + b, 0)

    if (totalChipsBought !== totalChips) {
      errors.push(`Mismatch between chips count (${totalChips}) and total buy ins (${totalBuyIns} for ${totalChipsBought} chips)`)
    }

    if (errors.length > 0) {
      return (
        <div className={styles.errorsWell}>
          <ul>
            {errors.map(error => <li>{error}</li>)}
          </ul>
        </div>
      )
    }
  }

  playersTable() {
    if (this.state.players.length === 0) { return <React.Fragment />}

    return (
      <div className={styles.playersTableWrapper}>
            <table className={styles.playersTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Venmo / Wallet</th>
                  <th>Buy Ins</th>
                  <th>Stack Size</th>
                  <th>$ Balance</th>
                  <th />
                  <th />
                </tr>
              </thead>
              <tbody>
                {this.playersList().map(player => {
                  return (
                    <tr key={player.id} className={styles.tableTr}>
                      <td className={styles.tableTd}>{this.playerField('name', 'string', player)}</td>
                      <td className={styles.tableTd}>{this.playerField('paymentMethod', 'string', player)}</td>
                      <td className={styles.tableTd}>{this.playerField('buyIns', 'number', player)}</td>
                      <td className={styles.tableTd}>{this.playerField('chips', 'number', player)}</td>
                      <td className={styles.tableTd}>${this.calculateBalance(player)}</td>
                      <td className={styles.addBuyInButton} onClick={() => this.addPlayerBuyIn(player)}>Add Buy In</td>
                      <td className={styles.deletePlayerButton} onClick={() => this.deletePlayer(player)}>Delete Player</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
    )
  }

  render() {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>
            Home Game Poker Ledger
          </h1>

          <div className={styles.mainInputContainer}>
            <div className={styles.mainInputWrapper}>
              <div className={styles.inputLabel}>Buy In Amount ($)</div>
              <input type={'number'} onChange={this.updateStateField} value={this.state.buyInAmount} name='buyInAmount' className={styles.inputField} />
            </div>

            <div className={styles.mainInputWrapper}>
              <div className={styles.inputLabel}>Value in Chips</div>
              <input type={'number'} onChange={this.updateStateField} value={this.state.buyInValue} name='buyInValue' className={styles.inputField} />
            </div>
          </div>

          <button onClick={this.addNewPlayer} className={styles.addPlayerButton}>Add New Player</button>

          {this.playersTable()}

          {this.errorsWell()}

          <br />
          <br />
          <br />

          <button onClick={this.clearAllState} className={styles.clearAllButton}>Clear All</button>
        </main>

        <footer className={styles.footer}>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by fanahova.eth
          </a>
        </footer>
      </div>
    )
  }
}
