const { response } = require("express");
var express = require("express");
const { Db } = require("mongodb");
const { resolve } = require("promise");
var router = express.Router();
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");

// Middleware for Cheching user Do Loggin
const userLoginedOrNot = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/user_login");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  let SessionUser = req.session.user;
  let cartCount = null;
  if (SessionUser) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  productHelpers.getAllProduct().then((Product) => {
    res.render("users/users-home", {
      Product,
      SessionUser,
      cartCount,
    });
  });
});

router.get("/user_login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("users/user_login", { loginError: req.session.userLoginError });
    req.session.userLoginError = null;
  }
});

router.post("/user_login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.userLoggedIn = true;
      res.redirect("/");
    } else {
      req.session.userLoginError = "Invalid Username or Password";
      res.redirect("/user_login");
    }
  });
});
router.get("/user_signOut", (req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;
  res.redirect("/");
});

router.get("/user_signup", (req, res) => {
  res.render("users/user_signup", {
    signUpErr: req.session.signUpErr,
    signUpErrClass: req.session.signUpErrClass,
  });
  req.session.signUpErr = null;
  req.session.signUpErrClass = null;
  req.session.signUpErrClass = null;
});
router.post("/user_signup", async (req, res) => {
  let user = await userHelpers.validateUserEamil(req.body.email);
  console.log(`user : ${user}`);
  if (req.body.email != user) {
    userHelpers.doSignup(req.body).then((response) => {
      req.session.user = response;
      req.session.userLoggedIn = true;
      res.redirect("/user_login");
    });
  } else {
    req.session.signUpErr = "Email Already Exisit";
    req.session.signUpErrClass = "signUpErrClass";
    res.redirect("/user_signup");
  }
});

// user Cart
router.get("/user_cart", userLoginedOrNot, async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id);
  let total = await userHelpers.getTotalAmount(req.session.user._id);
  // let SessionUser = req.session.user;
  if (products) {
    res.render("users/user_cart", {
      SessionUser: req.session.user,
      products,
      total,
    });
  } else {
    res.render("users/user_cart", { SessionUser: req.session.user });
  }
});

// produtct add to cart using a tag
// router.get("/add-to-cart/:id", userLoginedOrNot, (req, res) => {
//   userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
//     res.redirect("/");

//   });
// });

// using Ajax
router.get("/add-to-cart/:id", userLoginedOrNot, (req, res) => {
  // console.log("api called");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});

// change-product-quantity
router.post("/change-product-quantity", (req, res, next) => {
  console.log(req.body.quantity);
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user);
    res.json(response);
  });
});

router.get("/delete-product-from-cart/:cartId/:proId", (req, res, next) => {
  userHelpers.deleteProductFromCart(req.params).then((response) => {
    res.json(response);
  });
});

router.get("/place-order", userLoginedOrNot, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id);
  res.render("users/place-order", { total, SessionUser: req.session.user });
});

router.post("/place-order", async (req, res) => {
  // console.log(req.body);
  let products = await userHelpers.getCartProductList(req.body.userId);
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
  userHelpers.placeOrder(req.body, products, totalPrice).then((response) => {
    res.json({ status: true });
  });
});

router.get("/order-success", userLoginedOrNot, (req, res) => {
  res.render("users/order-success", { SessionUser: req.session.user });
});

router.get("/orders", userLoginedOrNot, async (req, res) => {
  let userOrders = await userHelpers.getUserOrders(req.session.user._id);
  // console.log(userOrders[0]);

  res.render("users/orders", {
    SessionUser: req.session.user,
    userOrders,
  });
});

router.get("/view-ordered-products/:id", async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id);
  console.log(products);
  res.render("users/view-orders-products", {
    SessionUser: req.session.user,
    products,
  });
});

module.exports = router;
