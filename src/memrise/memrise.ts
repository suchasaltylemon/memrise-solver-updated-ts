import { Session } from "./session";
import { Authentication } from "./authentication";
import { Courses, ICourse } from "./courses";
import { PointsSolver } from "./solvers/pointsSolver";
import Url from "./url";
import assert from "assert";
import { ComposedSolver } from "./solvers/composedSolver";

export class Memrise {
  private readonly _session = new Session();
  private readonly _authentication = new Authentication(this._session);
  private readonly _courses = new Courses(this._session);
  private readonly _solver = new ComposedSolver(this._session);

  public get courses() {
    return this._courses.get_courses();
  }

  private async _update_csrf() {
    const csrf = await this._session.get(Url.CSRF);
    assert(typeof csrf === "object");

    const token = csrf.csrftoken;
    assert(typeof token === "string");

    this._session.setCsrf(token);
  }

  public async login(username: string, password: string, sessionKey?: string) {
    await this._authentication.login(username, password, sessionKey);

    await this._session.get(Url.HOME); // Load cookies
  }

  public async solve(course: ICourse, points: number, timeToSpend: number) {
    await this._update_csrf();
    await this._solver.solve(course, points, timeToSpend * 60_000);
  }
}
