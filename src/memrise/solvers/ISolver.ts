import { ICourse } from "../courses";

export interface ISolver {
  solve(course: ICourse, totalPoints: number): Promise<void>;
}
