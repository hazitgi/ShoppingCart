const db = require("../configuration/dataBaseConnection");
const nameCollection = require("../configuration/collection");
const { resolve, reject } = require("promise");
const ObjectId = require("mongodb").ObjectID;
const { response } = require("express");
module.exports = {
  // without promise
  // addProduct: (productDetails, callback) => {
  //   db.get()
  //     .collection(nameCollection.PRODUCT_COLLECTIONS)
  //     .insertOne(productDetails)
  //     .then((data) => {
  //       callback(data.ops[0]._id);
  //     });
  // },
  addProduct: (productDetails, callback) => {
    let product = {
      catogery: productDetails.catogery,
      name: productDetails.name,
      price: parseInt(productDetails.price),
      description: productDetails.description,
    };
    db.get()
      .collection(nameCollection.PRODUCT_COLLECTIONS)
      .insertOne(product)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },
  getAllProduct: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(nameCollection.PRODUCT_COLLECTIONS)
        .find()
        .toArray();
      resolve(products);
    });
  },

  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(nameCollection.PRODUCT_COLLECTIONS)
        .removeOne({ _id: ObjectId(productId) })
        .then((response) => {
          resolve(productId);
        });
    });
  },
  editProduct: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(nameCollection.PRODUCT_COLLECTIONS)
        .findOne({ _id: ObjectId(productId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  updateProduct: (proId, productDeatials) => {
    console.log(proId);
    console.log(productDeatials);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(nameCollection.PRODUCT_COLLECTIONS)
        .updateOne(
          { _id: ObjectId(proId) },
          {
            $set: {
              name: productDeatials.name,
              price: parseInt(productDeatials.price),
              description: productDeatials.description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  // searchProduct: (data) => {
  //   console.log(data);
  //   return new Promise(async (resolve, reject) => {
  //     let searchData = await db
  //       .get()
  //       .collection(nameCollection.USER_COLLECTION)
  //       .find({
  //         $text: { $search: `"${data}"` },
  //       }).toArray()
  //       console.log(searchData);
  //   });
  // },
};
