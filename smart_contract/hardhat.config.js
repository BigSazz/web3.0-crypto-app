// https://eth-ropsten.alchemyapi.io/v2/TU-rv683H3tFnyBOUyzM9cQX_0xAnT1u

require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/TU-rv683H3tFnyBOUyzM9cQX_0xAnT1u',
      accounts: [ 'f358831e4a619881e4e4f536a5fad273fc3f7300c4311021934005dc88bdf523' ]
    }
  }
}