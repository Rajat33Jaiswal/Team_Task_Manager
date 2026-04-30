"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { Clock, CheckCircle2, ListTodo, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchTasks();
    }
  }, [status, router]);

  const fetchTasks = async () => {
    try {
      // Admins see all tasks, Members only see their tasks
      const url = session.user.role === 'ADMIN' ? "/api/tasks" : "/api/tasks?myTasks=true";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className={styles.container}>Loading dashboard...</div>;
  }

  if (!session) return null;

  const pendingTasks = tasks.filter(t => t.status === "PENDING").length;
  const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
  
  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date() && new Date(dateStr).toDateString() !== new Date().toDateString();
  };

  const overdueTasks = tasks.filter(t => t.status !== "COMPLETED" && isOverdue(t.dueDate));

  const recentTasks = [...tasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);

  const assignedProjectsCount = new Set(tasks.map(t => t.projectId)).size;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome, {session.user.name}</h1>
        {session.user.role === 'ADMIN' && (
          <Link href="/projects" className="btn-primary">Manage Projects</Link>
        )}
      </div>

      <div className={styles.statsGrid}>
        <div className={`glass-panel ${styles.statCard}`}>
          <span className={styles.statTitle}>
            {session.user.role === 'ADMIN' ? 'Total Tasks' : 'Total Assignments'}
          </span>
          <span className={styles.statValue}>{tasks.length}</span>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <span className={styles.statTitle} style={{ color: "var(--warning)" }}>In Progress</span>
          <span className={styles.statValue}>{inProgressTasks}</span>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <span className={styles.statTitle} style={{ color: "var(--success)" }}>Completed</span>
          <span className={styles.statValue}>{completedTasks}</span>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <span className={styles.statTitle} style={{ color: "var(--danger)" }}>Overdue</span>
          <span className={styles.statValue}>{overdueTasks.length}</span>
        </div>
        {session.user.role !== 'ADMIN' && (
          <div className={`glass-panel ${styles.statCard}`}>
            <span className={styles.statTitle} style={{ color: "var(--accent-primary)" }}>My Projects</span>
            <span className={styles.statValue}>{assignedProjectsCount}</span>
          </div>
        )}
      </div>

      <div className={styles.tasksSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Tasks</h2>
        </div>
        <div className={styles.taskList}>
          {recentTasks.length === 0 ? (
            <div className={styles.emptyState}>No tasks assigned to you yet.</div>
          ) : (
            recentTasks.map(task => (
              <div key={task.id} className={styles.taskItem}>
                <div className={styles.taskInfo}>
                  <Link href={`/projects/${task.projectId}`} className={styles.taskTitle}>
                    {task.title}
                  </Link>
                  <span className={styles.taskProject}>{task.project?.name}</span>
                </div>
                <div className={styles.taskMeta}>
                  {task.rating && (
                    <span className={styles.ratingBadge}>
                      ⭐ {task.rating}/5
                    </span>
                  )}
                  {isOverdue(task.dueDate) && task.status !== "COMPLETED" && (
                    <span className={styles.overdue}>
                      <AlertCircle size={14} /> Overdue
                    </span>
                  )}
                  <span className={`badge badge-${task.status.toLowerCase().replace('_', '-')}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
