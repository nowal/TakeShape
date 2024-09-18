import type { FC } from 'react';

export const _Prev: FC = () => {
  return (
    <style jsx>{`
      .dashboard-content {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .video-container {
        width: 100%;
        max-width: 450px;
      }

      .video {
        width: 100%;
        max-width: 768px;
      }

      .button-group {
        display: flex;
        gap: 1rem;
      }

      .quote-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      @media (min-width: 640px) {
        .quote-item {
          flex-direction: row;
        }
      }

      .quote-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      @media (min-width: 640px) {
        .quote-details {
          flex-direction: row;
          align-items: center;
        }
      }

      .recommended {
        display: flex;
        align-items: center;
      }

      .recommended img {
        margin-right: 8px;
      }

      .upload-progress {
        padding: 20px;
        background-color: #f0f4f8;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .modal-content {
        background: white;
        padding: 20px;
        border-radius: 8px;
        position: relative;
        width: 90%;
        max-width: 500px;
        text-align: center;
      }

      .modal-content h2 {
        margin-bottom: 20px;
      }

      .modal-content p {
        margin-bottom: 20px;
      }

      .modal-content button {
        margin-top: 20px;
        background-color: #ccc;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
      }

      .close-button {
        position: absolute;
        top: -10px; /* Adjusted to move it higher */
        right: 10px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
      }
    `}</style>
  );
};
