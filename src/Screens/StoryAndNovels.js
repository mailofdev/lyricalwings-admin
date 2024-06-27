import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ref, push, set, update, remove, db, get, child } from '../Config/firebase'; // Adjust the path to your firebaseConfig file
import Loader from '../Components/Loader'; // Assuming Loader component is in the same directory
import 'primereact/resources/themes/saga-blue/theme.css'; // Theme CSS
import 'primereact/resources/primereact.min.css'; // PrimeReact CSS
import 'primeicons/primeicons.css'; // PrimeIcons CSS
import '../css/loader.css'; // Adjust path to your loader CSS

const StoryAndNovels = () => {
    const editor = useRef(null);
    const [content, setContent] = useState('');
    const [stories, setStories] = useState([]);
    const [editDialogVisible, setEditDialogVisible] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [editStoryId, setEditStoryId] = useState(null);
    const [selectedType, setSelectedType] = useState('story'); // 'story' or 'novel'
    const [loading, setLoading] = useState(false); // Loading state
    const toast = useRef(null);

    const config = useMemo(() => ({
        readonly: false,
        placeholder: 'Start typing...',
        autofocus: true,
        uploader: {
            insertImageAsBase64URI: true
        },
        disablePlugins: "video,about,ai-assistant,clean-html,delete-command,iframe,mobile,powered-by-jodit,source,speech-recognize,xpath,wrap-nodes,spellcheck,file",
        buttons: "bold,italic,underline,strikethrough,eraser,ul,ol,font,fontsize,paragraph,lineHeight,image,preview",
        "askBeforePasteHTML": false,
        "askBeforePasteFromWord": false,
        "defaultActionOnPaste": "insert_only_text",

    }), []);

    const handleBlur = useCallback(newContent => {
        setContent(newContent);
    }, []);

    const saveContentToDatabase = async () => {
        if (!content || content.trim() === '') {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Content is empty.', life: 3000 });
            return;
        }
        const storiesRef = ref(db, 'storyAndNovels');
        const newStoryRef = push(storiesRef);
        try {
            setLoading(true); // Set loading to true before saving
            await set(newStoryRef, { content, type: selectedType }); // Save type along with content
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Content saved successfully', life: 3000 });
            setContent('');
            setSelectedType('story');
            fetchStories();
        } catch (error) {
            console.error('Error saving content to the database', error);
        } finally {
            setLoading(false); // Set loading to false after saving
        }
    };

    const fetchStories = useCallback(async () => {
        setLoading(true); // Set loading to true before fetching
        const dbRef = ref(db);
        try {
            const snapshot = await get(child(dbRef, 'storyAndNovels'));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const storiesList = Object.keys(data).map(key => ({
                    id: key,
                    content: data[key].content,
                    type: data[key].type
                }));
                setStories(storiesList);
            } else {
                setStories([]);
                console.log('No stories available');
            }
        } catch (error) {
            console.error('Error fetching stories from the database', error);
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    }, []);

    const handleEdit = (story) => {
        setEditContent(story.content);
        setEditStoryId(story.id);
        setEditDialogVisible(true);
    };

    const handleUpdate = async () => {
        if (!editContent || editContent.trim() === '') {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Content is empty.', life: 3000 });
            return;
        }
        const storyRef = ref(db, `storyAndNovels/${editStoryId}`);
        try {
            setLoading(true); // Set loading to true before updating
            await update(storyRef, { content: editContent });
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Content updated successfully', life: 3000 });
            setEditDialogVisible(false);
            fetchStories(); // Fetch stories after updating content
        } catch (error) {
            console.error('Error updating content in the database', error);
        } finally {
            setLoading(false); // Set loading to false after updating
        }
    };

    const handleDelete = async (storyId) => {
        const storyRef = ref(db, `storyAndNovels/${storyId}`);
        try {
            setLoading(true); // Set loading to true before deleting
            await remove(storyRef);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Content deleted successfully', life: 3000 });
            fetchStories(); // Fetch stories after deleting content
        } catch (error) {
            console.error('Error deleting content from the database', error);
        } finally {
            setLoading(false); // Set loading to false after deleting
        }
    };

    useEffect(() => {
        fetchStories();
    }, [fetchStories]);

    const handleRadioChange = (event) => {
        setSelectedType(event.target.value);
    };

    const filteredStories = stories.filter(story => story.type === 'story');
    const filteredNovels = stories.filter(story => story.type === 'novel');

    const renderStoriesPanel = () => (
        <Panel header="Stories" toggleable>
            {filteredStories.length === 0 ? (
                <p>No stories available.</p>
            ) : (
                filteredStories.map(story => (
                    <div key={story.id} className="mb-2 card shadow-sm p-3">
                        <div dangerouslySetInnerHTML={{ __html: story.content }} />
                        <div className="d-flex justify-content-end mt-2">
                            <Button icon="pi pi-pencil" className="p-button-warning mr-2" onClick={() => handleEdit(story)} />
                            <Button icon="pi pi-trash" className="p-button-danger" onClick={() => handleDelete(story.id)} />
                        </div>
                    </div>
                ))
            )}
        </Panel>
    );

    const renderNovelsPanel = () => (
        <Panel header="Novels" toggleable>
            {filteredNovels.length === 0 ? (
                <p>No novels available.</p>
            ) : (
                filteredNovels.map(story => (
                    <div key={story.id} className="mb-2 card shadow-sm p-3">
                        <div dangerouslySetInnerHTML={{ __html: story.content }} />
                        <div className="d-flex justify-content-end mt-2">
                            <Button icon="pi pi-pencil" className="p-button-warning mr-2" onClick={() => handleEdit(story)} />
                            <Button icon="pi pi-trash" className="p-button-danger" onClick={() => handleDelete(story.id)} />
                        </div>
                    </div>
                ))
            )}
        </Panel>
    );

    return (
        <div className='container gap-3 d-flex flex-column'>
            <Toast ref={toast} />
            {loading && <Loader loadingMessage="Loading..." />}
            <Panel header="" toggleable>
                <JoditEditor
                    ref={editor}
                    value={content}
                    config={config}
                    tabIndex={1}
                    onBlur={handleBlur}
                    onChange={handleBlur}
                />
                <div className='text-center d-flex justify-content-center gap-4 my-2'>
                    <div className='d-flex gap-1'>
                        <input type="radio" id="story" name="storyType" value="story" checked={selectedType === 'story'} onChange={handleRadioChange} />
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
            </Panel>
            {content}
            {renderStoriesPanel()}
            {renderNovelsPanel()}
            <Dialog header="Edit Story" visible={editDialogVisible} style={{ width: '50vw' }} onHide={() => setEditDialogVisible(false)}>
                <JoditEditor
                    ref={editor}
                    value={editContent}
                    config={config}
                    tabIndex={1}
                    onBlur={newContent => setEditContent(newContent)}
                    onChange={newContent => setEditContent(newContent)}
                />
                <Button label="Update" icon="pi pi-check" className="p-button-success mt-2" onClick={handleUpdate} />
            </Dialog>
        </div>
    );
}

export default StoryAndNovels;


