import Head from 'next/head';
import InfluencerCard from '../components/InfluencerCard';
import 'bootstrap/dist/css/bootstrap.min.css';
// import '../styles/globals.css';

export default function Home() {
  const influencers = ["Rachana Ranade", "Akshat Shrivastav", "Pranjal Kamra", "Sunil Mingalani", "Ravi Kumar Stock market"];

  return (
    <div>
      <Head>
        <title>Money control | Daily Updates of Stock market</title>
      </Head>
      <div className="container-fluid bg-dark text-white">
        <div className="container">
          <div className="row align-items-center py-4">
            <div className="col-md-6">
              <h2>Daily Updates of Stock market</h2>
            </div>
            <div className="col-md-6">
              <img src="../public/IMG.png" alt="Stock Market" />
            </div>
          </div>
        </div>
      </div>
      <div className="container my-4">
        <h2>Influencers :</h2>
        <div className="container-wrapper row my-4">
          {influencers.map(name => (
            <InfluencerCard key={name} name={name} />
          ))}
          <div className="stock-info"></div>
        </div>
        <h3 className="generate-text my-2">Results:</h3>
        <div className="card col-md-12 my-4">
          <div className="my-3">
            <div className="title-text">
              <h5 className="bottom-text">Expected Stocks:</h5>
              <br />
              <div id="chatgpt-response"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
