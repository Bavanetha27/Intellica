import React from "react";
import { FiChevronDown } from "react-icons/fi";

const CitationsPanel = ({ sources, expandedSources, toggleSource }) => (
  <div className="p-6 rounded-3xl bg-white shadow flex-1 overflow-y-auto">
    <h3 className="font-semibold text-gray-800 mb-4">Citations / Sources</h3>
    <div className="flex flex-col gap-4">
      {sources.map((src, idx) => (
        <div
          key={idx}
          className="border-l-4 border-indigo-400 bg-gray-50 p-4 rounded-xl cursor-pointer hover:bg-gray-100 transition"
          onClick={() => toggleSource(idx)}
        >
          <div className="flex justify-between items-center">
            <p className="font-medium text-gray-700">
              [{idx + 1}] {src?.file_name || "Unknown"}
            </p>
            <FiChevronDown
              className={`transition-transform ${
                expandedSources[idx] ? "rotate-180" : ""
              }`}
            />
          </div>
          {expandedSources[idx] && (
            <div className="mt-2 space-y-2">
              {src?.source_type === "image" && (
                <img
                  src={src.raw_path}
                  alt={src.file_name}
                  className="max-h-48 w-full object-contain rounded-xl"
                />
              )}
              {src?.source_type === "audio" && (
                <audio controls className="w-full rounded-xl">
                  <source src={src.raw_path} />
                </audio>
              )}
              {(src?.source_type === "docx" ||
                src?.source_type === "pdf" ||
                src?.source_type === "text") && (
                <p className="text-gray-600 text-sm">{src.text}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default CitationsPanel;
