import { getSubtitles } from 'youtube-captions-scraper';

export default async function handler(req, res) {
  console.log(req);
  const { videoId } = req.query;

  try {
    const subtitles = await getSubtitles({
      videoID: videoId,
      lang: 'en',
    });
    res.status(200).json(subtitles);
  } catch (error) {
    console.error('Error fetching subtitles:', error.message);
    res.status(500).json({ error: error.message });
  }
}
