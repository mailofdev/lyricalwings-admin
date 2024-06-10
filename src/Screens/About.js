import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { ConfirmPopup } from 'primereact/confirmpopup';
import { confirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';

const useAboutData = (sectionKey) => {
    const [aboutData, setAboutData] = useState({});
    const [loading, setLoading] = useState(true);
    const [contentCount, setContentCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const aboutRef = ref(db, `About/${sectionKey}`);
                const snapshot = await get(aboutRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setAboutData(data);
                    setContentCount(Object.keys(data).length);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, [sectionKey]);

    return { aboutData, loading, contentCount, setAboutData, setContentCount };
};

function AboutSection({ sectionName, sectionKey }) {
    const [text, setText] = useState('');
    const [bookLink, setBookLink] = useState('');
    const [editing, setEditing] = useState(false);
    const [dataId, setDataId] = useState('');
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [contentChanged, setContentChanged] = useState(false);
    const [wordCount, setWordCount] = useState(0);

    const { aboutData, loading, contentCount, setAboutData, setContentCount } = useAboutData(sectionKey);
    const toast = useRef(null);

    const countWords = (text) => {
        return text.trim().split(/\s+/).length;
    };

    const saveData = async () => {
        let minWordCount = 250;
        let maxWordCount = 300;

        // Adjust word count validation for "My Books" section
        if (sectionKey === "myBooks") {
            minWordCount = 20;
            maxWordCount = 50;
        }

        // Ensure word count is within the specified range
        if (wordCount < minWordCount || wordCount > maxWordCount) {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: `Content must be between ${minWordCount} and ${maxWordCount} words.`, life: 3000 });
            return;
        }

        const aboutRef = ref(db, `About/${sectionKey}/${editing ? dataId : Date.now()}`);
        const data = { text };

        // Only include book link if it's not empty and section is "My Books"
        if (sectionKey === "myBooks" && bookLink.trim() !== "") {
            data.bookLink = bookLink;
        }

        try {
            await set(aboutRef, data);

            if (editing) {
                setAboutData((prevData) => ({ ...prevData, [dataId]: data }));
            } else {
                const newId = Date.now().toString();
                setAboutData((prevData) => ({ ...prevData, [newId]: data }));
                setContentCount((prevCount) => prevCount + 1);
            }

            setEditing(false);
            setText('');
            setBookLink('');
            setShowAddPanel(false);
            setContentChanged(false);

            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Data saved successfully', life: 3000 });
        } catch (error) {
            console.error("Error saving data:", error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to save data', life: 3000 });
        }
    };


    const deleteData = useCallback(async (id) => {
        try {
            await set(ref(db, `About/${sectionKey}/${id}`), null);
            const updatedData = { ...aboutData };
            delete updatedData[id];
            setAboutData(updatedData);
            setContentCount((prevCount) => prevCount - 1);
            setText('');
            setBookLink('');
            setEditing(false);
            setShowAddPanel(false);

            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Data deleted successfully', life: 3000 });
        } catch (error) {
            console.error("Error deleting data:", error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete data', life: 3000 });
        }
    }, [aboutData, sectionKey, setAboutData, setContentCount]);

    const confirmDelete = useCallback((event, id) => {
        confirmPopup({
            target: event.currentTarget,
            message: 'Are you sure you want to delete this content?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteData(id),
        });
    }, [deleteData]);

    const editData = useCallback((id) => {
        setText(aboutData[id].text);
        // Only set book link if it exists
        if (aboutData[id].bookLink) {
            setBookLink(aboutData[id].bookLink);
        }
        setEditing(true);
        setDataId(id);
        setShowAddPanel(true);
    }, [aboutData]);

    const cancelEdit = () => {
        setText('');
        setBookLink('');
        setEditing(false);
        setShowAddPanel(false);
        setContentChanged(false);
    };

    const handleChange = (value) => {
        const wordCount = countWords(value);
        setText(value);
        setWordCount(wordCount);
        setContentChanged(value.trim() !== '');
    };

    return (
        <div className='card shadow-sm'>
            <Panel header={sectionName} toggleable>
                {showAddPanel ? (
                    <div className="card">
                        <div className='p-2'>
                            <div>{editing ? "Edit content" : "Add content"}</div>
                            <ReactQuill
                                theme="snow"
                                key={editing ? dataId : 'new'}
                                value={text}
                                onChange={handleChange}
                            />
                            {sectionKey === "myBooks" && (
                                <input
                                    type="text"
                                    placeholder="Book Link"
                                    value={bookLink}
                                    onChange={(e) => setBookLink(e.target.value)}
                                    className="mt-2 w-100"
                                />
                            )}
                            <div className='text-center'>
                                <Button
                                    label={editing ? "Update" : "Save"}
                                    onClick={saveData}
                                    className="mt-2"
                                    disabled={!contentChanged || contentCount >= 3}
                                />
                                <Button label="Cancel" onClick={cancelEdit} className="mt-2 ml-2 p-button-secondary" />
                            </div>
                            <div className='text-right'>
                                    {sectionKey === "myBooks" ? (
                                        <small>{wordCount} words (20-50 words required)</small>
                                    ) : (
                                        <small>{wordCount} words (250-300 words required)</small>
                                    )}
                            </div>
                        </div>
                    </div>
                ) : (

                    (sectionKey === "myBooks" || (sectionKey === "aboutUs" || sectionKey === "aboutme") && contentCount < 1) && (
                        <Button label="Add content" onClick={() => setShowAddPanel(true)} className="mt-2" />
                    )
                )}

                {loading ? <Loader loadingMessage="loading.." /> : (
                    Object.keys(aboutData).length > 0 && (
                        <div className="mt-4">
                            {Object.entries(aboutData).map(([key, data]) => (
                                <div key={key} className="mb-2 card shadow-sm p-2">
                                    <div dangerouslySetInnerHTML={{ __html: data.text }}></div>
                                    {data.bookLink && (
                                        <div>
                                            <a href={data.bookLink} target="_blank" rel="noopener noreferrer">Book Link</a>
                                        </div>
                                    )}
                                    <div className="mt-2 d-flex gap-2">
                                        <Button label="Edit" onClick={() => editData(key)} className="p-button-warning mr-2" />
                                        <Button label="Delete" onClick={(e) => confirmDelete(e, key)} className="p-button-danger" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </Panel>
            <ConfirmPopup />
            <Toast ref={toast} />
        </div>
    );
}

function About() {
    return (
        <div className='container'>
            <div className='gap-3 d-flex flex-column'>
                <div className='card shadow-sm'>
                    <AboutSection sectionName="About Us" sectionKey="aboutUs" />
                </div>
                <div className='card shadow-sm'>
                    <AboutSection sectionName="About Me" sectionKey="aboutme" />
                </div>
                <div className='card shadow-sm'>
                    <AboutSection sectionName="My Books" sectionKey="myBooks" />
                </div>
            </div>
        </div>
    );
}

export default About;
