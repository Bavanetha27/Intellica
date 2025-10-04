import React from "react";
import { FiImage, FiMic, FiSend } from "react-icons/fi";

const QueryPanel = ({
  textQuery,
  setTextQuery,
  imageQuery,
  setImageQuery,
  audioQuery,
  setAudioQuery,
  recording,
  startRecording,
  stopRecording,
  handleUpload,
  handleQuerySubmit
}) => (
  <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col gap-4">
    <h2 className="text-2xl font-bold text-gray-700">Ask a Question</h2>
    <div className="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        placeholder="Type your query..."
        value={textQuery}
        onChange={(e) => setTextQuery(e.target.value)}
        className="flex-1 p-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <label className="flex items-center justify-center p-3 rounded-2xl border border-gray-300 hover:bg-gray-100 cursor-pointer transition">
        <FiImage className="text-indigo-500" size={24} />
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files[0];
            setImageQuery(file);
            await handleUpload(file);
          }}
          className="hidden"
        />
      </label>

      <div className="flex items-center gap-2">
        <button
          onClick={recording ? stopRecording : startRecording}
          className={`p-3 rounded-2xl border ${
            recording ? "bg-red-500 text-white" : "border-gray-300 hover:bg-gray-100"
          } transition`}
        >
          <FiMic size={24} />
        </button>
        <label className="flex items-center justify-center p-3 rounded-2xl border border-gray-300 hover:bg-gray-100 cursor-pointer transition">
          Upload
          <input
            type="file"
            accept="audio/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              setAudioQuery(file);
              await handleUpload(file);
            }}
            className="hidden"
          />
        </label>
      </div>

      <button
        onClick={handleQuerySubmit}
        className="bg-indigo-500 text-white px-6 rounded-2xl hover:bg-indigo-600 transition flex items-center gap-2"
      >
        <FiSend /> Ask
      </button>
    </div>

    {audioQuery && (
      <audio
        controls
        src={URL.createObjectURL(audioQuery)}
        className="mt-2 w-full rounded-xl"
      />
    )}
  </div>
);

export default QueryPanel;
