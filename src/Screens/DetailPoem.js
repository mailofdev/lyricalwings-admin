import React from 'react';
import { useLocation } from 'react-router-dom';

const DetailPoem = () => {
    const location = useLocation();
    const { poem } = location.state;

    console.log(poem); // Display the poem data in the console

    return (
        <div>
            <h1>{poem.titleValue}</h1>
            <div dangerouslySetInnerHTML={{ __html: poem.backgroundOfPoem }}></div>
            <div dangerouslySetInnerHTML={{ __html: poem.poemContent }}></div>
            {/* Add more poem details as needed */}
        </div>
    );
}

export default DetailPoem;
