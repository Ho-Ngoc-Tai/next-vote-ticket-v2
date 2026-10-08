import ClientService from "./service";

const clientAjax = new ClientService({
  defaults: {
    baseURL: "", // Set nếu có API baseURL
  },
  prefix: "/apis", // Optional prefix
});

// Explicit helpers with proper types
const get = <Resp = unknown>(url: string, params?: Record<string, unknown>, options?: object): Promise<any> =>
  clientAjax.get<Resp>(url, params, options);

const post = <Resp = unknown, Req = unknown>(url: string, data: Req, options?: object): Promise<any> =>
  clientAjax.post<Resp, Req>(url, data, options);

const put = <Resp = unknown, Req = unknown>(url: string, data: Req, options?: object): Promise<any> =>
  clientAjax.put<Resp, Req>(url, data, options);

const patch = <Resp = unknown, Req = unknown>(url: string, data: Req, options?: object): Promise<any> =>
  clientAjax.patch<Resp, Req>(url, data, options);

const ajaxDelete = <Resp = unknown>(url: string, data?: any, options?: object): Promise<any> =>
  clientAjax.delete<Resp>(url, data, options);

export { get, post, put, patch, ajaxDelete };
export default clientAjax;
