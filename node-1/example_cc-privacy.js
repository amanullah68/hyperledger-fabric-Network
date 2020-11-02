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
      initialSupply: args[1],
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
      return shim.error('1', err);
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
    let referenceNo = 'a';
    let traderId = args[0];
    if (!traderId) {
      throw new Error('trader Id must not  be empty');
    }

    let supplyBytes = await stub.getState(referenceNo);
    console.log('supply bytes', supplyBytes);
    if (!supplyBytes) {
      throw new Error('Failed to get state of asset holder a');
    }
    let supply = JSON.parse(supplyBytes.toString());
    console.log('supply', supply);

    supply.traderId = traderId;
    supply.ownerId = traderId;

    console.log('supply', supply);
    await stub.putState(referenceNo, Buffer.from(JSON.stringify(supply)));
  }

  async sellerToBuyer(stub, args) {
    let referenceNo = 'a';

    let purchaserId = args[0];
    let requiredQty = args[1];

    if (!purchaserId) {
      throw new Error('Buyer Id must not  be empty');
    }

    let supplyBytes = await stub.getState(referenceNo);
    console.log('supply bytes', supplyBytes);
    let supply = JSON.parse(supplyBytes.toString());
    console.log('supply1', supply);

    let availableQty = supply.quantity;

    if (availableQty < requiredQty) {
      throw new Error(`Not enough Quantity, available quantity is ${availableQty} & required quantity is ${requiredQty}`);
    }

    let remainingQty = availableQty - requiredQty;
    let status = 'Delivered to seller';
    supply.quantity = remainingQty;
    supply.status = status;
    supply.buyerId.push(purchaserId);

    await stub.putState(referenceNo, Buffer.from(JSON.stringify(supply)));
  }


  async privateData(stub, args) {

    let referenceNo = 'b';

    // let private = stub.getTransient();
    // var buffer = new Buffer(private.map.conversation.value.toArrayBuffer());

    // var JSONString = buffer.toString('utf8');

    // var JSONObject = JSON.parse(JSONString);

    // await stub.putPrivateData("privateData", referenceNo, buffer);
    let price = args[0];
    if (!price) {
      throw new Error('trader Id must not  be empty');
    }

    const private = {
      name: 'Aman',
      price: price
    }

    console.log('supply', private);
    await stub.putPrivateData("privateData",referenceNo, Buffer.from(JSON.stringify(private)));
  }

  async queryPrivate(stub, args) {
    let referenceNo = 'b';

    let jsonResp = {};
    let id = args[0];

    let supplybytes = await stub.getPrivateData("privateData", referenceNo);
    if (!supplybytes) {
      jsonResp.error = 'Failed to get state for ';
      throw new Error(JSON.stringify(jsonResp));
    }

    let supply = supplybytes;

    console.info('Query Response:');
    console.info(supply);
    return supply;
  }

  async querySeller(stub, args) {
    let referenceNo = 'a';

    let jsonResp = {};
    let id = args[0];

    let supplybytes = await stub.getState(referenceNo);
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