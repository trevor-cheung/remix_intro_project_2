import * as schema from "~/database/schema";
import { redirect } from "react-router";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/tasks.$taskId.delete";

export async function action({ params, context }: Route.ActionArgs) {
  const taskId = parseInt(params.taskId);
  
  if (isNaN(taskId)) {
    throw new Response("Invalid task ID", { status: 400 });
  }
  
  try {
    await context.db.delete(schema.tasks).where(eq(schema.tasks.id, taskId));
  } catch (error) {
    throw new Response("Error deleting task", { status: 500 });
  }
  
  return redirect("/");
}
