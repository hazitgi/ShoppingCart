// function searchdata() {
//   // var searchKey = document.getElementById("searchBox").value;
//   // console.log(searchKey);
//   // fetch(`/admin/searchData`, {
//   //   headers: {
//   //     Accept: "application/json",
//   //     "Content-Type": "application/json",
//   //   },
//   //   method: "post",
//   //   body: JSON.stringify({
//   //     searchKey
//   //   }),
//   // })
//   // // .then((data) => {
//   // //   console.log(data);
//   // // });
// }
$(document).ready(function () {
  $("#view-users").DataTable();
});
$(document).ready(function () {
  $("#view-products").DataTable();
});
