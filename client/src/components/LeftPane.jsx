import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";
import FileList from "./FileList";

const LeftPane = ({ uploadedFiles, setUploadedFiles, handleFileSelect, selectedFile }) => (
  <div className="w-full md:w-1/3 flex flex-col gap-4">
    {/* Upload Area */}
    <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Upload Documents</h2>
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-2xl cursor-pointer hover:bg-gray-50 transition duration-300">
        <FiUpload size={36} className="text-indigo-500 mb-2" />
        <span className="text-gray-700 font-medium">Click or Drag to Upload</span>
        <input
          type="file"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files);
            console.log(files);
            setUploadedFiles(prev => [...prev, ...files]);
            files.forEach(file => handleFileSelect(file));
          }}
          className="hidden"
        />
      </label>
    </div>

    {/* File List */}
    <div className="bg-white rounded-3xl shadow-lg p-6 flex-1 flex flex-col">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Uploaded Files</h2>
      <FileList files={uploadedFiles} handleSelect={handleFileSelect} />

      {selectedFile && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl shadow-inner">
          <h3 className="font-semibold text-gray-800">{selectedFile.name}</h3>
          {selectedFile.type.startsWith("image") && (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt={selectedFile.name}
              className="mt-2 max-h-48 w-full object-contain rounded-xl shadow-sm"
            />
          )}
          {selectedFile.type.startsWith("audio") && (
            <audio controls className="mt-2 w-full rounded-xl">
              <source src={URL.createObjectURL(selectedFile)} />
            </audio>
          )}
          {(selectedFile.type === "application/pdf" ||
            selectedFile.type ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document") && (
            <p className="mt-2 text-gray-500 text-sm">Preview not available.</p>
          )}
        </div>
      )}
    </div>
  </div>
);

export default LeftPane;
