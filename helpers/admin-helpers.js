const { response } = require("express");
const { Db } = require("mongodb");
const Promise = require("promise");
const db = require("../configuration/dataBaseConnection");
const nameCollection = require("../configuration/collection");
const { resolve, reject } = require("promise");
const ObjectId = require("mongodb").ObjectID;
const Bycript = require("bcrypt");

module.exports = {
  doLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let adminLoginStatus = false;
      let response = {};
      let admin = await db
        .get()
        .collection(nameCollection.ADMIN_COLLECTION)
        .find()
        .toArray();
      if (
        adminData.username == admin[0].username &&
        adminData.password == admin[0].password
      ) {
        console.log(`Login Success`);
        response.admin = admin;
        response.status = true;
        resolve(response);
      } else {
        console.log("Login Failed");
        resolve({ status: false });
      }
    });
  },
  getUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(nameCollection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },
  getOneUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(nameCollection.USER_COLLECTION)
        .find({ _id: ObjectId(userId) })
        .toArray();
      // console.log(user);
      resolve(user[0]);
    });
  },
  updateUserData: (userData, userId) => {
    return new Promise(async (resolve, reject) => {
      // console.log(userData, userId);
      userData.password = await Bycript.hash(userData.password, 10);
      db.get()
        .collection(nameCollection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              username: userData.username,
              mobile: userData.mobile,
              email: userData.email,
              password: userData.password,
            },
          }
        )
        .then((response) => {
          // console.log(response);
          resolve();
        });
    });
  },
  deleteUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(nameCollection.USER_COLLECTION)
        .deleteOne({ _id: ObjectId(userId) }).then((response)=>{
          // console.log(response);
          resolve()
        })
    });
  },
};
