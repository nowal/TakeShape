import type { FC } from 'react';

export const _Prev: FC = () => {
  return (
    <>
          {/* <button
            onClick={() => router.push('/quote')}
            className="resubmit-btn button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300"
          >
            Resubmit Video
          </button>
          <button
            onClick={() =>
              handlePreferenceSubmit('/dashboard', false)
            }
            className={`only-preferences-btn button-color hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300 ${
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            disabled={isLoading}
          >
            {isLoading
              ? 'Submitting...'
              : 'Submit Preferences'}
          </button> */}
      <style jsx>{`
        .disabled-btn {
          background-color: grey;
        }
        .defaultPreferences {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          height: 120vh;
        }
        .form-container {
          width: 100%;
          max-width: 500px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          margin-top: 5vh;
        }
        .input-field,
        .select-field {
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .preferences-row {
          flex-direction: column;
          gap: 1rem;
        }
        .button-group {
          display: flex;
          gap: 1rem;
        }
        .resubmit-btn,
        .submit-btn {
          padding: 0.75rem;
          font-size: 1rem;
        }
        .tooltip {
          position: relative;
          display: inline-block;
          border-bottom: 1px dotted black;
        }
        .tooltip .tooltiptext {
          visibility: hidden;
          width: 120px;
          background-color: black;
          color: #fff;
          text-align: center;
          border-radius: 6px;
          padding: 5px 0;
          position: absolute;
          z-index: 1;
          bottom: 100%;
          left: 50%;
          margin-left: -60px;
        }
        .tooltip:hover .tooltiptext {
          visibility: visible;
        }
        .help-link {
          color: blue;
          text-decoration: underline;
          cursor: pointer;
        }
        .tooltip-container {
          position: relative;
          display: inline-block;
        }
        .tooltip-container .tooltiptext {
          visibility: hidden;
          width: 200px;
          background-color: black;
          color: #fff;
          text-align: center;
          border-radius: 6px;
          padding: 5px 0;
          position: absolute;
          z-index: 1;
          bottom: 125%;
          left: 50%;
          margin-left: -100px;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .tooltip-container:hover .tooltiptext {
          visibility: visible;
          opacity: 1;
        }
        .note-text {
          text-align: center;
          color: #666;
          font-size: 0.875rem;
          max-width: 90%;
          margin: 20px auto;
        }
      `}</style>
    </>
  );
};

{
  /* <InputsCheckbox
            >
              <div className="row gap-2">

                <span>Labor Only</span>
              </div>
            </InputsCheckbox> */
}
{
  /* <InputsCheckbox
              type="radio"
              classValue='has-[:checked]:bg-indigo-50'

              checked={laborAndMaterial === true}
              onChange={() =>
                handleLaborMaterialChange(true)
              }
            >
              <div className="flex-row flex gap-2">
                <IconsLaborAndMaterials />
                <span>Labor and Material</span>
              </div>
            </InputsCheckbox> */
}
{
  /* <label className="flex items-center gap-2">
              <input type="checkbox" />
            </label> */
}
