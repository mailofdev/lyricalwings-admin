import React, { useState, useRef, useMemo, useCallback } from 'react';
import JoditEditor from 'jodit-react';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { ref, push, set, db } from '../Config/firebase'; // Adjust the path to your firebaseConfig file
import Loader from '../Components/Loader'; // Assuming Loader component is in the same directory
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom for navigation
import '../css/loader.css'; // Adjust path to your loader CSS
import { Toast } from 'primereact/toast';

const StoryAndNovels = () => {
    const editor = useRef(null);
    const [title, setTitle] = useState(''); // State for title
    const [content, setContent] = useState('');
    const [selectedType, setSelectedType] = useState('stories'); // 'stories' or 'novel'
    const [loading, setLoading] = useState(false); // Loading state
    const toast = useRef(null);
    const navigate = useNavigate();

    const config = useMemo(() => ({
        readonly: false,
        placeholder: 'Start typing...',
        autofocus: true,
        uploader: {
            insertImageAsBase64URI: true
        },
        disablePlugins: "video,about,ai-assistant,clean-html,delete-command,iframe,mobile,powered-by-jodit,source,speech-recognize,xpath,wrap-nodes,spellcheck,file",
        buttons: "bold,italic,underline,strikethrough,eraser,ul,ol,font,fontsize,paragraph,lineHeight,image,preview, align",
        "askBeforePasteHTML": false,
        "askBeforePasteFromWord": false,
        "defaultActionOnPaste": "insert_only_text",

    }), []);

    const handleBlur = useCallback(newContent => {
        setContent(newContent);
    }, []);

    const saveContentToDatabase = async () => {
        if (!title || title.trim() === '') {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Title is empty.', life: 3000 });
            return;
        }
        if (!content || content.trim() === '') {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Content is empty.', life: 3000 });
            return;
        }
        const collectionName = selectedType === 'stories' ? 'stories' : 'novels'; // Determine collection based on selectedType
        const storiesRef = ref(db, collectionName); // Reference the correct collection
        const newStoryRef = push(storiesRef);
        try {
            setLoading(true); // Set loading to true before saving
            await set(newStoryRef, { title, content }); // Save title and content
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Content saved successfully', life: 3000 });
            setContent('');
            setTitle('');
        } catch (error) {
            console.error('Error saving content to the database', error);
        } finally {
            setLoading(false); // Set loading to false after saving
        }
    };

    const handleRadioChange = (event) => {
        setSelectedType(event.target.value);
    };

    

      
    const viewStories = (type) => {
        navigate(`/StoryAndNovelList/${type}`, { state: { type: 'stories' } }); // Navigate to story list page with parameter
    };

    const viewNovels = (type) => {
        navigate(`/StoryAndNovelList/${type}`, { state: { type: 'novels' } }); // Navigate to novel list page with parameter
    };

    return (
        <div className='container gap-3 d-flex flex-column'>
            <Toast ref={toast} />
            {loading && <Loader loadingMessage="Loading..." />}
            <Panel header="" toggleable>
                <div className='d-flex gap-3 flex-column'>
                <div className="p-fluid">
                    <div className="p-field">
                        <input id="title" type="text" className="p-inputtext" placeholder='title..' value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                </div>
                <div>
                <JoditEditor
                    ref={editor}
                    value={content}
                    config={config}
                    tabIndex={1}
                    onBlur={handleBlur}
                    onChange={handleBlur}
                />
                </div>
                <div className='text-center d-flex justify-content-center gap-4'>
                    <div className='d-flex gap-1'>
                        <input type="radio" id="story" name="storyType" value="story" checked={selectedType === 'stories'} onChange={handleRadioChange} />
                        <label htmlFor="story">Story</label>
                    </div>
                    <div className='d-flex gap-1'>
                        <input type="radio" id="novel" name="storyType" value="novel" checked={selectedType === 'novel'} onChange={handleRadioChange} />
                        <label htmlFor="novel">Novel</label>
                    </div>
                </div>
                <div className='text-center'>
                    <Button label="Save" icon="pi pi-save" className="p-button-success mt-2" onClick={saveContentToDatabase} />
                </div>
                <div className='justify-content-center gap-2 d-flex'>
                    <Button label="View Stories" className="p-button-success" onClick={() => viewStories('stories')} />
                    <Button label="View Novels"  className="p-button-success" onClick={() => viewNovels('novels')} />
                </div>
                </div>
            </Panel>
        </div>
    );
}

export default StoryAndNovels;
