import axios, { AxiosRequestConfig } from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:97.0) Gecko/20100101 Firefox/97.0";
const REFERER = "https://app.memrise.com/";

const AXIOS_CONFIG: AxiosRequestConfig = {
  headers: {
    "user-agent": USER_AGENT,
    "content-type": "application/json",
    referer: REFERER,
  },
};

type ObjectResponse = {
  [k: string | number | symbol]: ObjectResponse | any | undefined;
};

export class Session {
  private readonly _axios;
  private readonly _jar;
  private _csrf: string | undefined;

  constructor() {
    this._jar = new CookieJar();

    this._axios = wrapper(axios.create({ ...AXIOS_CONFIG, jar: this._jar }));
  }

  public async get(url: string) {
    return new Promise<ObjectResponse | string>(async (resolve, reject) => {
      const res = await this._axios.get(url);
      const data = res.data;

      resolve(data);
    });
  }

  public post(url: string, payload?: object) {
    return new Promise<ObjectResponse | string>(async (resolve, reject) => {
      const res = this._axios
        .post(url, payload)
        .then((res) => {
          const data = res.data;
          resolve(data);
        })
        .catch((reason) => {
          reject(reason);
        });
    });
  }

  public setCsrf(csrf: string) {
    this._axios.defaults.headers.common["x-csrftoken"] = csrf;
  }
}

export abstract class SessionContainer {
  protected _session: Session;

  constructor(session: Session) {
    this._session = session;
  }
}
