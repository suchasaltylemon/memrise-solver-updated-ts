import { SessionContainer } from "./session";
import Url from "./url";
import assert from "assert";

export interface ICourse {
  name: string;
  url: string;
  id: string;
}

export class Courses extends SessionContainer {
  public async get_courses() {
    const limit = 4;
    let offset = 0;

    const courses: ICourse[] = [];
    let finished = false;

    while (!finished) {
      const coursesUrl = `${Url.COURSES}&offset=${offset * limit}&limit=${limit}`;
      const courseInfo = await this._session.get(coursesUrl);
      assert(typeof courseInfo === "object");

      const availableCourses = courseInfo.courses as [{ [k: string]: unknown }];
      availableCourses.forEach((course) => {
        const id = course.id;
        assert(typeof id === "string");

        const name = course.name;
        assert(typeof name === "string");

        const url = `${Url.LEARNING_SESSION}${id}`;
        courses.push({
          id,
          name,
          url,
        });
      });

      const hasMoreCourses = courseInfo.has_more_pages;
      assert(typeof hasMoreCourses === "boolean");

      finished = !hasMoreCourses;

      ++offset;
    }
    return courses;
  }
}
