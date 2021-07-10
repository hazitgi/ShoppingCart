let count = document.querySelector("#cart-count");
// let countValue = document.querySelector("#cart-count").innerHTML;
addToCart = (proId) => {
  // using AJAX
  $.ajax({
    url: `/add-to-cart/${proId}`,
    method: "get",
    success: (response) => {
      console.log(response);
      if (response.status) {
        let count = $("#cart-count").html();
        count = parseInt(count) + 1;
        $("#cart-count").html(count);
      }
    },
  });

  // using Fetch
  // fetch(`/add-to-cart/${proId}`, { method: "get" }).then((response) => {
  //   if (response.status) {
  //     newCount = parseInt(count.innerHTML) + 1;
  //     console.log(newCount);
  //     count.innerHTML = newCount;
  //   }
  // });
};

changeQuantity = (cartId, proId, userId, count) => {
  let quantity = document.getElementById(proId).innerHTML;
  count = parseInt(count);
  // $.ajax({
  //   url: `/change-product-quantity`,
  //   data: {
  //     user: userId,
  //     cart: cartId,
  //     product: proId,
  //     count: count,
  //     quantity: quantity,
  //   },
  //   method: "post",
  //   success: (response) => {
  // if (response.removeProduct) {
  //   alert("Product removed from cart");
  //   location.reload();
  // } else {
  //   console.log(response);
  //   document.getElementById(proId).innerHTML = parseInt(quantity) + count;
  //   document.getElementById('total').innerText = response.total;
  // }
  //   },
  // });

  fetch("/change-product-quantity", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "post",
    body: JSON.stringify({
      user: userId,
      cart: cartId,
      product: proId,
      count: count,
      quantity: quantity,
    }),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.removeProduct) {
        alert("Product removed from cart");
        location.reload();
      } else {
        console.log(response);
        document.getElementById(proId).innerHTML = parseInt(quantity) + count;
        document.getElementById("total").innerText = response.total;
      }
    });
};

deleteProductFromCart = (cartId, proId, productName) => {
  var result = confirm(`Do you want to delete ${productName} from cart ? `);
  if (result) {
    fetch(`/delete-product-from-cart/${cartId}/${proId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.removeCart) {
          // alert("Product Removed From Cart");
          location.reload();
        }
      });
  }
};
$(document).ready(function () {
  $("#checkout-form").submit((action) => {
    action.preventDefault();
    $.ajax({
      url: "/place-order",
      method: "post",
      data: $("#checkout-form").serialize(),
      success: (response) => {
        alert("Product Orderd Successfuly");
        if (response.status) {
          location.href = "/order-success";
        }
      },
    });
  });
});

$(document).ready(function () {
  $("#view-cart").DataTable();
});
