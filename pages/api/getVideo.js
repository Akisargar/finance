import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { videoId } = req.query;
    const filePath = path.join(process.cwd(), 'public', 'video.json');

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

      const video = videoArray.find(video => video.id === videoId);
      if (video) {
        res.status(200).json(video);
      } else {
        res.status(404).json({ message: 'Video not found' });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
