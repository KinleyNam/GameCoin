const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("GC", (m) => {
  const gamesCoin = m.contract("GamesCoin");
  return { gamesCoin };
});
