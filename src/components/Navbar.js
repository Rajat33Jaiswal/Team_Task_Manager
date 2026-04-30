"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import styles from "./Navbar.module.css";
import { LogOut, LayoutDashboard, FolderKanban, CheckSquare, User } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href={session ? "/dashboard" : "/"} className={styles.logo}>
          <CheckSquare className={styles.logoIcon} size={32} />
          <div className={styles.logoTitleWrapper}>
            <span style={{ lineHeight: '1.2' }}>TeamTask</span>
            <p>Task Management System</p>
          </div>
        </Link>
        
        <div className={styles.links}>
          {session ? (
            <>
              <Link href="/dashboard" className={styles.navLink}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link href="/projects" className={styles.navLink}>
                <FolderKanban size={18} /> Projects
              </Link>
              <Link href="/profile" className={styles.navLink}>
                <User size={18} /> Profile
              </Link>
              <div className={styles.userMenu}>
                <div className={styles.userName}>
                  <span>{session.user.name}</span>
                  <span className={styles.badge}>{session.user.role}</span>
                </div>
                <button onClick={() => signOut()} className={styles.logoutBtn}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">Login</Link>
              <Link href="/register" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
