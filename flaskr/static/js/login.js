"use strict";

/**
 * Example JavaScript code that interacts with the page and Web3 wallets
 */

// Unpkg imports
const ethers = window.ethers; // for signing.
const Web3Modal = window.Web3Modal.default;

// const { WalletLink } = require("walletlink");

// Web3modal instance
let web3Modal;

// Chosen wallet provider given by the dialog window
let provider;

// Address of the selected account
let selectedAccount;
let web3;

const INFURA_ID = "<PROJECT_ID>";

/**
 * Setup the orchestra
 */
function init() {
  console.log("Initializing example");
  console.log(
    "window.web3 is",
    window.web3,
    "window.ethereum is",
    window.ethereum
  );

  // Tell Web3modal to add other wallets besides Metamask, if any.
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: INFURA_ID,
      },
    },
    walletlink: {
      package: WalletLink,
      options: {
        infuraId: INFURA_ID,
      },
    },
  };

  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    theme: "dark",
  });

  console.log("Web3Modal instance is", web3Modal);
}

/**
 * sign using ethers.js
 */
async function sign(message) {
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const signature = await signer.signMessage(message);
  const account = await signer.getAddress();
  return { signature, account };
}

/**
 * sign using MetaMask API.
 */
async function signMetaMask(message, account) {
  console.log("Signing message: " + message);
  console.log(ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message)));
  const signature = await ethereum.request({
    method: "personal_sign",
    params: [message, account],
  });
  return signature;
}

/**
 * Verify a message using the signature. This should be done on python backend
 */
async function verifyMessage(message, signature, address) {
  try {
    const signerAddr = await ethers.utils
      .verifyMessage(message, signature)
      .toLowerCase();
    console.log("Signer address:", signerAddr);
    console.log("Address:", address);
    return signerAddr == address;
  } catch (err) {
    console.log(err);
    return false;
  }
}

/**
 * Connect using web3Modal API.
 * @returns a POST request contain account and signature validity.
 */
async function onConnectWeb3Modal() {
  console.log("Opening a dialog", web3Modal);
  try {
    provider = await web3Modal.connect();
    await provider.enable();

    web3 = new Web3(provider);
    web3.eth.extend({
      methods: [
        {
          name: "chainId",
          call: "eth_chainId",
          outputFormatter: web3.utils.hexToNumber,
        },
      ],
    });
  } catch (e) {
    console.log("Could not get a wallet connection", e);
    return;
  }
  // This is a reference of window.ethereum.
  console.log("Got a wallet connection", provider);
  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();
  // MetaMask does not give you all accounts, only the selected account
  console.log("Got accounts", accounts);
  selectedAccount = accounts[0];

  // Generate a message padded with nonce.
  const message = String(
    "I agree to login on this page.\nLogin time: " +
      new Date().toLocaleDateString("en-US")
  );
  console.log("Message is: ", message);

  // Sign the message.
  let signature = await signMetaMask(message, selectedAccount);

  console.log("Posting message to server:\n");
  $.post(
    "./login",
    {
      account: selectedAccount,
      signature: signature,
    },
    (response) => {
      // to redirect the web-page, can't be done from python.
      // Solution is found here but I don't understand yet:
      // https://stackoverflow.com/questions/38926335/flask-redirecturl-for-returning-html-but-not-loading-page/38926522#comment65211259_38926522
      window.location = response;
    }
  );
}

/**
 * Clear cached, refresh window.
 * This is currently not needed since FLASK `session.clear()` will clean
 */
async function onDisconnect() {
  console.log("Killing the wallet connection", provider);
  if (!!provider && provider.close) {
    await provider.close();
    await web3Modal.clearCachedProvider();
    provider = null;
    // window.location.reload(true); // trigger reload to refresh the page information
  }

  selectedAccount = null;
  $.post(
    "./logout",
    {
      logout: true,
    },
    (response) => {
      window.location = response;
    }
  );
}

/**
 * Main entry point.
 */
window.addEventListener("load", async () => {
  init();
  // connect account.
  document
    .querySelector("#btn-connect")
    .addEventListener("click", onConnectWeb3Modal);
  // disconnect account.
  document
    .querySelector("#btn-disconnect")
    .addEventListener("click", onDisconnect);
});
