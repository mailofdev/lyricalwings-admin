import React, { useState, useEffect } from 'react';
import { ref, set, get, remove, push } from "firebase/database";
import { storage, db } from '../Config/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Loader from '../Components/Loader'; // Adjust the import path according to your project structure
import 'bootstrap/dist/css/bootstrap.min.css';
import { Panel } from 'primereact/panel';

const Courses = () => {

    const [introductionTitle, setIntroductionTitle] = useState('');
    const [poemTitle, setPoemTitle] = useState('');
    const [poemIntroduction, setPoemIntroduction] = useState('');
    const [poemStructure, setPoemStructure] = useState('');
    const [poemLiterature, setPoemLiterature] = useState('');
    const [poemMethodology, setPoemMethodology] = useState('');
    const [poemEvaluation, setPoemEvaluation] = useState('');
    const [poemConclusion, setPoemConclusion] = useState('');
    const [poemReference, setPoemReference] = useState('');
    const [files, setFiles] = useState({
        poemTitle: null,
        poemIntroduction: null,
        poemStructure: null,
        poemLiterature: null,
        poemMethodology: null,
        poemEvaluation: null,
        poemConclusion: null,
        poemReference: null
    });
    const [savedIntroductions, setSavedIntroductions] = useState([]);
    const [savedPoems, setSavedPoems] = useState([]);
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

                const poemRef = ref(db, 'Courses/Poems');
                const poemSnapshot = await get(poemRef);
                if (poemSnapshot.exists()) {
                    const data = poemSnapshot.val();
                    setSavedPoems(Object.keys(data).map(key => ({ id: key, ...data[key] })));
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
        if (files.poemTitle && introductionTitle) {
            setLoading(true);
            try {
                const fileUrl = await uploadFile(files.poemTitle, `introduction_pdfs/${files.poemTitle.name}`);

                const introductionData = {
                    title: introductionTitle,
                    pdfUrl: fileUrl
                };

                const newIntroRef = push(ref(db, 'Courses/Introductions'));
                await set(newIntroRef, introductionData);

                setSavedIntroductions(prevData => [...prevData, { id: newIntroRef.key, ...introductionData }]);

                setIntroductionTitle('');
                setFiles({ ...files, poemTitle: null });
            } catch (error) {
                console.error("Error uploading file or saving data:", error);
            } finally {
                setLoading(false);
            }
        } else {
            alert("Please enter a title and select a PDF file.");
        }
    };

    const handleSubmitPoem = async (e) => {
        e.preventDefault();
        if (files.poemTitle && poemTitle) {
            setLoading(true);
            try {
                const fileUrls = await Promise.all(Object.keys(files).map(async (key) => {
                    if (files[key]) {
                        return await uploadFile(files[key], `${key}_pdfs/${files[key].name}`);
                    }
                    return null;
                }));

                const poemData = {
                    poemTitle,
                    poemTitleUrl: fileUrls[0],
                    poemIntroduction,
                    poemIntroductionUrl: fileUrls[1],
                    poemStructure,
                    poemStructureUrl: fileUrls[2],
                    poemLiterature,
                    poemLiteratureUrl: fileUrls[3],
                    poemMethodology,
                    poemMethodologyUrl: fileUrls[4],
                    poemEvaluation,
                    poemEvaluationUrl: fileUrls[5],
                    poemConclusion,
                    poemConclusionUrl: fileUrls[6],
                    poemReference,
                    poemReferenceUrl: fileUrls[7]
                };

                const newPoemRef = push(ref(db, 'Courses/Poems'));
                await set(newPoemRef, poemData);

                setSavedPoems(prevData => [...prevData, { id: newPoemRef.key, ...poemData }]);

                setPoemTitle('');
                setPoemIntroduction('');
                setPoemStructure('');
                setPoemLiterature('');
                setPoemMethodology('');
                setPoemEvaluation('');
                setPoemConclusion('');
                setPoemReference('');
                setFiles({
                    poemTitle: null,
                    poemIntroduction: null,
                    poemStructure: null,
                    poemLiterature: null,
                    poemMethodology: null,
                    poemEvaluation: null,
                    poemConclusion: null,
                    poemReference: null
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
            const collectionName = pdfUrls[0].includes('introduction_pdfs') ? 'Introductions' : 'Poems'; // Adjust based on your logic
            const docRef = ref(db, `Courses/${collectionName}/${id}`);
            await remove(docRef);

            // Update state after successful deletion
            if (collectionName === 'Introductions') {
                setSavedIntroductions(prevData => prevData.filter(item => item.id !== id));
            } else if (collectionName === 'Poems') {
                setSavedPoems(prevData => prevData.filter(item => item.id !== id));
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
                                            onChange={handleFileChange('poemTitle')}
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


                    <Panel header="Add type of poem" toggleable className="mb-4">
                        <form onSubmit={handleSubmitPoem}>
                            <div className="mb-3">
                                <label htmlFor="poemTitle" className="form-label">Title of Poem:</label>
                                <input
                                    type="text"
                                    id="poemTitle"
                                    className="form-control"
                                    value={poemTitle}
                                    onChange={handleInputChange(setPoemTitle)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="poemIntroduction" className="form-label">Introduction of Poem:</label>
                                <div className="row">
                                    <div className="col-md-9 mb-2 mb-md-0">
                                        <textarea
                                            id="poemIntroduction"
                                            className="form-control"
                                            value={poemIntroduction}
                                            onChange={handleInputChange(setPoemIntroduction)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('poemIntroduction')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="poemStructure" className="form-label">Structure of Poem:</label>
                                <div className="row">
                                    <div className="col-md-9 mb-2 mb-md-0">
                                        <textarea
                                            id="poemStructure"
                                            className="form-control"
                                            value={poemStructure}
                                            onChange={handleInputChange(setPoemStructure)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('poemStructure')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="poemLiterature" className="form-label">Literature of Poem:</label>
                                <div className="row">
                                    <div className="col-md-9 mb-2 mb-md-0">
                                        <textarea
                                            id="poemLiterature"
                                            className="form-control"
                                            value={poemLiterature}
                                            onChange={handleInputChange(setPoemLiterature)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('poemLiterature')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="poemMethodology" className="form-label">Methodology and Implementation of Poem:</label>
                                <div className="row">
                                    <div className="col-md-9 mb-2 mb-md-0">
                                        <textarea
                                            id="poemMethodology"
                                            className="form-control"
                                            value={poemMethodology}
                                            onChange={handleInputChange(setPoemMethodology)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('poemMethodology')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="poemEvaluation" className="form-label">Evaluation of Poem:</label>
                                <div className="row">
                                    <div className="col-md-9 mb-2 mb-md-0">
                                        <textarea
                                            id="poemEvaluation"
                                            className="form-control"
                                            value={poemEvaluation}
                                            onChange={handleInputChange(setPoemEvaluation)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('poemEvaluation')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="poemConclusion" className="form-label">Conclusion of Poem:</label>
                                <div className="row">
                                    <div className="col-md-9 mb-2 mb-md-0">
                                        <textarea
                                            id="poemConclusion"
                                            className="form-control"
                                            value={poemConclusion}
                                            onChange={handleInputChange(setPoemConclusion)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('poemConclusion')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="poemReference" className="form-label">Reference of Poem:</label>
                                <div className="row">
                                    <div className="col-md-9 mb-2 mb-md-0">
                                        <textarea
                                            id="poemReference"
                                            className="form-control"
                                            value={poemReference}
                                            onChange={handleInputChange(setPoemReference)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-center">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handleFileChange('poemReference')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">Save Poem</button>
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


{savedPoems.length > 0 && (
    <Panel header="Saved types of poem" toggleable className="mt-4">
        {savedPoems.map((data) => (
            <div className="card mb-3" key={data.id}>
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="card-title">{data.poemTitle}</h5>
                            <p className="card-text">{data.poemIntroduction}</p>
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
