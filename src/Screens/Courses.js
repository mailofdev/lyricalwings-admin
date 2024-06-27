import React, { useState, useEffect } from 'react';
import { ref, set, get, remove, push, update } from "firebase/database";
import { storage, db } from '../Config/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Loader from '../Components/Loader'; // Adjust the import path according to your project structure
import 'bootstrap/dist/css/bootstrap.min.css';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';

const Courses = () => {
    const [introductionTitle, setIntroductionTitle] = useState('');
    const [courseTypeTitle, setCourseTypeTitle] = useState('');
    const [courseTypeIntroduction, setCourseTypeIntroduction] = useState('');
    const [courseTypeStructure, setCourseTypeStructure] = useState('');
    const [courseTypeLiterature, setCourseTypeLiterature] = useState('');
    const [courseTypeMethodology, setCourseTypeMethodology] = useState('');
    const [courseTypeEvaluation, setCourseTypeEvaluation] = useState('');
    const [courseTypeConclusion, setCourseTypeConclusion] = useState('');
    const [files, setFiles] = useState({
        introductionTitle: null,
        courseTypeTitle: null,
        courseTypeIntroduction: null,
        courseTypeStructure: null,
        courseTypeLiterature: null,
        courseTypeMethodology: null,
        courseTypeEvaluation: null,
        courseTypeConclusion: null,
    });
    const [savedIntroductions, setSavedIntroductions] = useState([]);
    const [savedCourseTypes, setSavedCourseTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editType, setEditType] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const introRef = ref(db, 'Courses/Introductions');
                const introSnapshot = await get(introRef);
                if (introSnapshot.exists()) {
                    const data = introSnapshot.val();
                    setSavedIntroductions(Object.keys(data).map(key => ({ id: key, ...data[key] })));
                }

                const courseTypeRef = ref(db, 'Courses/courseTypes');
                const courseTypeSnapshot = await get(courseTypeRef);
                if (courseTypeSnapshot.exists()) {
                    const data = courseTypeSnapshot.val();
                    setSavedCourseTypes(Object.keys(data).map(key => ({ id: key, ...data[key] })));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
    };

    const handleFileChange = (field) => (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFiles(prevFiles => ({ ...prevFiles, [field]: selectedFile }));
        } else {
            alert("Please select a valid PDF file.");
        }
    };

    const uploadFile = async (file, path) => {
        const fileRef = storageRef(storage, path);
        await uploadBytes(fileRef, file);
        return getDownloadURL(fileRef);
    };

    const handleSubmitIntroduction = async (e) => {
        e.preventDefault();
        if (files.introductionTitle && introductionTitle) {
            setLoading(true);
            try {
                const fileUrl = await uploadFile(files.introductionTitle, `introduction_pdfs/${files.introductionTitle.name}`);

                const introductionData = {
                    title: introductionTitle,
                    pdfUrl: fileUrl
                };

                if (editMode && editType === 'Introduction') {
                    const introRef = ref(db, `Courses/Introductions/${editId}`);
                    await update(introRef, introductionData);
                    setSavedIntroductions(prevData => prevData.map(item => item.id === editId ? { id: editId, ...introductionData } : item));
                } else {
                    const newIntroRef = push(ref(db, 'Courses/Introductions'));
                    await set(newIntroRef, introductionData);
                    setSavedIntroductions(prevData => [...prevData, { id: newIntroRef.key, ...introductionData }]);
                }

                setIntroductionTitle('');
                setFiles({ ...files, introductionTitle: null });
                setEditMode(false);
                setEditId(null);
                setEditType('');
            } catch (error) {
                console.error("Error uploading file or saving data:", error);
            } finally {
                setLoading(false);
            }
        } else {
            alert("Please enter a title and select a PDF file.");
        }
    };

    const handleSubmitCourseType = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fileUrls = await Promise.all(Object.keys(files).map(async (key) => {
                if (files[key]) {
                    return await uploadFile(files[key], `${key}_pdfs/${files[key].name}`);
                }
                return null;
            }));

            const courseTypeData = {
                courseTypeTitle,
                courseTypeTitleUrl: fileUrls[0],
                courseTypeIntroduction,
                courseTypeIntroductionUrl: fileUrls[1],
                courseTypeStructure,
                courseTypeStructureUrl: fileUrls[2],
                courseTypeLiterature,
                courseTypeLiteratureUrl: fileUrls[3],
                courseTypeMethodology,
                courseTypeMethodologyUrl: fileUrls[4],
                courseTypeEvaluation,
                courseTypeEvaluationUrl: fileUrls[5],
                courseTypeConclusion,
                courseTypeConclusionUrl: fileUrls[6],
            };

            if (editMode && editType === 'CourseType') {
                const courseTypeRef = ref(db, `Courses/courseTypes/${editId}`);
                await update(courseTypeRef, courseTypeData);
                setSavedCourseTypes(prevData => prevData.map(item => item.id === editId ? { id: editId, ...courseTypeData } : item));
            } else {
                const newCourseTypeRef = push(ref(db, 'Courses/courseTypes'));
                await set(newCourseTypeRef, courseTypeData);
                setSavedCourseTypes(prevData => [...prevData, { id: newCourseTypeRef.key, ...courseTypeData }]);
            }

            setCourseTypeTitle('');
            setCourseTypeIntroduction('');
            setCourseTypeStructure('');
            setCourseTypeLiterature('');
            setCourseTypeMethodology('');
            setCourseTypeEvaluation('');
            setCourseTypeConclusion('');
            setFiles({
                introductionTitle: null,
                courseTypeTitle: null,
                courseTypeIntroduction: null,
                courseTypeStructure: null,
                courseTypeLiterature: null,
                courseTypeMethodology: null,
                courseTypeEvaluation: null,
                courseTypeConclusion: null,
            });
            setEditMode(false);
            setEditId(null);
            setEditType('');
        } catch (error) {
            console.error("Error uploading files or saving data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, pdfUrls) => {
        setLoading(true);
        try {
            await Promise.all(pdfUrls.map(async (pdfUrl) => {
                if (pdfUrl) {
                    try {
                        const url = new URL(pdfUrl);
                        const filePath = decodeURIComponent(url.pathname).replace('/v0/b/lyricalwings-b7333.appspot.com/o/', '');
                        const fileRef = storageRef(storage, filePath);
                        await deleteObject(fileRef);
                    } catch (error) {
                        if (error.code === 'storage/object-not-found') {
                            console.warn(`File ${pdfUrl} not found.`);
                        } else {
                            throw error;
                        }
                    }
                }
            }));

            const collectionName = pdfUrls[0] && pdfUrls[0].includes('introduction_pdfs') ? 'Introductions' : 'courseTypes';
            const docRef = ref(db, `Courses/${collectionName}/${id}`);
            await remove(docRef);

            if (collectionName === 'Introductions') {
                setSavedIntroductions(prevData => prevData.filter(item => item.id !== id));
            } else if (collectionName === 'courseTypes') {
                setSavedCourseTypes(prevData => prevData.filter(item => item.id !== id));
            }
        } catch (error) {
            console.error("Error deleting data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id, type) => {
        setEditMode(true);
        setEditId(id);
        setEditType(type);
        if (type === 'Introduction') {
            const intro = savedIntroductions.find(item => item.id === id);
            setIntroductionTitle(intro.title);
        } else if (type === 'CourseType') {
            const courseType = savedCourseTypes.find(item => item.id === id);
            setCourseTypeTitle(courseType.courseTypeTitle);
            setCourseTypeIntroduction(courseType.courseTypeIntroduction);
            setCourseTypeStructure(courseType.courseTypeStructure);
            setCourseTypeLiterature(courseType.courseTypeLiterature);
            setCourseTypeMethodology(courseType.courseTypeMethodology);
            setCourseTypeEvaluation(courseType.courseTypeEvaluation);
            setCourseTypeConclusion(courseType.courseTypeConclusion);
        }
    };

    return (
        <div className='container mt-5'>
            {loading ? <Loader loadingMessage="Loading..." /> : (
                <>
                    <Panel header="Add introduction" toggleable className="mb-4">
                        <form onSubmit={handleSubmitIntroduction}>
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label">Introduction</label>
                                <div className="row">
                                    <div className="col-md-9 mb-3 mb-md-0">
                                        <textarea
                                            id="title"
                                            className="form-control"
                                            value={introductionTitle}
                                            onChange={handleInputChange(setIntroductionTitle)}
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            id="pdf"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('introductionTitle')}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <button type="submit" className="btn btn-primary">{editMode && editType === 'Introduction' ? 'Update Introduction' : 'Save Introduction'}</button>
                            </div>
                        </form>
                    </Panel>

                    <Panel header="Add types of poem" toggleable className="mb-4">
                        <form onSubmit={handleSubmitCourseType}>
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label">Title</label>
                                <div className="row">
                                    <div className="col-md-9 mb-3 mb-md-0">
                                        <input
                                            type="text"
                                            id="courseTypeTitle"
                                            className="form-control"
                                            value={courseTypeTitle}
                                            onChange={handleInputChange(setCourseTypeTitle)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            id="pdf"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('courseTypeTitle')}
                                        />
                                    </div>
                                </div>
                            </div>
                            {[
                                { label: 'Introduction', state: courseTypeIntroduction, setState: setCourseTypeIntroduction, fileKey: 'courseTypeIntroduction' },
                                { label: 'Structure', state: courseTypeStructure, setState: setCourseTypeStructure, fileKey: 'courseTypeStructure' },
                                { label: 'Literature', state: courseTypeLiterature, setState: setCourseTypeLiterature, fileKey: 'courseTypeLiterature' },
                                { label: 'Methodology', state: courseTypeMethodology, setState: setCourseTypeMethodology, fileKey: 'courseTypeMethodology' },
                                { label: 'Evaluation', state: courseTypeEvaluation, setState: setCourseTypeEvaluation, fileKey: 'courseTypeEvaluation' },
                                { label: 'Conclusion', state: courseTypeConclusion, setState: setCourseTypeConclusion, fileKey: 'courseTypeConclusion' },
                            ].map(({ label, state, setState, fileKey }) => (
                                <div className="mb-3" key={fileKey}>
                                    <label htmlFor={fileKey} className="form-label">{label}</label>
                                    <div className="row">
                                        <div className="col-md-9 mb-3 mb-md-0">
                                            <textarea
                                                id={fileKey}
                                                className="form-control"
                                                value={state}
                                                onChange={handleInputChange(setState)}
                                            />
                                        </div>
                                        <div className="col-md-3 d-flex align-items-center">
                                            <input
                                                type="file"
                                                id={`${fileKey}Pdf`}
                                                className="form-control"
                                                accept="application/pdf"
                                                onChange={handleFileChange(fileKey)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="text-center">
                                <button type="submit" className="btn btn-primary">{editMode && editType === 'CourseType' ? 'Update type' : 'Save type'}</button>
                            </div>
                        </form>
                    </Panel>

                    {savedIntroductions.length > 0 && (
                        <Panel header="Introductions" toggleable>
                            {savedIntroductions.map((introduction, index) => (
                                <div className="card shadow-sm p-3 m-3 d-flex gap-2">
                                    <div className='d-flex justify-content-between align-items-center'>
                                        <div>
                                            <div className='ellipsis'>{index + 1}. {introduction.title}</div>
                                        </div>
                                        <div className='d-flex gap-2'>
                                            <a href={introduction.pdfUrl} target="_blank" rel="noopener noreferrer">
                                                <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-button-outlined" />
                                            </a>
                                            <Button icon="pi pi-pencil" className="p-button-rounded p-button-info p-button-outlined" onClick={() => handleEdit(introduction.id, 'Introduction')} />
                                            <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-outlined" onClick={() => handleDelete(introduction.id, [introduction.pdfUrl])} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Panel>
                    )}

                    {savedCourseTypes.length > 0 && (
                        <Panel header="Types" toggleable>
                            {savedCourseTypes.map((courseType, index) => (
                                <div className="card shadow-sm p-3 m-3 d-flex gap-2" key={courseType.id}>
                                    <div className='d-flex justify-content-between align-items-center'>
                                        <div>
                                            <strong>{index + 1}. {courseType.courseTypeTitle}</strong>
                                        </div>
                                        <div className='d-flex gap-2'>
                                            <Button icon="pi pi-pencil" className="p-button-rounded p-button-info p-button-outlined" onClick={() => handleEdit(courseType.id, 'CourseType')} />
                                            <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-outlined" onClick={() => handleDelete(courseType.id, [
                                                courseType.courseTypeTitleUrl,
                                                courseType.courseTypeIntroductionUrl,
                                                courseType.courseTypeStructureUrl,
                                                courseType.courseTypeLiteratureUrl,
                                                courseType.courseTypeMethodologyUrl,
                                                courseType.courseTypeEvaluationUrl,
                                                courseType.courseTypeConclusionUrl
                                            ])} />
                                        </div>
                                    </div>
                                    <div className='d-flex gap-2 flex-column'>
                                        {[
                                            { label: courseType.courseTypeIntroduction, url: courseType.courseTypeIntroductionUrl },
                                            { label: courseType.courseTypeStructure, url: courseType.courseTypeStructureUrl },
                                            { label: courseType.courseTypeLiterature, url: courseType.courseTypeLiteratureUrl },
                                            { label: courseType.courseTypeMethodology, url: courseType.courseTypeMethodologyUrl },
                                            { label: courseType.courseTypeEvaluation, url: courseType.courseTypeEvaluationUrl },
                                            { label: courseType.courseTypeConclusion, url: courseType.courseTypeConclusionUrl },
                                        ].map(({ label, url }) => url && (
                                            <div className='d-flex justify-content-between align-items-center' key={label}>
                                                <div className='ellipsis'>{label}</div>
                                                <div>
                                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                                        <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-button-outlined" />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </Panel>
                    )}

                </>
            )}
        </div>
    );
};

export default Courses;
