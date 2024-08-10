import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../config/firebase';
import { get, ref, push, set, remove } from 'firebase/database';
import { InputText } from 'primereact/inputtext';
import { Button } from 'react-bootstrap';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Panel } from 'primereact/panel';
import Loader from '../Components/Loader';

const UI = () => {
    const [themeName, setThemeName] = useState('');
    const [themeBGColor, setThemeBGColor] = useState('');
    const [themeFontColor, setThemeFontColor] = useState('');
    const [themeButtonColor, setThemeButtonColor] = useState('');
    const [themeButtonTextColor, setThemeButtonTextColor] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [themes, setThemes] = useState([]);
    const [loading, setLoading] = useState(false); // State for loading indicator
    const fileInputRef = useRef(null);
    const [editId, setEditId] = useState(null); // Track the ID of the theme being edited
    const [loadingMessage, setLoadingMessage] = useState('');
    const [appliedTheme, setAppliedTheme] = useState(null); // State to track applied theme object

    useEffect(() => {
        fetchThemes();
        const fetchAppliedTheme = async () => {
            try {
                const snapshot = await get(ref(db, 'AppliedTheme'));
                if (snapshot.exists()) {
                    setAppliedTheme(snapshot.val());
                } else {
                    setAppliedTheme(null);
                }
            } catch (error) {
                console.error('Error fetching applied theme:', error);
            }
        };

        fetchAppliedTheme();
    }, []);

    const fetchThemes = async () => {
        try {
            setLoadingMessage("Fetching themes...");
            setLoading(true); // Start loading indicator
            const ThemesRef = ref(db, 'Themes');
            const snapshot = await get(ThemesRef);
            if (snapshot.exists()) {
                const themesArray = [];
                snapshot.forEach((childSnapshot) => {
                    themesArray.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
                setThemes(themesArray);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };

    const handleTitleChange = (event) => {
        const { value } = event.target;
        setThemeName(value);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'image/jpeg' && file.size >= 20000 && file.size <= 500000) {
            setSelectedFile(file);
        } else {
            alert('Please select a JPG image between 20KB and 500KB.');
        }
    };

    const handlePost = async () => {
        if (!themeName || !themeBGColor || !themeFontColor || !themeButtonColor || !themeButtonTextColor) {
            alert('Please fill all fields.');
            return;
        }

        try {
            setLoadingMessage("Saving theme...");
            setLoading(true); // Start loading indicator
            const ThemesRef = ref(db, 'Themes');
            let newId;
            if (editId) {
                newId = editId; // Use the editId if in edit mode
            } else {
                newId = push(ThemesRef).key; // Generate new key for new theme
            }

            const themeData = {
                themeName,
                themeBGColor,
                themeFontColor,
                themeButtonColor,
                themeButtonTextColor,
                fileName: selectedFile ? selectedFile.name : null
            };

            if (selectedFile) {
                const fileRef = storageRef(storage, `ThemeImage/${newId}/${selectedFile.name}`);
                await uploadBytes(fileRef, selectedFile);
                const downloadUrl = await getDownloadURL(fileRef);
                themeData.fileUrl = downloadUrl;
            }

            await set(ref(db, `Themes/${newId}`), themeData);

            fetchThemes();
            setThemeName('');
            setThemeBGColor('');
            setThemeFontColor('');
            setThemeButtonColor('');
            setThemeButtonTextColor('');
            setSelectedFile(null);
            fileInputRef.current.value = '';
            setEditId(null); // Clear editId after posting

        } catch (error) {
            console.error('Error posting theme:', error);
            alert(error.message);
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };

    const handleEdit = async (theme) => {
        try {
            setThemeName(theme.themeName);
            setThemeBGColor(theme.themeBGColor);
            setThemeFontColor(theme.themeFontColor);
            setThemeButtonColor(theme.themeButtonColor);
            setThemeButtonTextColor(theme.themeButtonTextColor);
            setEditId(theme.id); // Set editId to track the theme being edited
        } catch (error) {
            console.error('Error editing theme:', error);
            alert(error.message);
        }
    };

    const handleDelete = async (themeId) => {
        try {
            setLoadingMessage("Deleting theme...");
            setLoading(true); // Start loading indicator
            await remove(ref(db, `Themes/${themeId}`));
            fetchThemes(); // Refresh themes list after deletion
        } catch (error) {
            console.error('Error deleting theme:', error);
            alert(error.message);
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };

    const applyThemeToUserWebsite = async (theme) => {
        try {
            setLoadingMessage("Applying theme...");
            setLoading(true); // Start loading indicator

            // Update applied theme object in Firebase
            await set(ref(db, 'AppliedTheme'), theme);

            // Update state with applied theme object
            setAppliedTheme(theme);

            setLoadingMessage("Theme applied successfully!");
        } catch (error) {
            console.error('Error applying theme:', error);
            alert('Error applying theme. Please try again.');
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };

    return (
        <div className="container gap-4 d-flex flex-column">
            <Panel header={editId ? 'Update Theme' : 'Save Theme'}>
                <div className="d-flex flex-column gap-4">
                    <div>
                        <div>Theme name</div>
                        <InputText
                            className="form-control"
                            type="text"
                            id="themeName"
                            value={themeName}
                            onChange={handleTitleChange}
                            required
                        />
                    </div>

                    <div>
                        <div>Theme background color</div>
                        <div className="d-flex gap-2">
                            <InputText
                                className="form-control"
                                type="color"
                                id="themeBGColor"
                                value={themeBGColor}
                                onChange={(e) => setThemeBGColor(e.target.value)}
                                required
                            />
                            <InputText
                                className="form-control"
                                type="text"
                                value={themeBGColor}
                                onChange={(e) => setThemeBGColor(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div>Theme font color</div>
                        <div className="d-flex gap-2">
                            <InputText
                                className="form-control"
                                type="color"
                                id="themeFontColor"
                                value={themeFontColor}
                                onChange={(e) => setThemeFontColor(e.target.value)}
                                required
                            />
                            <InputText
                                className="form-control"
                                type="text"
                                value={themeFontColor}
                                onChange={(e) => setThemeFontColor(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div>Theme button color</div>
                        <div className="d-flex gap-2">
                            <InputText
                                className="form-control"
                                type="color"
                                id="themeButtonColor"
                                value={themeButtonColor}
                                onChange={(e) => setThemeButtonColor(e.target.value)}
                                required
                            />
                            <InputText
                                className="form-control"
                                type="text"
                                value={themeButtonColor}
                                onChange={(e) => setThemeButtonColor(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div>Theme button text color</div>
                        <div className="d-flex gap-2">
                            <InputText
                                className="form-control"
                                type="color"
                                id="themeButtonTextColor"
                                value={themeButtonTextColor}
                                onChange={(e) => setThemeButtonTextColor(e.target.value)}
                                required
                            />
                            <InputText
                                className="form-control"
                                type="text"
                                value={themeButtonTextColor}
                                onChange={(e) => setThemeButtonTextColor(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div>Theme background image</div>
                        <InputText
                            className='w-100'
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            required
                        />
                    </div>

                    <div className='text-center'>
                        <Button
                            className="btn btn-light btn-outline-success border border-1 border-success"
                            onClick={handlePost}> {editId ? 'Update Theme' : 'Save Theme'} </Button>
                    </div>
                </div>
            </Panel>
            <div className="card shadow-sm p-4 mt-4">
                <h3>Current Themes</h3>
                {loading && <Loader loadingMessage={loadingMessage} />} {/* Display spinner while loading */}
                {!loading && themes.map((theme) => (
                    <div key={theme.id} className="d-flex align-items-center justify-content-between border p-2 mb-2">
                        <div>
                            <strong>{theme.themeName}</strong>
                        </div>
                        <div>
                            <Button variant="outline-primary" className="mx-2" onClick={() => handleEdit(theme)}>Edit</Button>
                            <Button variant="outline-danger" onClick={() => handleDelete(theme.id)}>Delete</Button>
                            <Button
                                variant="outline-info"
                                onClick={() => applyThemeToUserWebsite(theme)}
                                disabled={loading}>
                                {appliedTheme && appliedTheme.id === theme.id ? 'Applied' : 'Apply Theme'}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UI;
