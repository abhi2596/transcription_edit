"use client";
import { useState } from "react";
import axios from "axios";
import Transcript from "./transcript";
import "../styles/globals.css";

export default function Button() {
    const [transcript, setTranscript] = useState(null);

    function handleClick() {
        document.getElementById("fileUpload").click();
    }

    async function handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post('/api/transcribe', formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                      },
                }
            );
            const transcriptText = response.data.transcript;
            setTranscript(transcriptText);
        }
    }

    return (
        <>
            <div className='mb-4'>Notes App</div>
            <div className='mb-4'>
                <input type="file" id="fileUpload" onClick={handleFileChange} accept="audio/*" className='hidden' />
                <button onClick={handleClick} className='py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'>
                    Upload File
                </button>
            </div>
            <Transcript transcriptText={transcript} />
        </>
    )
}
