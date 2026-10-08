import { useEffect, useMemo, useState } from "react";

const initialTasks = [
  {
    id: 1,
    title: "Build Login Page",
    description: "Create responsive login page using ReactJS",
    status: "In Progress",
    priority: "High",
    dueDate: "2026-10-15"
  },
  {
    id: 2,
    title: "Design Dashboard",
    description: "Create the main dashboard layout",
    status: "Pending",
    priority: "Medium",
    dueDate: "2026-10-18"
  },
  {
    id: 3,
    title: "Connect API",
    description: "Connect frontend with REST API",
    status: "Completed",
    priority: "Low",
    dueDate: "2026-10-10"
  }
];

const emptyForm = {
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
  dueDate: ""
};

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === "Pending").length,
    progress: tasks.filter(t => t.status === "In Progress").length,
    completed: tasks.filter(t => t.status === "Completed").length
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter(task => {
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }

  function validate() {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "Task title is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (!form.priority) nextErrors.priority = "Priority is required.";
    if (!form.dueDate) nextErrors.dueDate = "Due date is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    if (editingId !== null) {
      setTasks(prev =>
        prev.map(task =>
          task.id === editingId ? { ...form, id: editingId } : task
        )
      );
    } else {
      setTasks(prev => [...prev, { ...form, id: Date.now() }]);
    }

    resetForm();
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
  }

  function handleEdit(task) {
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate
    });
    setEditingId(task.id);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id) {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (confirmed) {
      setTasks(prev => prev.filter(task => task.id !== id));
      if (editingId === id) resetForm();
    }
  }

  function changeStatus(id, status) {
    setTasks(prev =>
      prev.map(task => task.id === id ? { ...task, status } : task)
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">ReactJS Technical Round 1</p>
          <h1>Task Management Dashboard</h1>
          <p className="subtitle">Create, manage, search and track your tasks.</p>
        </div>
      </header>

      <main className="container">
        <section className="stats-grid">
          <StatCard label="Total Tasks" value={stats.total} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="In Progress" value={stats.progress} />
          <StatCard label="Completed" value={stats.completed} />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>{editingId !== null ? "Edit Task" : "Add Task"}</h2>
              <p>{editingId !== null ? "Update the task details." : "Create a new task."}</p>
            </div>
            {editingId !== null && (
              <button className="secondary-btn" onClick={resetForm}>Cancel Edit</button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="task-form">
            <div className="field">
              <label>Task Title *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Build Login Page" />
              {errors.title && <small className="error">{errors.title}</small>}
            </div>

            <div className="field">
              <label>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Describe the task..." />
              {errors.description && <small className="error">{errors.description}</small>}
            </div>

            <div className="form-row">
              <div className="field">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>

              <div className="field">
                <label>Priority *</label>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                {errors.priority && <small className="error">{errors.priority}</small>}
              </div>

              <div className="field">
                <label>Due Date *</label>
                <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
                {errors.dueDate && <small className="error">{errors.dueDate}</small>}
              </div>
            </div>

            <button className="primary-btn" type="submit">
              {editingId !== null ? "Save Changes" : "Add Task"}
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>All Tasks</h2>
              <p>{filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} shown</p>
            </div>
          </div>

          <div className="toolbar">
            <input
              className="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks by title or description..."
            />

            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>

            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
              <option value="All">All Priorities</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="empty">No tasks found.</div>
          ) : (
            <div className="task-list">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={changeStatus}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  return (
    <article className="task-card">
      <div className="task-main">
        <div className="task-title-row">
          <h3>{task.title}</h3>
          <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
        </div>
        <p>{task.description}</p>

        <div className="task-meta">
          <span><b>Status:</b> {task.status}</span>
          <span><b>Due:</b> {task.dueDate}</span>
        </div>
      </div>

      <div className="task-actions">
        <select
          value={task.status}
          onChange={e => onStatusChange(task.id, e.target.value)}
          aria-label={`Change status for ${task.title}`}
        >
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <button className="action edit" onClick={() => onEdit(task)}>Edit</button>
        <button className="action delete" onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </article>
  );
}

export default App;