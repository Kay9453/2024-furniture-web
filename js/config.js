const baseUrl = "https://livejs-api.hexschool.io/";
const apiPath = "kaka945";

// 前台
const customerAPI = `${baseUrl}api/livejs/v1/customer/${apiPath}`;

// 後台
const token = "blHG9RlLLxTjovhWFFBymjJntdB2";
const adminAPI = `${baseUrl}api/livejs/v1/admin/${apiPath}`;
const headers = {
    headers:{
        authorization: token
    }
};

const adminInstance = axios.create({
    baseURL: adminAPI,
    headers: {
        authorization: token
    }
  });