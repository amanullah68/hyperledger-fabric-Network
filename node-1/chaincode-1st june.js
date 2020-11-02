/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

const shim = require('fabric-shim');
const util = require('util');

var Chaincode = class {

  // Initialize the chaincode
  async Init(stub) {
    console.info('========= Triterras Init =========');
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let args = ret.params;
    console.log('argss', args);

    let sellerId = args[0];
    let referenceNo = 'a';

    const supply = {
        ownerId: sellerId,
        sellerId: sellerId,
        traderId: '',
        buyerId: [],
        status: 'Initiated',
        initialSupply:  args[1],
        quantity: args[1],
        commodityName: args[3],
        description: args[4],
        executionId: 'none',
        unit: args[5],
        quality: args[6],
        createdDate: args[7],
        referenceNo: referenceNo,
        uploadProductSpecification: 'none',
        uploadQualityCertificate: 'none',
        adds: 'none'
    };

    console.log('supply', supply);
    try {
      await stub.putState(referenceNo, Buffer.from(JSON.stringify(supply)));
      return shim.success();
    } catch (err) {
      return shim.error('1',err);
    }
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let method = this[ret.fcn];

    if (!method) {
      console.error('no method of name:' + ret.fcn + ' found');
      return shim.error('no method of name:' + ret.fcn + ' found');
    }

    console.info('\nCalling method : ' + ret.fcn);
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async transferToTrader(stub, args) {
    let referenceNo='a';
    let referenceNo1='t';
    let traderId = args[0];
    if (!traderId) {
      throw new Error('trader Id must not  be empty');
    }

    let supplyBytes = await stub.getState(referenceNo);
    console.log('supply bytes', supplyBytes);
    if(!supplyBytes) {
      throw new Error('Failed to get state of asset holder a');
    }
    let supply = JSON.parse(supplyBytes.toString());
    console.log('supply', supply);

    supply.traderId = traderId;
    supply.ownerId = traderId;

    const price = {
      price: args[1]
    }

    console.log('supply', supply);
    await stub.putPrivateData('collectionPrivate', referenceNo1, Buffer.from(JSON.stringify(price)));
    await stub.putPrivateData('collectionShared', referenceNo, Buffer.from(JSON.stringify(supply)));
  }

  async traderToBuyer(stub, args) {
    let referenceNo='a';
    let referenceNo1 = 'b';
     
    let purchaserId = args[0];
    let requiredQty = args[1];
  
    if (!purchaserId) {
      throw new Error('Buyer Id must not  be empty');
    }
  
    let supplyBytes = await stub.getPrivateData("collectionShared", referenceNo);
    console.log('supply bytes', supplyBytes);
    let supply = JSON.parse(supplyBytes.toString());
    console.log('supply1', supply);
  
    let availableQty = supply.quantity;
  
    if(availableQty < requiredQty) {
      throw new Error(`Not enough Quantity, available quantity is ${availableQty} & required quantity is ${requiredQty}`);
    }
  
    let remainingQty = availableQty - requiredQty;
    let status = 'Delivered to seller';
    supply.quantity = remainingQty;
    supply.status = status;
    supply.buyerId.push(purchaserId);

    const price = {
      price: args[4]
    }
  
    await stub.putPrivateData('collectionPrivate1', referenceNo1, Buffer.from(JSON.stringify(price)));
    await stub.putPrivateData("collectionShared", referenceNo, Buffer.from(JSON.stringify(supply)));
    }

    async createSharedCollection(stub, args) {
      const drugPrivate = {
        name: args[1],
        price: args[2]
      };

      await stub.putPrivateData('collectionPrivate', args[0], Buffer.from(JSON.stringify(drugPrivate)));
      console.info('============= END : createMyDrug ===========');
    }

    async querySharedPrivate(stub, args) {
      console.info('============= START : readMyDrugPrivate ==========='); 
      let drugNumber = args[0];
      console.log(drugNumber)
      let res = {};
      const buffer = await stub.getPrivateData('collectionPrivate', drugNumber);
      try {
        res = JSON.parse(buffer.toString());
      } catch (err) {
        res = err;
      }
      console.info('============= END : readMyDrugPrivate ===========');
      return buffer;
    }
   
   
    async querySeller(stub, args) {
      let referenceNo='a';

      let jsonResp = {};
      let id = args[0];

      let supplybytes = await stub.getPrivateData("collectionShared", referenceNo);
      if (!supplybytes) {
        jsonResp.error = 'Failed to get state for ';
        throw new Error(JSON.stringify(jsonResp));
      }
      let supply = supplybytes;
      console.info('Query Response:');
      console.info(supply);
      return supply;
  }
};

shim.start(new Chaincode());