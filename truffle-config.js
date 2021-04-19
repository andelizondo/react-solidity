module.exports = {
  migrations_directory: "./migrations",
  networks: {
    dev: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    azure: {
      host: "fiets1o4luzu.westeurope.cloudapp.azure.com",
      port: 8545,
      network_id: "72",
      gas: 3000000,
      from: "0xDD22DF449bAd3b85115e8f96eCa4231155F3c2B6"
    }
  }
};
