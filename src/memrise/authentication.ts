import { SessionContainer } from "./session";
import assert from "assert";
import { JSDOM } from "jsdom";
import Url from "./url";

export class Authentication extends SessionContainer {
  private async _get_oauth() {
    const page = await this._session.get(Url.OAUTH);
    assert(typeof page === "string", "Page is not a string");

    const dom = new JSDOM(page);
    const nextData = dom.window.document.getElementById("__NEXT_DATA__")?.innerHTML;
    assert(typeof nextData === "string", "Data is not string");

    const config = JSON.parse(nextData)?.runtimeConfig;
    const oauth = config?.OAUTH_CLIENT_ID;
    assert(typeof oauth === "string", "OAuth is not string");

    return oauth;
  }

  public async login(username: string, password: string, accessToken?: string) {
    const oauth = this._get_oauth();
    const access_token =
      typeof accessToken === "string" ? accessToken : await this._get_access_token(username, password, await oauth);

    await this._session.get(`${Url.LOGIN}${access_token}`);
  }

  private async _get_access_token(username: string, password: string, oauth: string) {
    const res = await this._session.post(Url.ACCESS_TOKEN, {
      username: username,
      password: password,
      grant_type: "password",
      client_id: oauth,
    });
    assert(typeof res === "object");

    const token = res.access_token?.access_token;
    assert(typeof token === "string");

    return token;
  }
}
