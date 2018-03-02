const TestToken = artifacts.require("./TestToken.sol");
const TokenSale = artifacts.require("./TokenSale.sol");

module.exports = function(deployer, network, accounts) {
  const owner = accounts[0];
  // const owner = "0x11f0cdddd75259b02418e5c116d904621632a590";
  deployer.deploy(TestToken).then(async () => {
    const token = await TestToken.deployed();
    return deployer.deploy(TokenSale, token.address, owner);
  });
};

// Running migration: 1_initial_migration.js
//   Deploying Migrations...
//   ... 0x76ff8562255be708abcd5de589637f2dc5c2020c6cd216fc6d1c53375e5a8841
//   Migrations: 0x2f0328d6359d698b364b5957dcb3775d34c0f9c9
// Saving successful migration to network...
//   ... 0x7e5c3ea936f9f41a739d719204d96989e25baacc424784e90d6f5431a8e5ca84
// Saving artifacts...
// Running migration: 2_deploy_contracts.js
//   Deploying TestToken...
//   ... 0x01bedc3a461110b5d5d1fdebe7fbbae2c0c19fc831a2331623ecfb54da3ee20d
//   TestToken: 0x2fee92f02e3835edc705167cec9c9eeac3a8db72
//   Deploying TokenSale...
//   ... 0x2fb781d434153528571bd0881da8f302a7e9ae2405bfac7f1537a3b559c9f6cf
//   TokenSale: 0x87e62428a43f9bcde1b38cb18bcbbe2ca3d3b942
// Saving successful migration to network...
//   ... 0x78a1738b334930128c2f97a247d6efc6d1cef6378e043bb60b14efef9a2e6787
