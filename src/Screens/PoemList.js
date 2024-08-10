import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { get, ref, remove } from "firebase/database";
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
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPoems, setFilteredPoems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPoems();
    }, [emotion]); // Fetch poems whenever the emotion parameter changes

    useEffect(() => {
        setFilteredPoems(
            poems.filter(poem =>
                poem.titleValue.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, poems]);

    const fetchPoems = async () => {
        try {
            setLoading(true);
            const AllPoemsRef = ref(db, 'AllPoems');
            const snapshot = await get(AllPoemsRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                let poemsArray = Object.values(data);

                if (emotion !== 'showall') {
                    poemsArray = poemsArray.filter(poem => poem.emotion === emotion);
                }

                poemsArray = poemsArray.reverse(); // Reverse the order if needed
                setPoems(poemsArray);
                setFilteredPoems(poemsArray);
            }
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };


    const handleEdit = (poem) => {
        navigate(`/DetailPoem`, { state: { poem } });
    };

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    return (
        <>
            {loading ? (
                <Loader loadingMessage="Loading poem list.." />
            ) : (
                <div className="container">
                    <div className="row mb-3">
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by poem name"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="row">
                        {filteredPoems.slice(first, first + rows).map((poem) => (
                            <div key={poem.id} className="col-md-4 col-lg-4 mb-3">
                                <div className="custom-card rounded h-100" style={{
                                    backgroundImage: poem.fileUrl ? `url(${poem.fileUrl})` : 'none',
                                    backgroundColor: poem.fileUrl ? 'transparent' : poem.cardColor
                                }}>
                                    <div className="card-body" onClick={() => handleEdit(poem)}>
                                        <h5 style={{ color: poem.fontColor }} className="card-title">{poem.titleValue}</h5>
                                        <div style={{ color: poem.fontColor }} className="card-text home-poem-content" dangerouslySetInnerHTML={{ __html: poem.poemContent }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="row mt-3 fixed-bottom">
                        <div className="col d-flex justify-content-center">
                            <Paginator
                                first={first}
                                rows={rows}
                                totalRecords={filteredPoems.length}
                                onPageChange={onPageChange}
                                className="p-paginator-sm"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default PoemList;
