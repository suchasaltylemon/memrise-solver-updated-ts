import { ISolver } from "./ISolver";
import { ICourse } from "../courses";
import { SessionContainer } from "../session";
import Url from "../url";
import assert from "assert";
import { randomUUID } from "crypto";

const MAX_POINTS = 150;

//#region Types
type Event = {
  attempts: number;
  bonus_points: number;
  box_template: "typing";
  correct: number;
  course_id: number;
  created_date: number;
  current_streak: number;
  definition_element: string;
  given_answer: string;
  growth_level: number;
  ignored: boolean;
  interval: number;
  last_date: number;
  learnable_id: number;
  learning_element: string;
  mem_id: null;
  next_date: number;
  not_difficult: boolean;
  points: number;
  score: number;
  starred: boolean;
  test_id: string;
  time_spent: number;
  total_streak: number;
  when: number;
};

type RegisterPayload = {
  events: Event[];
  limit: number;
  sync_token: number;
};

type LearnableInfo = {
  definition_element: string;
  id: number;
  learning_element: string;
};

type ProgressInfo = {
  attempts: number;
  correct: number;
  created_date: string;
  current_streak: number;
  growth_level: number;
  ignored: false;
  interval: number;
  is_difficult: boolean;
  last_date: string;
  learnable_id: string;
  mem_id: null;
  next_date: string;
  starred: boolean;
};

type SourceInfo = {
  source_id: number;
};

//#endregion

export class SubmissionSolver extends SessionContainer implements ISolver {
  private _load_events_into_payload(events: Event[]): RegisterPayload {
    return {
      events: events,
      limit: 0,
      sync_token: 0,
    };
  }

  private _generate_event(
    progressInfo: ProgressInfo,
    learnableInfo: LearnableInfo,
    sourceInfo: SourceInfo,
    points: number,
    timeSpent: number
  ): Event {
    const createdDate = Date.parse(progressInfo.created_date) / 10000;
    const lastDate = Date.parse(progressInfo.last_date) / 1000;
    const nextDate = Date.parse(progressInfo.next_date) / 1000;

    return {
      attempts: progressInfo.attempts,
      bonus_points: 0,
      box_template: "typing",
      correct: progressInfo.correct,
      course_id: sourceInfo.source_id,
      created_date: createdDate,
      given_answer: learnableInfo.learning_element,
      current_streak: progressInfo.current_streak,
      definition_element: learnableInfo.definition_element,
      growth_level: progressInfo.growth_level,
      ignored: progressInfo.ignored,
      interval: progressInfo.interval,
      last_date: lastDate,
      learnable_id: learnableInfo.id,
      learning_element: learnableInfo.learning_element,
      mem_id: progressInfo.mem_id,
      next_date: nextDate,
      not_difficult: progressInfo.is_difficult,
      points: points,
      score: 1,
      starred: false,
      test_id: randomUUID(),
      time_spent: Math.floor(timeSpent),
      total_streak: progressInfo.attempts,
      when: lastDate,
    };
  }

  public async solve(course: ICourse, totalPoints: number, timeSpent: number) {
    const events: Event[] = [];

    const session_info = await this._session.get(course.url);
    assert(typeof session_info === "object");

    const learnables = session_info.learnables;
    assert(Array.isArray(learnables));

    const progress = session_info.progress as ProgressInfo[];
    assert(typeof progress === "object");

    const sourceInfo = session_info.session_source_info as SourceInfo;
    assert(typeof sourceInfo === "object");

    let cumPoints = 0;

    learnables.forEach((learnable: LearnableInfo) => {
      const learnableProgress = progress.find((l) => parseInt(l.learnable_id) === learnable.id);
      assert(learnableProgress !== undefined);

      const points = Math.max(Math.min(totalPoints - cumPoints, MAX_POINTS), 0);
      cumPoints += points;

      if (points > 0) {
        const learnableEvent = this._generate_event(
          learnableProgress,
          learnable,
          sourceInfo,
          points,
          timeSpent / learnables.length
        );
        events.push(learnableEvent);
      }
    });

    const payload = this._load_events_into_payload(events);

    await this._session.post(Url.REGISTER_ANSWERS, payload);
  }

  public async get_total_points(course: ICourse) {
    const session_info = await this._session.get(course.url);
    assert(typeof session_info === "object");

    const learnables = session_info.learnables;
    assert(Array.isArray(learnables));

    return learnables.length * MAX_POINTS;
  }
}
