import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faX,
  faWandSparkles,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import Table from "../components/output.jsx";
import "./App.css";

const App = () => {
  const [data, setData] = useState({});
  const [rawText, setRawText] = useState("");
  const fileInputRef = useRef(null);
  const [filterText, setFilterText] = useState("");

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = (e) => {
      const text = e.target.result;
      setRawText(text);
      setData(countGCodeMCode(text));
      console.log("data: ", data);
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };
  };

  const countGCodeMCode = (text) => {
    const regex = /(M\d+)\s*\(([^)]+)\)|\b(G\d+)\b/g;
    const matches = [...text.matchAll(regex)];

    const counts = matches.reduce((acc, match) => {
      if (match[1]) {
        // If it's an M-code with a description
        const code = match[1];
        const description = match[2];
        if (!acc[code]) {
          acc[code] = { description, count: 0 };
        }
        acc[code].count += 1;
      } else if (match[3]) {
        // If it's a G-code (no description)
        const code = match[3];
        acc[code] = (acc[code] || 0) + 1;
      }
      return acc;
    }, {});

    console.log("counts: ", counts);
    return counts;
  };

  const handleSearch = (e) => {
    setFilterText(e.target.value);
  };

  const downloadCSV = () => {
    if (!fileInputRef.current?.files[0]) return;

    const fileName = fileInputRef.current.files[0].name.replace(
      /\.[^/.]+$/,
      ""
    );
    let csvContent = `data:text/csv;charset=utf-8,${fileName}\n\n`;

    csvContent += "Code,Description,Count\n";

    const sortedEntries = Object.entries(data).sort(([codeA], [codeB]) => {
      const numA = parseInt(codeA.slice(1)); // Extract number part
      const numB = parseInt(codeB.slice(1));

      if (codeA[0] === codeB[0]) {
        return numA - numB; 
      }
      return codeA.localeCompare(codeB);
    });

    sortedEntries.forEach(([code, value]) => {
      if (typeof value === "object") {
        csvContent += `${code},${value.description},${value.count}\n`;
      } else {
        csvContent += `${code},,${value}\n`;
      }
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`); // Keeps original filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemoveFile = () => {
    setData({});
    setRawText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="font-inter box-border flex w-screen h-screen overflow-hidden max-sm:flex-col">
      <div className={`w-1/2 h-screen bg-[#608BC1] flex flex-col justify-center items-center max-sm:w-full ${rawText ? 'max-sm:h-2/6 max-sm:w-full' : ''}`}>
        <div className={`text-center mb-5 w-md max-sm:w-sm ${rawText ? 'max-sm:hidden' : ''}`}>
          <p className={`font-bold mb-3 text-4xl max-sm:text-3xl`}>
            Identify G-code & M-code with{" "}
            <span className="text-white">MG Reader</span>!
          </p>
          <p className="mb-5">
            Upload your{" "}
            <span className="bg-gray-100 rounded-md py-1 px-2">.nc</span> file
            and see check the result
          </p>
          {/* <p className='text-2xl'>👇</p> */}
          <hr />
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="data_file"
            className="bg-white px-3 py-1 rounded-md border-1 border-gray-400 cursor-pointer
                hover:bg-gray-100 transition-colors"
          >
            Choose File
          </label>
          <input
            type="file"
            id="data_file"
            accept="*/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleUpload}
          />
          <span>
            {rawText ? (
              <>{fileInputRef.current?.files[0]?.name} </>
            ) : (
              "No file chosen"
            )}
          </span>
        </div>
        {rawText && (
          <div className={`mt-5 p-3 border rounded-lg w-3/4 max-w-2xl bg-gray-100 ${rawText ? 'max-sm:p-2' : ''}`}>
            <div className="flex justify-between items-center mb-1">
              <h2 className={`text-md font-bold mb-3 ${rawText ? 'max-sm:mb-0' : ''}`}>
                {fileInputRef.current?.files[0]?.name}
              </h2>
              <button
                type="button"
                title="Remove file"
                className="decoration-0 bg-white h-6 cursor-pointer border-1 rounded-sm px-1 py-0.5 flex"
                onClick={handleRemoveFile}
              >
                <FontAwesomeIcon icon={faX} size="xs" color="red" />
              </button>
            </div>
            <pre className={`overflow-scroll h-56 text-sm bg-white p-2 rounded-md border ${rawText ? 'max-sm:h-32' : ''}`}>
              {rawText}
            </pre>
          </div>
        )}
      </div>
      <div className={`w-1/2 bg-[#F3F3E0] items-center flex justify-center flex-col max-sm:w-auto ${rawText ? 'max-sm:h-4/6 max-sm:w-full' : ''}`}>
        {!rawText ? (
          <>
            <label
              htmlFor="data_file"
              className="cursor-pointer flex flex-col text-3xl font-bold text-[#608BC1] border-dashed border-4 rounded-3xl h-13/14 w-3/4 justify-center justify-self-center items-center
                            max-sm:w-0 max-sm:hidden"
              onClick={handleUpload}
            >
              Upload file and cast your spell
              <span>
                <FontAwesomeIcon
                  icon={faWandSparkles}
                  className="text-amber-300 mt-5"
                />
              </span>
            </label>
          </>
        ) : (
          <>
            <div className="flex w-3/4 h-10 mb-5 max-sm:mt-5">
              <input
                className={`px-5 w-full bg-white rounded-md border-1 border-gray-300`}
                type="text"
                placeholder="search for code..."
                value={filterText}
                onChange={handleSearch}
              />
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className={`absolute top-15 right-1/14 text-gray-500 ${rawText ? 'max-sm:top-9/22 max-sm:right-2/14' : ''}`}
              />
            </div>
            <div className={`bg-white h-3/4 w-3/4 overflow-y-scroll rounded-2xl mb-5`}>
              <Table
                data={data}
                filter={filterText}
                fileName={fileInputRef.current.files[0].name.replace(
                  /\.[^/.]+$/,
                  ""
                )}
              />
            </div>
            <button
              onClick={downloadCSV}
              className={`font-inter w-1/5 h-10 bg-[#608BC1] px-3 py-1 rounded-md border-1 border-gray-400 cursor-pointer
                                hover:bg-[#133E87] transition-colors ${rawText ? 'max-sm:w-2/6 max-sm:mb-5' : ''}`}
            >
              <p className={`text-white text-sm font-bold`}>Download CSV</p>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
