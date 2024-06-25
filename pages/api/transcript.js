import ytdl from 'ytdl-core';
import xml2js from 'xml2js';
import https from 'https';

async function fetchTranscript(videoId) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const info = await ytdl.getBasicInfo(videoUrl);
  const captionTracks = info.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  if (!captionTracks) {
    throw new Error("No transcript found for this video.");
  }

  const transcriptUrl = captionTracks[0]?.baseUrl;
  if (!transcriptUrl) {
    throw new Error("No transcript URL found.");
  }

  return await fetchAndParseTranscript(transcriptUrl);
}

function fetchAndParseTranscript(transcriptUrl) {
  return new Promise((resolve, reject) => {
    https.get(transcriptUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(`Failed to fetch transcript. Status code: ${res.statusCode}`);
        return;
      }

      let xmlData = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        xmlData += chunk;
      });
      res.on('end', () => {
        xml2js.parseString(xmlData, (err, result) => {
          if (err) {
            reject("Error parsing XML.");
          } else {
            const transcript = result.transcript.text.map(text => text._);
            resolve(transcript);
          }
        });
      });
    }).on('error', (error) => {
      reject("Failed to fetch transcript.");
    });
  });
}

export default async function handler(req, res) {
  const { videoId } = req.query;
  try {
    const transcript = await fetchTranscript(videoId);
    res.json({ transcript });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
