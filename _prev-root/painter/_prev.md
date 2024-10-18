<select
        className="text-xl font-medium mb-4 p-2 underline"
        value={selectedPage}
        onChange={onPageChange}
        style={{
          fontSize:
            selectedPage === 'Available Quotes'
              ? '2rem'
              : '1rem',
          fontWeight:
            selectedPage === 'Available Quotes'
              ? 'bold'
              : 'normal',
        }}
      >
        <option value="Available Quotes">
          Available Quotes
        </option>
        <option value="Completed Quotes">
          Completed Quotes
        </option>
        <option value="Accepted Quotes">
          Accepted Quotes
        </option>
      </select>

<div className="text-center my-10">
  <h2 className="text-2xl font-medium">
    No Available Quotes at this time
  </h2>
</div>
