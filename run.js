const axios = require('axios');
const bs58 = require('bs58');
const fs = require('fs');
const { Keypair, PublicKey, Connection, Transaction, SystemProgram, TransactionInstruction } = require('@solana/web3.js');

let sessionRpc = ""
const connection = new Connection(sessionRpc);
// Fetch recent blockhash

let keypair;

fs.readFile("/home/jc/.config/solana/id.json", 'utf8', (err, jsonString) => {
    if (err) {
        console.log("Error reading file:", err);
        return;
    }

    try {
        const data = JSON.parse(jsonString);
        //console.log("Data from file:", data);  // Log the data to the console
        //console.log(data)
        //console.log(data.length)
        //const secretKeyArray = new Uint8Array(data.secretKey);

        // console.log(data)
  
        keypair = Keypair.fromSecretKey(Uint8Array.from(data));
        //console.log(keypair);
    } catch (err) {
        console.log('Error parsing JSON string:', err);
    }
});

async function callProgram2(tree,feePayerKeypair) {

    // Rest of your code using keypair
    console.log("Cranking PDA");

    // Use a specific program id
    const programId = new PublicKey(tree.programId);

    //sessionID from IPFS
    var sessionID = tree.sessionID

    console.log(tree)
    //console.log(feepayerKeypair)
    // rest of your callProgram2 code ...

    var layers =[];


    for (let index = 0; index < tree.sizeOfLayer+1; index++) {
        let layers_key = "layer"+index;
        layers.push(layers_key)        
    }

    console.log("*************************************")

    for (let index = layers.length - 1; index >= 0; index--) {
        // console.log("INDEX")
        // console.log(tree[layers[index]]);
        // console.log(tree[layers[index]].pairs);


        for (let indexY = 0; indexY < tree[layers[index]].pairs.length; indexY++) {
            // console.log("These are the instruction params")
            // console.log("ProgramID: "+tree.programId)
            // console.log("SessionID: "+tree.sessionID)
            console.log("PDA: "+tree[layers[index]].pairs[indexY].pda)  
            // console.log("bump: "+tree[layers[index]].pairs[index].bump)            
            // console.log("seed: "+tree[layers[index]].pairs[index].seed)      
            // console.log("Accounts")  
            // console.log(tree[layers[index]].pairs[index].pair)  

            //base58 pda
            let pda = tree[layers[index]].pairs[indexY].pda;

            //pairArr
            let pairArr = tree[layers[index]].pairs[indexY].pair

            //seed
            let seed = tree[layers[index]].pairs[indexY].seed

            //bump
            let bump = tree[layers[index]].pairs[indexY].bump

            var { blockhash } = await connection.getRecentBlockhash();

            //console.log(pairArr)
            
            //console.log("Calling Program")          
          
            // Create a transaction
            const transaction = new Transaction({
              feePayer: new PublicKey(feePayerKeypair.publicKey),
              recentBlockhash: blockhash,
            });
          
          
            const publicKeys = [
              { pubkey: new PublicKey(feePayerKeypair.publicKey), isSigner: true, isWritable: true }, // Fee payer
              { pubkey: new PublicKey(pda), isSigner: false, isWritable: true }, // PDA
              { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },// system program
              { pubkey: new PublicKey("D1Wr9oy2sLVB7Vb6fMU94F3B3N5nJJzr5QqiP2ymhXTr"), isSigner: false, isWritable: true },// RPC fee collection
              { pubkey: new PublicKey(sessionID), isSigner: false, isWritable: false }, // Session ID
            ];
          
            for (let index = 0; index < pairArr.length; index++) {
              var obj = {pubkey: new PublicKey(pairArr[index]),isSigner:false,isWritable:true}
              publicKeys.push(obj)
            }
          
            //console.log(publicKeys)
          
            //crank instruction
            let idx=1;
            var idxBuffer = Buffer.from([idx & 0xFF]); // Ensures it fits in a single byte
            var separatorBuffer = Buffer.from([pairArr.length & 0xFF]); // Ensures it fits in a single byte
            var seedBuffer = Buffer.from(seed);
            var bumpBuffer = Buffer.from([bump & 0xFF]); // Ensures it fits in a single byte
          
            var dataBuffer = Buffer.concat([idxBuffer, separatorBuffer, seedBuffer, bumpBuffer]);
            
            // console.log("Instruction Data Buffer");
            // console.log(seed)
            // console.log(seedBuffer)
            // console.log(dataBuffer)
          
            // Create an instruction with the 32-byte seed
            const instruction = new TransactionInstruction({
              keys: publicKeys,
              programId,
              data: dataBuffer 
            });
                
            // Add the instruction to the transaction
            transaction.add(instruction);
          
                
            transaction.sign(feePayerKeypair)
          
          
            // // Send the transaction
            const transactionId = await connection.sendTransaction(transaction, [feePayerKeypair],{skipPreflight:true});
            //console.log(transactionId);
            // // Open the transaction in Solana explorer in a new tab
            // window.open(`https://explorer.solana.com/tx/${transactionId}?cluster=devnet`, '_blank');
          
            console.log(`https://explorer.solana.com/tx/${transactionId}`)
          
        
          
        }


    }
    


}

async function handleIpfs(ipfsUrl) {
    const last59BytesAsString = ipfsUrl;
    const jsonUrl = `https://${last59BytesAsString}.ipfs.nftstorage.link/`;

    try {
        const jsonResponse = await axios.get(jsonUrl);
        console.log("***********Found IPFS Tree****************\n");
        console.log('JSON response:', jsonResponse.data);

        const tree = jsonResponse.data;
        console.log("Cranking if Profitable");
        await callProgram2(tree, keypair);
    } catch (error) {
        console.error("Error fetching IPFS data:", error);
    }
}

async function main(pubkey) {
    console.log('onepubkey worker crank');

    const url = '';

    const data = {
        jsonrpc: '2.0',
        id: 1,
        method: 'getProgramAccounts',
        params: ['mempnhZcS6Ugdf6A9rnzcmiBfnUHCnLzZsB1oL4U1nY']
    };

    try {
        const response = await axios.post(url, data, {
            headers: { 'Content-Type': 'application/json' }
        });

        const targetPubKey = pubkey;
        const account = response.data.result.find(item => item.pubkey === targetPubKey);

        if (account) {
            console.log(`Found account with pubkey: ${targetPubKey}`);

            const accountData = account.account.data;
            const decodedData = bs58.decode(accountData);
            const last59Bytes = decodedData.slice(-59);
            const buffer = Buffer.from(last59Bytes);
            const last59BytesAsString = buffer.toString('utf8');

            const jsonUrl = `https://${last59BytesAsString}.ipfs.nftstorage.link/`;

            const jsonResponse = await axios.get(jsonUrl);
            console.log("***********Found IPFS Tree****************\n");
            console.log('JSON response:', jsonResponse.data);

            const tree = jsonResponse.data;

            console.log("Cranking if Profitable");
            await callProgram2(tree, keypair);
        } else {
            console.log(`No account found with pubkey: ${targetPubKey}`);
        }
    } catch (error) {
        console.error(error);
    }
}

let treePubkey = '';
let ipfsUrl = '';

for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i].startsWith('--tree=')) {
        treePubkey = process.argv[i].split('=')[1];
    } else if (process.argv[i].startsWith('--ipfs=')) {
        ipfsUrl = process.argv[i].split('=')[1];
    }
}

if (treePubkey && ipfsUrl) {
    console.log('Please provide only one argument, either --tree or --ipfs.');
    return;
}

if (ipfsUrl) {
    handleIpfs(ipfsUrl);
    return;
}

if (treePubkey) {
    main(treePubkey);
} else {
    console.log('Please provide a tree pubkey using the --tree=<base58address> format. or --ipfs<CID> format ');
}
