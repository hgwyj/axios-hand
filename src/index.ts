import parse from 'parse-headers';
import qs from 'qs';

type method = 'get' | 'post' | 'delete' | 'options';

interface AxiosConfig {
    method: method;
    url: string;
    timeout: number;
    withCredentials: boolean;
    data: Record<string, any>;
}

class Axios {
    request(config: AxiosConfig) {
        return this.dispatchRequest(config);
    }
    dispatchRequest(config: AxiosConfig) {
        return new Promise((reslove, reject) => {
            let { method = 'get', url, data, timeout, withCredentials } = config;
            const xhr = new XMLHttpRequest();
            if (url) {
                const paramsString = qs.stringify(data);
                url = url + (url.indexOf('?') == -1 ? '?' : '&') + paramsString;
            }
            xhr.open(method, url, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = {
                            data: xhr.response,
                            status: xhr.status,
                            headers: parse(xhr.getAllResponseHeaders()),
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

export default axios;