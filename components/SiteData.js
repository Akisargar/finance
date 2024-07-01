import React, { useEffect } from 'react';

function SiteData({ url }) {
  const uniqueId = `stock-web-info-${url.replace(/[^a-zA-Z0-9]/g, '-')}`;

  async function getFetchData(url) {
    try {
      const response = await fetch(`/api/fetchData?url=${url}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  async function sendDataToChatGPT(array, prompt) {
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

  useEffect(() => {
    const stockWebInfo = document.getElementById(uniqueId);
    getFetchData(url)
      .then(dataFromURL => {
        console.log(dataFromURL);
        return sendDataToChatGPT(dataFromURL, 'Analyze the data and list down stocks discussed with one-liner summary for each stock');
      })
      .then(response => {
        const responseElement = document.createElement('pre');
        responseElement.textContent = response;
        stockWebInfo.appendChild(responseElement);
      })
      .catch(error => {
        console.error('Error processing data:', error);
      });
  }, [url, uniqueId]);

  return (
    <>
      <h3 className="Website-Name">{url}</h3><hr/>
      <div id={uniqueId} className="stock-web-info"></div>
    </>
  );
}

export default SiteData;
