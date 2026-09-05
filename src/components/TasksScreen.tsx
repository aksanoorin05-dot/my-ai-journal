import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Circle,
  Tag,
  Clock,
  Filter,
} from "lucide-react";
import { StudentTask } from "../types";

interface TasksScreenProps {
  tasks: StudentTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<StudentTask, "id" | "createdAt">) => void;
  onDeleteTask: (id: string) => void;
  onGenerateAiTasks?: () => void;
  onLoadSampleTasks?: () => void;
}

export function TasksScreen({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onGenerateAiTasks,
  onLoadSampleTasks,
}: TasksScreenProps) {
  const [filter, setFilter] = useState<string>("all");
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<
    "Homework" | "Exam Prep" | "Study Goal" | "Personal" | "Habit"
  >("Homework");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">(
    "medium"
  );
  const [newDueDate, setNewDueDate] = useState("");

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      dueDate: newDueDate.trim() || undefined,
      completed: false,
    });

    setNewTitle("");
    setNewDueDate("");
    setIsAddingTask(false);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    if (filter === "high-priority") return task.priority === "high";
    return task.category.toLowerCase() === filter.toLowerCase();
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                Tasks & Study Goals
              </h1>
              <p className="text-xs text-zinc-500">
                Stay on top of assignments, prep milestones, and daily habits.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onGenerateAiTasks && (
            <button
              onClick={onGenerateAiTasks}
              className="flex items-center gap-1.5 px-3 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-xs font-semibold border border-violet-200 transition-colors"
              title="AI suggest tasks from journal entries"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span>AI Suggestions</span>
            </button>
          )}

          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-zinc-200 shadow-sm text-center">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Total Tasks
          </p>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">{tasks.length}</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-zinc-200 shadow-sm text-center">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Pending
          </p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600">{pendingCount}</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-zinc-200 shadow-sm text-center">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Completed
          </p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600">
            {completedCount}
          </p>
        </div>
      </div>

      {/* New Task Inline Modal/Form */}
      {isAddingTask && (
        <form
          onSubmit={handleCreateTask}
          className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <h3 className="text-sm font-semibold text-zinc-900">
              Create New Task or Study Goal
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="text-xs text-zinc-400 hover:text-zinc-700"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Task Title or Objective *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Read Physics Chapter 5 & solve problems 1-10"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Homework">Homework</option>
                <option value="Exam Prep">Exam Prep</option>
                <option value="Study Goal">Study Goal</option>
                <option value="Habit">Daily Habit</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Due Date / Time (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Today 5 PM, Friday"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "all", label: "All" },
          { id: "active", label: "Active" },
          { id: "completed", label: "Completed" },
          { id: "high-priority", label: "High Priority" },
          { id: "Homework", label: "Homework" },
          { id: "Exam Prep", label: "Exam Prep" },
          { id: "Habit", label: "Habits" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === tab.id
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm divide-y divide-zinc-100 overflow-hidden">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 flex items-start justify-between gap-3 hover:bg-zinc-50/70 transition-colors ${
                task.completed ? "bg-zinc-50/50" : ""
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  className="mt-0.5 text-zinc-400 hover:text-indigo-600 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-400 shrink-0" />
                  )}
                </button>

                <div className="space-y-1 flex-1 min-w-0">
                  <p
                    onClick={() => onToggleTask(task.id)}
                    className={`text-sm font-medium cursor-pointer ${
                      task.completed
                        ? "line-through text-zinc-400"
                        : "text-zinc-900"
                    }`}
                  >
                    {task.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {/* Category */}
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {task.category}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                        task.priority === "high"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : task.priority === "medium"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {task.priority.toUpperCase()}
                    </span>

                    {/* Due Date */}
                    {task.dueDate && (
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.dueDate}
                      </span>
                    )}

                    {/* AI Suggested */}
                    {task.aiSuggested && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-violet-500" />
                        AI Insight
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDeleteTask(task.id)}
                className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="p-8 text-center space-y-3">
            <CheckSquare className="w-8 h-8 text-zinc-300 mx-auto" />
            <p className="text-xs text-zinc-500">
              No tasks found in this filter.
            </p>
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setIsAddingTask(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Add Study Task
              </button>
              {onLoadSampleTasks && (
                <button
                  onClick={onLoadSampleTasks}
                  className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-medium border border-zinc-200 transition-colors"
                >
                  Load Sample Tasks
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
