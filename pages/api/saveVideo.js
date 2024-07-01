import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { videoObj } = req.body;

    const filePath = path.join(process.cwd(), 'public', 'video.json');

    // Read the existing file
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return res.status(500).json({ message: 'Failed to read video file' });
      }

      let videoArray = [];
      if (data) {
        try {
          videoArray = JSON.parse(data);
        } catch (parseErr) {
          console.error('Error parsing JSON:', parseErr);
          return res.status(500).json({ message: 'Failed to parse video file' });
        }
      }

      // Check if the video ID already exists
      const existingIndex = videoArray.findIndex(video => video.id === videoObj.id);
      if (existingIndex !== -1) {
        videoArray[existingIndex] = videoObj; // Update the existing object
      } else {
        videoArray.push(videoObj); // Add the new object
      }

      // Write the updated array back to the file
      fs.writeFile(filePath, JSON.stringify(videoArray, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error writing to file:', writeErr);
          return res.status(500).json({ message: 'Failed to save video array' });
        }
        res.status(200).json({ message: 'Video array saved successfully' });
      });
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
