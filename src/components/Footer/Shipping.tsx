import React from "react";

const Shipping = () => {
  return (
    <div style={styles.wrapper}>
      <h1 style={styles.heading}>Shipping & Delivery Policy</h1>
      <p style={styles.intro}>
        At <strong>Semamart</strong>, we are committed to delivering your orders promptly and efficiently. 
        Review our shipping and delivery guidelines for a smooth experience.
      </p>

      <div style={styles.card}>
        <h2 style={styles.subHeading}>Delivery Time</h2>
        <ul style={styles.list}>
          <li>Orders typically arrive within 7 to 9 business days when placed before 12:00 noon (IST).</li>
          <li>Delivery times may vary during holidays or natural events.</li>
          <li>Orders placed late on Fridays or Saturdays will be processed starting Monday.</li>
        </ul>
      </div>

      <div style={styles.card}>
        <h2 style={styles.subHeading}>Additional Charges</h2>
        <ul style={styles.list}>
          <li>Priority and overnight shipping options are available, with additional charges.</li>
          <li>Extra charges may apply if multiple delivery attempts are needed.</li>
        </ul>
      </div>

      <div style={styles.card}>
        <h2 style={styles.subHeading}>Change in Delivery Schedule</h2>
        <ul style={styles.list}>
          <li>Delivery times may change due to unforeseen factors.</li>
          <li>We confirm the exact delivery schedule at order placement.</li>
        </ul>
      </div>

      <div style={styles.card}>
        <h2 style={styles.subHeading}>Reporting Issues</h2>
        <ul style={styles.list}>
          <li>Contact us promptly for any delivery issues.</li>
          <li>For damaged or incorrect goods, check our <a href="/return-policy" style={styles.link}>return & replacement policy</a>.</li>
        </ul>
      </div>

      <div style={styles.card}>
        <h2 style={styles.subHeading}>Contact Us</h2>
        <p>
          Email us at <a href="mailto:support@semamart.com" style={styles.link}>support@semamart.com</a> within 24 hours of receiving your order for any shipping queries.
        </p>
      </div>

      <p style={styles.thankYou}>Thank you for choosing <strong>Semamart</strong>! We appreciate your trust.</p>
    </div>
  );
};

// TypeScript-safe styles
const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    maxWidth: 900,
    margin: "40px auto",
    padding: "0 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    lineHeight: 1.7,
    color: "#333",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
  heading: {
    textAlign: "center",
    fontSize: "2.2rem",
    marginBottom: 20,
    color: "#1a73e8",
  },
  intro: {
    textAlign: "center",
    fontSize: "1.1rem",
    marginBottom: 30,
    color: "#555",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  subHeading: {
    fontSize: "1.4rem",
    marginBottom: 10,
    color: "#333",
    borderBottom: "2px solid #1a73e8",
    paddingBottom: 5,
  },
  list: {
    paddingLeft: 20,
    color: "#555",
  },
  link: {
    color: "#1a73e8",
    textDecoration: "none",
    transition: "0.3s",
  },
  thankYou: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "1.1rem",
    marginTop: 30,
    color: "#333",
  },
};

export default Shipping;
