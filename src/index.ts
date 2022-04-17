import { Memrise } from "./memrise/memrise";
import { password, username } from "./auth.json";
import { ICourse } from "./memrise/courses";
import inquirer from "inquirer";
import assert from "assert";

const memrise = new Memrise();

const queryCourseChoice = async (courses: ICourse[]) => {
  const res = await inquirer.prompt({
    type: "list",
    name: "chosenCourse",
    message: "Choose your course",
    choices: courses.map((course) => course.name),
  });

  const choice = res.chosenCourse;
  assert(typeof choice === "string");

  return courses.find((c) => c.name === choice) as ICourse;
};

const queryTotalPoints = async () => {
  const res = await inquirer.prompt({
    type: "number",
    name: "points",
    message: "How many points do you want",
  });

  const points = res.points;
  assert(typeof points === "number");

  return points;
};

const queryTimeToSpend = async () => {
  const res = await inquirer.prompt({
    type: "number",
    name: "time",
    message: "How much time do want to 'spend' on this (minutes)",
  });

  const time = res.time;
  assert(typeof time === "number");

  return time;
};

memrise.login(username, password).then(async () => {
  const courses = await memrise.courses;

  const chosenCourse = await queryCourseChoice(courses);
  const points = await queryTotalPoints();
  const time = await queryTimeToSpend();

  await memrise.solve(chosenCourse, points, time);

  console.log("Finished solving");
});
