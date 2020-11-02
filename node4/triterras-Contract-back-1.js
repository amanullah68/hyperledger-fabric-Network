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
    return shim.success();
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
  * @param args[5]_is_sellers - sellers if none assign null, should be of type Array
  * @param args[6]_is_traders - traders if none assign null, should be of type Array
  * @param args[7]_is_buyers - buyers if none assign null, should be of type Array
  * @param args[8]_is_bankers - bankers if none assign null, should be of type Array
  * @param args[9]_is_shippers - shippers if none assign null, should be of type Array
  */

  async addMember(stub, args) {
    console.info('addMember invoked');

    //check args length should be 10
    if(args.length != 10) {
      console.info(`Argument length should be 10 with the order example: 
      {
        user_id: "abc",
        organization: "Seller",
        user_name: "MCB Bank",
        address: "Street 1, F-10 Markaz",
        memberType: "seller",
        seller: "none",
        traders : [{
          name: "Afghan Traders",
          mobile: 021**********,
          address: "Peshawar Road",
        }],
        buyers: "none"
        bankers : [{
          name: "MCB Bank",
          mobile: 021**********,
          address: "F-10 Markaz",
        }],
        shippers : [{
          name: "Razzaq Shipping",
          mobile: 021**********,
          address: "New Town, Karachi",
        }]
      }`);

      throw new Error(`Argument length should be 10 with the order example: 
      {
        user_id: "abc",
        organization: "Seller",
        user_name: "MCB Bank",
        address: "Street 1, F-10 Markaz",
        memberType: "seller",
        traders : [{
          name: "Afghan Traders",
          mobile: 021**********,
          address: "Peshawar Road",
        }],
        bankers : [{
          name: "MCB Bank",
          mobile: 021**********,
          address: "F-10 Markaz",
        }],
        shippers : [{
          name: "Razzaq Shipping",
          mobile: 021**********,
          address: "New Town, Karachi",
        }]
      }`);
    }

    //create object to hold details of our new member
    if(args[1] !== 'Seller' && args[1] !== 'Trader' && args[1] !== 'Buyer' && args[1] !== 'Banker' && args[1] !== 'Shipper') {
      console.info('Organization not exist');
      throw new Error('Invalid Organiztion, please check the name of organization');
    }

    if(args[4] !== 'seller' && args[4] !== 'trader' && args[4] !== 'buyer' && args[4] !== 'banker' && args[4] !== 'shipper') {
      console.info('member should be one of these seller, trader, buyer, banker or a shipper');
      throw new Error('member should be one of these seller, trader, buyer, banker or a shipper');
    }
    let newMember = {};

    newMember.user_id = args[0];
    newMember.organization = args[1];
    newMember.user_name = args[2];
    newMember.address = args[3];
    newMember.memberType = args[4];

    if(args[4] === 'seller') {
      // if(!Array.isArray(args[6]) && !Array.isArray(args[8]) && !Array.isArray(args[9])) {
      //   console.info('Value should be of type Array');
      //   throw new Error('Value should be of type Array');
      // }
      newMember.traders = args[6];
      newMember.bankers = args[8];
      newMember.shippers = args[9];
    }
    else if(args[4] === 'trader') {
      // if(!Array.isArray(args[5]) && !Array.isArray(args[7]) && !Array.isArray(args[8]) && !Array.isArray(args[9])) {
      //   console.info('Value should be of type Array');
      //   throw new Error('Value should be of type Array');
      // }
      newMember.sellers = args[5];
      newMember.buyers = args[7];
      newMember.bankers = args[8];
      newMember.shippers = args[9];
    }
    else if(args[4] === 'buyer') {
      // if(!Array.isArray(args[6]) && !Array.isArray(args[8]) && !Array.isArray(args[9])) {
      //   console.info('Value should be of type Array');
      //   throw new Error('Value should be of type Array');
      // }
      newMember.traders = args[6];
      newMember.bankers = args[8];
      newMember.shippers = args[9];
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
  if(args.length != 6) {
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

  if(args[3] === 'seller') {
    user.sellers.push(userToAdd);
  }
  else if(args[3] === 'trader') {
    user.traders.push(userToAdd);
  }
  else if(args[3] === 'buyer') {
    user.buyers.push(userToAdd);
  }
  else if(args[3] === 'banker') {
    user.bankers.push(userToAdd);
  }
  else if(args[3] === 'shipper') {
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
    if(args.length != 1) {
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
    return JSON.parse(result.toString());
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

   for(let i=0; i<args.length; i++) {
    let userAsBytes = await stub.getState(args[i]);
    if(userAsBytes != null && userAsBytes.length != 0) {
      usersArray.push(JSON.parse(userAsBytes.toString('utf8')));
    }
   }

  //  let users = {};
  //  users.users = usersArray;
   return usersArray;
 }


  
  /**
   * 
   * add product by seller
   * 
   * Seller will add product to blockchain.
   * @param args[0]_is_seller_id - the unique id to identify the member
   * @param args[1]_is_organization - what organization is the member part of
   * @param args[2]_is_product_id - the unique id to identify the product
   * @param args[3]_is_product_name - Name of the product
   * @param args[4]_is_product_quality - Quality of the product
   * @param args[5]_is_product_quantity - Quantity of the product
   * @param args[6]_is_measuring_unit - Measuring unit of the product
   * @param args[7]_is_price_per_kg - Price of the product per kg
   * @param args[8]_is_mfg_date - Entering date of product
   * @param args[9]_is_expiry_date - Expiry date of product if, else set to null
   */

  async sellerAddProduct(stub, args) {

    // check user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if(!userBytes || userBytes.length == 0) {
      throw new Error(`User with this id ${args[0]} not exist`);
    }

    // check that product with the id exist or not
    let productByte = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_products',args[2]);
    if(productByte || productByte.length != 0) {
      throw new Error(`Product with this id ${args[2]} already exist`);
    }

    //check args length should be 9
    if(args.length != 9) {
      console.info(`Argument length should be 9 with the order example: 
      {
        seller_id: "abc",
        organization: "Seller",
        product_id: "wheat12",
        product_name: "Wheat",
        product_quality: "pure",
        product_quantity: "100",
        measuring_unit: "Kg",
        price_per_kg : "50",
        mfg_date: "12/12/12",
        expiry_date: "01/08/14"
      }`);

      throw new Error(`Argument length should be 9 with the order example: 
      {
        seller_id: "abc",
        organization: "Seller",
        product_id: "wheat12",
        product_name: "Flour",
        product_quality: "pure",
        product_quantity: "100",
        measuring_unit: "Kg",
        price_per_kg : "50",
        mfg_date: "12/12/12",
        expiry_date: "01/08/14"
      }`);
    }

    // newProudct 
    let newProduct = {};

    newProduct.product_id = args[2]
    newProduct.product_name = args[3];
    newProduct.product_quality = args[4];
    newProduct.product_quantity = args[5];
    newProduct.measuring_unit = args[6];
    newProduct.price = args[7];
    newProduct.mfg_date = args[8];
    newProduct.expiry_date = args[9];
    newProduct.owner = args[0];

    console.log('org ', (args[1].charAt(0).toLowerCase() + args[1].slice(1)));
    console.log('key', ((args[1].charAt(0).toLowerCase() + args[1].slice(1))+args[2]));
    await stub.putPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_products',args[2], Buffer.from(JSON.stringify(newProduct)));
  }

  
  /**
   * 
   * query product by id
   * 
   * Fetch product by product id.
   * @param args[0]_is_user_id - the unique id to identify the member
   * @param args[1]_is_product_id - the unique id to identify the product
   * @param args[2]_is_organization - Organization
   */

  async queryProduct(stub, args) {

    //check args length should be 3
    if(args.length != 3) {
      console.info(`Argument length should be 3 with the order example: 
      {
        user_id: "abc",
        product_id: "prod123",
        organization: "Seller"
      }`);

      return shim.error(`Argument length should be 3 with the order example: 
      {
        user_id: "abc",
        product_id: "prod123",
        organization: "Seller"
      }`);
    }

    let returnAsBytes = await stub.getPrivateData((args[2].charAt(0).toLowerCase() + args[1].slice(1)) + "_products", args[1]);
    console.info(returnAsBytes)
    if (!returnAsBytes || returnAsBytes.length === 0) {
      throw new Error(`Product with ${args[1]} does not exist`);
    }
    let product = JSON.parse(returnAsBytes.toString());
    let owner = product.owner;

    if(owner !== args[0]) {
      throw new Error(`Product with ${args[1]} does not belong to this user`);
    }

    // let result = JSON.parse(returnAsBytes);
    let res = {};
    let result = returnAsBytes;
    try {
      res = JSON.parse(result.toString());
    } catch (err) {
      res = err;
    }
    console.info('============= END : readMyDrugPrivate ===========');
    return result;
  }


  /**
   * 
   * query All Seller Products
   * 
   * Fetch seller products by user id.
   * @param args[0]_is_startKey - start key to identify the product
   * @param args[1]_is_startKey - start key to identify the product
   * @param args[2]_is_endKey - end key to identify the product
   * @param args[3]_is_organization - Organization of a User
   */

  async querySellerProducts(stub, args) {
    args[0] = 'range';
    //check args length should be 4
    if(args.length != 4) {
      console.info(`Argument length should be 4 with the order example: 
      {
        startKey: "prod000",
        endKey: "prod999",
        organization: "Seller"
      }`);

      return shim.error(`Argument length should be 4 with the order example: 
      {
        startKey: "prod000",
        endKey: "prod999",
        organization: "Seller"
      }`);
    }

    let startKey = args[0];
    let endKey = args[1];


    const {iterator} = await stub.getPrivateDataByRange((args[2].charAt(0).toLowerCase() + args[2].slice(1)) + "_products",startKey, endKey);

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
   * placeOrder
   * 
   * Order will be placed by Trader to Seller or by Buyer to Trader.
   * @param args[0]_is_orderer_id - the unique id to identify the member
   * @param args[1]_is_organization - what organization is the member part of
   * @param args[2]_is_order_Id - Order Id
   * @param args[3]_is_product_name - Name of the product
   * @param args[4]_is_product_quantity - Quantity of the product
   * @param args[5]_is_order_date - Order date
   * @param args[6]_is_seller_id - id of the seller to which order is placed
   */

  async placeOrder(stub, args) {

    //check args length should be 7
    if(args.length != 7) {
      console.info(`Argument length should be 7 with the order example: 
      {
        orderer_id: "trader12",
        organization: "Trader",
        order_id: "order122",
        product_name: "Wheat",
        product_quantity: "100",
        order_date: "10/02/2020",
        seller_id: "seller12"
      }`);

      throw new Error(`Argument length should be 6 with the order example: 
      {
        orderer_id: "trader12",
        organization: "Trader",
        order_id: "order122",
        product_name: "Wheat",
        product_quantity: "100",
        order_date: "10/02/2020",
        seller_id: "seller12"
      }`);
    }

    // check the org
    if(args[1] != 'Trader' && args[1] != 'Buyer') {
      throw new Error('Invalid Organization must be Trader or Buyer');
    }

    // check the orderer existence
    // let ordererBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let ordererBytes = await stub.getState(args[0]);

    if(!ordererBytes || ordererBytes.length == 0) {
      throw new Error(`Orderer with this id ${args[0]} not exist`);
    }

    // check the seller existence
    if(args[1] === 'Trader') {
      // let sellerBytes = await stub.getPrivateData('seller_users', args[6]);
      let sellerBytes = await stub.getState(args[6]);
      if(!sellerBytes || sellerBytes.length == 0) {
        throw new Error(`Seller with this id ${args[6]} not exist`);
      }
    }
    else if(args[1] === 'Buyer') {
      // let sellerBytes = await stub.getPrivateData('trader_users', args[6]);
      let sellerBytes = await stub.getState(args[6]);
      if(!sellerBytes || sellerBytes.length == 0) {
        throw new Error(`Seller with this id ${args[6]} not exist`);
      }
    }

    // newOrder
    let newOrder = {};

    newOrder.product_order_id = args[2]
    newOrder.product_name = args[3];
    newOrder.product_quantity = args[4];
    newOrder.order_date = args[5];
    newOrder.Orderer = args[0];
    newOrder.Seller = args[6];
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
  * @param args[2]_is_orderer_id - the unique id to identify the order
  * @param args[3]_is_product_id - the product id to identify the product
  */

  async acceptOrder(stub, args) {

    //check args length should be 4
    if(args.length != 4) {
      console.info(`Argument length should be 4 with the order example: 
      {
        orderer_id: "user12",
        organization: "Seller",
        order_id: "order12",
        product_id: "product12"
      }`);

      throw new Error(`Argument length should be 4 with the order example: 
      {
        orderer_id: "user12",
        organization: "Seller",
        order_id: "order12",
        product_id: "product12"
      }`);
    }

    // check the user existence
    // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
    let userBytes = await stub.getState(args[0]);
    if(!userBytes || userBytes.length == 0) {
      throw new Error(`Seller with this id ${args[0]} not exist`);
    }

    // check that product with the id exist or not
    let productByte = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_products',args[3]);
    if(!productByte || productByte.length == 0) {
      throw new Error(`Product with this id ${args[3]} not exist`);
    }
    let product = JSON.parse(productByte.toString());

    // get the availble quantity
    let qty_available = product.product_quality;

    // fetch order
    let orderBytes = stub.getState(args[2]);
    if(orderBytes == null || orderBytes.length == 0) {
      throw new Error(`Order with this id ${args[2]} not exist`);
    }
    let order = JSON.parse(orderBytes.toString());

    // get the quantity required
    let req_qty = order.product_quantity;

    if(qty_available < req_qty) {
      throw new Error(`Not enough quantity to proceed, available quantity is ${qty_available} and required quantity is ${req_qty}`);
    }

    order.status = 'accepted';

    await stub.putState(args[2], Buffer.from(JSON.stringify(order)));
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
  if(args.length != 4) {
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

  // check the user existence
  // let userBytes = await stub.getPrivateData((args[1].charAt(0).toLowerCase() + args[1].slice(1))+'_users', args[0]);
  let userBytes = await stub.getState(args[0]);
  if(!userBytes || userBytes.length == 0) {
    throw new Error(`Seller with this id ${args[0]} not exist`);
  }

  // fetch order
  let orderBytes = stub.getState(args[2]);
  if(orderBytes == null || orderBytes.length == 0) {
    throw new Error(`Order with this id ${args[2]} not exist`);
  }

  let order = JSON.parse(orderBytes.toString());
  order.status = 'reject';
  order.comment = args[3];

  await stub.putState(args[2], Buffer.from(JSON.stringify(order)));
}

};



shim.start(new Chaincode());