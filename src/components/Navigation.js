import { ethers } from 'ethers';

const Navigation = ({ account, setAccount }) => {
    return (
        <nav className=' bg-[#182344] w-full py-8 px-4 md:px-12 flex flex-row justify-between'>
            <div className='md:text-6xl text-4xl font-serif font-bold text-center text-white'>Dappazon</div>
            {account ? (
                <button className='md:text-2xl text-xs md:px-8 px-3 md:py-3 py-1 text-center bg-yellow-400 font-bold rounded-xl'>{account.slice(0,6)+'...'+account.slice(-4)}</button>
            ) : (
                <button
                    className='md:text-2xl text-xs md:px-8 px-3 md:py-3 py-1 text-center bg-yellow-400 font-bold rounded-xl'
                    onClick={async () => {
                        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accountt = ethers.getAddress(accounts[0]);
    setAccount(accountt);
                    }}
                >
                    Connect Wallet
                </button>
            )}
        </nav>
    );
}

export default Navigation;