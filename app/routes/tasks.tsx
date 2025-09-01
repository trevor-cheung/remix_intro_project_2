import * as schema from "~/database/schema";
import { Form, useNavigation, redirect } from "react-router";

import type { Route } from "./+types/tasks";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Todo App - Manage Your Tasks" },
    { name: "description", content: "A simple todo app built with React Router and Cloudflare D1" },
  ];
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  
  if (!title?.trim()) {
    return { error: "Title is required" };
  }
  
  try {
    await context.db.insert(schema.tasks).values({
      title: title.trim(),
      description: description?.trim() || null,
    });
  } catch (error) {
    return { error: "Error creating task" };
  }
  
  return redirect("/");
}

export async function loader({ context }: Route.LoaderArgs) {
  const tasks = await context.db.query.tasks.findMany({
    orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
  });

  return {
    tasks,
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
  };
}

export default function Tasks({ actionData, loaderData }: Route.ComponentProps) {
  const { tasks } = loaderData;
  const error = actionData?.error;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Todo App</h1>
      
      {/* Add Task Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
        <Form 
          method="post" 
          className="space-y-4"
          onSubmit={(event) => {
            if (navigation.state === "submitting") {
              event.preventDefault();
            }
            const form = event.currentTarget;
            requestAnimationFrame(() => {
              form.reset();
            });
          }}
        >
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              placeholder="What needs to be done?"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              placeholder="Add more details..."
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding..." : "Add Task"}
          </button>
          
          {error && (
            <p className="text-red-500">{error}</p>
          )}
        </Form>
      </div>
      
      {/* Tasks List */}
      <div className="space-y-4 mb-4">
        <h2 className="text-xl font-semibold">Your Tasks</h2>
        
        {tasks.filter((task) => task.completed === 0).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks yet. Add your first task above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.filter((task) => task.completed === 0).map((task) => (
              // check box to toggle the task on the left side
              <div key={task.id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-start justify-between">
                  <div className="mr-4">
                    <Form method="post" action={`/tasks/${task.id}/toggle`}>
                      <button type="submit" className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors bg-white border-gray-300 hover:border-green-500">
                        {task.completed && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                    
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    </Form>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <a
                      href={`/tasks/${task.id}/edit`}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                    >
                      Edit
                    </a>
                    
                    <Form method="post" action={`/tasks/${task.id}/delete`}>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                        onClick={(e) => {
                          if (!confirm('Are you sure you want to delete this task?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </Form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {tasks.filter((task) => task.completed === 1).length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No completed tasks yet.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-4">
        <h2 className="text-xl font-semibold">Completed Tasks</h2>
        
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks yet. Add your first task above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.filter((task) => task.completed === 1).map((task) => (
              // check box to toggle the task on the left side
              <div key={task.id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-start justify-between">
                  <div className="mr-4">
                    <Form method="post" action={`/tasks/${task.id}/toggle`}>
                      <button type="submit" className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors bg-white border-gray-300 hover:border-green-500">
                        {task.completed && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                    
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    </Form>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
