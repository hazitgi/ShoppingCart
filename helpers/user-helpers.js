const db = require("../configuration/dataBaseConnection");
const nameCollection = require("../configuration/collection");
const Bycript = require("bcrypt");
const { resolve, reject } = require("promise");
const { response } = require("express");
const ObjectId = require("mongodb").ObjectID;

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.password = await Bycript.hash(userData.password, 10);
      db.get()
        .collection(nameCollection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve(data.ops[0]);
        });
    });
  },
  validateUserEamil: (userEmail) => {
    // console.log(userEmail);
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(nameCollection.USER_COLLECTION)
        .findOne({ email: userEmail });
      if (user) {
        resolve(user.email);
      } else {
        resolve();
      }
    });
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(nameCollection.USER_COLLECTION)
        .findOne({ email: userData.email });
      // console.log(user);
      if (user) {
        Bycript.compare(userData.password, user.password).then((status) => {
          if (status) {
            console.log(`Login Success`);
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("Login Failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("Login Failed");
        resolve({ status: false });
      }
    });
  },
  addToCart: (proId, userId) => {
    let ProObj = {
      item: ObjectId(proId),
      qty: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(nameCollection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      if (userCart) {
        // console.log(userCart);

        let productExist = userCart.products.findIndex(
          (product) => product.item == proId
        );
        // console.log(productExist);
        if (productExist != -1) {
          db.get()
            .collection(nameCollection.CART_COLLECTION)
            .updateOne(
              {
                user: ObjectId(userId),
                "products.item": ObjectId(proId),
              },
              {
                $inc: { "products.$.qty": 1 },
              }
            )
            .then(() => resolve());
        } else {
          db.get()
            .collection(nameCollection.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId) },
              { $push: { products: ProObj } }
            )
            .then(() => resolve());
        }
      } else {
        let user = ObjectId(userId);
        let products = [ProObj];
        db.get()
          .collection(nameCollection.CART_COLLECTION)
          .insertOne({ user, products })
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(nameCollection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.qty",
            },
          },
          {
            $lookup: {
              from: nameCollection.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      if (cartItems) {
        // console.log(cartItems);
        resolve(cartItems);
      } else {
        resolve();
      }
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = null;
      let cart = await db
        .get()
        .collection(nameCollection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },

  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
    return new Promise(async (resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        await db
          .get()
          .collection(nameCollection.CART_COLLECTION)
          .updateOne(
            { _id: ObjectId(details.cart) },
            {
              $pull: { products: { item: ObjectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(nameCollection.CART_COLLECTION)
          .updateOne(
            {
              _id: ObjectId(details.cart),
              "products.item": ObjectId(details.product),
            },
            {
              $inc: { "products.$.qty": details.count },
            }
          )
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },
  deleteProductFromCart: ({ cartId, proId }) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(nameCollection.CART_COLLECTION)
        .updateOne(
          { _id: ObjectId(cartId) },
          {
            $pull: { products: { item: ObjectId(proId) } },
          }
        )
        .then((response) => {
          resolve({ removeCart: true });
        });
    });
  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let totalAmout = await db
        .get()
        .collection(nameCollection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.qty",
            },
          },
          {
            $lookup: {
              from: nameCollection.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },

          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: ["$quantity", "$product.price"],
                },
              },
            },
          },
        ])
        .toArray();
      // console.log(totalAmout[0].total);
      resolve(totalAmout[0].total);
    });
  },

  placeOrder: (order, product, total) => {
    return new Promise((resolve, reject) => {
      // console.log(order);
      // console.log(product);
      // console.log(total);
      let status = order.paymentMethod == "COD" ? "Order Placed" : "Pending";
      let orders = {
        deliveryDetails: {
          name: order.fullName,
          mobile: order.mbile,
          address: order.address,
        },
        user: ObjectId(order.userId),
        paymentMethod: order.paymentMethod,
        product: product,
        totalAmount: total,
        status: status,
        date: new Date(),
      };
      // console.log(orders);
      db.get()
        .collection(nameCollection.ORDER_COLLECTION)
        .insertOne(orders)
        .then((response) => {
          db.get()
            .collection(nameCollection.CART_COLLECTION)
            .deleteOne({ user: ObjectId(order.userId) });
          resolve();
        });
    });
  },
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      var cart = await db
        .get()
        .collection(nameCollection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      // console.log(cart.products);
      resolve(cart.products);
    });
  },
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      // console.log(userId);
      let orders = await db
        .get()
        .collection(nameCollection.ORDER_COLLECTION)
        .find({ user: ObjectId(userId) })
        .toArray();
      // console.log(orders);
      resolve(orders);
    });
  },

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(nameCollection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: ObjectId(orderId) },
          },
          {
            $unwind: "$product",
          },
          {
            $project: {
              item: "$product.item",
              quantity: "$product.qty",
              amount: "$totalAmount",
            },
          },
          {
            $lookup: {
              from: nameCollection.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              name: "$product.name",
              price: "$product.price",
              img: "$product._id",
              quantity: "$quantity",
              totalAmount: "$amount",
            },
          },
        ])
        .toArray();
      // console.log(orderItems);
      resolve(orderItems);
    });
  },
};
