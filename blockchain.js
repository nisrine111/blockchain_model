const SHA256=require('crypto-js/sha256');
const EC=require("elliptic").ec;
const ec=new EC("secp256k1");

class transaction{
    constructor(sender,recipient,amount){
        this.sender=sender;
        this.recipient=recipient;
        this.amount=amount;
        this.timestamp = Date.now();
    }
    TcalculateHash(){
        return SHA256(this.sender+this.recipient+this.amount).toString;
    }
    signTransaction(signingKey){
        if (signingKey.getPublic("hex")!==this.sender){
            throw new Error(" what agh you tghying to do")
        }
        const hashTx=this.TcalculateHash();
        const sig=signingKey.sign(hashTx,'base64');
        this.signature=sig.toDER("hex");
    }
    isValid(){
        if (this.sender === null) return true;

        if (!this.signature || this.signature.length === 0) {
          throw new Error('No signature in this transaction');
        }
    
        const publicKey = ec.keyFromPublic(this.sender, 'hex');
        return publicKey.verify(this.TcalculateHash(), this.signature);
      }
}
class Block {
    constructor(timestamps,transactions){
        this.timestamps=timestamps;
        this.transactions=transactions;
        this.nonce=0;
        this.hash=this.calculateHash();

    }
    calculateHash(){
        return SHA256(this.timestamps +JSON.stringify(this.transactions)+ this.nonce).toString();
        

    }
    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty)!==Array(difficulty+1).join('0')){
            this.nonce++;
            this.hash=this.calculateHash();
        }
        console.log("Block mined  :"+this.hash+ "  "+this.nonce);

    }
    hasValidTransactions(){
        for (const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
            return true;
        }

    }
}
class Blockchain{
    constructor(){
        this.chain=[this.creatGenesisBlock()];    /* it's an array of blocks*/
        this.difficulty=2;
        this.pendingTransactions=[];
        this.miningReward=100;
    }
    creatGenesisBlock(){
        return new Block("29/05/2021",[]);
    }
    getLatestBlock(){
        return this.chain[this.chain.length-1];

    }
    /*addBlock(newBlock){
        newBlock.previousHash=this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
        return this.chain;
    }*/
  /* minePendingTransactions(miningRewardAdress){
        let block=new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);
        console.log("successfully mined!");
        this.chain.push(block);
        this.pendingTransactions=[
            new transaction(null,miningRewardAdress,this.miningReward)
        ];
        this.pendingTransactions = [];
        

    }*/
    minePendingTransactions(miningRewardAddress) {
        const rewardTx = new transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);
        let block=new Block(Date.now(), this.pendingTransactions);
    
        block.mineBlock(this.difficulty);
    
       console.log('Block successfully mined!');
        this.chain.push(block);
    
        this.pendingTransactions = [];
      }
    addTransaction(transaction){
        if(!transaction.sender || !transaction.recipient){
            throw new Error('the transaction must contain a sender and recipient adress');
        }
        if(!transaction.isValid()){
            throw new Error ('cannot add invalid transaction ');

        }

        this.pendingTransactions.push(transaction);
    }
    getBalanceAdress(adress){
        let balance=0;
        for( const block of this.chain){
            for(const trans of block.transactions){
                if (trans.sender===adress){
                    balance-=trans.amount;
                }else if(trans.recipient===adress){
                    balance+=trans.amount;

                }
            }
        }
        return balance;
    };
    PreviouseHash(block){
        const index=this.chain.indexOf(block);
        return this.chain[index-1].hash;
    }
    isChainValid(){
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock=this.chain[i-1];
            if(!currentBlock.hasValidTransactions()){
                return false;
            };
            if  (currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            };
            if  (this.PreviouseHash(currentBlock) !== previousBlock.calculateHash()){
                return false;
            };
            return true;
        }
   
    }
        
    

}
module.exports.Blockchain=Blockchain;
module.exports.transaction=transaction;


