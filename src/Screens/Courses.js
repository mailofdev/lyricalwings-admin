import React, { useState, useEffect } from 'react';
import { ref, set, get, remove, push } from "firebase/database";
import { storage, db } from '../Config/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Loader from '../Components/Loader'; // Adjust the import path according to your project structure
import 'bootstrap/dist/css/bootstrap.min.css';
import { Panel } from 'primereact/panel';

const Courses = () => {

    const [introductionTitle, setIntroductionTitle] = useState('');
    const [courseTypeTitle, setcourseTypeTitle] = useState('');
    const [courseTypeIntroduction, setcourseTypeIntroduction] = useState('');
    const [courseTypeStructure, setcourseTypeStructure] = useState('');
    const [courseTypeLiterature, setcourseTypeLiterature] = useState('');
    const [courseTypeMethodology, setcourseTypeMethodology] = useState('');
    const [courseTypeEvaluation, setcourseTypeEvaluation] = useState('');
    const [courseTypeConclusion, setcourseTypeConclusion] = useState('');
    const [courseTypeReference, setcourseTypeReference] = useState('');
    const [files, setFiles] = useState({
        courseTypeTitle: null,
        courseTypeIntroduction: null,
        courseTypeStructure: null,
        courseTypeLiterature: null,
        courseTypeMethodology: null,
        courseTypeEvaluation: null,
        courseTypeConclusion: null,
        courseTypeReference: null
    });
    const [savedIntroductions, setSavedIntroductions] = useState([]);
    const [savedcourseTypes, setSavedcourseTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch saved data from Firebase when component mounts
        const fetchData = async () => {
            setLoading(true);
            try {
                const introRef = ref(db, 'Courses/Introductions');
                const introSnapshot = await get(introRef);
                if (introSnapshot.exists()) {
                    const data = introSnapshot.val();
                    setSavedIntroductions(Object.keys(data).map(key => ({ id: key, ...data[key] })));
                }

                const courseTypeRef = ref(db, 'Courses/courseType');
                const courseTypeSnapshot = await get(courseTypeRef);
                if (courseTypeSnapshot.exists()) {
                    const data = courseTypeSnapshot.val();
                    setSavedcourseTypes(Object.keys(data).map(key => ({ id: key, ...data[key] })));
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
        if (files.courseTypeTitle && introductionTitle) {
            setLoading(true);
            try {
                const fileUrl = await uploadFile(files.courseTypeTitle, `introduction_pdfs/${files.courseTypeTitle.name}`);

                const introductionData = {
                    title: introductionTitle,
                    pdfUrl: fileUrl
                };

                const newIntroRef = push(ref(db, 'Courses/Introductions'));
                await set(newIntroRef, introductionData);

                setSavedIntroductions(prevData => [...prevData, { id: newIntroRef.key, ...introductionData }]);

                setIntroductionTitle('');
                setFiles({ ...files, courseTypeTitle: null });
            } catch (error) {
                console.error("Error uploading file or saving data:", error);
            } finally {
                setLoading(false);
            }
        } else {
            alert("Please enter a title and select a PDF file.");
        }
    };

    const handleSubmitcourseType = async (e) => {
        e.preventDefault();
        if (files.courseTypeTitle && courseTypeTitle) {
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
                    courseTypeReference,
                    courseTypeReferenceUrl: fileUrls[7]
                };

                const newcourseTypeRef = push(ref(db, 'Courses/courseType'));
                await set(newcourseTypeRef, courseTypeData);

                setSavedcourseTypes(prevData => [...prevData, { id: newcourseTypeRef.key, ...courseTypeData }]);

                setcourseTypeTitle('');
                setcourseTypeIntroduction('');
                setcourseTypeStructure('');
                setcourseTypeLiterature('');
                setcourseTypeMethodology('');
                setcourseTypeEvaluation('');
                setcourseTypeConclusion('');
                setcourseTypeReference('');
                setFiles({
                    courseTypeTitle: null,
                    courseTypeIntroduction: null,
                    courseTypeStructure: null,
                    courseTypeLiterature: null,
                    courseTypeMethodology: null,
                    courseTypeEvaluation: null,
                    courseTypeConclusion: null,
                    courseTypeReference: null
                });
            } catch (error) {
                console.error("Error uploading files or saving data:", error);
            } finally {
                setLoading(false);
            }
        } else {
            alert("Please enter a title and select a PDF file.");
        }
    };

    const handleDelete = async (id, pdfUrls) => {
        setLoading(true);
        try {
            // Delete each PDF file from Firebase Storage
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

            // Delete the document from Firestore
            const collectionName = pdfUrls[0].includes('introduction_pdfs') ? 'Introductions' : 'courseType'; // Adjust based on your logic
            const docRef = ref(db, `Courses/${collectionName}/${id}`);
            await remove(docRef);

            // Update state after successful deletion
            if (collectionName === 'Introductions') {
                setSavedIntroductions(prevData => prevData.filter(item => item.id !== id));
            } else if (collectionName === 'courseType') {
                setSavedcourseTypes(prevData => prevData.filter(item => item.id !== id));
            }
        } catch (error) {
            console.error("Error deleting data:", error);
            // Log the error code or message for further debugging
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className='container mt-5'>
            {loading ? <Loader loadingMessage="Loading..." /> : (
                <>
                    <Panel header="Add Introduction" toggleable className="mb-4">
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
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <button type="submit" className="btn btn-primary">Save Introduction</button>
                            </div>
                        </form>
                    </Panel>


                    <Panel header="Add type of courseType" toggleable className="mb-4">
                        <form onSubmit={handleSubmitcourseType}>
                            <div className="mb-3">
                                <label htmlFor="courseTypeTitle" className="form-label">Title of courseType:</label>
                                <input
                                    type="text"
                                    id="courseTypeTitle"
                                    className="form-control"
                                    value={courseTypeTitle}
                                    onChange={handleInputChange(setcourseTypeTitle)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="courseTypeIntroduction" className="form-label">Introduction of courseType:</label>
                                <div className="row">
                                    <div className="col-md-9 mb-2 mb-md-0">
                                        <textarea
                                            id="courseTypeIntroduction"
                                            className="form-control"
                                            value={courseTypeIntroduction}
                                            onChange={handleInputChange(setcourseTypeIntroduction)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('courseTypeIntroduction')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="courseTypeStructure" className="form-label">Structure of courseType:</label>
                                <div className="row">
                                    <div className="col-md-9 mb-2 mb-md-0">
                                        <textarea
                                            id="courseTypeStructure"
                                            className="form-control"
                                            value={courseTypeStructure}
                                            onChange={handleInputChange(setcourseTypeStructure)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('courseTypeStructure')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="courseTypeLiterature" className="form-label">Literature of courseType:</label>
                                <div className="row">
                                    <div className="col-md-9 mb-2 mb-md-0">
                                        <textarea
                                            id="courseTypeLiterature"
                                            className="form-control"
                                            value={courseTypeLiterature}
                                            onChange={handleInputChange(setcourseTypeLiterature)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('courseTypeLiterature')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="courseTypeMethodology" className="form-label">Methodology and Implementation of courseType:</label>
                                <div className="row">
                                    <div className="col-md-9 mb-2 mb-md-0">
                                        <textarea
                                            id="courseTypeMethodology"
                                            className="form-control"
                                            value={courseTypeMethodology}
                                            onChange={handleInputChange(setcourseTypeMethodology)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('courseTypeMethodology')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="courseTypeEvaluation" className="form-label">Evaluation of courseType:</label>
                                <div className="row">
                                    <div className="col-md-9 mb-2 mb-md-0">
                                        <textarea
                                            id="courseTypeEvaluation"
                                            className="form-control"
                                            value={courseTypeEvaluation}
                                            onChange={handleInputChange(setcourseTypeEvaluation)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('courseTypeEvaluation')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="courseTypeConclusion" className="form-label">Conclusion of courseType:</label>
                                <div className="row">
                                    <div className="col-md-9 mb-2 mb-md-0">
                                        <textarea
                                            id="courseTypeConclusion"
                                            className="form-control"
                                            value={courseTypeConclusion}
                                            onChange={handleInputChange(setcourseTypeConclusion)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('courseTypeConclusion')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="courseTypeReference" className="form-label">Reference of courseType:</label>
                                <div className="row">
                                    <div className="col-md-9 mb-2 mb-md-0">
                                        <textarea
                                            id="courseTypeReference"
                                            className="form-control"
                                            value={courseTypeReference}
                                            onChange={handleInputChange(setcourseTypeReference)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('courseTypeReference')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">Save courseType</button>
                        </form>
                    </Panel>


                    {savedIntroductions.length > 0 && (
                        <Panel header="Saved Introductions" toggleable className="mt-4">
                            {savedIntroductions.map((data) => (
                                <div className="card mb-3" key={data.id}>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5 className="card-title">{data.title}</h5>
                                                <a href={data.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-link">View PDF</a>
                                            </div>
                                            <button onClick={() => handleDelete(data.id, [data.pdfUrl])} className="btn btn-danger">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Panel>
                    )}


{savedcourseTypes.length > 0 && (
    <Panel header="Saved types of courseType" toggleable className="mt-4">
        {savedcourseTypes.map((data) => (
            <div className="card mb-3" key={data.id}>
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="card-title">{data.courseTypeTitle}</h5>
                            <p className="card-text">{data.courseTypeIntroduction}</p>
                        </div>
                        <button
                            onClick={() => handleDelete(
                                data.id,
                                Object.values(data).filter(
                                    url => url && typeof url === 'string' && url.startsWith('https://')
                                )
                            )}
                            className="btn btn-danger"
                        >
                            Delete
                        </button>
                    </div>
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
