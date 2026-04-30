import Link from "next/link";
import styles from "./page.module.css";
import { CheckCircle, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.pulse}></span>
          TeamTask v1.0 is live
        </div>
        <h1 className={styles.title}>
          Manage Work. <span className={styles.gradientText}>Brilliantly.</span>
        </h1>
        <p className={styles.subtitle}>
          The ultimate task management platform designed for modern teams. 
          Coordinate, track, and conquer your projects with breathtaking speed and clarity.
        </p>
        <div className={styles.actions}>
          <Link href="/register" className="btn-primary" style={{ padding: "16px 32px", fontSize: "1.1rem" }}>
            Start for free
          </Link>
          <Link href="/login" className="btn-secondary" style={{ padding: "16px 32px", fontSize: "1.1rem" }}>
            Sign In
          </Link>
        </div>
      </div>

      <div className={styles.features}>
        <div className={`glass-panel ${styles.featureCard} animate-fade-in`} style={{ animationDelay: "0.1s" }}>
          <div className={styles.featureIcon}><CheckCircle size={32} /></div>
          <h3>Track Everything</h3>
          <p>Create tasks, set priorities, and monitor progress across all your ongoing projects effortlessly.</p>
        </div>
        
        <div className={`glass-panel ${styles.featureCard} animate-fade-in`} style={{ animationDelay: "0.2s" }}>
          <div className={styles.featureIcon}><Users size={32} /></div>
          <h3>Team Collaboration</h3>
          <p>Assign tasks to team members and establish clear role-based access controls for your workspace.</p>
        </div>
        
        <div className={`glass-panel ${styles.featureCard} animate-fade-in`} style={{ animationDelay: "0.3s" }}>
          <div className={styles.featureIcon}><Zap size={32} /></div>
          <h3>Lightning Fast</h3>
          <p>Built with Next.js and Prisma to deliver an incredibly responsive, snappy experience for your team.</p>
        </div>
      </div>
    </div>
  );
}
