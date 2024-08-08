import axios from 'axios';
import { NextResponse } from "next/server";
import clsx from 'clsx';



export async function POST(req) {
    const baseUrl = 'https://api.assemblyai.com/v2';

    const headers = {
        authorization: process.env.ASSEMBLYAI_API_KEY
    };

    const formData = await req.formData();
    const file = formData.get('file');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResponse = await axios.post(`${baseUrl}/upload`, buffer, {
        headers
    });
    const uploadUrl = uploadResponse.data.upload_url

    const data = {
        audio_url: uploadUrl // You can also use a URL to an audio or video file on the web
    }

    const url = `${baseUrl}/transcript`
    const response = await axios.post(url, data, { headers: headers })

    const transcriptId = response.data.id
    const pollingEndpoint = `${baseUrl}/transcript/${transcriptId}`

    while (true) {
    const pollingResponse = await axios.get(pollingEndpoint, {
        headers: headers
    })
    const transcriptionResult = pollingResponse.data

    if (transcriptionResult.status === 'completed') {
        function formatMilliseconds(ms) {
            let milliseconds = ms % 1000;
            let seconds = Math.floor(ms / 1000) % 60;
            let minutes = Math.floor(ms / (1000 * 60)) % 60;
            let hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
          
            // Pad the values with leading zeros to ensure two digits for hours, minutes, and seconds
            hours = String(hours).padStart(2, '0');
            minutes = String(minutes).padStart(2, '0');
            seconds = String(seconds).padStart(2, '0');
            milliseconds = String(milliseconds).padStart(3, '0');
          
            return `${hours}:${minutes}:${seconds}.${milliseconds}`;
        }
        let text = "";
        text += "<p>WebVTT</p>"
        let start_time,end_time = "";
        let interval_time = 15;
        let subtext = "";
        let classname;
        for (let word of transcriptionResult.words){
            if(!start_time){
                start_time = word.start;
            }
            if (word.end/1000 <= interval_time){
                if(word.confidence <= 0.3){
                    classname = clsx("text-red-300");
                }
                else if ((word.confidence > 0.3) && (word.confidence <= 0.6)){
                    classname = clsx("text-red-600");
                }
                else{
                    classname = clsx("text-red-950");
                }
                subtext += `<span class="${classname}"> ${word.text} </span>`;
                end_time = word.end;
            }
            else if(word.end/1000 > interval_time){
                interval_time += 30;
                text += `<p>${formatMilliseconds(start_time)} --> ${formatMilliseconds(end_time)}</p>`;
                text += `<br><br>`
                text += `<div> ${subtext} </div>`;
                text += `<br>`
                start_time = (word.end);
                interval_time += 15;
                subtext = "";
            }
        }
        console.log(text);
        return NextResponse.json({transcript: text});
    }
    else if (transcriptionResult.status === 'error') {
        NextResponse.error(`Transcription failed: ${transcriptionResult.error}`)
    } else {
        await new Promise((resolve) => setTimeout(resolve, 3000))
    }
    }
}      


export const config = {
    api: {
      bodyParser: {
        sizeLimit: '10mb',
      },
    },
  }