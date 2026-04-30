"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./project-detail.module.css";
import { ArrowLeft, Plus, Calendar, User } from "lucide-react";

export default function ProjectDetail() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  // New task state
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // For edit modal

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated" && params?.id) {
      fetchProject();
      if (session.user.role === 'ADMIN') fetchUsers();
    }
  }, [status, params?.id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      } else if (res.status === 404) {
        router.push("/projects");
      }
    } catch (error) {
      console.error("Error fetching project", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, priority, 
          assigneeId: assigneeId || null, 
          dueDate: dueDate || null,
          projectId: params.id
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setTitle(""); setDescription(""); setAssigneeId(""); setDueDate(""); setPriority("MEDIUM");
        fetchProject();
      }
    } catch (error) {
      console.error("Failed to create task", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, priority, 
          assigneeId: assigneeId || null, 
          dueDate: dueDate || null,
        }),
      });
      if (res.ok) {
        setEditingTask(null);
        setTitle(""); setDescription(""); setAssigneeId(""); setDueDate(""); setPriority("MEDIUM");
        fetchProject();
      }
    } catch (error) {
      console.error("Failed to update task", error);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setAssigneeId(task.assigneeId || "");
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchProject();
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleRatingChange = async (taskId, rating) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: parseInt(rating) }),
      });
      if (res.ok) {
        fetchProject();
      }
    } catch (error) {
      console.error("Failed to update rating", error);
    }
  };

  if (loading || status === "loading") {
    return <div className={styles.container}>Loading project details...</div>;
  }

  if (!project) return null;

  const tasksByStatus = {
    PENDING: project.tasks.filter(t => t.status === "PENDING"),
    IN_PROGRESS: project.tasks.filter(t => t.status === "IN_PROGRESS"),
    COMPLETED: project.tasks.filter(t => t.status === "COMPLETED"),
  };

  const TaskColumn = ({ title, statusKey, tasks }) => (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <span className={styles.columnTitle}>{title}</span>
        <span className={styles.taskCount}>{tasks.length}</span>
      </div>
      
      {tasks.map(task => (
        <div key={task.id} className={styles.taskCard}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
            <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
          </div>
          <h4 className={styles.taskTitle}>{task.title}</h4>
          {task.description && <p className={styles.taskDesc}>{task.description}</p>}
          
          <div className={styles.taskMeta}>
            <span className={styles.assignee}>
              <User size={14} /> {task.assignee ? task.assignee.name : "Unassigned"}
            </span>
            {task.dueDate && (
              <span className={styles.assignee}>
                <Calendar size={14} /> {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {session.user.role === 'ADMIN' && (
            <button 
              className={styles.editBtn} 
              onClick={() => openEditModal(task)}
            >
              Edit Task Details
            </button>
          )}
          
          {(session.user.role !== 'ADMIN' && session.user.id === task.assigneeId) && (
            <select 
              className={styles.statusSelect}
              value={task.status}
              onChange={(e) => handleStatusChange(task.id, e.target.value)}
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          )}

          {session.user.role === 'ADMIN' && task.status === 'COMPLETED' && (
            <div className={styles.ratingSection}>
              <label className={styles.ratingLabel}>Rate Work (1-5):</label>
              <select 
                className={styles.statusSelect}
                value={task.rating || ""}
                onChange={(e) => handleRatingChange(task.id, e.target.value)}
              >
                <option value="" disabled>Select Rating</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>
          )}

          {task.rating && (
            <div className={styles.ratingDisplay}>
              Rating: {task.rating}/5
            </div>
          )}
        </div>
      ))}
      
      {tasks.length === 0 && (
        <div style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px 0'}}>
          No tasks
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/projects" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Projects
        </Link>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>{project.name}</h1>
            <p className={styles.description}>{project.description}</p>
          </div>
          {session.user.role === 'ADMIN' && (
            <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Add Task
            </button>
          )}
        </div>
      </div>

      <div className={styles.board}>
        <TaskColumn title="To Do" statusKey="PENDING" tasks={tasksByStatus.PENDING} />
        <TaskColumn title="In Progress" statusKey="IN_PROGRESS" tasks={tasksByStatus.IN_PROGRESS} />
        <TaskColumn title="Completed" statusKey="COMPLETED" tasks={tasksByStatus.COMPLETED} />
      </div>

      {(showModal || editingTask) && (
        <div className={styles.modalOverlay}>
          <div className={`glass-panel ${styles.modalContent}`}>
            <h2 className={styles.modalTitle}>{editingTask ? "Edit Task" : "Create New Task"}</h2>
            <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Task Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Assignee</label>
                <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setEditingTask(null); }} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? (editingTask ? "Saving..." : "Adding...") : (editingTask ? "Save Changes" : "Add Task")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
