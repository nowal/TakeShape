import type { FC } from "react";

export const DashboardPainterJobForm: FC = () => {
  return (
    <div>
      <form
            onSubmit={(e) =>
              handlePriceSubmit(
                e,
                job.jobId,
                parseFloat(price)
              )
            }
            className="mt-4 w-full lg:w-auto"
          >
            <div className="flex flex-row">
              <input
                type="text"
                name="price"
                placeholder="Total Price"
                className="mr-2 p-2 border rounded w-full lg:w-auto"
                value={price}
                onChange={handlePriceChange}
              />
              <label>
                Invoice (optional)
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="w-full lg:w-auto"
                />
              </label>
            </div>
            <button
              type="submit"
              className={`button-color hover:bg-green-900 text-white font-bold py-1 px-4 mt-2 rounded w-full lg:w-auto ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Quote'}
            </button>
          </form>
    </div>
  );
};