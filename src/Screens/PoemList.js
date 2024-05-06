import React, { useState, useEffect } from 'react';
import { db } from '../Config/firebase';
import { get, ref, remove, update } from "firebase/database";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Loader from '../Components/Loader';
import { useParams } from 'react-router-dom';
import { Paginator } from 'primereact/paginator';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

const PoemList = () => {
    const { emotion } = useParams();
    const [poems, setPoems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(3);
    const [editMode, setEditMode] = useState(false);
    const [updatedId, setUpdatedId] = useState('');
    const [updateData, setUpdateData] = useState({
        titleValue: '',
        authorValue: '',
        poemContent: ''
    });

    useEffect(() => {
        fetchPoems();
    }, []);

    const fetchPoems = async () => {
        try {
            setLoading(true);
            const AllPoemsRef = ref(db, 'AllPoems');
            const snapshot = await get(AllPoemsRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                const poemsArray = Object.values(data).filter(poem => poem.emotion === emotion).reverse();
                setPoems(poemsArray);
            }
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    const handleDelete = async (poemId) => {
        try {
            setLoading(true);
            await remove(ref(db, `AllPoems/${poemId}`));
            const updatedPoems = poems.filter(poem => poem.id !== poemId);
            setPoems(updatedPoems);
            setLoading(false);
        } catch (error) {
            console.error('Error deleting poem:', error);
            setLoading(false);
        }
    };

    const handleEdit = (poem) => {
        setUpdateData(poem);
        setUpdatedId(poem.id);
        setEditMode(true);
    };

    const handleUpdate = async (poemId) => {
        try {
            setLoading(true);
            setLoadingMessage('Updating poem...');
            const poemData = { ...updateData };
            await update(ref(db, `AllPoems/${poemId}`), poemData);
            setUpdatedId('');
            setEditMode(false);
            fetchPoems();
            setLoading(false);
        } catch (error) {
            console.error('Error updating poem:', error);
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="row">
                <div className="col-lg-12">
                    <div className="poems-container">
                        {loading ? (
                            <Loader loadingMessage="Fetching poems..." />
                        ) : (
                            <>
                                {poems.length === 0 ? (
                                    <div className="form-height align-self-center d-flex justify-content-center">
                                        <p>No poems found for {emotion} emotion.</p>
                                    </div>
                                ) : (
                                    <>
                                        {poems.slice(first, first + rows).map((poem) => (
                                            <Card key={poem.id} className='p-2 gap-2 mb-3'>
                                                {editMode && updatedId === poem.id ? (
                                                    <>
                                                        <InputText
                                                            title="Title"
                                                            name="titleValue"
                                                            type="text"
                                                            placeholder="Enter title"
                                                            value={updateData.titleValue}
                                                            onChange={(e) => setUpdateData({...updateData, titleValue: e.target.value})}
                                                        />
                                                        <InputText
                                                            title="Author"
                                                            name="authorValue"
                                                            type="text"
                                                            placeholder="Enter author name"
                                                            value={updateData.authorValue}
                                                            onChange={(e) => setUpdateData({...updateData, authorValue: e.target.value})}
                                                        />
                                                        <InputTextarea
                                                            title="Poem Content"
                                                            name="poemContent"
                                                            type="text"
                                                            placeholder="Enter poem content"
                                                            value={updateData.poemContent}
                                                            onChange={(e) => setUpdateData({...updateData, poemContent: e.target.value})}
                                                            className='custom-textarea'
                                                        />
                                                        <Button className='w-50 align-self-center d-flex justify-content-center btn btn-light btn-outline-success border border-1 border-success' onClick={() => handleUpdate(poem.id)}>Update</Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p>{poem.titleValue}</p>
                                                        <h6>{poem.authorValue}</h6>
                                                        <p>{poem.poemContent}</p>
                                                        <div className='d-flex justify-content-evenly'>
                                                            <Button className='btn btn-light btn-outline-primary border border-1 border-primary' onClick={() => handleEdit(poem)}>Edit</Button>
                                                            <Button className='btn btn-light btn-outline-danger border border-1 border-danger' onClick={() => handleDelete(poem.id)}>Delete</Button>
                                                        </div>
                                                    </>
                                                )}
                                            </Card>
                                        ))}
                                        <Paginator
                                            first={first}
                                            rows={rows}
                                            totalRecords={poems.length}
                                            onPageChange={(e) => setFirst(e.first)}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PoemList;
