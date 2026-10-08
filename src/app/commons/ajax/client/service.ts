import { decryptCryptoJS, shouldEncrypt } from "@commons/utils/crypto.utils";
import AxiosCommon, { AxiosOptions } from "../Axios";

class ClientService extends AxiosCommon {
  constructor(options: AxiosOptions) {
    super(options);

    // handle response
    this.axiosInstance.interceptors.response.use(
      async function (response: any) {
        // Decrypt data if it exists and is a string
        let decryptedData = response.data?.data;
        if (shouldEncrypt()) {
          decryptedData =
            response.data?.data !== undefined && response.data?.data !== null && typeof response.data.data === "string"
              ? JSON.parse(decryptCryptoJS(response.data.data))
              : response.data?.data;
        }
        const res = {
          code: response.data?.code,
          message: response.data?.message,
          success: response.data?.success,
          data: decryptedData,
          ...(response.data?.meta && { meta: response.data.meta }),
        };
        return res;
      },
      async function (error: any) {
        return {
          code: error?.status || error.code || 500,
          message: error.message,
          data: error?.response?.data || error?.data || error,
        };
      }
    );
  }

  // protected override async setHeaders(): Promise<void> {
  //   const token = ""; // TODO: lấy token nếu cần
  //   if (token) {
  //     this.axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  //   }
  // }
  // handle response
}

export default ClientService;
