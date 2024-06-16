import React, { useState, useEffect } from 'react';
import { db } from '../Config/firebase';
import { get, ref, remove } from "firebase/database";
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Loader from '../Components/Loader';
import { useParams, useNavigate } from 'react-router-dom';
import { Paginator } from 'primereact/paginator';
import '../css/poemlist.css';

const PoemList = () => {
    const { emotion } = useParams();
    const [poems, setPoems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(9);
    const navigate = useNavigate();

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
        navigate(`/DetailPoem`, { state: { poem } });
    };

    return (
        <div className="container-fluid">
            <div className="row row-cols-1 row-cols-md-3 g-4">
                {loading ? (
                    <Loader loadingMessage={`Fetching ${emotion} poems...`} />
                ) : (
                    poems.slice(first, first + rows).map((poem) => (
                        <div key={poem.id} className="col">
                            <Card className='p-2 gap-2 mb-3' style={{ backgroundColor: poem.cardColor }}>
                                <p>{poem.titleValue}</p>
                                <div dangerouslySetInnerHTML={{ __html: poem.backgroundOfPoem }}></div>
                                <div dangerouslySetInnerHTML={{ __html: poem.poemContent }}></div>
                                <div className='d-flex justify-content-evenly'>
                                    <Button className='btn btn-light btn-outline-primary border border-1 border-primary' onClick={() => handleEdit(poem)}>View</Button>
                                    <Button className='btn btn-light btn-outline-danger border border-1 border-danger' onClick={() => handleDelete(poem.id)}>Delete</Button>
                                </div>
                            </Card>
                        </div>
                    ))
                )}
            </div>
            <div className="paginator-container">
                <Paginator
                    first={first}
                    rows={rows}
                    totalRecords={poems.length}
                    onPageChange={(e) => setFirst(e.first)}
                    className="paginator-bottom"
                />
            </div>
        </div>
    );
}

export default PoemList;
