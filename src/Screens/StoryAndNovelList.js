import React, { useState, useEffect } from 'react';
import { ref, get, db } from '../Config/firebase'; // Adjust the path to your firebaseConfig file
import { useParams, useNavigate } from 'react-router-dom';
import { Paginator } from 'primereact/paginator';
import Loader from '../Components/Loader'; // Assuming Loader component is in the same directory
import '../css/poemlist.css'; // Adjust path to your CSS for styling
import { Button } from 'primereact/button';

const StoryAndNovelList = () => {
    const { type } = useParams(); // Get the 'type' parameter from URL
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(9);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchItems();
    }, [type]); // Fetch items whenever the type parameter changes



    useEffect(() => {
        // setFilteredItems(
        //     items.filter(item =>
        //         item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())
        //     )
        // );
    }, [searchTerm, items]);
    

    const fetchItems = async () => {
        try {
            setLoading(true);
            const collectionName = type === 'stories' ? 'stories' : 'novels';
            const itemsRef = ref(db, collectionName);
            const snapshot = await get(itemsRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                let itemsArray = Object.values(data);
                itemsArray = itemsArray.reverse(); // Reverse the order if needed
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
        // Assuming you have a DetailItem component for editing/viewing an item
        navigate(`/DetailStoryAndNovels`, { state: { item } });
    };

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

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
                                placeholder="Search by item name"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="row">
                        {filteredItems.slice(first, first + rows).map((item) => (
                            <div key={item.id} className="col-md-4 col-lg-4 mb-3">
                                <div className="custom-card h-100">
                                    <div className="card-body" onClick={() => handleEdit(item)}>
                                        <h5 className="card-title">{item.title}</h5>
                                        {/* <div className="card-text" dangerouslySetInnerHTML={{ __html: item.content }}></div> */}
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
