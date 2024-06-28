import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import Navigation from './components/Navigation';
import Section from './components/Section';
import Product from './components/Product';

import Dappazon from './abis/Dappazon.json';
import config from './config';


function App() {
  const [dappazon, setDappazon] = useState(null);
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState('');



  const [electronics, setElectronics] = useState(null)
  const [clothing, setClothing] = useState(null)
  const [toys, setToys] = useState(null)

  const [item, setItem] = useState({})
  const [toggle, setToggle] = useState(false)

  const togglePop = (item) => {
    setItem(item)
    toggle ? setToggle(false) : setToggle(true)
  }


  const loadBlockchainData = async () => {


    const provider = new ethers.BrowserProvider(window.ethereum)
    setProvider(provider)
    const network = await provider.getNetwork()


    const dappazon = new ethers.Contract(config[network.chainId].dappazon.address, Dappazon.abi, provider)
    setDappazon(dappazon)



    const items = []

    for (var i = 0; i < 9; i++) {
      const item = await dappazon.items(i + 1)
      items.push(item)
    }



    const electronics = items.filter((item) => item.category === 'electronics')
    const clothing = items.filter((item) => item.category === 'clothing')
    const toys = items.filter((item) => item.category === 'toys')



    setElectronics(electronics)
    setClothing(clothing)
    setToys(toys)


  }

  useEffect(() => {
    loadBlockchainData();
  }, []);
  return (
    <div className="App">
      <Navigation account={account} setAccount={setAccount} />

      {electronics && clothing && toys && (
        <>
          <Section title={"Clothing & Jewelry"} items={clothing} togglePop={togglePop} />
          <Section title={"Electronics & Gadgets"} items={electronics} togglePop={togglePop} />
          <Section title={"Toys & Gaming"} items={toys} togglePop={togglePop} />
        </>
      )}

      {toggle && (
        <Product item={item} provider={provider} account={account} dappazon={dappazon} togglePop={togglePop} />
      )}
    </div>
  );
}

export default App;
