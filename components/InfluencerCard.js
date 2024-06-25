import React, { useEffect } from 'react';

async function searchVideos(query) {
  const apiKey = 'AIzaSyCeTCznpqoKsDru7lDI75Ikoqy-bniyNWA'; // Store API key in environment variables
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

const InfluencerCard = ({ name }) => {
  useEffect(() => {
    const query = name;
    const videoList = document.querySelector(`#${name.replace(/ /g, '-')}-videoList`);
    const expectedResult = document.getElementById('chatgpt-response');
    const chatGPTResponse = document.getElementById('chatgpt-response-wrapper');

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
                  const expectedResult = document.getElementById('chatgpt-response');
                  console.log(transcriptArray);
                  expectedResult.setAttribute('id',video.videoId);
                  const chatgptResponse = document.createElement("div");
                  chatgptResponse.innerHTML = `<h3 id="chatgpt-response ${video.videoId}">${response}</h3>`;
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
    <div className="col-md-6">
      <div className="card my-2 bg-secondary text-white">
        <div className="card-body">
          <h3 className="generate-text">{name}</h3>
          <div className="title-text">
            <h5 className="bottom-text">Latest Videos :-</h5>
            <br />
            <div className="videoResults">
              <ul id={`${name.replace(/ /g, '-')}-videoList`} className="videoList"></ul>
            </div>
            <br />
            <h5 className="bottom-text">Expected result :-</h5>
            <div id="chatgpt-response"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerCard;
