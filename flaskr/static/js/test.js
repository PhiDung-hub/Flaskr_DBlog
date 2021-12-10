"use strict";
/** THIS IS FOR TESTING webpack AND browserify */

import Web3Modal from "../../../web3modal";
import Web3 from "web3";
import { create } from "ipfs-http-client";

console.log(Web3Modal);
const providerOptions = {
  /* See Provider Options Section */
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions, // required
});

const provider = await web3Modal.connect();

const web3 = new Web3(provider);

// contract("Flaskr", async (accounts) => {
//   let web3Modal = new Web3Modal({
//     network: "ropsten",
//     cacheProvider: true,
//   });
//   let provider = await web3Modal.connect();
//   let signer = provider.getSigner();
//   let contractAddress = "0x0c4f6a7c8d8d0a4e6a0b6e7c8e8a9f9c9a9e0b9d";
//   let contract = new utils.Contract(
//     contractAddress,
//     JSON.parse(contract),
//     signer
//   );
//   it("should be able to add a new post", async () => {
//     let tx = await contract.addPost("hello", "world");
//     let receipt = await tx.wait();
//     assert.equal(receipt.status, 1);
//   });
// });
