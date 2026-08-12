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

export default function LookbookStrip() {
  const loop = [...PHOTOS, ...PHOTOS];

  return (
    <section className={styles.section} aria-label="Lookbook New Generation">
      <div className={`container ${styles.header}`}>
        <span className={styles.eyebrow}>Shooting</span>
        <h2 className={styles.title}>Portés par la rue</h2>
      </div>

      <div className={styles.track}>
        <div className={styles.scroller}>
          {loop.map((src, index) => (
            <div className={styles.frame} key={index} aria-hidden={index >= PHOTOS.length}>
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
