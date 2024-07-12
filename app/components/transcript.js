
export default function Transcript({ transcriptText }) {
    return (
        <div id="transcript" className='mb-4' dangerouslySetInnerHTML={{ __html: transcriptText }}></div>
    )
}