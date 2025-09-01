import * as schema from "~/database/schema";
import { Form, redirect } from "react-router";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/tasks.$taskId.edit";

// Loader to fetch the task for editing
export async function loader({ params, context }: { params: { taskId: string }, context: { db: any } }) {
  const taskId = parseInt(params.taskId);
  
  if (isNaN(taskId)) {
    throw new Response("Invalid task ID", { status: 400 });
  }
  
  const task = await context.db.query.tasks.findFirst({
    where: eq(schema.tasks.id, taskId),
  });
  
  if (!task) {
    throw new Response("Task not found", { status: 404 });
  }
  
  return { task };
}

// Action to handle task updates
export async function action({ params, request, context }: { params: { taskId: string }, request: Request, context: { db: any } }) {
  const taskId = parseInt(params.taskId);
  
  if (isNaN(taskId)) {
    throw new Response("Invalid task ID", { status: 400 });
  }
  
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  
  if (!title?.trim()) {
    return { error: "Title is required" };
  }
  
  try {
    await context.db.update(schema.tasks)
      .set({
        title: title.trim(),
        description: description?.trim() || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.tasks.id, taskId));
  } catch (error) {
    return { error: "Error updating task" };
  }
  
  return redirect("/");
}

export default function EditTask({ actionData, loaderData }: { actionData?: { error?: string }, loaderData: { task: any } }) {
  const { task } = loaderData;
  const error = actionData?.error;
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Task</h1>
        
        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={task.title}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={task.description || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
            
            <a
              href="/tasks"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </a>
          </div>
          
          {error && (
            <p className="text-red-500">{error}</p>
          )}
        </Form>
      </div>
    </div>
  );
}
