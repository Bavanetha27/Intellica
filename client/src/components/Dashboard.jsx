import React, { useState, useRef } from "react";
import Header from "./Header";
import LeftPane from "./LeftPane";
import RightPane from "./RightPane";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  // States
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textQuery, setTextQuery] = useState("");
  const [imageQuery, setImageQuery] = useState(null);
  const [audioQuery, setAudioQuery] = useState(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [expandedSources, setExpandedSources] = useState({});
  const [loading, setLoading] = useState(false);

  // ---------------- Knowledge Base Upload ----------------
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      await axios.post("http://localhost:8000/upload", formData);
      toast.success(`${file.name} uploaded successfully!`);
    } catch (err) {
      console.error(err);
      toast.error(`Upload failed for ${file.name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    await handleUpload(file);
  };

  // ---------------- Query Handlers ----------------

  const handleAudioQuery = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("http://localhost:8000/transcribe", formData);
      const queryText = res.data.text;
      setTextQuery(queryText);

      const answerRes = await axios.post("http://localhost:8000/query", { query: queryText });
      setAnswer(answerRes.data.answer);
      setSources(answerRes.data.sources || []);
    } catch (err) {
      console.error(err);
      toast.error("Error processing audio query");
    } finally {
      setLoading(false);
    }
  };

  const handleImageQuery = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("http://localhost:8000/ocr", formData);
      const queryText = res.data.text;
      setTextQuery(queryText);

      const answerRes = await axios.post("http://localhost:8000/query", { query: queryText });
      setAnswer(answerRes.data.answer);
      setSources(answerRes.data.sources || []);
    } catch (err) {
      console.error(err);
      toast.error("Error processing image query");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Audio Recording ----------------
  const startRecording = async () => {
    if (!navigator.mediaDevices) return toast.error("Audio recording not supported.");
    setAudioQuery(null);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    let chunks = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioQuery(blob);
      await handleAudioQuery(blob);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // ---------------- Text Query ----------------
  const handleQuerySubmit = async () => {
    if (!textQuery.trim()) return toast.error("Enter a query");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/query", { query: textQuery });
      setAnswer(res.data.answer);
      setSources(res.data.sources || []);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching answer");
    } finally {
      setLoading(false);
    }
  };

  const toggleSource = (idx) => {
    setExpandedSources((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-col md:flex-row flex-1 gap-6 p-6 bg-gray-100">
        <LeftPane
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          handleFileSelect={handleFileSelect}
          selectedFile={selectedFile}
        />
        <RightPane
          textQuery={textQuery}
          setTextQuery={setTextQuery}
          imageQuery={imageQuery}
          setImageQuery={setImageQuery}
          audioQuery={audioQuery}
          setAudioQuery={setAudioQuery}
          recording={recording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          handleImageQuery={handleImageQuery}
          handleAudioQuery={handleAudioQuery}
          handleQuerySubmit={handleQuerySubmit}
          answer={answer}
          sources={sources}
          expandedSources={expandedSources}
          toggleSource={toggleSource}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Dashboard;
