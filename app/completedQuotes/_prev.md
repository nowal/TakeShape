<select 
  className="text-xl font-medium mb-4 p-2 underline"
  value={selectedPage} 
  onChange={handlePageChange}
  style={{ fontSize: selectedPage === 'Completed Quotes' ? '2rem' : '1rem', fontWeight: selectedPage === 'Completed Quotes' ? 'bold' : 'normal' }}
>
  <option value="Available Quotes">Available Quotes</option>
  <option value="Accepted Quotes">Accepted Quotes</option>
  <option value="Completed Quotes">Completed Quotes</option>
</select>