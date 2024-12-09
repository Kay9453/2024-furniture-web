// 取得產品列表
let productData = [];

function getProduct() {
  axios
    .get(`${customerAPI}/products`)
    .then((res) => {
      productData = res.data.products;
      renderProduct(productData);
    })
    .catch((err) => {
      console.log(err.message);
    });
}

const productWrap = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");

// 篩選產品
function filterProduct(value) {
  const result = []; //存放篩選後的資料用
  productData.forEach((item) => {
    if (item.category === value) {
      result.push(item);
    }
    // 如果 value 值為全部，就把每個 item 都加進去篩選陣列裡
    if (value === "全部") {
      result.push(item);
    }
  });
  renderProduct(result);
}

// 渲染產品
function renderProduct(data) {
  let str = "";
  data.forEach((item) => {
    str += `
        <li class="productCard">
          <h4 class="productType">新品</h4>
          <img
            src="${item.images}"
            alt=""
          />
          <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
          <h3>${item.title}</h3>
          <del class="originPrice">NT$${formatNumber(item.origin_price)}</del>
          <p class="nowPrice">NT$${formatNumber(item.price)}</p>
        </li>`;
  });
  productWrap.innerHTML = str;
}

productSelect.addEventListener("change", (e) => {
  e.preventDefault(); //取消跳轉行為
  filterProduct(e.target.value);
});

//取得購物車列表

let cartData = [];
let cartTotal = 0;

function getCart() {
  axios
    .get(`${customerAPI}/carts`)
    .then((res) => {
      cartData = res.data.carts;
      cartTotal = res.data.finalTotal;
      renderCart();
    })
    .catch((err) => {
      console.log(err);
    });
}

// 加入購物車
function addCart(id) {
  const addCardBtns = document.querySelectorAll(".addCardBtn");
  addCardBtns.forEach((item) => {
    item.classList.add("disabled");
  });
  // const data = {
  //   data: {
  //     productId: id,
  //     quantity: 1,
  //   },
  // };
  // axios
  //   .post(`${customerAPI}/carts`, data)
  //   .then((res) => {
  //     cartData = res.data.carts;
  //     cartTotal = res.data.finalTotal;
  //     renderCart();
  //     Toast.fire({
  //       icon: "success",
  //       title: "商品已成功加入購物車",
  //     });
  //     addCardBtns.forEach((item) => {
  //       item.classList.remove("disabled");
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  let existingProduct = null;
  // 判斷購物車中是否已經有該商品
  cartData.forEach((item) => {
    if (item.product.id === id) {
      existingProduct = item;
    }
  });

  // 若商品已存在，更新數量
  if (existingProduct) {
    let newQty = existingProduct.quantity + 1;
    updateCart(existingProduct.id, newQty);
    Toast.fire({
      icon: "success",
      title: "商品已成功加入購物車",
    });
    // 設定延遲移除禁用狀態，等待 Toast 結束
    setTimeout(() => {
      addCardBtns.forEach((item) => {
        item.classList.remove("disabled");
      });
    }, 1000);
  } else {
    // 若商品不存在，新增至購物車
    const data = {
      data: {
        productId: id,
        quantity: 1,
      },
    };
    axios
      .post(`${customerAPI}/carts`, data)
      .then((res) => {
        cartData = res.data.carts;
        cartTotal = res.data.finalTotal;
        renderCart();
        Toast.fire({
          icon: "success",
          title: "商品已成功加入購物車",
        });
        // 設定延遲移除禁用狀態，等待 Toast 結束
        setTimeout(() => {
          addCardBtns.forEach((item) => {
            item.classList.remove("disabled");
          });
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

// 監聽產品列表加入購物車按鈕
productWrap.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.classList.contains("addCardBtn")) {
    addCart(e.target.dataset.id);
  }
});

// 刪除所有購物車的內容

const discardAllBtn = document.querySelector(".discardAllBtn");

function deleteAllCart() {
  Swal.fire({
    title: "你確定要刪除所有品項?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "刪除",
    cancelButtonText: "取消",
  }).then((result) => {
    if (result.isConfirmed) {
      axios.delete(`${customerAPI}/carts`).then((res) => {
        cartData = res.data.carts;
        cartTotal = res.data.finalTotal;
        renderCart();
      });
      // .catch((err) => {
      //   console.log(err);
      // });
      Swal.fire({
        title: "刪除成功",
        text: "您的購物車已清空",
        icon: "success",
      });
    }
  });
}

discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  deleteAllCart();
});

// 刪除購物車內單一商品
function deleteCart(id) {
  axios
    .delete(`${customerAPI}/carts/${id}`)
    .then((res) => {
      cartData = res.data.carts;
      cartTotal = res.data.finalTotal;
      renderCart();
      Toast.fire({
        icon: "success",
        title: "刪除單一商品成功",
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

// 編輯產品數量
function updateCart(id, qty) {
  const data = {
    data: {
      id: id,
      quantity: qty,
    },
  };
  axios
    .patch(`${customerAPI}/carts`, data)
    .then((res) => {
      cartData = res.data.carts;
      cartTotal = res.data.finalTotal;
      renderCart();
    })
    .catch((err) => {
      console.log(err);
    });
}

const shoppingCartTableBody = document.querySelector(
  ".shoppingCart-table tbody"
);

const shoppingCartTableFoot = document.querySelector(
  ".shoppingCart-table tfoot"
);

shoppingCartTableBody.addEventListener("click", (e) => {
  e.preventDefault();
  const id = e.target.closest("tr").getAttribute("data-id");
  // 因為這邊的 e.target 是選到 a 標籤，故需要用判斷式
  if (e.target.classList.contains("removeBtn")) {
    deleteCart(id);
  }

  // 點擊 + 號後，要處理的事
  if (e.target.classList.contains("addBtn")) {
    let result = {};
    cartData.forEach((item) => {
      if (item.id === id) {
        result = item;
      }
    });
    let qty = result.quantity + 1;
    updateCart(id, qty);
  }

  // 點擊 - 號後，要處理的事
  if (e.target.classList.contains("minusBtn")) {
    let result = {};
    cartData.forEach((item) => {
      if (item.id === id) {
        result = item;
        // console.log(result);
      }
    });
    let qty = result.quantity - 1;
    updateCart(id, qty);
  }
});

shoppingCartTableFoot.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.classList.contains("discardAllBtn")) {
    deleteAllCart();
  }
});

// 渲染購物車
function renderCart() {
  if (cartData.length === 0) {
    shoppingCartTableBody.innerHTML = "購物車沒有商品";
    shoppingCartTableFoot.innerHTML = "";
    return;
  }
  let str = "";
  cartData.forEach((item) => {
    str += `<tr data-id="${item.id}">
              <td>
                <div class="cardItem-title">
                  <img src="${item.product.images}" alt="" />
                  <p>${item.product.title}</p>
                </div>
              </td>
              <td>NT$${formatNumber(item.product.price)}</td>
              <td>
                <button type="button" class="minusBtn">-</button>
                ${item.quantity}
                <button type="button" class="addBtn">+</button>
              </td>
              <td>NT$${formatNumber(item.product.price * item.quantity)}</td>
              <td class="discardBtn">
                <a href="#" class="material-icons removeBtn"> clear </a>
              </td>
            </tr>`;
  });
  shoppingCartTableBody.innerHTML = str;
  shoppingCartTableFoot.innerHTML = `<tr>
              <td>
                <a href="#" class="discardAllBtn">刪除所有品項</a>
              </td>
              <td></td>
              <td></td>
              <td>
                <p>總金額</p>
              </td>
              <td>NT$${formatNumber(cartTotal)}</td>
            </tr>`;
}

const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");

const orderInfoBtn = document.querySelector(".orderInfo-btn");

const orderInfoForm = document.querySelector(".orderInfo-form");

function checkForm() {
  const constraints = {
    姓名: {
      presence: { message: "^必填" },
    },
    電話: {
      presence: { message: "^必填" },
      length: {
        is: 10,
        message: "^長度須為 10 碼",
      },
    },
    Email: {
      presence: { message: "^必填" },
      format: {
        pattern:
          /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/,
        message: "^請輸入正確的信箱格式",
      },
    },
    寄送地址: {
      presence: { message: "^必填" },
    },
  };

  // 清空所有錯誤訊息
  const resetMessage = document.querySelectorAll("[data-message]");
  resetMessage.forEach((item) => {
    item.textContent = "";
  });

  const errors = validate(orderInfoForm, constraints);
  console.log(errors);
  if (errors) {
    const errorsArr = Object.keys(errors);
    console.log(errorsArr);
    errorsArr.forEach((item) => {
      const message = document.querySelector(`[data-message="${item}"]`);
      message.textContent = errors[item][0];
      console.log(errors[item][0]);
    });
  }
  return errors;
}

function sendOrder() {
  if (cartData.length === 0) {
    Swal.fire("購物車不得為空!");
    return;
  }
  if (checkForm()) {
    // Swal.fire("還有欄位沒有填寫呦!");
    return;
  }
  let data = {
    data: {
      user: {
        name: customerName.value.trim(),
        tel: customerPhone.value.trim(),
        email: customerEmail.value.trim(),
        address: customerAddress.value.trim(),
        payment: tradeWay.value,
      },
    },
  };
  axios
    .post(`${customerAPI}/orders`, data)
    .then((res) => {
      orderInfoForm.reset();
      // location.reload();
      Toast.fire({
        icon: "success",
        title: "訂單已成功送出",
      });
      getCart(); //預定資料送出，刷新購物車的資料使用
    })
    .catch((err) => {
      console.log(err);
    });
}

orderInfoBtn.addEventListener("click", (e) => {
  e.preventDefault();
  sendOrder();
});

// 初始化
function init() {
  getProduct();
  getCart();
}

init();
