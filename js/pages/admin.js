let orderData = [];
const orderPageTableBody = document.querySelector('.orderPage-table tbody');

// 取後台訂單資料
function getOrders(){
    adminInstance.get("/orders")
    .then(res=>{
        orderData = res.data.orders;
        orderData.sort((a,b)=>{
            return b.createdAt - a.createdAt;
        });
        renderOrders();
        // calcProductCategory();
        calcProductTitle();
    }).catch(err=>{
        console.log(err);
    });
}

// 渲染後台訂單資料
function renderOrders(){
    let str = "";
    orderData.forEach(order=>{
        let productStr = "";
        order.products.forEach(product=>{
            productStr += `<p>${product.title} x ${product.quantity}</p>`;
        });
        str += `<tr data-id="${order.id}">
            <td>${order.id}</td>
            <td>
              <p>${order.user.name}</p>
              <p>${order.user.tel}</p>
            </td>
            <td>${order.user.address}</td>
            <td>${order.user.email}</td>
            <td>
              ${productStr}
            </td>
            <td>${formatTime(order.createdAt)}</td>
            <td class="orderStatus">
              <a href="#">${ order.paid ? `<span class="orderStatus-Btn" style="color:green">已處理</span>` : `<sapn class="orderStatus-Btn" style="color:red">未處理</span>`}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn" value="刪除">
            </td>
          </tr>`
    });
    orderPageTableBody.innerHTML = str;
}

// 時間格式化
function formatTime(timestamp){
    const time = new Date( timestamp * 1000);
    // 方法一
    // return `${time.getFullYear()}/${String(time.getMonth()+1).padStart(2,0)}/${String(time.getDate()).padStart(2,0)} ${String(time.getHours()).padStart(2,0)}:${time.getMinutes()}:${String(time.getSeconds()).padStart(2,0)}`;
    // 方法二
    return time.toLocaleString('zh-TW',{hour12: false});
}

// 刪除單筆訂單
function deleteSingleOrder(id){
    adminInstance.delete(`/orders/${id}`)
    .then(res=>{
        orderData = res.data.orders;
        renderOrders();
    }).catch(err=>{
        console.log(err);
    });
}

// 修改訂單狀態
function updateOrderStatus(id){
    let result = {};
    orderData.forEach(order=>{
        if (order.id === id){
            result = order;
        }
    });
    console.log(result);
    const data = {
        "data": {
          "id": id,
          "paid": !result.paid
        }
      }
    adminInstance.put("/orders",data)
    .then(res => {
        orderData = res.data.orders;
        renderOrders();
    }).catch(err => {
        console.log(err);
    });
}

// LV1. 全產品類別營收比重
//1. 組成資料
//2. 渲染圖表
function calcProductCategory(){
    const resultObj = {};
    orderData.forEach( order => {
        // console.log(order);
        order.products.forEach(product => {
            if (resultObj[product.category] === undefined){
                resultObj[product.category] = product.price * product.quantity;
            } else {
                resultObj[product.category] += product.price * product.quantity;
            }
        });
    });
    renderChart(Object.entries(resultObj));     //Object.entries(resultObj) 為物件轉陣列，因為 c3.js 的資料格式是 [[],[]]
}

//LV2：全品項營收比重，類別含四項，篩選出前三名營收品項，其他 4~8 名都統整為「其它」
//1. 組成資料
//2. 渲染圖表
function calcProductTitle(){
    const resultObj = {};
    orderData.forEach( order => {
        order.products.forEach(product => {
            if (resultObj[product.title] === undefined){
                resultObj[product.title] = product.price * product.quantity;
            } else {
                resultObj[product.title] += product.price * product.quantity;
            }
        });
    });
    const resultArr = Object.entries(resultObj);
    const sortResultArr = resultArr.sort((a,b) => {
        return b[1] - a[1];     //由大排到小
    });
    
    const rankOfThree = [];
    let otherTotal = 0;
    sortResultArr.forEach((product,index) =>{
        if (index <= 2){
            rankOfThree.push(product);
        }
        if (index > 2){
            otherTotal += product[1];
        }
    });

    if ( sortResultArr.length > 3){
        rankOfThree.push(['其他',otherTotal]);
    }
    
    renderChart(rankOfThree);
}

// 監聽圖表類型，產生圖表 - 預設顯示"全品項營收比重"
const chartOption = document.querySelector('.chartOption');
const sectionTitle = document.querySelector('.section-title');

chartOption.addEventListener('change',(e)=>{
    if( chartOption.value === "全產品類別營收比重"){
        sectionTitle.textContent = "全產品類別營收比重";
        calcProductCategory();
    } else {
        sectionTitle.textContent = "全品項營收比重";
        calcProductTitle();
    }
});

// 事件代理監聽 - 刪除單筆 & 更新訂單狀態
orderPageTableBody.addEventListener('click',(e)=>{
    e.preventDefault();
    // 找尋點擊刪除按鈕後離他最近的 tr 的 data-id
    const id = e.target.closest('tr').getAttribute('data-id');
    if (e.target.classList.contains('delSingleOrder-Btn')){
        deleteSingleOrder(id);
    }
    if (e.target.classList.contains('orderStatus-Btn')){
        updateOrderStatus(id);
    }
})


// 刪除全部訂單
function deleteAllOrder(){
    adminInstance.delete("/orders")
    .then(res=>{
        orderData = res.data.orders;
        renderOrders();
    }).catch(err=>{
        console.log(err);
    });
}

const discardAllBtn = document.querySelector('.discardAllBtn');

discardAllBtn.addEventListener('click',(e)=>{
    e.preventDefault();
    deleteAllOrder();
});

// 初始化
function init(){
    getOrders();
}

init();

// C3.js
function renderChart(data){
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        color: {
            pattern: ['#DACBFF', '#9D7FEA', '#5434A7', '#301E5F']
        },
        data: {
            type: "pie",
            columns: data,
            // colors:{
            //     "Louvre 雙人床架":"#DACBFF",
            //     "Antony 雙人床架":"#9D7FEA",
            //     "Anty 雙人床架": "#5434A7",
            //     "其他": "#301E5F",
            // }
            
        },
    });
}