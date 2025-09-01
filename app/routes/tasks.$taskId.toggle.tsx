import * as schema from "~/database/schema";
import { redirect } from "react-router";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/tasks.$taskId.toggle";

export async function action({ params, context }: Route.ActionArgs) {
  const taskId = parseInt(params.taskId);

  const task = await context.db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
  const completedValue = task[0].completed;

  if (isNaN(taskId)) {
    throw new Response("Invalid task ID", { status: 400 });
  }

  try {
    await context.db.update(schema.tasks).set({ completed: completedValue ? 0 : 1 }).where(eq(schema.tasks.id, taskId));
  } catch (error) {
    throw new Response("Error toggling task", { status: 500 });
  }
  
  return redirect("/");
}