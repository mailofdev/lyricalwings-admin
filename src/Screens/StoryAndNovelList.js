import React, { useState, useEffect } from 'react';
import { ref, get, db } from '../config/firebase';
import { useParams, useNavigate } from 'react-router-dom';
import { Paginator } from 'primereact/paginator';
import Loader from '../Components/Loader';
import '../css/poemlist.css';
import { Button } from 'primereact/button';

const StoryAndNovelList = () => {
    const { type } = useParams(); // Get the 'type' parameter from URL
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(18);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchItems();
    }, [type]); // Fetch items whenever the type parameter changes

    useEffect(() => {
        setFilteredItems(
            items.filter(item =>
                item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, items]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const collectionName = type === 'stories' ? 'stories' : 'novels';
            const itemsRef = ref(db, collectionName);
            const snapshot = await get(itemsRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                let itemsArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                itemsArray = itemsArray.reverse(); 
                setItems(itemsArray);
                setFilteredItems(itemsArray);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching items from the database', error);
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        navigate(`/DetailStoryAndNovels/${item.title}`, { state: { item, type } });
    };

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const placeHolderName = type === 'stories' ? 'story' : 'novel';
    return (
        <>
            {loading ? (
                <Loader loadingMessage="Loading item list..." />
            ) : (
                <div className="container">
                    <div className="row mb-3">
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                placeholder={`Search by ${placeHolderName} name`}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="row">
                        {filteredItems.slice(first, first + rows).map((item) => (
                            <div key={item.id} className="col-md-4 col-lg-4 mb-3 cursor-pointer">
                                <div className="custom-card h-100">
                                    <div className="card-body" onClick={() => handleEdit(item)}>
                                        <h5 className="ellipsis">{item.title}</h5>
                                        {/* <div className="ellipsis" dangerouslySetInnerHTML={{ __html: item.content }}></div> */}
                                        <div className="d-flex justify-content-between mt-3">
                                            {/* Add additional buttons or actions here if needed */}
                                        </div>
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
                                totalRecords={filteredItems.length}
                                onPageChange={onPageChange}
                                className="p-paginator-sm"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StoryAndNovelList;
