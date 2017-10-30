module.exports = {
  migrations_directory: "./migrations",
  networks: {
    dev: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    ropsten: {
      host: "localhost",
      port: 8545,
      network_id: "3",
      gas: 3000000
    }
  }
};
