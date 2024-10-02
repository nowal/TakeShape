import type { FC } from "react";

export const PainterCardStyle: FC = () => {
  return (
      <style jsx>{`
        .painter-card {
          padding: 20px;
          margin: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
          transition: 0.3s;
          display: flex;
          align-items: center;
          flex: 1;
        }
        .painter-card:hover {
          box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
        }
        .painter-logo {
          width: 50px;
          height: 50px;
          border-radius: 5px;
          margin-right: 10px;
          object-fit: cover;
        }
        .painter-name {
          font-size: 1.5em;
          color: #333;
          margin-right: 10px;
        }
        .is-insured {
          font-size: 1em;
          color: green;
          display: flex;
          align-items: center;
        }
        .checkmark {
          font-size: 1.5em;
        }
        .painter-phone {
          font-size: 1em; /* Smaller font size for phone number */
          color: #555; /* Slightly lighter color for contrast */
          margin-top: 5px; /* Space between name and phone number */
        }
        .painter-reviews {
          font-size: 1em;
          margin-top: 5px;
          display: flex; /* Ensure stars are aligned horizontally */
          align-items: center;
        }
        .star {
          font-size: 1.5em;
          color: #ffd700; /* Gold color for stars */
          margin-right: 2px; /* Add some space between stars */
        }
        .star.empty {
          color: #ccc; /* Gray color for empty stars */
        }
        .no-reviews {
          color: #999;
          font-style: italic;
        }
      `}</style>
  );
};