import React, { useState, useEffect, useCallback } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../common/firebase';
import NoDataMessage from '../components/NoDataMessage';
import { Card } from 'react-bootstrap';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { InputText } from 'primereact/inputtext';
import { FaSearch } from 'react-icons/fa';
import Loader from '../components/Loader';

const EmailList = ({ dbName }) => {
    const [emails, setEmails] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    // Fetch emails from Firebase
    const fetchEmails = useCallback(async () => {
        setLoading(true);
        try {
            const emailsRef = ref(db, dbName);
            const snapshot = await get(emailsRef);
            if (snapshot.exists()) {
                const emailsData = snapshot.val();
                const emailsList = Object.entries(emailsData).map(([key, value]) => ({
                    uid: key,
                    ...value,
                }));
                const reversedList = emailsList.reverse();
                setEmails(reversedList);
                setFilteredList(reversedList);
            } else {
                setEmails([]);
                setFilteredList([]);
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
        } finally {
            setLoading(false);
        }
    }, [dbName]);

    useEffect(() => {
        fetchEmails();
    }, [fetchEmails]);

 // Filter emails based on search term
 useEffect(() => {
    const filtered = emails.filter((email) =>
        Object.values(email).some(val =>
            val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredList(filtered);
    setCurrentPage(0);
}, [searchTerm, emails]);

const onPageChange = (e) => {
    setCurrentPage(e.page);
};

// Function to check if the email is recent (within 24 hours)
const isRecentEmail = (timestamp) => {
    if (!timestamp) return false; // Check if timestamp exists
    const now = new Date();
    const emailDate = new Date(timestamp);
    const timeDiff = now - emailDate; // Difference in milliseconds
    const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in 24 hours
    return timeDiff <= oneDay;
};

// Function to apply row highlighting
const rowClassName = (email) => {
    return isRecentEmail(email.timestamp) ? 'bg-body-secondary' : '';
};

const renderHeader = () => {
    return (
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className='py-2'>Total: {emails.length}</h4>
            <div className="position-relative">
                <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-2" />
                <InputText
                    type="text"
                    className="form-control ps-4"
                    placeholder="Search.."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
    );
};

    return (
        <div className="py-4">
        <Card className="shadow-sm">
            <Card.Body>
                {loading && <Loader loadingMessage="Fetching emails..." />}
                {!loading && emails.length === 0 && (
                    <NoDataMessage message="No E-mail found" showActionButton={false} />
                )}
                {!loading && emails.length > 0 && (
                    <>
                        {renderHeader()}
                        <DataTable
                            value={filteredList.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)}
                            responsiveLayout="scroll"
                            className="mb-3"
                            stripedRows
                            rowClassName={rowClassName} // Apply the row class for highlighting
                        >
                            <Column field="email" header="Email" />
                            <Column field="message" header="Message" />
                            <Column field="name" header="Name" />
                            <Column field="timestamp" header="Received On" body={(data) => new Date(data.timestamp).toLocaleString()} />
                        </DataTable>
                        <Paginator
                            first={currentPage * itemsPerPage}
                            rows={itemsPerPage}
                            totalRecords={filteredList.length}
                            onPageChange={onPageChange}
                        />
                    </>
                )}
            </Card.Body>
        </Card>
    </div>

    );
};

export default EmailList;