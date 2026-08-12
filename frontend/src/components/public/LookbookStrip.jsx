import { useEffect, useState } from "react";
import styles from "./LookbookStrip.module.css";

import shoot01 from "../../assets/lookbook/shoot-01.jpeg";
import shoot02 from "../../assets/lookbook/shoot-02.jpeg";
import shoot03 from "../../assets/lookbook/shoot-03.jpeg";
import shoot04 from "../../assets/lookbook/shoot-04.jpeg";
import shoot05 from "../../assets/lookbook/shoot-05.jpeg";
import shoot06 from "../../assets/lookbook/shoot-06.jpeg";
import shoot07 from "../../assets/lookbook/shoot-07.jpeg";
import shoot08 from "../../assets/lookbook/shoot-08.jpeg";
import shoot09 from "../../assets/lookbook/shoot-09.jpeg";
import shoot10 from "../../assets/lookbook/shoot-10.jpeg";
import shoot11 from "../../assets/lookbook/shoot-11.jpeg";
import shoot12 from "../../assets/lookbook/shoot-12.jpeg";
import shoot13 from "../../assets/lookbook/shoot-13.jpeg";
import shoot14 from "../../assets/lookbook/shoot-14.jpeg";

const PHOTOS = [
  shoot01, shoot02, shoot03, shoot04, shoot05, shoot06, shoot07,
  shoot08, shoot09, shoot10, shoot11, shoot12, shoot13, shoot14,
];

const INTERVAL_MS = 2000;

export default function LookbookStrip() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % PHOTOS.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.section} aria-label="Photos New Generation">
      <h2 className={styles.title}>Portés par la rue</h2>

      <div className={styles.stage}>
        {PHOTOS.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={i === index ? `${styles.photo} ${styles.photoActive}` : styles.photo}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      <div className={styles.dots} role="presentation">
        {PHOTOS.map((src, i) => (
          <span key={src} className={i === index ? styles.dotActive : styles.dot} />
        ))}
      </div>
    </section>
  );
}
