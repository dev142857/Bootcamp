import React, { Component } from 'react'
import Navbar from './Navbar';
import MyCarousel from './Carousel';
import MyFooter from './Footer';
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import StellartToken from '../abis/StellartToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentDidMount() {
    // 1. Carga de Web3
    await this.loadWeb3()
    // 2. Carga de datos de la Blockchain
    await this.loadBlockchainData()
  }

  // 1. Carga de Web3
  async loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Accounts: ', accounts)
      }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('¡Deberías considerar usar Metamask!')
    }
  }

  // 2. Carga de datos de la Blockchain
  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Ganache -> 5777, Rinkeby -> 4, BSC -> 97
    const networkId = await web3.eth.net.getId()
    console.log('networkid:', networkId)

    // Carga de DaiToken
    const daiTokenData = DaiToken.networks[networkId]
    if (daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({ daiToken })
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
    } else {
      window.alert('¡DaiToken no se ha desplegado en la red!')
    }

    // Carga de StellartToken
    const stellartTokenData = StellartToken.networks[networkId]
    if (stellartTokenData) {
      const stellartToken = new web3.eth.Contract(StellartToken.abi, stellartTokenData.address)
      this.setState({ stellartToken })
      let stellartTokenBalance = await stellartToken.methods.balanceOf(this.state.account).call()
      this.setState({ stellartTokenBalance: stellartTokenBalance.toString() })
    } else {
      window.alert('¡Stellart Token no se ha desplegado en la red!')
    }

    // Carga de TokenFarm
    const tokenFarmData = TokenFarm.networks[networkId]
    if (tokenFarmData) {
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({ tokenFarm })
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    } else {
      window.alert('¡TokenFarm no se ha desplegado en la red!')
    }
    this.setState({ loading: false })
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      stellartToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      stellartTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {

    let content
    if (this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        daiTokenBalance={this.state.daiTokenBalance}
        stellartTokenBalance={this.state.stellartTokenBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
      />
    }



    return (
      <div>
        <Navbar account={this.state.account} />
        <MyCarousel />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.blockstellart.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
        <MyFooter />
      </div>
    );
  }
}

export default App;
