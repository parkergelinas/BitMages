import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export interface IAuctionPageProps {};

const AuctionPage: React.FunctionComponent<IAuctionPageProps> = props => {
    const [message, setMessage] = useState('');
    const { number } = useParams();

    useEffect(() => {
        if (number) {
            setMessage('The number is ' + number);
        } else {
            setMessage('No number provided');
        }
    }, []);

    return (
        <div>
            <p>This is a test page.</p>
        </div>
    )
};

export default AuctionPage;