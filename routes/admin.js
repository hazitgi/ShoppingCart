const { response } = require("express");
var express = require("express");
const { resolve, reject } = require("promise");
var router = express.Router();
const fileSystem = require("fs");
// const { vegitableProduct, fruitsProduct } = require("./products");
const productHelpers = require("../helpers/product-helpers");
const adminHelpers = require("../helpers/admin-helpers");
const userHelpers = require("../helpers/user-helpers");

const verifyAdmin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};
// home
router.get("/", verifyAdmin, function (req, res, next) {
  productHelpers.getAllProduct().then((product) => {
    res.render("admin/view-products", {
      admin: true,
      product,
      AdminSession: req.session.admin,
    });
  });
});
// login get
router.get("/login", (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect("/admin");
  } else {
    res.render("admin/admin-login", {
      admin: true,
      adminLoginError: req.session.adminLoginError,
    });
    req.session.adminLoginError = false;
  }
});
// login post
router.post("/login", (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminLoggedIn = true;
      req.session.admin = response.admin;
      res.redirect("/admin");
    } else {
      req.session.adminLoginError = "Invalid Username or Password";
      res.redirect("/admin/login");
    }
  });
});
// sign out
router.get("/admin_signOut", (req, res) => {
  req.session.admin = null;
  req.session.adminLoggedIn = false;
  res.redirect("/admin");
});

router.get("/add-product", verifyAdmin, (req, res) => {
  res.render("admin/add-product", {
    admin: true,
    AdminSession: req.session.admin,
  });
});

router.post("/add-product", (req, res) => {
  let image = req.files.img;
  productHelpers.addProduct(req.body, (id) => {
    console.log(id);
    image.mv(`./public/images/product_images/${id}.jpg`, (err, done) => {
      if (err) {
        console.log(`Product Can't Add : ${err}`);
      } else {
        console.log(`Product Added Successfuly`);
        res.redirect("/admin");
      }
    });
  });
});
router.get("/delete_product/:id", verifyAdmin, (req, res) => {
  let ProId = req.params.id;
  productHelpers.deleteProduct(ProId).then((productId) => {
    fileSystem.unlink(
      `./public/images/product_images/${productId}.jpg`,
      (err) => {
        console.log(err);
      }
    );
    res.redirect("/admin");
  });
});

router.get("/edit_Product/:id", verifyAdmin, (req, res) => {
  let ProId = req.params.id;
  productHelpers.editProduct(ProId).then((product) => {
    res.render("admin/edit-product", {
      admin: true,
      product,
      AdminSession: req.session.admin,
    });
  });
});

router.post("/edit-product/:id", (req, res) => {
  id = req.params.id;
  proDetails = req.body;
  productHelpers.updateProduct(id, proDetails).then(() => {
    if (req.files) {
      let image = req.files.img;
      image.mv(`./public/images/product_images/${id}.jpg`);
    }
    res.redirect("/admin");
  });
});
router.get("/users", verifyAdmin, (req, res) => {
  adminHelpers.getUsers().then((users) => {
    let ab = "ab";
    res.render("admin/view-users", {
      admin: true,
      users,
      AdminSession: req.session.admin,
      ab,
    });
  });
});

router.get("/edit_user/:id", verifyAdmin, async (req, res) => {
  var userData = await adminHelpers.getOneUser(req.params.id);
  console.log(userData);
  res.render("admin/edit-user-account", {
    admin: true,
    userData,
    AdminSession: req.session.admin,
  });
});

router.post("/edit_user/:id", (req, res) => {
  console.log(req.body);
  adminHelpers.updateUserData(req.body, req.params.id).then((response) => {
    res.redirect("/admin/users");
  });
});

router.get("/delete_user/:id", verifyAdmin, (req, res) => {
  adminHelpers.deleteUser(req.params.id).then(() => {
    res.redirect("/admin/users");
  });
});

router.get("/add-user", verifyAdmin, (req, res) => {
  res.render("admin/add-user", {
    admin: true,
    AdminSession: req.session.admin,
  });
});

router.post("/user_signup", (req, res) => {
  console.log("sdf");
  userHelpers.doSignup(req.body).then((response) => {
    res.redirect("/admin/users");
  });
});

// router.post("/searchData", (req, res) => {
//   // console.log("sadfas");
//   // console.log(req.body);
//   productHelpers.searchProduct(req.body).then((response) => {
//     // res.json(response);
//   });
// });
module.exports = router;
