import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Col, Container, Row, InputGroup, FormControl, Alert } from 'react-bootstrap';
import DynamicForm from '../Components/DynamicForm';
import { FetchData, CreateData, UpdateData, DeleteData, clearError } from '../redux/AddDataSlice';
import { FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { narrativeConfig, poemConfig } from '../Common/commonFunction';

const AddData = () => {
    const dispatch = useDispatch();
    const { itemsList, totalItems, isLoading, error } = useSelector(state => state.AddData);
    const [selectedCategory, setSelectedCategory] = useState('Poem');
    const [selectedItemType, setSelectedItemType] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [showDynamicForm, setShowDynamicForm] = useState(false);
    const [showDataList, setShowDataList] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const pageSize = 10;

    const poemTypes = poemConfig?.[0]?.fields?.[3]?.options || [];
    const narrativeTypes = narrativeConfig?.[0]?.fields?.[2]?.options || [];
    
    const getItemTypes = () => {
        if (selectedCategory === 'Poem') {
            return poemTypes;
        } else if (selectedCategory === 'Narrative') {
            return narrativeTypes;
        } else {
            return [];
        }
    };
    

    useEffect(() => {
        if (selectedItemType) {
            handleFetchData();
        }
    }, [selectedItemType, selectedCategory]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setSelectedItemType(null); // Reset selected item type when category changes
        setCurrentPage(1); // Reset to the first page
        setSearchQuery(''); // Reset search query
    };

    const handleFormSubmit = (data, formType) => {
        if (formType === 'add') {
            dispatch(CreateData({ newItem: data, category: selectedCategory }));
        } else if (formType === 'edit') {
            dispatch(UpdateData({ itemId: editingItem.id, updatedItem: data, category: selectedCategory }));
        }
        setShowDynamicForm(false);
        handleFetchData();
    };

    const handleItemTypeSelect = (subType) => {
        setSelectedItemType(subType);
        setShowDynamicForm(false);
        setCurrentPage(1);
        setSearchQuery('');
    };

    const handleShowForm = () => {
        setShowDynamicForm(true);
        setShowDataList(false);
        setEditingItem(null);
    };

    const handleFetchData = () => {
        setShowDynamicForm(false);
        setShowDataList(true);
        dispatch(FetchData({
            page: currentPage,
            pageSize,
            filterType: selectedItemType,
            searchQuery,
            category: selectedCategory
        }));
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowDynamicForm(true);
    };

    const handleDelete = (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            dispatch(DeleteData({ itemId, category: selectedCategory }));
            handleFetchData();
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        handleFetchData();
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        handleFetchData();
    };

    const handleOnCancel = () => {
        setShowDynamicForm(false);
        setShowDataList(true);
    };

    const NoDataMessage = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h3 className="text-center">No data found</h3>
            <p className="text-center">There are no items available for the selected type.</p>
        </motion.div>
    );

    return (
        <Container fluid className="gap-3 d-flex flex-column my-4">
            <Row className="justify-content-center">
                <Col xs={12} md={10} lg={8} className='d-flex gap-3 flex-column'>
                    <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="d-flex flex-wrap justify-content-center gap-3">
                            <Button variant={selectedCategory === 'Poem' ? 'info' : 'outline-light'} onClick={() => handleCategoryChange('Poem')}>Poems</Button>
                            <Button variant={selectedCategory === 'Narrative' ? 'info' : 'outline-light'} onClick={() => handleCategoryChange('Narrative')}>Narratives</Button>
                        </div>
                    </motion.div>

                    <div className="d-flex flex-wrap justify-content-center gap-3">
                        {getItemTypes().map(item => (
                            <motion.div key={item.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant={selectedItemType === item.value ? 'info' : 'outline-light'}
                                    onClick={() => handleItemTypeSelect(item.value)}
                                >
                                    {item.label}
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </Col>
            </Row>

            {selectedItemType && (
                <Row className="justify-content-center mb-4">
                    <Col xs={12} md={10} lg={8}>
                        <Card className="shadow-sm p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className='d-flex justify-content-start align-items-center'>
                                    <h2>{selectedItemType}</h2>
                                    <h5 className="ms-2">({totalItems} {totalItems === 1 ? selectedCategory : `${selectedCategory}s`})</h5>
                                </div>
                                <div className="d-flex">
                                    <Button variant="primary" onClick={handleShowForm}>
                                        <FaPlus /> Add {selectedCategory}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            )}

            <Row className="justify-content-center my-4">
                <Col xs={12} md={10} lg={8}>
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Alert variant="danger" onClose={() => dispatch(clearError())} dismissible>
                                    {error}
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {showDynamicForm && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                            <Card className="shadow-sm p-4 mb-4">
                                <DynamicForm
                                    formConfig={selectedCategory === 'Poem' ? poemConfig : narrativeConfig}
                                    onSubmit={(data) => handleFormSubmit(data, editingItem ? 'edit' : 'add')}
                                    editingItem={editingItem}
                                    title={editingItem ? `Edit ${selectedCategory}` : `Add ${selectedCategory}`}
                                    buttonLabel={editingItem ? 'Update' : 'Add'}
                                    requiredFields={['title', 'type']}
                                    onCancel={handleOnCancel}
                                />
                            </Card>
                        </motion.div>
                    )}

                    {selectedItemType && showDataList && (
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <Card className="shadow-sm p-4">
                                <form onSubmit={handleSearch} className="mb-4">
                                    <InputGroup>
                                        <FormControl
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={`Search ${selectedCategory}s...`}
                                        />
                                        <Button type="submit" variant="outline-secondary">
                                            <FaSearch />
                                        </Button>
                                    </InputGroup>
                                </form>

                                {isLoading ? (
                                    <p className="text-center">Loading...</p>
                                ) : itemsList.length === 0 ? (
                                    <NoDataMessage />
                                ) : (
                                    <>
                                        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                                            {itemsList.map(item => (
                                                <Col key={item.id}>
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Card className="shadow-sm h-100">
                                                            <Card.Body>
                                                                <Card.Title>{item.title}</Card.Title>
                                                                <Card.Subtitle className="mb-2 text-muted">{item.type}</Card.Subtitle>
                                                                <Card.Text>{item.htmlSubtitle}</Card.Text>
                                                            </Card.Body>
                                                            <Card.Footer className="d-flex justify-content-end gap-2">
                                                                <Button variant="outline-primary" size="sm" onClick={() => handleEdit(item)}>
                                                                    <FaEdit />
                                                                </Button>
                                                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)}>
                                                                    <FaTrash />
                                                                </Button>
                                                            </Card.Footer>
                                                        </Card>
                                                    </motion.div>
                                                </Col>
                                            ))}
                                        </Row>
                                        <div className="d-flex justify-content-center align-items-center mt-4">
                                            <Button
                                                variant="outline-primary"
                                                disabled={currentPage === 1}
                                                onClick={() => handlePageChange(currentPage - 1)}
                                            >
                                                Previous
                                            </Button>
                                            <span className="mx-3">Page {currentPage}</span>
                                            <Button
                                                variant="outline-primary"
                                                disabled={itemsList.length < pageSize}
                                                onClick={() => handlePageChange(currentPage + 1)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Card>
                        </motion.div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default AddData;
