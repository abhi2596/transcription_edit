'use client';
import { useState } from "react";
import axios from 'axios';

export default function Home() {
  const [fileURL, setFileURL] = useState(null);
  const [transcriptText, setTranscriptText] = useState("");

  function handleClick() {
    document.getElementById('fileUpload').click();
  }

  async function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async function() {
        const arrayBuffer = reader.result;
        const baseUrl = 'https://api.assemblyai.com/v2';
        console.log(process.env.assembly_api_key);
        const headers = {
          authorization: process.env.assesmbly_api_key
        };

        // Upload audio file
        const uploadResponse = await axios.post(`${baseUrl}/upload`, arrayBuffer, { headers });
        const uploadUrl = uploadResponse.data.upload_url;

        // Transcribe audio file
        const response = await axios.post(`${baseUrl}/transcript`, { audio_url: uploadUrl }, { headers: { authorization: headers.authorization } });
        const transcriptId = response.data.id;
        const pollingEndpoint = `${baseUrl}/transcript/${transcriptId}`;

        // Polling for transcription result
        while (true) {
          const pollingResponse = await axios.get(pollingEndpoint, { headers: { authorization: headers.authorization } });
          const transcriptionResult = pollingResponse.data;

          if (transcriptionResult.status === 'completed') {
            setTranscriptText(transcriptionResult.text);
            break;
          } else if (transcriptionResult.status === 'error') {
            throw new Error(`Transcription failed: ${transcriptionResult.error}`);
          } else {
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        }
      };
      reader.onerror = function(error) {
        console.error('Error reading file:', error);
      };
    }
  }

  return (
    <main className="flex flex-col items-center justify-center">
      <div className="mb-4">
        TranscribeAI EditHuman
      </div>
      <div className="mb-4">
        <input type="file" id="fileUpload" name="fileUpload" accept="audio/*" className="hidden" onChange={handleFileChange} />
        <button
          className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          type="button"
          onClick={handleClick}
        >
          Upload Audio
        </button>
      </div>
      <div id="transcript" contentEditable>
        {transcriptText}
      </div>
    </main>
  );
}
