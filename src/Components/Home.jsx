import React from 'react'
// import Navbar from './Navbar'
import SecureTransaction from './SecureTransaction';
// import Dashboard from './Dashboard';

const Home = () => {
    return (
        <div>
            <div>
                <SecureTransaction/>
            </div>
            <div className='text-black mt-10 mb-4'>
                <h1 className='text-center'>support@securetrace.io - securedapp.io - 2024 </h1>
                <h1 className='text-center'>Terms od service and privacy</h1>
            </div>
        </div>
    )
}

export default Home;
