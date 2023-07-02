/*****************************************/
/* Detect the MetaMask Ethereum provider */
/*****************************************/

import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
const Tx = require('ethereumjs-tx').Transaction;

//detect MetaMask provider
const provider = await detectEthereumProvider();

if (provider) {
    //from now on, this should always be true:
    // provider === window.ethereum
  startApp(provider);
} else {
  console.log('Please install MetaMask!');
}

function startApp(provider) {
  if (provider !== window.ethereum) {
    console.error('Do you have multiple wallets installed?');
  }

  //Instantiate the Web3 object using the connected provider, Infura
  const web3 = new Web3('https://mainnet.infura.io/v3/0e0e2412f8df4d91843ea3a3f98ef91d')

  //interacting with the Ethereum blockchain
  const account1 = '<address 1>';
  const account2 = '<address 2>';
  const privateKey1 = Buffer.from('<private key 1>', 'hex');
  const privateKey2 = Buffer.from('<private key 2>', 'hex');

  web3.eth.getTransactionCount(account1, (err, txCount) => {

  // Build a transaction
  const txObject = {
    nonce: web3.utils.toHex(txCount),
    to: account2,
    value: web3.utils.toHex(web3.utils.toWei('1', 'ether')),
    gasLimit: web3.utils.toHex(21000),
    gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei'))
  };

  // Sign the transaction
  const tx = new Tx(txObject, { chain: 'ropsten' })
  tx.sign(privateKey1)

  const serializedTransaction = tx.serialize()
  const raw = '0x' + serializedTransaction.toString('hex')

  // Broadcast the transaction
  web3.eth.sendSignedTransaction(raw, (err, txHash) => {
     console.log('txHash: ', txHash)
     console.log(err)
    });
  });
}

/**********************************************************/
/* Handle chain (network) and chainChanged (per EIP-1193) */
/**********************************************************/

const chainId = await window.ethereum.request({ method: 'eth_chainId' });

window.ethereum.on('chainChanged', handleChainChanged);

function handleChainChanged(chainId) {
  window.location.reload();
}

/***********************************************************/
/* Handle user accounts and accountsChanged (per EIP-1193) */
/***********************************************************/

let currentAccount = null;
window.ethereum.request({ method: 'eth_accounts' })
  .then(handleAccountsChanged)
  .catch((err) => {
    console.error(err);
  });

window.ethereum.on('accountsChanged', handleAccountsChanged);

function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    console.log('Please connect to MetaMask.');
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    showAccount.innerHTML = currentAccount;
  }
}

/*********************************************/
/* Access the user's accounts (per EIP-1102) */
/*********************************************/

const ethereumButton = document.querySelector('.enableEthereumButton');
const showAccount = document.querySelector('.showAccount'); //probably already has a div in the html (still check though)

ethereumButton.addEventListener('click', () => { //need to add a button to the html ?
  getAccount();
});

async function getAccount() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    .catch((err) => {
      if (err.code === 4001) {
        console.log('Please connect to MetaMask.');
      } else {
        console.error(err);
      }
    });
  const account = accounts[0];
  showAccount.innerHTML = account;
}