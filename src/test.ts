import axios from './index';

axios({ 
    method: 'get', 
    url: '/test', 
    data: { username: '123', pass: 123 }, 
    timeout: 1000, 
    withCredentials: false
 }).then((response)=>{
     console.log(response);
 }).catch(err=>console.error(err));