import React, { useState, useEffect } from 'react';
import { db } from '../Config/firebase';
import { get, ref, push, set, remove, update } from "firebase/database";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import Loader from '../Components/Loader';
import { useParams } from 'react-router-dom';

const PoemList = () => {
    const { emotion } = useParams();
    // const filteredPoems = emotion.filter(poem => poem.emotion === emotion);
    console.log(emotion)
    return (
        <div className="container-fluid" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>

        </div>
    );
}

export default PoemList;
