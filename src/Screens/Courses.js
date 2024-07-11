import React, { useState, useEffect } from 'react';
import { ref, set, get, remove, update, push } from "firebase/database";
import { storage, db } from '../Config/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Loader from '../Components/Loader';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';


const Courses = () => {
    const [title, setTitle] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null); // Store the course being edited

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        const coursesRef = ref(db, 'courses');
        const snapshot = await get(coursesRef);
        if (snapshot.exists()) {
            setCourses(Object.entries(snapshot.val()));
        } else {
            setCourses([]);
        }
        setLoading(false);
    };

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
    };

    const handleSave = async () => {
        if (!title) {
            alert('Title is required');
            return;
        }

        setLoading(true);

        if (editing) {
            const courseRef = ref(db, `courses/${editing}`);
            if (pdfFile) {
                const pdfStorageRef = storageRef(storage, `courses/${pdfFile.name}`);
                await uploadBytes(pdfStorageRef, pdfFile);
                const pdfUrl = await getDownloadURL(pdfStorageRef);
                await update(courseRef, { title, pdfUrl, pdfName: pdfFile.name });
            } else {
                await update(courseRef, { title });
            }
        } else {
            if (!pdfFile) {
                alert('PDF file is required for new courses');
                setLoading(false);
                return;
            }
            const pdfStorageRef = storageRef(storage, `courses/${pdfFile.name}`);
            await uploadBytes(pdfStorageRef, pdfFile);
            const pdfUrl = await getDownloadURL(pdfStorageRef);

            const newCourseRef = push(ref(db, 'courses'));
            await set(newCourseRef, {
                title,
                pdfUrl,
                pdfName: pdfFile.name
            });
        }

        setTitle('');
        setPdfFile(null);
        setEditing(null);
        fetchCourses();
        setLoading(false);
    };

    const handleEdit = (id, course) => {
        setTitle(course.title);
        setEditing(id);
    };

    const handleDelete = async (id, course) => {
        setLoading(true);
        const pdfStorageRef = storageRef(storage, `courses/${course.pdfName}`);
        await deleteObject(pdfStorageRef);
        await remove(ref(db, `courses/${id}`));
        fetchCourses();
        setLoading(false);
    };

    return (
        <div className='container mt-5'>
            <Panel header="Main introduction">
                <div className="row gap-2 d-flex">
                <label htmlFor="title" className="form-label">Main Introduction Title</label>
                    <div className="col">
                        <textarea id="title" value={title} onChange={(e) => setTitle(e.target.value)} rows={3} className="form-control" />
                    </div>
                    <div className="col-3 d-flex align-self-center">
                        <input type="file" id="pdfFile" accept="application/pdf" onChange={handleFileChange} className="form-control" />
                    </div>

                    <div className='text-center'>
                    <button label={editing ? "Update" : "Save"} onClick={handleSave} className="btn btn-primary w-25">Save</button>
                    </div>
                </div>
            </Panel>
            <Panel header="Saved introduction">
                {loading ? <Loader /> : (
                    <ul className="list-group">
                        {courses.map(([id, course]) => (
                            <li key={id} className="list-group-item">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className='ellipsis'>{course.title}</div>

                                    </div>
                                    <div className='d-flex gap-2'>
                                        <a href={course.pdfUrl} target="_blank" className="btn btn-success" rel="noopener noreferrer"><FaEye /></a>
                                        <button className="btn btn-warning" onClick={() => handleEdit(id, course)}><FaEdit /></button>
                                        <button className="btn btn-danger" onClick={() => handleDelete(id, course)}><FaTrash /></button>

                                    </div>
                                </div>
                                <Divider />
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>
        </div>
    );
};

export default Courses;
