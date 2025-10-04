import React from "react";
import { FiFileText } from "react-icons/fi";

const FileList = ({ files, handleSelect }) => (
  <div className="flex-1 overflow-y-auto space-y-2">
    {files.map((file, idx) => (
      <div
        key={idx}
        onClick={() => handleSelect(file)}
        className="flex items-center p-3 border rounded-xl hover:shadow-lg cursor-pointer transition transform hover:scale-105 "
      >
        <FiFileText className="mr-3 text-indigo-400" />
        <span className="truncate">{file.name}</span>
      </div>
    ))}
  </div>
);

export default FileList;
