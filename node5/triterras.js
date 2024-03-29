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
  * 
  * addMember 
  * 
  * When a member to the blockchain - can be either seller, trader, buyer, banker or shipper.
  * @param args[0]_is_user_id - the unique id to identify the member
  * @param args[1]_is_password - what password
  * @param args[2]_is_user_name - the unique id to identify the member
  * @param args[3]_is_address - address of org
  * @param args[4]_is_memberType - can be seller, trader, buyer, banker and shipper
  * @param args[5]_is_telephone
  * @param args[6]_is_risk
  * @param args[7]_is_bankId
  * @param args[8]_is_id
  */

  async addMember(stub, args) {
    let cid = new ClientIdentity(stub);

    console.info('addMember invoked');

    let userBytes = await stub.getState(args[0]);
    console.info(userBytes)

    //check args length should be 10
    if (args.length != 10) {
      console.info(`Argument length should be 10 with the order example: 
      {
        user_id: "abc",
        password: 'abwe12',
        user_name: "MCB Bank",
        address: "Street 1, F-10 Markaz",
        memberType: "seller",
        telephone: "051232342342",
        risk: 0,
        bankId: 123,
        databaseId: 12
      }`);

      throw new Error(`Argument length should be 10 with the order example: 
      {
        user_id: "abc",
        password: 'abwe12',
        user_name: "MCB Bank",
        address: "Street 1, F-10 Markaz",
        memberType: "seller",
        telephone: "051232342342",
        risk: 0,
        bankId: 123,
        databaseId: 12
      }`);
    }


    //create object to hold details of our new member
    if (args[4] !== 'Seller' && args[4] !== 'Trader' && args[4] !== 'Buyer' && args[4] !== 'Banker' && args[4] !== 'Shipper') {
      console.info('Organization not exist', args[4]);
      throw new Error('Invalid Organiztion, please check the name of organization', args[0], args[1], args[2], args[3], args[4], args[4], args[5]);
    }

    let newMember = {};

    newMember.user_id = args[0];
    newMember.password = args[1];
    newMember.organization = cid.getMSPID();
    newMember.user_name = args[2];
    newMember.address = args[3];
    newMember.memberType = args[4];
    newMember.telephoneNo = args[5];
    newMember.risk = args[6];
    newMember.dbId = args[8];

    if (args[4] === 'seller' || args[4] === 'Seller') {
      newMember.bankId = args[7];
    }
    else if (args[4] === 'trader' || args[4] === 'Trader') {
      newMember.bankId = args[7];
    }
    else if (args[4] === 'buyer' || args[4] === 'Buyer') {
      newMember.bankId = args[7];
    }

    // await stub.putPrivateData(args[4]+'_users',args[0], Buffer.from(JSON.stringify(newMember)));
    await stub.putState(args[0], Buffer.from(JSON.stringify(newMember)));
  }


  /**
  * 
  * Assign users to a user (like add Bank to Seller)
  * 
  * Fetch users by user id.
  * @param args[0]_is_user_id - the unique id to identify the member
  * @param args[1]_is_organization - the unique id to identify the member
  * @param args[2]_is_name - name of the member to add
  * @param args[3]_is_organization - org of a member
  * @param args[4]_is_mobile - mobile number of a member
  * @param args[5]_is_address - address of a member
  */

  async assignUsers(stub, args) {

    //check args length should be 6
    if (args.length != 6) {
      console.info(`Argument length should be 6 with the order example: 
    {
      user_id: "abc",
      organization: "Seller",
      user_id: "MCB Bank",
      organization: "Bank"
      mobile: "0312*********",
      address: "F-10 Markaz"
    }`);

      return shim.error(`Argument length should be 6 with the order example: 
    {
      user_id: "abc",
      organization: "Seller",
      user_id: "MCB Bank",
      organization: "Bank"
      mobile: "0312*********",
      address: "F-10 Markaz"
    }`);
    }

    // let returnAsBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1)) + "_users", args[0]);
    let userBytes = await stub.getState(args[0]);
    console.info(userBytes)
    if (!userBytes || userBytes.length === 0) {
      throw new Error(`User with id ${args[2]} does not exist`);
    }

    let userBytes1 = await stub.getState(args[2]);
    console.info(userBytes1)
    if (!userBytes1 || userBytes1.length === 0) {
      throw new Error(`User2 of org ${args[3]} with id ${args[2]} does not exist`);
    }

    let user = JSON.parse(userBytes.toString());
    let userToAdd = {};

    userToAdd.name = args[2];
    userToAdd.addMember = args[4];
    userToAdd.addMember = args[5];

    if (args[3] === 'seller') {
      user.sellers.push(userToAdd);
    }
    else if (args[3] === 'trader') {
      user.traders.push(userToAdd);
    }
    else if (args[3] === 'buyer') {
      user.buyers.push(userToAdd);
    }
    else if (args[3] === 'banker') {
      user.bankers.push(userToAdd);
    }
    else if (args[3] === 'shipper') {
      user.shippers.push(userToAdd);
    }
    await stub.putState(args[0], Buffer.from(JSON.stringify(user)));
  }


  /**
  * 
  * query users by id
  * 
  * Fetch users by user id.
  * @param args[0]_is_user_id - the unique id to identify the member
  * @param args[1]_is_organization - the unique id to identify the member
  */

  async queryUsers(stub, args) {

    //check args length should be 2
    if (args.length != 1) {
      console.info(`Argument length should be 2 with the order example: 
      {
        user_id: "abc",
        organization: "Seller"
      }`);

      return shim.error(`Argument length should be 2 with the order example: 
      {
        user_id: "abc",
        organization: "Seller"
      }`);
    }

    // let returnAsBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1)) + "_users", args[0]);
    let userAsBytes = await stub.getState(args[0]);
    console.info(userAsBytes)
    if (!userAsBytes || userAsBytes.length === 0) {
      throw new Error(`User with id ${args[0]} does not exist`);
    }
    // let result = JSON.parse(returnAsBytes);
    let res = {};
    let result = userAsBytes;
    try {
      res = JSON.parse(result.toString());
    } catch (err) {
      res = err;
    }
    return result;
  }


  /**
  * 
  * query all users by id
  * 
  * Fetch all users by user id.
  * @param args_is_user_ids - the unique ids to identify the member
  */

  async queryAllUsers(stub, args) {
    let usersArray = [];

    for (let i = 0; i < args.length; i++) {
      let userAsBytes = await stub.getState(args[i]);
      if (userAsBytes != null && userAsBytes.length != 0) {
        usersArray.push(JSON.parse(userAsBytes.toString('utf8')));
      }
    }

    //  let users = {};
    //  users.users = usersArray;
    return usersArray;
  }


  /**
  * 
  * request Order by Seller/Trader/Buyer
  * 
  * Order request will be placed by Seller to Trader or by Trader to Buyer or vice versa.
  * @param args[0]_is_orderer_id - the unique id to identify the member
  * @param args[1]_is_organization - what organization is the member part of
  * @param args[2]_is_order_Id - Order Id
  * @param args[3]_is_product_name - Name of the product
  * @param args[4]_is_product_quantity - Quantity of the product
  * @param args[5]_is_unit - unit to be measured
  * @param args[6]_is_quality - unit to be quality
  * @param args[7]_is_price - price
  * @param args[8]_is_order_date - Order date
  * @param args[9]_is_seller_id - id of the seller to which order is placed
  * @param args[10]_is_buyer_id - Buyer(the one placing order) have to choose his bank so that to perform LC and BL opertaions
  */

  async placeOrder(stub, args) {

    //check args length should be 11
    if (args.length != 11) {
      console.info(`Argument length should be 11 with the order example: 
       {
        orderer_id: "trader12",
        organization: "Trader",
        order_id: "order122",
        product_name: "Wheat",
        product_quantity: "100",
        unit : "Kg",
        quality : "Pure",
        price : "2000",
        order_date: "10/02/2020",
        seller_id: "seller12",
        traderBank_id: "HBL Bank"
      }`);

      throw new Error(`Argument length should be 11 with the order example: 
      {
        orderer_id: "trader12",
        organization: "Trader",
        order_id: "order122",
        product_name: "Wheat",
        product_quantity: "100",
        unit : "Kg",
        quality : "Pure",
        price : "2000",
        order_date: "10/02/2020",
        seller_id: "seller12",
        traderBank_id: "HBL Bank"
      }`);
    }

    // check the org
    if (args[1] != 'Trader' && args[1] != 'Buyer' && args[1] != 'Seller') {
      throw new Error('Invalid Organization must be Seller or Trader or Buyer');
    }

    // check the orderer existence
    // let ordererBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let ordererBytes = await stub.getState(args[0]);
    if (!ordererBytes || ordererBytes.length == 0) {
      throw new Error(`Orderer with this id ${args[0]} not exist`);
    }

    let orderBytes = await stub.getState(args[2]);
    if (orderBytes && orderBytes.length != 0) {
      throw new Error('already exist');
    }

    // check the trader existence
    if (args[1] === 'Trader') {
      // let sellerBytes = await stub.getPrivateData('seller_users', args[6]);
      let sellerBytes = await stub.getState(args[9]);
      if (!sellerBytes || sellerBytes.length == 0) {
        throw new Error(`User with this id ${args[6]} not exist`);
      }
    }
    else if (args[1] === 'Buyer') {
      // let sellerBytes = await stub.getPrivateData('trader_users', args[6]);
      let sellerBytes = await stub.getState(args[9]);
      if (!sellerBytes || sellerBytes.length == 0) {
        throw new Error(`User with this id ${args[6]} not exist`);
      }
    }
    else if (args[1] === 'Seller') {
      // let sellerBytes = await stub.getPrivateData('trader_users', args[6]);
      let sellerBytes = await stub.getState(args[9]);
      if (!sellerBytes || sellerBytes.length == 0) {
        throw new Error(`User with this id ${args[6]} not exist`);
      }
    }
    else {
      throw new Error(`Member of ${args[1]} are not allowed to perform this action`);
    }

    // newOrder
    let newOrder = {};

    newOrder.product_order_id = args[2];
    newOrder.product_name = args[3];
    newOrder.product_quantity = args[4];
    newOrder.unit = args[5];
    newOrder.quality = args[6];
    newOrder.price = args[7];
    newOrder.order_date = args[8];
    newOrder.Orderer = args[0];
    newOrder.Seller = args[9];
    newOrder.buyerBank = args[10];
    newOrder.status = 'pending';

    await stub.putState(args[2], Buffer.from(JSON.stringify(newOrder)));
  }


  /**
  * 
  * acceptOrder
  * 
  * Order acceptance function.
  * @param args[0]_is_user_id - the unique id to identify the member
  * @param args[1]_is_organization - the unique id to identify the organization
  * @param args[2]_is_order_id - the unique id to identify the order
  * @param args[3]_is_price - the product id to identify the product
  * @param args[4]_is_sellerBank - seller have to choose his bank to perform the LC and BL operations
  * @param args[5]_is_shipper - seller have to choose shipper for shippment
  * @param args[6]_is_order_type - Type of order whether Seller type, Trader type or Buyer type
  * @param args[7]_is_ids - trader order id's where values stored in trader_order and buyer_order type
  * @param args[8]_is_qtys - trader order qty's selected from seller orders
  */

  async acceptOrder(stub, args) {

    console.log('order idssss', args[7]);

    console.log('order qtyyyyyyyyyyyyys.....', args[8]);

    // check the org
    if (args[1] != 'Trader' && args[1] != 'Buyer' && args[1] != 'Seller') {
      throw new Error('Invalid Organization must be Seller or Trader or Buyer');
    }

    // check the user existence
    let userBytes = await stub.getState(args[0]);
    if (!userBytes || userBytes.length == 0) {
      throw new Error(`User with this id ${args[0]} not exist`);
    }
    console.log('1, user bytes', userBytes);

    let userBytes1 = await stub.getState(args[4]);
    if (!userBytes1 || userBytes1.length == 0) {
      throw new Error(`Seller Bank with this id ${args[4]} not exist, register the user first`);
    }

    let userBytes2 = await stub.getState(args[5]);
    if (!userBytes2 || userBytes2.length == 0) {
      throw new Error(`Shipper with this id ${args[5]} not exist, register the user first`);
    }

    // fetch order
    let orderBytes = await stub.getState(args[2]);
    console.log('3.1, orderbytes', orderBytes);

    if (orderBytes == null || orderBytes.length == 0) {
      throw new Error(`Order with this id ${args[2]} not exist, place the order first`);
    }

    if (args[6] === "" && args[6] === null && args[6] === undefined && args[6] != 'seller_order' && args[6] != 'trader_orer' && args[6] != 'buyer_order') {
      //check args length should be 7
      if (args.length != 7) {
        console.info(`Argument length should be 7 with the order example: 
        {
          orderer_id: "user12",
          organization: "Seller",
          order_id: "order12",
          total_amount: "2000",
          sellerBank_id: "NIB_Bank12",
          shipper_id: "alrazzaq1122",
          order_type: "seller_order"
        }`);

        throw new Error(`Argument length should be 7 with the order example: 
        {
          orderer_id: "user12",
          organization: "Seller",
          order_id: "order12",
          total_amount: "2000",
          sellerBank_id: "NIB_Bank12",
          shipper_id: "alrazzaq1122",
          order_type: "seller_order"
        }`);
      }
    }

    // check if type is seller order then simply perform the simple actions
    if (args[6] === 'seller_order') {

      //check args length should be 7
      if (args.length != 7) {
        console.info(`Argument length should be 7 with the order example: 
        {
          orderer_id: "user12",
          organization: "Seller",
          order_id: "order12",
          total_amount: "2000",
          sellerBank_id: "NIB_Bank12",
          shipper_id: "alrazzaq1122",
          order_type: "seller_order"
        }`);

        throw new Error(`Argument length should be 7 with the order example: 
        {
          orderer_id: "user12",
          organization: "Seller",
          order_id: "order12",
          total_amount: "2000",
          sellerBank_id: "NIB_Bank12",
          order_type: "seller_order"
        }`);
      }
    }

    // check if type is trader_order or buyer_order then to perform extra actions
    if (args[6] === 'trader_order' || args[6] === 'buyer_order') {
      //check args length should be 8
      if (args.length != 9) {
        console.info(`Argument length should be 9 with the order example: 
        {
          orderer_id: "user12",
          organization: "Seller",
          order_id: "order12",
          total_amount: "2000",
          sellerBank_id: "NIB_Bank12",
          shipper_id: "alrazzaq1122",
          order_type: "seller_order",
          seller_order_ids: "30,31",
          qtys_selected: "100, 20"
        }`);

        throw new Error(`Argument length should be 9 with the order example: 
        {
          orderer_id: "user12",
          organization: "Seller",
          order_id: "order12",
          total_amount: "2000",
          sellerBank_id: "NIB_Bank12",
          order_type: "seller_order",
          seller_order_ids: "30,31",
          qtys_selected: "100, 20"
        }`);
      }
      let val = [];
      val = args[7].split(',');
      let val1 = [];
      val1 = args[8].split(',');

      for (let i = 0; i < val.length; i++) {
        let a = 'order' + val[i];
        let orderbytes1 = await stub.getState(a);
        if (!orderbytes1 || orderbytes1.length == 0) {
          throw new Error(`Seller Order with this id ${a} not exist in chaincode`);
        }
        else {
          let a = 'order' + val[i];
          let orderbytes1 = await stub.getState(a);
          let orders = JSON.parse(orderbytes1.toString());
          console.log('11 ' + a);
          console.log(`${a} value of order is `, orders);
          if (orders.product_quantity >= val1[i]) {
            orders.product_quantity = orders.product_quantity - val1[i];
            await stub.putState(a, Buffer.from(JSON.stringify(orders)));
          }
          else {
            throw new Error(`Quantity exceeds: Quantity in ${a} is ${orders.product_quantity}`);
          }
        }
      }
      console.log('valllllllll', val);
      console.log('order idssss', args[7]);
      console.log('selected qtyssssssssss', args[8]);
    }

    console.log('3.2, orderbytes', orderBytes);
    let order = JSON.parse(orderBytes.toString());
    console.log('4, order', order);

    // get the quantity required
    let req_qty = order.product_quantity;
    console.log('5, req_qty', req_qty);

    order.price = args[3];
    order.askLC = "pending";
    order.BL = "pending";
    order.status = 'accepted';
    order.sellerBank = args[4];
    order.shipper = args[5];

    console.log('8, req_qty', req_qty);
    await stub.putState(args[2], Buffer.from(JSON.stringify(order)));
  }


  /**
  * 
  * queryOrder
  * 
  * query Order
  * @param args[0]_is_user_id - the unique id to identify the member
  * @param args[1]_is_organization - the unique id to identify the organization
  * @param args[2]_is_orderer_id - the unique id to identify the order
  */

  async queryOrder(stub, args) {

    //check args length should be 3
    if (args.length != 3) {
      console.info(`Argument length should be 3 with the order example: 
      {
        orderer_id: "user12",
        organization: "Seller",
        order_id: "order12"
      }`);

      throw new Error(`Argument length should be 3 with the order example: 
      {
        orderer_id: "user12",
        organization: "Seller",
        order_id: "order12"
      }`);
    }

    // check the org
    if (args[1] != 'Trader' && args[1] != 'Buyer' && args[1] != 'Seller') {
      throw new Error('Invalid Organization must be Seller or Trader or Buyer');
    }

    // check the user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if (!userBytes || userBytes.length == 0) {
      throw new Error(`Seller with this id ${args[0]} not exist`);
    }

    // fetch order
    let orderBytes = stub.getState(args[2]);
    if (orderBytes == null || orderBytes.length == 0) {
      throw new Error(`Order with this id ${args[2]} not exist`);
    }
    let order = orderBytes.toString();

    return order;
  }


  /**
  * 
  * queryAllOrders
  * 
  * query all Orders
  * @param args[0]_is_user_id - the unique id to identify the member
  * @param args[1]_is_organization - the unique id to identify the organization
  * @param args[2]_is_startKey - the unique start of order id to identify the order
  * @param args[3]_is_endKey - the unique end of order id to identify the order
  */

  async queryAllOrders(stub, args) {

    //check args length should be 4
    if (args.length != 4) {
      console.info(`Argument length should be 3 with the order example: 
      {
        orderer_id: "user12",
        organization: "Seller",
        start_order_id: "order000",
        end_order_id: "order999"
      }`);

      throw new Error(`Argument length should be 4 with the order example: 
      {
        orderer_id: "user12",
        organization: "Seller",
        start_order_id: "order000",
        end_order_id: "order999"
      }`);
    }

    // check the org
    if (args[1] != 'Trader' && args[1] != 'Buyer' && args[1] != 'Seller') {
      throw new Error('Invalid Organization must be Seller or Trader or Buyer');
    }

    // check the user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if (!userBytes || userBytes.length == 0) {
      throw new Error(`Seller with this id ${args[0]} not exist`);
    }

    let startKey = args[2];
    let endKey = args[3];


    const { iterator } = await stub.getStateByRange(startKey, endKey);

    const allResults = [];
    while (true) {
      const res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        console.log(res.value.value.toString('utf8'));

        const Key = res.value.key;
        let Record;
        try {
          Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          Record = res.value.value.toString('utf8');
        }
        allResults.push({ Key, Record });
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return JSON.stringify(allResults);
      }
    }
  }


  /**
  * 
  * Reject Order
  * 
  * Reject Order by Seller.
  * @param args[0]_is_user_id - the unique id to identify the member
  * @param args[1]_is_organization - the unique id to identify the organization
  * @param args[2]_is_order_id - the unique id to identify the order
  * @param args[3]_is_comment - the unique id to identify the order
  */

  async rejectOrder(stub, args) {

    //check args length should be 4
    if (args.length != 4) {
      console.info(`Argument length should be 4 with the order example: 
    {
      orderer_id: "user12",
      organization: "Seller",
      order_id: "order12",
      comment: "quantity not available or any other issue"
    }`);

      throw new Error(`Argument length should be 4 with the order example: 
    {
      orderer_id: "user12",
      organization: "Seller",
      order_id: "order12",
      comment: "quantity not available or any other issue"
    }`);
    }

    // check the org
    if (args[1] != 'Trader' && args[1] != 'Buyer' && args[1] != 'Seller') {
      throw new Error('Invalid Organization must be Seller or Trader or Buyer');
    }

    // check the user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if (!userBytes || userBytes.length == 0) {
      throw new Error(`Seller with this id ${args[0]} not exist`);
    }

    // fetch order
    let orderBytes = stub.getState(args[2]);
    if (orderBytes == null || orderBytes.length == 0) {
      throw new Error(`Order with this id ${args[2]} not exist`);
    }

    let order = JSON.parse(orderBytes.toString());
    order.status = 'reject';
    order.comment = args[3];

    await stub.putState(args[2], Buffer.from(JSON.stringify(order)));
  }


  /**
  * 
  * Ask Bank to Issue LC
  * 
  * Buyer(Trader) ask for LC.
  * @param args[0]_is_user_id - the unique id to identify the member
  * @param args[1]_is_organization - the unique id to identify the organization
  * @param args[2]_is_order_id - the unique id to identify the order
  * @param args[3]_is_LC_id - the unique id to identify the lc
  * @param args[4]_is_requestDate - date of requesting lc
  */

  async askLC(stub, args) {

    //check args length should be 5
    if (args.length != 5) {
      console.info(`Argument length should be 5 with the order example: 
      {
        buyer_id: "user12",
        organization: "Seller",
        order_id: "order12",
        lc_id: "lc12",
        requestDate: '12/06/20'
      }`);

      throw new Error(`Argument length should be 5 with the order example: 
      {
        buyer_id: "user12",
        organization: "Seller",
        order_id: "order12",
        lc_id: "lc12",
        requestDate: '12/06/20'
      }`);
    }

    let lcBytes = await stub.getState(args[3]);
    if (lcBytes && lcBytes.length != 0) {
      throw new Error(`already exist`);
    }

    // check the org
    if (args[1] != 'Trader' && args[1] != 'Buyer') {
      throw new Error('Invalid Organization must be Trader or Buyer');
    }

    // check the user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if (!userBytes || userBytes.length == 0) {
      throw new Error(`Seller with this id ${args[0]} not exist`);
    }

    // fetch order
    let orderBytes = await stub.getState(args[2]);
    if (orderBytes == null || orderBytes.length == 0) {
      throw new Error(`Order with this id ${args[2]} not exist`);
    }

    // convert order object back into object to fetch values
    let order = JSON.parse(orderBytes.toString());

    // add more fields in order
    order.askLC = 'requestSend';
    order.LCid = args[3];

    // add it into ledger
    await stub.putState(args[2], Buffer.from(JSON.stringify(order)));

    // create LC object
    let askLC = {};

    // initialize it with key value
    askLC.LCid = args[3];
    askLC.orderId = args[2];
    askLC.phase = 1; // 1 means LC request send to Bank
    askLC.status = 'lcRequestSent';
    askLC.requestor = args[0];
    askLC.seller = order.seller;
    askLC.organization = args[1];
    askLC.price = order.price;
    askLC.requestDate = args[4];

    // add it to ledger
    await stub.putState(args[3], Buffer.from(JSON.stringify(askLC)));
  }


  /**
  * 
  * generate LC request for Seller bank
  * 
  * Bank generated the LC.
  * @param args[0]_is_user_id - the unique id to identify the bank member
  * @param args[1]_is_organization - the unique id to identify the organization
  * @param args[2]_is_LC_id - the unique id to identify the order
  * @param args[3]_is_recipientId - a unique id given by the bank
  * @param args[4]_is_generateDate - date on which LC is generated
  */

  async generateLC(stub, args) {

    //check args length should be 5
    if (args.length != 5) {
      console.info(`Argument length should be 5 with the order example: 
    {
      banker_id: "user12",
      organization: "Banker",
      lc_id: "lc12",
      recipient_Id: 'b10213231',
      generateDate: '18/06/20'
    }`);

      throw new Error(`Argument length should be 5 with the order example: 
    {
      banker_id: "user12",
      organization: "Banker",
      lc_id: "lc12",
      recipient_Id: 'b10213231',
      generateDate: '18/06/20'
    }`);
    }

    // check the org
    if (args[1] != 'Banker') {
      throw new Error('Invalid Organization must be Bank');
    }

    // check the user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if (!userBytes || userBytes.length == 0) {
      throw new Error(`Banker with this id ${args[0]} not exist`);
    }

    // fetch lc
    let lcBytes = await stub.getState(args[2]);
    if (lcBytes == null || lcBytes.length == 0) {
      throw new Error(`LC with this id ${args[2]} not exist`);
    }

    // convert lc object back into object to fetch values
    let lc = JSON.parse(lcBytes.toString());

    if (lc.phase == 2) {
      throw new Error(`LC with this id ${args[2]} is generated and deliver to seller bank`);
    }

    if (lc.phase == 3) {
      throw new Error(`LC with this id ${args[2]} is accepted by seller bank`);
    }

    if (lc.phase == 5) {
      throw new Error(`LC with this id ${args[2]} is rejected by seller bank`);
    }

    // add more fields in lc
    lc.phase = 2; // phase 2 LC generated by trader bank or seller bank and send to seller bank
    lc.status = 'lcGenerated';
    lc.recipientId = args[3];
    lc.generateDate = args[4];

    console.log('lccccc', lc);

    // add it to ledger
    await stub.putState(args[2], Buffer.from(JSON.stringify(lc)));
  }


  /**
  * 
  * LC accepted by seller bank
  * 
  * LC accepted by seller bank.
  * @param args[0]_is_user_id - the unique id to identify the bank member
  * @param args[1]_is_organization - the unique id to identify the organization
  * @param args[2]_is_LC_id - the unique id to identify the order
  * @param args[4]_is_acceptanceDate - the unique id to identify the order
  */

  async acceptLC(stub, args) {

    //check args length should be 5
    if (args.length != 5) {
      console.info(`Argument length should be 5 with the order example: 
    {
      banker_id: "sellerBank12",
      organization: "Banker",
      lc_id: "lc12",
      recipient_Id: 'b10213231',
      acceptanceDate: '18/06/20'
    }`);

      throw new Error(`Argument length should be 5 with the order example: 
    {
      banker_id: "sellerBank12",
      organization: "Banker",
      lc_id: "lc12",
      recipient_Id: 'b10213231',
      acceptanceDate: '18/06/20'
    }`);
    }

    // check the org
    if (args[1] != 'Banker') {
      throw new Error('Invalid Organization must be Bank');
    }

    // check the user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if (!userBytes || userBytes.length == 0) {
      throw new Error(`Seller with this id ${args[0]} not exist`);
    }

    // fetch lc
    let lcBytes = await stub.getState(args[2]);
    if (!lcBytes || lcBytes.length == 0) {
      throw new Error(`LC with this id ${args[2]} not exist`);
    }

    // convert lc object back into object to fetch values
    let lc = JSON.parse(lcBytes.toString());

    if (lc.phase == 5) {
      throw new Error(`LC with this id ${args[2]} is in rejected by Seller bank`);
    }

    if (lc.phase == 4) {
      throw new Error(`LC with this id ${args[2]} is in rejected by Trader or buyer bank`);
    }

    if (lc.phase == 3) {
      throw new Error(`LC with this id ${args[2]} is already accepted`);
    }

    console.log('lccccc', lc);
    if (lc.phase != 2) {
      throw new Error(`LC with this id ${args[2]} is not in a phase to accept by seller bank`);
    }

    // add more fields in lc
    lc.phase = 3; // phase 3 LC accepted by seller bank
    lc.status = 'sellerBankAccepted'
    lc.recipientId = args[3];
    lc.acceptanceDate = args[4];

    console.log('lcccc111', lc);
    // add it to ledger
    await stub.putState(args[2], Buffer.from(JSON.stringify(lc)));
  }


  /**
  * 
  * reject LC request by bank
  * 
  * Bank reject the LC request.
  * @param args[0]_is_user_id - the unique id to identify the bank member
  * @param args[1]_is_organization - the unique id to identify the organization
  * @param args[2]_is_LC_id - the unique id to identify the order
  * @param args[3]_is_reason - reason of LC rejection
  * @param args[4]_is_acceptanceDate - the unique id to identify the order
  */

  async rejectLC(stub, args) {
    //check args length should be 4
    if (args.length != 4) {
      console.info(`Argument length should be 4 with the order example: 
    {
      buyer_id: "user12",
      organization: "Banker",
      lc_id: "lc12",
      reason: 'not enough balance try again',
      rejectionDate: '18/06/20'
    }`);

      throw new Error(`Argument length should be 4 with the order example: 
    {
      buyer_id: "user12",
      organization: "Banker",
      lc_id: "lc12",
      reason: 'not enough balance try again',
      rejectionDate: '18/06/20'
    }`);
    }

    // check the org
    if (args[1] != 'Banker') {
      throw new Error('Invalid Organization must be Bank');
    }

    // check the user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if (!userBytes || userBytes.length == 0) {
      throw new Error(`Seller with this id ${args[0]} not exist`);
    }

    // fetch lc
    let lcBytes = await stub.getState(args[2]);
    if (lcBytes == null || lcBytes.length == 0) {
      throw new Error(`LC with this id ${args[2]} not exist`);
    }

    // convert lc object back into object to fetch values
    let lc = JSON.parse(lcBytes.toString());

    if (lc.phase == 3) {
      throw new Error(`LC with this id ${args[2]} already accepted by seller bank`);
    }

    if (lc.phase == 4) {
      throw new Error(`LC with this id ${args[2]} already rejected by Trader Bank`);
    }

    if (lc.phase == 5) {
      throw new Error(`LC with this id ${args[2]} already rejected by Seller Bank`);
    }

    if (lc.phase == 2) {
      lc.status = 'rejectedByTraderBank';
      lc.phase = '4'; //lc request rejected by Trader bank
    }

    if (lc.phase == 3) {
      lc.status = 'rejectedBySellerBank';
      lc.phase = '5'; //lc request rejected by Seller bank
    }
    // add more fields in lc
    lc.comment = args[3];
    lc.rejectionDate = args[4];

    // add it to ledger
    await stub.putState(args[3], Buffer.from(JSON.stringify(lc)));
  }


  /**
  * 
  * queryLC
  * 
  * query LC
  * @param args[0]_is_user_id - the unique id to identify the member
  * @param args[1]_is_organization - the unique id to identify the organization
  * @param args[2]_is_lc_id - the unique id to identify the lc
  */

  async queryLC(stub, args) {

    //check args length should be 3
    if (args.length != 3) {
      console.info(`Argument length should be 3 with the LC example: 
      {
        banker_id: "Bank",
        organization: "Bank",
        lc_id: "lc12"
      }`);

      throw new Error(`Argument length should be 3 with the LC example: 
      {
        banker_id: "Bank",
        organization: "Bank",
        lc_id: "lc12"
      }`);
    }

    // check the user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if (!userBytes || userBytes.length == 0) {
      throw new Error(`Seller with this id ${args[0]} not exist`);
    }

    // fetch order
    let lcBytes = await stub.getState(args[2]);
    if (lcBytes == null || lcBytes.length == 0) {
      throw new Error(`LC with this id ${args[2]} not exist`);
    }
    let lc = lcBytes;
    return lc;
  }


  /**
  * 
  * queryAllLC
  * 
  * query all LC
  * @param args[0]_is_user_id - the unique id to identify the member
  * @param args[1]_is_organization - the unique id to identify the organization
  * @param args[2]_is_startKey - the unique start of lc id to identify the order
  * @param args[3]_is_endKey - the unique end of lc id to identify the order
  */

  async queryAllLCs(stub, args) {

    //check args length should be 4
    if (args.length != 4) {
      console.info(`Argument length should be 3 with the order example: 
      {
        lc_id: "MCB Bank",
        organization: "Banker",
        start_order_id: "lc000",
        end_order_id: "lc999"
      }`);

      throw new Error(`Argument length should be 4 with the order example: 
      {
        lc_id: "MCB Bank",
        organization: "Banker",
        start_order_id: "lc000",
        end_order_id: "lc999"
      }`);
    }

    // check the user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if (!userBytes || userBytes.length == 0) {
      throw new Error(`Seller with this id ${args[0]} not exist`);
    }

    let startKey = args[2];
    let endKey = args[3];


    const { iterator } = await stub.getStateByRange(startKey, endKey);

    const allResults = [];
    while (true) {
      const res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        console.log(res.value.value.toString('utf8'));

        const Key = res.value.key;
        let Record;
        try {
          Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          Record = res.value.value.toString('utf8');
        }
        allResults.push({ Key, Record });
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return JSON.stringify(allResults);
      }
    }
  }


  /**
  * 
  * Seller send request to shipper for BL
  * 
  * Seller request for BL to Shipper.
  * @param args[0]_is_user_id - the unique id to identify the member
  * @param args[1]_is_organization - the unique id to identify the organization
  * @param args[2]_is_order_id - the unique id to identify the order
  * @param args[3]_is_BL_id - the unique id to identify the bank letter BL
  * @param args[4]_is_requestDate - date on which BL is requested
  * @param args[5]_is_shippmentDate - date of shippment
  * @param args[6]_is_expectedDeliveryDate - expected date of delivery
  */

  async requestBL(stub, args) {

    //check args length should be 7
    if (args.length != 7) {
      console.info(`Argument length should be 7 with the order example: 
      {
        buyer_id: "user12",
        organization: "Seller",
        order_id: "order12",
        bl_id: "bl12",
        requestDate: '12/06/20',
        shippmentDate: '14/06/20',
        expectedDeliveryDate: '14/06/20'
      }`);

      throw new Error(`Argument length should be 7 with the order example: 
      {
        buyer_id: "user12",
        organization: "Seller",
        order_id: "order12",
        bl_id: "bl12",
        requestDate: '12/06/20',
        shippmentDate: '14/06/20',
        expectedDeliveryDate: '14/06/20'
      }`);
    }

    let blBytes = await stub.getState(args[3]);
    if (blBytes && blBytes.length != 0) {
      throw new Error(`already exist`);
    }

    // check the org
    if (args[1] != 'Seller' && args[1] != 'Trader') {
      throw new Error('Invalid Organization must be Seller or Trader');
    }

    // check the user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if (!userBytes || userBytes.length == 0) {
      throw new Error(`Seller with this id ${args[0]} not exist`);
    }

    // fetch order
    let orderBytes = await stub.getState(args[2]);
    if (orderBytes == null || orderBytes.length == 0) {
      throw new Error(`Order with this id ${args[2]} not exist`);
    }

    // convert order object back into object to fetch values
    let order = JSON.parse(orderBytes.toString());

    console.log('orderrrr', order);

    let lcBytes = await stub.getState(order.LCid);
    if (lcBytes == null || lcBytes.length == 0) {
      throw new Error(`LC with this id ${order.LCid} not exist`);
    }

    // convert LC object back into object to fetch values
    let lc = JSON.parse(lcBytes.toString());

    console.log('lccccc in Bllll', lc);

    if (lc.phase != 3) {
      throw new Error(`First complete the lc process`);
    }

    // add more fields in order
    order.requestBL = 'requestSend';
    order.BLid = args[3];

    // add it into ledger
    await stub.putState(args[2], Buffer.from(JSON.stringify(order)));

    // create BL object
    let requestBL = {};

    // initialize it with key value
    requestBL.BLid = args[3];
    requestBL.orderId = args[2];
    requestBL.phase = 1; // 1 means BL request send to Bank
    requestBL.status = 'blRequestSent';
    requestBL.requestor = args[0]; //seller
    requestBL.seller = order.seller;
    requestBL.organization = args[1];
    requestBL.requestDate = args[4];
    requestBL.shippmentDate = args[5];
    requestBL.expectedDeliveryDate = args[6];
    requestBL.traderBank = '';
    requestBL.shipper = '';

    console.log('bllll', requestBL);

    // add it to ledger
    await stub.putState(args[3], Buffer.from(JSON.stringify(requestBL)));
  }


  /*
  * 
  * Shipper send BL to Trader Bank/Buyer Bank
  * 
  * Shipper send BL to Trader Bank.
  * @param args[0]_is_user_id - the unique id to identify the member
  * @param args[1]_is_organization - the unique id to identify the organization
  * @param args[2]_is_BL_id - the unique id to identify the bank letter BL
  * @param args[3]_is_transferDate - date on which BL is requested
  */

  async shipperSendToTraderBank(stub, args) {

    //check args length should be 4
    if (args.length != 4) {
      console.info(`Argument length should be 4 with the order example: 
      {
        shipper_id: "user12",
        organization: "Shipper",
        bl_id: "bl12",
        requestDate: '12/06/20',
      }`);

      throw new Error(`Argument length should be 4 with the order example: 
      {
        shipper_id: "user12",
        organization: "Shipper",
        bl_id: "bl12",
        requestDate: '12/06/20'
      }`);
    }

    // check the org
    if (args[1] != 'Shipper') {
      throw new Error('Invalid Organization must be Shipper');
    }

    // check the user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if (!userBytes || userBytes.length == 0) {
      throw new Error(`Shipper with this id ${args[0]} not exist`);
    }

    // fetch order
    let blBytes = await stub.getState(args[2]);
    if (blBytes == null || blBytes.length == 0) {
      throw new Error(`Order with this id ${args[2]} not exist`);
    }

    // convert order object back into object to fetch values
    let bl = JSON.parse(blBytes.toString());

    console.log('blllll', bl);

    if (bl.phase == 2) {
      throw new Error(`This BL already transfered to Shipper, already exist`);
    }

    if (bl.phase == 3) {
      throw new Error(`This BL already verified`);
    }

    if (bl.phase != 1) {
      throw new Error(`Seller must trasfer it first to Trader Bank`);
    }


    bl.phase = 2; //2 means shipper send BL to Trader Bank
    bl.status = 'BL sended to Trader Bank';
    bl.transferDate = args[3];

    console.log('bllll1111', bl);

    // update the bl ledger
    await stub.putState(args[2], Buffer.from(JSON.stringify(bl)));
  }


  /*
  * 
  * Verification by Trader/Buyer Bank
  * 
  * Trader/Buyer Bank verify BL.
  * @param args[0]_is_user_id - the unique id to identify the member
  * @param args[1]_is_organization - the unique id to identify the organization
  * @param args[2]_is_BL_id - the unique id to identify the bank letter BL
  * @param args[3]_is_verificationDate - date on which BL is requested
  */

  async blVerification(stub, args) {

    //check args length should be 4
    if (args.length != 4) {
      console.info(`Argument length should be 4 with the order example: 
      {
        banker_id: "user12",
        organization: "Shipper",
        bl_id: "bl12",
        requestDate: '12/06/20',
      }`);

      throw new Error(`Argument length should be 4 with the order example: 
      {
        banker_id: "user12",
        organization: "Shipper",
        bl_id: "bl12",
        requestDate: '12/06/20'
      }`);
    }

    // check the org
    if (args[1] != 'Banker') {
      throw new Error('Invalid Organization must be Trader or Buyer');
    }

    // check the user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if (!userBytes || userBytes.length == 0) {
      throw new Error(`Shipper with this id ${args[0]} not exist`);
    }

    // fetch order
    let blBytes = await stub.getState(args[2]);
    if (blBytes == null || blBytes.length == 0) {
      throw new Error(`Order with this id ${args[2]} not exist`);
    }

    // convert order object back into object to fetch values
    let bl = JSON.parse(blBytes.toString());

    console.log('blll', bl);

    if (bl.phase == 3) {
      throw new Error(`This BL already verified`);
    }

    if (bl.phase != 2) {
      throw new Error(`Shipper must send BL to Trader Bank`);
    }

    bl.phase = 3; //3 trader bank verified BL succesfully
    bl.status = 'BL sended to Trader Bank';

    console.log('bllllll2222', bl);

    // update the bl ledger
    await stub.putState(args[2], Buffer.from(JSON.stringify(bl)));
  }

  /*
  *  
  * query BL
  * 
  * @param args[0]_is_user_id - the unique id to identify the member
  * @param args[1]_is_organization - the unique id to identify the organization
  * @param args[2]_is_bl_id - the unique id to identify the order
  */

  async queryBL(stub, args) {

    //check args length should be 3
    if (args.length != 3) {
      console.info(`Argument length should be 3 with the bl example: 
    {
      banker_id: "Bank",
      organization: "Bank",
      bl_id: "bl12"
    }`);

      throw new Error(`Argument length should be 3 with the bl example: 
    {
      banker_id: "Bank",
      organization: "Bank",
      bl_id: "bl12"
    }`);
    }

    // check the user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if (!userBytes || userBytes.length == 0) {
      throw new Error(`Seller with this id ${args[0]} not exist`);
    }

    // BL order
    let blBytes = await stub.getState(args[2]);
    if (blBytes == null || blBytes.length == 0) {
      throw new Error(`BL with this id ${args[2]} not exist`);
    }
    let bl = blBytes;

    return bl;
  }

  /**
  * 
  * queryAllBL
  * 
  * query all BL
  * @param args[0]_is_user_id - the unique id to identify the member
  * @param args[1]_is_organization - the unique id to identify the organization
  * @param args[2]_is_startKey - the unique start of bl id to identify the order
  * @param args[3]_is_endKey - the unique end of bl id to identify the order
  */

  async queryAllBLs(stub, args) {

    //check args length should be 4
    if (args.length != 4) {
      console.info(`Argument length should be 4 with the BL example: 
    {
      bl_id: "MCB Bank",
      organization: "Banker",
      start_order_id: "bl000",
      end_order_id: "bl999"
    }`);

      throw new Error(`Argument length should be 4 with the BL example: 
    {
      bl_id: "MCB Bank",
      organization: "Banker",
      start_order_id: "bl000",
      end_order_id: "bl999"
    }`);
    }

    // check the user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if (!userBytes || userBytes.length == 0) {
      throw new Error(`Seller with this id ${args[0]} not exist`);
    }

    let startKey = args[2];
    let endKey = args[3];

    const { iterator } = await stub.getStateByRange(startKey, endKey);

    const allResults = [];
    while (true) {
      const res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        console.log(res.value.value.toString('utf8'));

        const Key = res.value.key;
        let Record;
        try {
          Record = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          console.log(err);
          Record = res.value.value.toString('utf8');
        }
        allResults.push({ Key, Record });
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return JSON.stringify(allResults);
      }
    }
  }
};

shim.start(new Chaincode());