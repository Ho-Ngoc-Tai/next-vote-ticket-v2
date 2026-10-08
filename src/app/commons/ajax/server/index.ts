import ServiceService from "./service";

const serverAjax = new ServiceService({
  defaults: {
    baseURL: process.env.CORE_API_DOMAIN,
    // withCredentials: true, // Ensure cookies are sent with requests
  },
  prefix: "/",
});

const get = (...args: Parameters<typeof serverAjax.get>) => serverAjax.get(...args);

const post = (...args: Parameters<typeof serverAjax.post>) => serverAjax.post(...args);

const put = (...args: Parameters<typeof serverAjax.put>) => serverAjax.put(...args);

const patch = (...args: Parameters<typeof serverAjax.patch>) => serverAjax.patch(...args);

const ajaxDelete = (...args: Parameters<typeof serverAjax.delete>) => serverAjax.delete(...args);

export { get, post, put, patch, ajaxDelete };
