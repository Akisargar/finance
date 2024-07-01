import Head from 'next/head';
import { useState,useEffect } from 'react';
import { useRouter } from 'next/router';  
import InfluencerCard from '../components/InfluencerCard';
import 'bootstrap/dist/css/bootstrap.min.css';
import Styles from '../styles/hero.module.css';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [influencers, setInfluencers] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const router = useRouter();
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    if (!isLoggedIn) {
      // router.push('/login');
      setIsLoggedIn(false);
    } else {
      setIsLoggedIn(true);
    }
    
  }, []);

  // useEffect(() => {
  //   fetch('/influencer.json')
  //     .then(response => response.json())
  //     .then(data => setInfluencers(data));
  // }, []);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    // router.push('/login');
    setIsLoggedIn(false);
  };

  const refreshAll = () => {
    setIsRefreshing(true);
    fetch('/influencer.json')
    .then(response => response.json())
    .then(data => setInfluencers(data))
    // .finally(() => setIsRefreshing(false));
  };
  

  return (
    <>
      <Head>
        <title>Money control | Daily Updates of Stock market</title>
      </Head>
      <div className={`container-fluid text-dark ${Styles.heroBanner}`}>
        <div className={`container ${Styles.container}`}>
          <div className="row align-items-center py-4">
            <div className='col'>
              <h1>Daily Updates of Stock market</h1>
            </div>
            <div className='col d-flex justify-content-end'>
              {!isLoggedIn && <button onClick={handleLogin} className='mx-2'>Login</button>}
              {isLoggedIn && <div><button onClick={handleLogout} className='mx-2'>Logout</button>
              <button className='mx-2' onClick={refreshAll}>Refresh</button></div>}
            </div>
          </div>
        </div>
      </div>
      <div className={`container-fluid ${Styles.dashboard}`}>
        <div className="container">
          <div className="container-wrapper row">
            {influencers.map(influencer => (
              <InfluencerCard key={influencer.name} name={influencer.name} refresh = {isRefreshing} />
            ))}
            <div className="stock-info"></div>
          </div>
          <div className="Website-container">
            <h2 className="web-heading">Details from website</h2>
            <h3 className="Website-Name">https://www.livemint.com/market</h3>
            <div className="stock-info"></div>
          </div>
        </div>
      </div>
    </>
  );
}
