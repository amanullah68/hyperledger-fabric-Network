/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

const shim = require('fabric-shim');
const util = require('util');
const ClientIdentity = shim.ClientIdentity;


async function requireRole(stub, role) {

  const ClientIdentity = shim.ClientIdentity;

  let cid = new ClientIdentity(stub);

  if (!cid.assertAttributeValue('role', role))
    throw new Error(`Unauthorized access: ${role} required`);
}

var Chaincode = class {

  // Initialize the chaincode
  async Init(stub) {
    console.info('========= Triterras Init =========');
    return shim.success();
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();

    // try {

    //   await requireRole(stub, 'admin');

    // } catch(err) {

    //   // log failed access attempt and return

    //   console.error("Error during Invoke: ", err);

    //   return shim.error(err.message || err);

    // }


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


/** 
* Signup new user.
* @param args[0]_is_user_id - the unique id to identify the member
* @param args[1]_is_password - what password
*/

 async signup(stub, args) {
  let cid = new ClientIdentity(stub);
  let mspId = cid.getMSPID();

  console.info('cid', mspId);

  console.info('signup new user');

  let key = await stub.createCompositeKey(mspId, [args[0]]);
  console.log('key created', key);

  let userBytes = await stub.getState(key);
  console.info('userBytes',userBytes);

  if(userBytes.length != 0) {
    console.info('User with this id already exists in database');
    throw new Error('User with this id already exists in database');
  }

  //check args length should be 2
  if (args.length != 2) {
    console.info(`Argument length should be 2 with the order example: 
    {
      userName: "Aman",
      password: 'zamzam123'
    }`);

    throw new Error(`Argument length should be 2 with the order example: 
    {
      userName: "Aman",
      password: 'zamzam123'
    }`);
  }

  let newMember = {};

  newMember.userName = args[0];
  newMember.password = args[1];

  // await stub.putPrivateData(args[4]+'_users',args[0], Buffer.from(JSON.stringify(newMember)));
  await stub.putState(key, Buffer.from(JSON.stringify(newMember)));
}


/** 
* login user.
* @param args[0]_is_user_id - the unique id to identify the member
* @param args[1]_is_password - what password
*/

async login(stub, args) {
  let cid = new ClientIdentity(stub);
  let mspId = cid.getMSPID();

  console.info('cid', mspId);

  console.info('login new user');

  let key = await stub.createCompositeKey(mspId, [args[0]]);
  console.log('key created', key);

  let userBytes = await stub.getState(key);
  console.info('userBytes',userBytes);

  //check args length should be 2
  if (args.length != 2) {
    console.info(`Argument length should be 2 with the order example: 
    {
      userName: "Aman",
      password: 'zamzam123'
    }`);

    throw new Error(`Argument length should be 2 with the order example: 
    {
      userName: "Aman",
      password: 'zamzam123'
    }`);
  }

  var res = {};
  if(userBytes.length == 0) {
    console.info('User with this id not exist');
    res.result = false;
    res.res = "failed";
    return userBytes;
  }
  else{
    let user = JSON.parse(userBytes.toString());
    console.log('user', user);
    if(user.password != args[0]) {
      res.result = false;
      res.res = "failed";
      throw new Error('User password not matched');
      // return res;
    }
    else {
      res.result = true;
      res.res = "success";
      return userBytes;
    }
  } 
}

};

shim.start(new Chaincode());