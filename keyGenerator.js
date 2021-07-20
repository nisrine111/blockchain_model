const EC=require("elliptic").ec;
const ec=new EC("secp256k1");
const key=ec.genKeyPair();
const publicKey=key.getPublic('hex');
const privateKey=key.getPrivate('hex');
console.log();
console.log('the public key is : ', publicKey);
console.log();
console.log('the private key is : ' , privateKey);

