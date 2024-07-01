import React, { useEffect, useState } from 'react';

async function searchVideos(query) {
  const apiKey = 'AIzaSyCy6WWY4_PmSIoR4IzAFzIIoxJu03GqgG8'; // Store API key in environment variables
  const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=${query}&part=snippet&maxResults=1&type=video`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (response.ok) {
      return data.items.map(item => ({
        title: item.snippet.title,
        videoId: item.id.videoId,
        publishedAt: item.snippet.publishedAt,
      }));
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    console.error('Error searching for videos:', error);
    throw error;
  }
}

async function getVideoTranscript(videoId) {
  try {
    const response = await fetch(`/api/transcript?videoId=${videoId}`);
    const transcript = await response.json();
    return transcript.transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
}

async function sendArrayToChatGPT(array, prompt) {
  try {
    const response = await fetch('/api/sendArrayToChatGPT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ array, prompt })
    });

    if (!response.ok) {
      throw new Error('Failed to send array to ChatGPT');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error sending array to ChatGPT:', error);
    throw error;
  }
}

async function saveVideo(videoObj) {
  try {
    const response = await fetch('/api/saveVideo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ videoObj })
    });

    if (!response.ok) {
      throw new Error('Failed to save video');
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error saving video:', error);
    throw error;
  }
}

const InfluencerCard = ({ name }) => {
  const [videoArray, setVideoArray] = useState([]);

  useEffect(() => {
    const query = name;
    const idSuffix = typeof name === 'string' ? name.replace(/ /g, '-') : 'default';
    const videoList = document.querySelector(`#${idSuffix}-videoList`);
    const expectedResult = document.getElementById('chatgpt-response');

    searchVideos(query)
      .then(videos => {
        videos.forEach(video => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<h3 id="description-text ${video.videoId}">${video.title}: ${new Date(video.publishedAt).toLocaleDateString()}</h3>`;
          videoList.appendChild(listItem);
          getVideoTranscript(video.videoId)
            .then(transcriptArray => {
              sendArrayToChatGPT(transcriptArray, 'Analyze the transcript and list down stocks discussed with one-liner summary for each stock')
                .then(response => {
                  const videoObj = {
                    id: video.videoId,
                    name: name,
                    title: video.title,
                    date: video.publishedAt,
                    transcript: transcriptArray,
                    chatGPTresponse: response
                  };
                  setVideoArray(oldArray => {
                    saveVideo(videoObj); // Save video one by one
                    return [...oldArray, videoObj];
                  });
                  const expectedResult = document.getElementById('chatgpt-response');
                  expectedResult.setAttribute('id', video.videoId);
                  const chatgptResponse = document.createElement("div");
                  chatgptResponse.innerHTML = `<h5 className="bottom-text">Expected result :-</h5><br><h3 id="chatgpt-response ${video.videoId}">${response}</h3>`;
                  expectedResult.appendChild(chatgptResponse);
                })
                .catch(error => console.error('Error sending array to ChatGPT:', error));
            })
            .catch(error => console.error('Error fetching transcript:', error));
        });
      })
      .catch(error => console.error('Failed to search videos:', error));
  }, [name]);

  return (
    <div className="col-md-12">
      <div className="card my-2 bg-white text-dark bg-opacity-50">
        <div className="card-body">
          <h3 className="generate-text">{name}</h3>
          <div className="title-text">
            <h5 className="bottom-text">Latest Videos:-</h5>
            <br />
            <div className="videoResults">
              <ul id={typeof name === 'string' ? `${name.replace(/ /g, '-')}-videoList` : 'default-videoList'} className="videoList"></ul>
            </div>
            <br />
            <div id="chatgpt-response"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerCard;
