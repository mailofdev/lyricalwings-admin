import React, { useState, useEffect } from 'react';
import { db, ref, set, get } from '../Config/firebase';
import Loader from "../Components/Loader";
import "../css/customSidebar.css";
import '../App.css';
import "../css/loader.css";
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function About() {
    const [text, setText] = useState('');
    const [aboutData, setAboutData] = useState({});
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [dataId, setDataId] = useState('');
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [contentChanged, setContentChanged] = useState(false); // State to track if content is changed
    const [contentCount, setContentCount] = useState(0); // State to track the number of contents added

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const aboutRef = ref(db, 'About/aboutUs');
            const snapshot = await get(aboutRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                setAboutData(data);
                setContentCount(Object.keys(data).length); // Set the content count based on existing data
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const saveData = async () => {
        const aboutRef = ref(db, `About/aboutUs/${editing ? dataId : Date.now()}`);
        const data = { text };

        await set(aboutRef, data);

        if (editing) {
            setAboutData((prevData) => ({ ...prevData, [dataId]: data }));
        } else {
            const newId = Date.now().toString();
            setAboutData((prevData) => ({ ...prevData, [newId]: data }));
            setContentCount((prevCount) => prevCount + 1); // Increment content count on adding new content
        }

        setEditing(false);
        setText('');
        setShowAddPanel(false); // Close the add data panel after saving
        setContentChanged(false); // Reset content changed state
    };

    const editData = (id) => {
        setText(aboutData[id].text);
        setEditing(true);
        setDataId(id);
        setShowAddPanel(true); // Show the add data panel for editing
    };

    const deleteData = async (id) => {
        await set(ref(db, `About/aboutUs/${id}`), null);
        const updatedData = { ...aboutData };
        delete updatedData[id];
        setAboutData(updatedData);
        setContentCount((prevCount) => prevCount - 1); // Decrement content count on deleting content
        setText('');
        setEditing(false);
        setShowAddPanel(false); // Close the add data panel if open
    };

    const cancelEdit = () => {
        setText('');
        setEditing(false);
        setShowAddPanel(false);
        setContentChanged(false); // Reset content changed state
    };

    const handleChange = (value) => {
        setText(value);
        setContentChanged(value.trim() !== ''); // Check if content is not empty
    };

    return (
        <>
            <div className='container'>
                <div className='card shadow-sm'>
                    <Panel header="About us" toggleable>
                        {showAddPanel ? (
                            <div className="card">
                                <div className='p-2'>
                                    <div>{editing ? "Edit content" : "Add content"}</div>
                                    <ReactQuill 
                                        theme="snow"
                                        key={editing ? dataId : 'new'}  // Ensure re-render
                                        value={text} 
                                        onChange={handleChange} 
                                    />
                                    <div className='text-center'>
                                        <Button 
                                            label={editing ? "Update" : "Save"} 
                                            onClick={saveData} 
                                            className="mt-2" 
                                            disabled={!contentChanged || contentCount >= 3} // Disable if content not changed or content count reaches 3
                                        />
                                        <Button label="Cancel" onClick={cancelEdit} className="mt-2 ml-2 p-button-secondary" />
                                    </div>          
                                </div>
                            </div>
                        ) : (
                            // <Button label="Add content" onClick={() => setShowAddPanel(true)} className="mt-2" disabled={contentCount >= 1} /> 
                            contentCount < 1 && (
                                <Button label="Add content" onClick={() => setShowAddPanel(true)} className="mt-2" /> 
                            )
                        )}

                        {loading ? <Loader loadingMessage="loading.." /> : (
                            Object.keys(aboutData).length > 0 && (
                                <div className="mt-4">
                                    {Object.entries(aboutData).map(([key, data]) => (
                                        <div key={key} className="mb-2 card shadow-sm p-2">
                                            <div dangerouslySetInnerHTML={{ __html: data.text }}></div>
                                            <div className="mt-2 d-flex gap-2">
                                                <Button label="Edit" onClick={() => editData(key)} className="p-button-warning mr-2" />
                                                <Button label="Delete" onClick={() => deleteData(key)} className="p-button-danger" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </Panel>
                </div>
            </div>
        </>
    );
}

export default About;
