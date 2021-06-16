// const parse = require('parse-headers');
// const qs  = require('qs');


class InterceptorManager {
    interceptors = [];
    use(onFulfilled, onRejected) {
        this.interceptors.push({
            onFulfilled,
            onRejected
        });
        return this.interceptors.length - 1;
    }
    eject(id) {
        if (typeof id === 'number') {
            this.interceptors[id] = null;
        }
    }
}

class Axios {
    interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager(),
    }
    request(config) {
        const chain = [
            {
                onFulfilled: this.dispatchRequest,
                onRejected: undefined,
            }
        ];
        this.interceptors.request.interceptors.forEach(i => {
            i && chain.unshift(i); // 向左添加
        });
        this.interceptors.response.interceptors.forEach(i => {
            i && chain.push(i); // 向右添加
        });
        let promise = Promise.resolve(config);
        while (chain.length) {
            const { onFulfilled, onRejected } = chain.shift();
            promise = promise.then(onFulfilled, onRejected);
        }
        return promise;
    }
    dispatchRequest(config) {
        return new Promise((reslove, reject) => {
            let { method = 'get', url, data, timeout, withCredentials } = config;
            const xhr = new XMLHttpRequest();
            // if (url) {
            //     const paramsString = qs.stringify(data);
            //     url = url + (url.indexOf('?') == -1 ? '?' : '&') + paramsString;
            // }
            xhr.open(method, url, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = {
                            data: xhr.response,
                            status: xhr.status,
                            // headers: parse(xhr.getAllResponseHeaders()),
                            headers: xhr.getAllResponseHeaders(),
                            statusText: xhr.statusText,
                            request: xhr,
                        }
                        // 请求成功
                        reslove(response);
                    }
                } else {
                    reject('fetch error');
                }
            }
            xhr.withCredentials = withCredentials;
            xhr.timeout = timeout;
            xhr.ontimeout = ()=> {
                reject('time out')
            }
            xhr.send();
        });
    }
}
function createInstance() {
    const context = new Axios();
    let instance = Axios.prototype.request.bind(context);
    instance = Object.assign(instance, Axios.prototype, context);
    return instance;
}

const axios = createInstance();

axios.interceptors.request.use((config) => {
    config.data.request  = config.data.request +  '1';
    return config;
 }, (err) => { 
     console.log(err);
 });
const n = axios.interceptors.request.use((config) => {
    config.data.request  = config.data.request +  '2';
    return config;
 }, (err) => { 
     console.log(err);
 });
axios.interceptors.request.use((config) => {
    config.data.request = '3';
    return config;
 }, (err) => { 
     console.log(err);
 });

axios.interceptors.request.eject(n);

axios.interceptors.response.use((config) => {
    config.data.response = '1';
    return config;
 }, (err) => { 
     console.log(err);
 });
axios.interceptors.response.use((config) => {
    config.data.response = config.data.response+ '2';
    return config;
 }, (err) => { 
     console.log(err);
 });
axios.interceptors.response.use((config) => {
    config.data.response = config.data.response+ '3';
    return config;
 }, (err) => { 
     console.log(err);
 });
console.log(axios);


axios({
    methd:'get',
    data:{name:'123',password:123},
    timeout:3000,
    withCredentials:false,
    url:'/test'
}).then((res)=>{
    console.log('res',res)
}).catch(err=>console.error(err));