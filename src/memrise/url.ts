const enum Url {
  OAUTH = "https://app.memrise.com/signin",
  ACCESS_TOKEN = "https://app.memrise.com/v1.17/auth/access_token/",
  LOGIN = "https://app.memrise.com/v1.17/auth/web/?invalidate_token_after=true&token=",
  COURSES = "https://app.memrise.com/v1.17/dashboard/courses/?filter=recent",
  REVIEW = "https://app.memrise.com/aprender/review?course_id=",
  REGISTER_ANSWERS = "https://app.memrise.com/v1.17/progress/register/",
  CSRF = "https://app.memrise.com/v1.17/web/ensure_csrf",
  HOME = "https://app.memrise.com/home/",
  LEARNING_SESSION = "https://app.memrise.com/v1.17/learning_sessions/review/?session_source_type=course&session_source_id=",
}

export default Url;
