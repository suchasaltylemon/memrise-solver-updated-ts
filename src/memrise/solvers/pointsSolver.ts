import { SessionContainer } from "../session";
import { ISolver } from "./ISolver";
import { ICourse } from "../courses";

const SOLVE_URL = "https://app.memrise.com/v1.17/learning_sessions/end/";
const MAX_POINTS = 2_000; // Points for every solve

const TIMEOUT = 50;

export class PointsSolver extends SessionContainer implements ISolver {
  private async _send_points(course: ICourse, points: number) {
    return this._session.post(SOLVE_URL, {
      session_points: points,
      session_source_id: course.id,
      session_source_type: "course",
      session_type: "review",
    });
  }

  public async solve(course: ICourse, totalPoints: number) {
    const fullAttempts = Math.floor(totalPoints / MAX_POINTS);
    const rem = totalPoints % MAX_POINTS;

    for (let i = 0; i <= fullAttempts; ++i) {
      this._send_points(course, MAX_POINTS);
      await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
    }

    if (rem > 0) {
      this._send_points(course, rem);
      await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
    }
  }
}
