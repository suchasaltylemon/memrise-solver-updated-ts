import { SessionContainer } from "../session";
import { ISolver } from "./ISolver";
import { ICourse } from "../courses";
import { SubmissionSolver } from "./submissionSolver";
import { PointsSolver } from "./pointsSolver";

const TIMEOUT = 50;

export class ComposedSolver extends SessionContainer implements ISolver {
  private readonly _submissionSolver = new SubmissionSolver(this._session);
  private readonly _pointsSolver = new PointsSolver(this._session);

  public async solve(course: ICourse, totalPoints: number, timeToSpend: number) {
    const pointsPerSolve = await this._submissionSolver.get_total_points(course);

    const repeats = Math.floor(totalPoints / pointsPerSolve);
    const rem = totalPoints % pointsPerSolve;

    for (let i = 0; i <= repeats; ++i) {
      const _ = this._submissionSolver.solve(course, pointsPerSolve, timeToSpend / repeats);
      await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
    }

    if (rem > 0) {
      const _ = this._submissionSolver.solve(course, rem, 0);
    }

    const _ = this._pointsSolver.solve(course, totalPoints);
  }
}
