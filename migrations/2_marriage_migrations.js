const Marriage = artifacts.require("./Marriage.sol");

module.exports = async function(deployer){
    await deployer.deploy(Marriage, "Marriage", "M");
    const marriage = await Marriage.deployed();
}
