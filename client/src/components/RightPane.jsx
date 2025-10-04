import React from "react";
import QueryPanel from "./QueryPanel";
import CitationsPanel from "./CitationsPanel";

const RightPane = ({
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
  handleQuerySubmit,
  answer,
  sources,
  expandedSources,
  toggleSource,
  loading
}) => (
  <div className="w-full md:w-2/3 flex flex-col gap-4">
    <QueryPanel
      textQuery={textQuery}
      setTextQuery={setTextQuery}
      imageQuery={imageQuery}
      setImageQuery={setImageQuery}
      audioQuery={audioQuery}
      setAudioQuery={setAudioQuery}
      recording={recording}
      startRecording={startRecording}
      stopRecording={stopRecording}
      handleUpload={handleUpload}
      handleQuerySubmit={handleQuerySubmit}
    />

    {loading ? (
      <div className="animate-pulse p-6 rounded-3xl bg-white shadow">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    ) : (
      answer && (
        <div className="p-6 rounded-3xl bg-white shadow">
          <h3 className="font-semibold text-gray-800 mb-2">Answer</h3>
          <p>{answer}</p>
        </div>
      )
    )}

    {sources.length > 0 && (
      <CitationsPanel
        sources={sources}
        expandedSources={expandedSources}
        toggleSource={toggleSource}
      />
    )}
  </div>
);

export default RightPane;
