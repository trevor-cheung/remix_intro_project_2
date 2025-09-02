import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/tasks.tsx"),
    route("tasks/:taskId/edit", "routes/tasks.$taskId.edit.tsx"),
    route("tasks/:taskId/delete", "routes/tasks.$taskId.delete.tsx"),
    route("tasks/:taskId/toggle", "routes/tasks.$taskId.toggle.tsx"),
    route("api/auth/*", "routes/api.auth.$.ts"),
    route("signin", "routes/signin.tsx"),
    route("signup", "routes/signup.tsx"),
] satisfies RouteConfig;
