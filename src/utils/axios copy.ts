import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import md5 from "js-md5";
import qs from "qs";
import { uuid } from "vue-uuid";
import { message } from "./alert";

// 数据返回的接口
// 定义请求响应参数，不含data
interface Result {
  errCode: number;
  errMsg: string;
}

// 请求响应参数，包含data
interface ResultData<T = any> extends Result {
  data?: T;
}

enum RequestEnums {
  TIMEOUT = 20000,
  OVERDUE = 600, // 登录失效
  FAIL = 999, // 请求失败
  SUCCESS = 200, // 请求成功
}
const config = {

  // 设置超时时间
  timeout: RequestEnums.TIMEOUT as number,
  // 跨域时候允许携带凭证
  withCredentials: true,
  //
};

class RequestHttp {
  // 定义成员变量并指定类型
  service: AxiosInstance;
  public constructor(config: AxiosRequestConfig) {
    axios.defaults.withCredentials = true
    config.withCredentials=true
    // 实例化axios
    this.service = axios.create(config);

    /**
     * 请求拦截器
     * 客户端发送请求 -> [请求拦截器] -> 服务器
     * token校验(JWT) : 接受服务器返回的token,存储到vuex/pinia/本地储存当中
     */
    this.service.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        config.withCredentials=true//允许跨域
        const token = localStorage.getItem("token") || "";
        console.log(config)
        config.data.OperationID = md5(uuid.v4())
        return {
          ...config,
          headers: {
            "token": token, // 请求头中携带token信息
            'Content-Type':'application/x-www-form-urlencoded',
          },
        };
      },
      (error: AxiosError) => {
        message.error(JSON.stringify(error));
        // 请求报错
        Promise.reject(error);
      }
    );

    /**
     * 响应拦截器
     * 服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
     */
    this.service.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(response);
        const { data, config } = response; // 解构
        const res = data as ResultData;
        if (res.errCode === 401) {
          // 登录信息失效，应跳转到登录页面，并清空本地的token
          localStorage.setItem("token", "");
          // router.replace({
          //   path: '/login'
          // })
          return Promise.reject(res);
        }
        // 全局错误信息拦截（防止下载文件得时候返回数据流，没有code，直接报错）
        if (res.errCode && res.errCode !== 0) {
          
          message.error(res.errMsg);
          return Promise.reject(res);
        }
        return res;
      },
      (error: AxiosError) => {
        console.log(error)
        const { response } = error;
        const { data, config } = response; // 解构
        const res = data as ResultData;
        if (res.errCode!==0) {
          console.log(res.errMsg);
          this.handleCode(res.errCode,res.errMsg);
        }
        if (!window.navigator.onLine) {
          message.error("网络连接失败");
          // 可以跳转到错误页面，也可以不做操作
          // return router.replace({
          //   path: '/404'
          // });
        }
      }
    );
  }
  handleCode(code: number,msg?:string): void {
    switch (code) {
      case 401:
        message.error("登录失败，请重新登录");

        break;
      default:
        message.error(msg);

        break;
    }
  }

  // 常用方法封装
  get<T>(url: string, params?: object): Promise<ResultData<T>> {
    return this.service.get(url, { params });
  }
  post<T>(url: string, params?: object,config?:AxiosRequestConfig): Promise<ResultData<T>> {
    
    return this.service.post(url, params,config);
  }
  put<T>(url: string, params?: object): Promise<ResultData<T>> {
    return this.service.put(url, params);
  }
  delete<T>(url: string, params?: object): Promise<ResultData<T>> {
    return this.service.delete(url, { params });
  }
}

// 导出一个实例对象
export default new RequestHttp(config);
