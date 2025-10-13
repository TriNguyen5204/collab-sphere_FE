

function Table({ headers, rows }) {
  return (
    <div className='overflow-x-auto rounded-lg border border-gray-200'>
      <table className='min-w-full text-sm text-gray-700'>
        <thead className='bg-gray-100 text-gray-800'>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className='p-3 text-left font-semibold'>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className={`border-t ${
                i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              } hover:bg-blue-50`}
            >
              {r.map((cell, j) => (
                <td key={j} className='p-3 align-top'>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default Table