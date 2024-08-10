import React, { useState, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Card, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { updatePoem, deletePoem, deleteStoryAndNovel, updateStoryAndNovel } from '../redux/contentSlice';
import JoditEditor from 'jodit-react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { RxUpdate } from 'react-icons/rx';
import { MdOutlineCancel } from 'react-icons/md';
import Loader from '../Components/Loader';

const ItemDetails = () => {
  const location = useLocation();
  const { item } = location.state;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const editorSubtitle = useRef(null);
  const editorContent = useRef(null);
  const loading = useSelector((state) => state.content.loading); 

  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item);

  const config = useMemo(() => ({
    readonly: false,
    placeholder: 'Start typing...',
    autofocus: true,
    uploader: {
      insertImageAsBase64URI: true,
    },
    disablePlugins: "video,about,ai-assistant,clean-html,delete-command,iframe,mobile,powered-by-jodit,source,speech-recognize,xpath,wrap-nodes,spellcheck,file",
    buttons: "bold,italic,underline,strikethrough,eraser,ul,ol,font,fontsize,paragraph,lineHeight,image,preview,align",
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: "insert_only_text",
  }), []);

  if (!item) {
    return <Container className="my-4"><p>Item not found.</p></Container>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedItem({
      ...editedItem,
      [name]: value,
    });
  };

  const handleSubtitleChange = (newContent) => {
    setEditedItem({
      ...editedItem,
      subTitle: newContent,
    });
  };

  const handleContentChange = (newContent) => {
    setEditedItem({
      ...editedItem,
      content: newContent,
    });
  };

  const handleSave = () => {
    if (editedItem.isPoem) {
      dispatch(updatePoem(editedItem));
    } else if (editedItem.isStoryAndNovel) {
      dispatch(updateStoryAndNovel(editedItem));
    }
    setIsEditing(false);
    navigate(-1); // Go back to the previous page
  };

  const handleDelete = () => {
    if (editedItem.isPoem) {
      dispatch(deletePoem(editedItem.id));
    } else if (editedItem.isStoryAndNovel) {
      dispatch(deleteStoryAndNovel(editedItem.id));
    }
    navigate(-1); // Go back to the previous page
  };

  return (
    <Container className="my-4">
      {loading && <Loader loadingMessage={'Loading...'} />}
      <Card className="shadow-sm" style={{ background: item.cardColor }}>
        <div className='text-center fs-3 mb-2' style={{ textTransform: 'uppercase' }}>
          {item.type}
        </div>

        <Card.Body>
          {isEditing ? (
            <>
              <Form>
                <Form.Group>
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={editedItem.title}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Subtitle</Form.Label>
                  <JoditEditor
                    ref={editorSubtitle}
                    value={editedItem.subTitle}
                    config={config}
                    onChange={handleSubtitleChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Content</Form.Label>
                  <JoditEditor
                    config={config}
                    ref={editorContent}
                    value={editedItem.content}
                    onChange={handleContentChange}
                    onBlur={handleContentChange}
                  />
                </Form.Group>
              </Form>
              <div className='d-flex justify-content-evenly'>
                <OverlayTrigger placement="top" overlay={<Tooltip>Update</Tooltip>}>
                  <Button variant="success" onClick={handleSave} className="mt-3">
                    <RxUpdate />
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip>Cancel</Tooltip>}>
                  <Button variant="secondary" onClick={() => setIsEditing(false)} className="mt-3 ms-2">
                    <MdOutlineCancel />
                  </Button>
                </OverlayTrigger>
              </div>
            </>
          ) : (
            <>
              <Card.Title className="h3" style={{ color: item.fontColor }}>{item.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted" style={{ color: item.fontColor }}>
                <div dangerouslySetInnerHTML={{ __html: item.subTitle }}></div>
              </Card.Subtitle>
              <Card.Text className="mt-4" style={{ color: item.fontColor }}>
                <div dangerouslySetInnerHTML={{ __html: item.content }}></div>
              </Card.Text>
              <div className="text-muted small mt-4">
                <span>Posted on: {new Date(item.timestamp).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}</span>
              </div>
              <div className='d-flex justify-content-evenly'>
                <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                  <Button variant="primary" onClick={() => setIsEditing(true)}>
                    <FaEdit />
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                  <Button variant="danger" onClick={handleDelete}>
                    <FaTrash />
                  </Button>
                </OverlayTrigger>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ItemDetails;
