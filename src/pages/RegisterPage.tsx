import { Link } from "react-router-dom";
import { isApiMode } from "../lib/api/config";
import styles from "./RegisterPage.module.css";

export default function RegisterPage() {
  const apiMode = isApiMode();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Register</h1>
      <p className={styles.lead}>Are you setting up a school or joining as a pupil?</p>

      <ChoiceGrid apiMode={apiMode} />
      <p className={styles.footer}>
        <Link to="/">Back to sign in</Link>
      </p>
    </div>
  );
}

function ChoiceGrid({ apiMode }: { apiMode: boolean }) {
  return (
    <div className={styles.choiceGrid}>
      <Link to="/register/school" className={styles.choiceCard}>
        <span className={styles.choiceTitle}>Register a school</span>
        <span className={styles.choiceDesc}>
          Add your school details and get a pupil link to share with students.
        </span>
        {!apiMode ? (
          <span className={styles.choiceNote}>Requires online mode.</span>
        ) : null}
      </Link>
      <div className={styles.choiceCardStatic}>
        <span className={styles.choiceTitle}>Register as a pupil</span>
        <span className={styles.choiceDesc}>
          Use the special link your school gave you. It looks like{" "}
          <strong>/join/your-school-link</strong>.
        </span>
        <p className={styles.choiceFoot}>
          Already have an account? <Link to="/">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
