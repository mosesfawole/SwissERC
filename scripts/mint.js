// Import necessary modules from Hardhat and SwisstronikJS
const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");

// Function to send a shielded transaction using the provided signer, destination, data, and value
const sendShieldedTransaction = async (signer, destination, data, value) => {
  // Get the RPC link from the network configuration
  const rpcLink = hre.network.config.url;

  // Encrypt transaction data
  const [encryptedData] = await encryptDataField(rpcLink, data);

  // Construct and sign transaction with encrypted data
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  // Address of the deployed contract
  const contractAddress = "0x14583A82b7943BA436Bb92f5267EeE4907556dAe";

  // Get the signer (your account)
  const [signer] = await hre.ethers.getSigners();

  // Create a contract instance
  const contractFactory = await hre.ethers.getContractFactory("MyERC721Token");
  const contract = contractFactory.attach(contractAddress);

  // Define the function name and parameters for the mint function
  const functionName = "mint";
  const recipient = "0x0D4a34ca54afCd6A57337754977fe9d1BE9C2c81"; // Replace with the actual recipient address
  const encodedFunctionData = contract.interface.encodeFunctionData(
    functionName,
    [recipient]
  );

  // Send a shielded transaction to mint a token in the contract
  const mintTokenTx = await sendShieldedTransaction(
    signer,
    contractAddress,
    encodedFunctionData,
    0
  );

  await mintTokenTx.wait();

  // It should return a TransactionReceipt object
  console.log("Transaction Receipt: ", mintTokenTx);
}

// Using async/await pattern to handle errors properly
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
