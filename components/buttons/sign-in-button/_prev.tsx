import type { FC } from 'react';

export const _Prev: FC = () => {
  return (
    <div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          padding: 40px; /* Increased padding for more white space */
          border-radius: 5px;
          position: relative; /* For absolute positioning of close button */
          width: 400px; /* Adjust as needed */
          max-width: 90%;
        }

        .close-modal {
          position: absolute;
          top: 10px;
          right: 10px;
          border: none;
          background: transparent;
          font-size: 18px;
          cursor: pointer;
        }

        .shadow {
          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};
