import './output.css';

const Table = ({ data, filter, fileName }) => {
    if (!data || Object.keys(data).length === 0) return;

    const sortedEntries = Object.entries(data).sort(([codeA], [codeB]) => {
        const numA = parseInt(codeA.slice(1)); 
        const numB = parseInt(codeB.slice(1));

        if (codeA[0] === codeB[0]) {
            return numA - numB; 
        }
        return codeA.localeCompare(codeB);
    });

    // Apply filtering
    const lowerCaseFilter = filter.toLowerCase();
    const filteredEntries = sortedEntries.filter(([code, value]) =>
        code.toLowerCase().includes(lowerCaseFilter) ||
        (typeof value === 'object' && value.description.toLowerCase().includes(lowerCaseFilter))
    );

    return (
        <>
            <div className="bg-white p-5 rounded-2xl">
                <table className={`w-full border-collapse border border-gray-400 ${data ? 'max-sm:text-sm' : ''}`}>
                    <thead>
                        <tr>
                            <th colSpan={3} className='text-left'>{fileName}</th>
                        </tr>
                        <tr className="bg-gray-300">
                            <th className="border border-gray-400 p-2">Code</th>
                            <th className="border border-gray-400 p-2">Description</th>
                            <th className="border border-gray-400 p-2">Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEntries.length > 0 ? (
                            filteredEntries.map(([code, value]) => (
                                <tr key={code} className="border border-gray-400">
                                    <td className="border border-gray-400 p-2">{code}</td>
                                    <td className="border border-gray-400 p-2">{typeof value === 'object' ? value.description : ''}</td>
                                    <td className="border border-gray-400 p-2">{typeof value === 'object' ? value.count : value}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center p-3 text-gray-500">No matching results</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Table;