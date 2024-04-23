import React, { useState } from 'react';
import SquareCardList from '../Components/SquareCard';
import { BiHappyBeaming } from "react-icons/bi";
import DynamicTable from '../Components/DynamicTable';

import InputTextarea from '../Components/InputTextarea';
const Dashboard = () => {

    const cardData = [
        { id: 1, label: "Users", icon: <BiHappyBeaming />, quantity: 10 },
        { id: 2, label: "Poems", icon: <BiHappyBeaming />, quantity: 15 },
        { id: 3, label: "Stories", icon: <BiHappyBeaming />, quantity: 20 },
        { id: 4, label: "Feedback", icon: <BiHappyBeaming />, quantity: 12 },
    ];

    const tableData = [
        { Id: 1, name: 'John', email: 'test@gmail.com', },
        { Id: 2, name: 'Alice', email: 'test@gmail.com', },
        { Id: 3, name: 'Bob', email: 'test@gmail.com', }
    ];

    const tableStyle = {
        border: '1px solid black',
        borderCollapse: 'collapse'
    };

    const cellStyle = {
        border: '1px solid black',
        padding: '8px'
    };

    const [textareaValue, setTextareaValue] = useState('');

    const handleTextareaChange = (event) => {
        setTextareaValue(event.target.value);
    };


    return (
        <div className='text-center'>
            <SquareCardList data={cardData} />
            <DynamicTable
                title="Admin list"
                data={tableData}
            />
            <InputTextarea
                value={textareaValue}
                onChange={handleTextareaChange}
                placeholder="Enter your text here"
            />
            <p>You typed: {textareaValue}</p>

           
          
         
        </div>
    );
}

export default Dashboard;
