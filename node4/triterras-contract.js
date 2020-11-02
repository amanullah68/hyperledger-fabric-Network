/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const shim = require('fabric-shim');


class MyContract extends Contract {

  /**
   * 
   * addMember 
   * 
   * When a member to the blockchain - can be either seller, trader, buyer, banker or shipper.
   * @param args[0]_is_user_id - the unique id to identify the member
   * @param args[1]_is_organization - what organization is the member part of
   * @param args[2]_is_user_name - the unique id to identify the member
   * @param args[3]_is_address - address of org
   * @param args[4]_is_memberType - can be seller, trader, buyer, banker and shipper
   */

  async addMember(ctx, args) {
    console.info('addMember invoked');

    //check args length should be 5
    if(args.length != 5) {
      console.info(`Argument length should be 5 with the order example: 
      {
        user_id: abc,
        organization: Seller,
        user_name: MCB Bank,
        address: Street 1, F-10 Markaz,
        memberType: seller
      }`);

      return shim.error(`Argument length should be 5 with the order example: 
      {
        user_id: abc,
        organization: Seller,
        user_name: MCB Bank,
        address: Street 1, F-10 Markaz,
        memberType: seller
      }`);
    }

    //create object to hold details of our new member
    if(args[1] !== 'Seller' || args[1] !== 'Trader' || args[1] !== 'Buyer' || args[1] !== 'Banker' || args[1] !== 'Shipper') {
        console.info('Organization not exist');
        return shim.error('Invalid Organiztion, please check the name of organization');
    }

    if(args[4] !== 'seller' || args[4] !== 'trader' || args[4] !== 'buyer' || args[4] !== 'banker' || args[4] !== 'shipper') {
        console.info('member should be one of these seller, trader, buyer, banker or a shipper');
        return shim.error('member should be one of these seller, trader, buyer, banker or a shipper');
    }
    let newMember = {};

    newMember.user_id = args[0];
    newMember.organization = args[1];
    newMember.user_name = args[2];
    newMember.address = args[3];
    newMember.memberType = args[4];
    try {
        await ctx.stub.putPrivateData(args[4]+'_users',args[0], Buffer.from(JSON.stringify(newMember)));
        console.info('updated ledger with key: ' + args[0] + 'and value: ');
        console.info(JSON.stringify(newMember));
        return shim.success(newMember);
      } catch (err) {
        return shim.error('Add member: ',err);
      }

  }


  async init(ctx) {
    console.info('init invoked');
  }


  /**
   * 
   * query users
   * 
   * Fetch users by user id.
   * @param args[0]_is_user_id - the unique id to identify the member
   * @param args[1]_is_org_type - the unique id to identify the member
   */

  async queryUsers(ctx, args) {

    //check args length should be 2
    if(args.length != 2) {
      console.info(`Argument length should be 2 with the order example: 
      {
        user_id: abc,
        organization: Seller
      }`);

      return shim.error(`Argument length should be 2 with the order example: 
      {
        user_id: abc,
        organization: Seller
      }`);
    }

    let supplybytes = await stub.getPrivateData(args[1] + "_users", args[0]);
    console.info(returnAsBytes)
    if (!returnAsBytes || returnAsBytes.length === 0) {
      return new Error(`${args[0]} does not exist`);
    }
    let result = JSON.parse(returnAsBytes);
    console.info('result of getState: ');
    console.info(result);
    return JSON.stringify(result);
  }
}

module.exports = MyContract;