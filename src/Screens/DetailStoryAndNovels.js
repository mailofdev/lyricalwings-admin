import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, ref, update, remove } from '../config/firebase';
import 'react-quill/dist/quill.snow.css';
import { Button } from 'primereact/button';
import Loader from '../Components/Loader';
import { Panel } from 'primereact/panel';
import { Toast } from 'primereact/toast';
import JoditEditor from 'jodit-react';

const DetailStoryAndNovels = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { item, type } = location.state || {};
    const editor = useRef(null);
    const [title, setTitle] = useState(item?.title || '');
    const [content, setContent] = useState(item?.content || '');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);

    useEffect(() => {
        if (!item) {
            navigate('/StoryAndNovel');
        }
    }, [item, navigate]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const config = useMemo(() => ({
        readonly: false,
        placeholder: 'Start typing...',
        autofocus: true,
        uploader: {
            insertImageAsBase64URI: true
        },
        disablePlugins: "video,about,ai-assistant,clean-html,delete-command,iframe,mobile,powered-by-jodit,source,speech-recognize,xpath,wrap-nodes,spellcheck,file",
        buttons: "bold,italic,underline,strikethrough,eraser,ul,ol,font,fontsize,paragraph,lineHeight,image,preview, align",
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        defaultActionOnPaste: "insert_only_text",
    }), []);

    const handleBlur = useCallback(newContent => {
        setContent(newContent);
    }, []);

    const handleSave = async () => {
        try {
            setLoading(true);
            const collectionName = type === 'stories' ? 'stories' : 'novels';
            const itemRef = ref(db, `${collectionName}/${item.id}`);
            await update(itemRef, { title, content });
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Content updated successfully', life: 3000 });
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating content', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to update content', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            const collectionName = type === 'stories' ? 'stories' : 'novels';
            const itemRef = ref(db, `${collectionName}/${item.id}`);
            await remove(itemRef);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Content deleted successfully', life: 3000 });
            navigate('/StoryAndNovels');
        } catch (error) {
            console.error('Error deleting content', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete content', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <Toast ref={toast} />
            {loading && <Loader loadingMessage="Processing..." />}
            <div className='card shadow-sm'>
                {isEditing ? (
                    <>
                        <div className='d-flex gap-3 flex-column'>
                            <div>
                                <input
                                    id="title"
                                    type="text"
                                    className="p-inputtext w-100"
                                    placeholder='Title'
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div>
                                <JoditEditor
                                    ref={editor}
                                    value={content}
                                    config={config}
                                    tabIndex={1}
                                    onBlur={handleBlur}
                                    onChange={handleBlur}
                                    readOnly={!isEditing}
                                />
                            </div>
                            <div className='d-flex justify-content-center gap-3'>
                                <Button icon="pi pi-save" className="p-button-success" onClick={handleSave} />
                                <Button icon="pi pi-times" className="p-button-secondary" onClick={() => setIsEditing(false)} />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className='d-flex gap-3 flex-column my-2 '>
                            <div className="card-body" dangerouslySetInnerHTML={{ __html: title }} />
                            <div className="card-body" dangerouslySetInnerHTML={{ __html: content }} />
                            <div className='d-flex justify-content-center gap-3'>
                                <Button icon="pi pi-pencil" className="p-button-info" onClick={handleEdit} />
                                <Button icon="pi pi-trash" className="p-button-danger" onClick={handleDelete} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DetailStoryAndNovels;
