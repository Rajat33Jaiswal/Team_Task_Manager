"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./projects.module.css";
import { Plus, FolderKanban } from "lucide-react";

export default function Projects() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // New project state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProjects();
    }
  }, [status, router]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Error fetching projects", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        setShowModal(false);
        setName("");
        setDescription("");
        fetchProjects();
      }
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className={styles.container}>Loading projects...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Projects</h1>
        {session?.user?.role === 'ADMIN' && (
          <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <FolderKanban size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3>No projects found</h3>
          <p>Get started by creating your first project.</p>
        </div>
      ) : (
        <div className={styles.projectsGrid}>
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className={`glass-panel ${styles.projectCard}`}>
              <h3 className={styles.projectName}>{project.name}</h3>
              <p className={styles.projectDesc}>{project.description || "No description provided."}</p>
              <div className={styles.projectFooter}>
                <span>{project._count?.tasks || 0} tasks</span>
                <span>By {project.owner?.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`glass-panel ${styles.modalContent}`}>
            <h2 className={styles.modalTitle}>Create New Project</h2>
            <form onSubmit={handleCreateProject} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Project Name</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Website Redesign" 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description (Optional)</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Briefly describe the project goals..."
                  rows={3}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
