import React, { useState, useEffect, useRef } from 'react';
import { ref, set, get, remove, update, push } from "firebase/database";
import { storage, db } from '../config/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Loader from '../Components/Loader';
import { Panel } from 'primereact/panel';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Toast } from 'primereact/toast';
import 'bootstrap/dist/css/bootstrap.min.css';

const Courses = () => {
    const [title, setTitle] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null);
    const [editingType, setEditingType] = useState(null);
    const [fieldsDisabled, setFieldsDisabled] = useState(false);
    const [typeFields, setTypeFields] = useState({
        title: '',
        introduction: '',
        structureTitle: '',
        structurePdf: null,
        literatureTitle: '',
        literaturePdf: null,
        methodologyTitle: '',
        methodologyPdf: null,
        evaluationTitle: '',
        evaluationPdf: null,
        conclusionTitle: '',
        conclusionPdf: null
    });
    const toast = useRef(null);
    const fileInputRef = useRef(null);
    const fileStructurePdf = useRef(null);
    const fileLiteraturePdf = useRef(null);
    const fileMethodologyPdf = useRef(null);
    const fileEvaluationPdf = useRef(null);
    const fileConclusionPdf = useRef(null);

    useEffect(() => {
        fetchCourses();
        fetchTypes();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        const coursesRef = ref(db, 'courses/intro');
        const snapshot = await get(coursesRef);
        if (snapshot.exists()) {
            setCourses(Object.entries(snapshot.val()));
            setFieldsDisabled(true);
        } else {
            setCourses([]);
            setFieldsDisabled(false);
        }
        setLoading(false);
    };

    const fetchTypes = async () => {
        setLoading(true);
        const typesRef = ref(db, 'courses/types');
        const snapshot = await get(typesRef);
        if (snapshot.exists()) {
            setTypes(Object.entries(snapshot.val()));
        } else {
            setTypes([]);
        }
        setLoading(false);
    };

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
    };

    const handleTypeFileChange = (e, field) => {
        setTypeFields({
            ...typeFields,
            [field]: e.target.files[0]
        });
    };

    const handleSave = async () => {
        if (!title) {
            showErrorMessage('Title is required');
            return;
        }

        setLoading(true);

        if (editing) {
            const courseRef = ref(db, `courses/intro/${editing}`);
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
                showErrorMessage('PDF file is required for new courses');
                setLoading(false);
                return;
            }
            const pdfStorageRef = storageRef(storage, `courses/${pdfFile.name}`);
            await uploadBytes(pdfStorageRef, pdfFile);
            const pdfUrl = await getDownloadURL(pdfStorageRef);

            const newCourseRef = push(ref(db, 'courses/intro'));
            await set(newCourseRef, {
                title,
                pdfUrl,
                pdfName: pdfFile.name
            });
        }

        setTitle('');
        setPdfFile(null);
        fileInputRef.current.value = '';
        setEditing(null);
        fetchCourses();
        setLoading(false);
    };

    const handleSaveType = async () => {
        setLoading(true);

        const uploadFile = async (file, path) => {
            if (!file) return null;
            const storagePath = storageRef(storage, path);
            await uploadBytes(storagePath, file);
            return getDownloadURL(storagePath);
        };

        const typeData = {
            ...typeFields,
            structurePdf: await uploadFile(typeFields.structurePdf, `types/${typeFields.structurePdf?.name}`),
            literaturePdf: await uploadFile(typeFields.literaturePdf, `types/${typeFields.literaturePdf?.name}`),
            methodologyPdf: await uploadFile(typeFields.methodologyPdf, `types/${typeFields.methodologyPdf?.name}`),
            evaluationPdf: await uploadFile(typeFields.evaluationPdf, `types/${typeFields.evaluationPdf?.name}`),
            conclusionPdf: await uploadFile(typeFields.conclusionPdf, `types/${typeFields.conclusionPdf?.name}`)
        };

        if (editingType) {
            await update(ref(db, `courses/types/${editingType}`), typeData);
        } else {
            await set(push(ref(db, 'courses/types')), typeData);
        }

        setTypeFields({
            title: '',
            introduction: '',
            structureTitle: '',
            structurePdf: null,
            literatureTitle: '',
            literaturePdf: null,
            methodologyTitle: '',
            methodologyPdf: null,
            evaluationTitle: '',
            evaluationPdf: null,
            conclusionTitle: '',
            conclusionPdf: null
        });

        fileStructurePdf.current.value = '';
        fileLiteraturePdf.current.value = '';
        fileMethodologyPdf.current.value = '';
        fileEvaluationPdf.current.value = '';
        fileConclusionPdf.current.value = '';

        setEditingType(null);
        fetchTypes();
        setLoading(false);
    };

    const handleEdit = (id, course) => {
        setTitle(course.title);
        setEditing(id);
        setFieldsDisabled(false);
    };

    const handleEditType = (id, type) => {
        setTypeFields({
            title: type.title,
            introduction: type.introduction,
            structureTitle: type.structureTitle,
            structurePdf: type.structurePdf,
            literatureTitle: type.literatureTitle,
            literaturePdf: type.literaturePdf,
            methodologyTitle: type.methodologyTitle,
            methodologyPdf: type.methodologyPdf,
            evaluationTitle: type.evaluationTitle,
            evaluationPdf: type.evaluationPdf,
            conclusionTitle: type.conclusionTitle,
            conclusionPdf: type.conclusionPdf
        });
        setEditingType(id);
    };

    const handleDelete = async (id, course) => {
        setLoading(true);
        const pdfStorageRef = storageRef(storage, `courses/${course.pdfName}`);
        await deleteObject(pdfStorageRef);
        await remove(ref(db, `courses/intro/${id}`));
        fetchCourses();
        setLoading(false);
    };

    const handleDeleteType = async (id) => {
        setLoading(true);
        await remove(ref(db, `courses/types/${id}`));
        fetchTypes();
        setLoading(false);
    };

    const showSuccessMessage = (message) => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
    };

    const showErrorMessage = (message) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
    };

    return (
        <div className='container mt-5'>
            <div className="row gap-2 d-flex">

                    <Panel header="Add introduction" className="panel panel-primary">
                    <div className="row gap-2 d-flex">
                        <div className="row gap-2 d-flex">
                            <div className="col">
                                <label htmlFor="title" className="form-label">Main Introduction Title</label>
                                <textarea id="title" value={title} onChange={(e) => setTitle(e.target.value)} rows={3} className="form-control" disabled={fieldsDisabled} />
                            </div>
                            <div className="col-3 d-flex align-items-center">
                                <input type="file" id="pdfFile" accept="application/pdf" ref={fileInputRef} onChange={handleFileChange} className="form-control" disabled={fieldsDisabled} />
                            </div>
                            <div className='text-center'>
                                <button onClick={handleSave} className="btn btn-primary" disabled={fieldsDisabled}>
                                    {fieldsDisabled ? "You can add introduction only once." : (editing ? "Update" : "Save")}
                                </button>
                            </div>
                        </div>
                        {loading ? <Loader loadingMessage="Loading data.." /> : (
                            <div className="list-group">
                                {courses.map(([id, course]) => (
                                    <div key={id} className="list-group-item list-group-item-action">
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
                                    </div>
                                ))}
                            </div>
                        )}
                          </div>
                    </Panel>
                    <Panel header="Add types" className="panel panel-primary">
                        <div className="row gap-2 d-flex">
                            <div className="d-flex gap-2 flex-column">
                                <label htmlFor="typeTitle" className="form-label">Type Title</label>
                                <input type="text" id="typeTitle" value={typeFields.title} onChange={(e) => setTypeFields({ ...typeFields, title: e.target.value })} className="form-control" />

                                <label htmlFor="introduction" className="form-label">Introduction</label>
                                <textarea onResize={true} id="introduction" value={typeFields.introduction} onChange={(e) => setTypeFields({ ...typeFields, introduction: e.target.value })} rows={3} className="form-control" />

                                <label htmlFor="structureTitle" className="form-label">Structure Title</label>
                                <div className='d-flex flex-row gap-2 flex-wrap'>
                                    <div className='col'>
                                        <textarea onResize={true} id="structureTitle" value={typeFields.structureTitle} onChange={(e) => setTypeFields({ ...typeFields, structureTitle: e.target.value })} className="form-control" />
                                    </div>
                                    <div className='col-3 align-self-center'>
                                        <input type="file" id="structurePdf" accept="application/pdf" ref={fileStructurePdf} onChange={(e) => handleTypeFileChange(e, 'structurePdf')} className="form-control" />
                                    </div>
                                </div>


                                <label htmlFor="literatureTitle" className="form-label">Literature Title</label>
                                <div className='d-flex flex-row gap-2 flex-wrap'>
                                    <div className='col'>
                                        <textarea onResize={true} id="literatureTitle" value={typeFields.literatureTitle} onChange={(e) => setTypeFields({ ...typeFields, literatureTitle: e.target.value })} className="form-control" />
                                    </div>
                                    <div className='col-3 align-self-center'>
                                        <input type="file" id="literaturePdf" accept="application/pdf" ref={fileLiteraturePdf} onChange={(e) => handleTypeFileChange(e, 'literaturePdf')} className="form-control" />
                                    </div>
                                </div>

                                <label htmlFor="methodologyTitle" className="form-label">Methodology Title</label>
                                <div className='d-flex flex-row gap-2 flex-wrap'>
                                    <div className='col'>
                                        <textarea onResize={true} id="methodologyTitle" value={typeFields.methodologyTitle} onChange={(e) => setTypeFields({ ...typeFields, methodologyTitle: e.target.value })} className="form-control" />
                                    </div>
                                    <div className='col-3 align-self-center'>
                                        <input type="file" id="methodologyPdf" accept="application/pdf" ref={fileMethodologyPdf} onChange={(e) => handleTypeFileChange(e, 'methodologyPdf')} className="form-control" />
                                    </div>
                                </div>

                                <label htmlFor="evaluationTitle" className="form-label">Evaluation Title</label>
                                <div className='d-flex flex-row gap-2 flex-wrap'>
                                    <div className='col'>
                                        <textarea onResize={true} id="evaluationTitle" value={typeFields.evaluationTitle} onChange={(e) => setTypeFields({ ...typeFields, evaluationTitle: e.target.value })} className="form-control" />
                                    </div>
                                    <div className='col-3 align-self-center'>
                                        <input type="file" id="evaluationPdf" accept="application/pdf" ref={fileEvaluationPdf} onChange={(e) => handleTypeFileChange(e, 'evaluationPdf')} className="form-control" />
                                    </div>
                                </div>

                                <label htmlFor="conclusionTitle" className="form-label">Conclusion Title</label>
                                <div className='d-flex flex-row gap-2 flex-wrap'>
                                    <div className='col'>
                                        <textarea onResize={true} id="conclusionTitle" value={typeFields.conclusionTitle} onChange={(e) => setTypeFields({ ...typeFields, conclusionTitle: e.target.value })} className="form-control" />
                                    </div>
                                    <div className='col-3 align-self-center'>
                                        <input type="file" id="conclusionPdf" accept="application/pdf" ref={fileConclusionPdf} onChange={(e) => handleTypeFileChange(e, 'conclusionPdf')} className="form-control" />
                                    </div>
                                </div>

                                <div className='text-center'>
                                    <button onClick={handleSaveType} className="btn btn-primary">
                                        {editingType ? "Update" : "Save"}
                                    </button>
                                </div>
                            </div>
                            {loading ? <Loader loadingMessage="Loading courses.." /> : (
                                <div className="list-group">
                                    {types.map(([id, type]) => (
                                        <div key={id} className="list-group-item list-group-item-action">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className='d-flex gap-2 flex-column w-100'>
                                                    <div className='d-flex flex-row align-items-center justify-content-between'>
                                                        <div className='ellipsis'>{type.title}</div>
                                                        <div className='d-flex gap-2'>
                                                            <button className="btn btn-warning" onClick={() => handleEditType(id, type)}><FaEdit /></button>
                                                            <button className="btn btn-danger" onClick={() => handleDeleteType(id)}><FaTrash /></button>
                                                        </div>
                                                    </div>
                                                    <div className='d-flex gap-2 flex-column'>
                                                        <div className='ellipsis'>{type.introduction}</div>
                                                        <div className='d-flex flex-row'>
                                                            <div className='ellipsis'>{type.structureTitle}</div>
                                                            <div className='text-end'>
                                                                <a href={type.structurePdf} target="_blank" className="btn btn-success" rel="noopener noreferrer"><FaEye /></a>
                                                            </div>
                                                        </div>
                                                        <div className='d-flex flex-row'>
                                                            <div className='ellipsis'>{type.literatureTitle}</div>
                                                            <div className='text-end'>
                                                                <a href={type.literaturePdf} target="_blank" className="btn btn-success" rel="noopener noreferrer"><FaEye /></a>
                                                            </div>
                                                        </div>
                                                        <div className='d-flex flex-row'>
                                                            <div className='ellipsis'>{type.methodologyTitle}</div>
                                                            <div className='text-end'>
                                                                <a href={type.methodologyPdf} target="_blank" className="btn btn-success" rel="noopener noreferrer"><FaEye /></a>
                                                            </div>
                                                        </div>
                                                        <div className='d-flex flex-row'>
                                                            <div className='ellipsis'>{type.evaluationTitle}</div>
                                                            <div className='text-end'>
                                                                <a href={type.evaluationPdf} target="_blank" className="btn btn-success" rel="noopener noreferrer"><FaEye /></a>
                                                            </div>
                                                        </div>
                                                        <div className='d-flex flex-row'>
                                                            <div className='ellipsis'>{type.conclusionTitle}</div>
                                                            <div className='text-end'>
                                                                <a href={type.conclusionPdf} target="_blank" className="btn btn-success" rel="noopener noreferrer"><FaEye /></a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Panel>

            </div>
            <Toast ref={toast} />
        </div>
    );
};

export default Courses;
