import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import DynamicForm from '../components/DynamicForm';
import { addcourses, fetchcourses, updatecourses, deletecourses, addLike, removeLike, addComment } from '../redux/coursesSlice';
import DynamicList from '../components/DynamicList';
import ConfirmDialog from '../components/ConfirmDialog';
import { Modal, Form, Button } from 'react-bootstrap';
import Loader from '../components/Loader';

// Create memoized selector
const selectCoursesData = createSelector(
  state => state.courses.courses,
  state => state.courses.loading,
  state => state.courses.saveUpdateLoading,
  (courses, loading, saveUpdateLoading) => ({
    coursess: courses,
    coursesLoading: loading,
    saveUpdateLoading
  })
);

const Courses = () => {
  const dispatch = useDispatch();
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Use memoized selector
  const { coursess, coursesLoading: loading, saveUpdateLoading } = useSelector(selectCoursesData);

  const reversedcoursess = useMemo(() => [...coursess].reverse(), [coursess]);
  const auth = useSelector((state) => state.auth);
  const user = auth.user || { id: 'Anonymous', username: 'Anonymous' };
  const [hasFetched, setHasFetched] = useState(false);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedcourses, setSelectedcourses] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});

  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchcourses());
      setHasFetched(true);
    }
  }, [dispatch, hasFetched]);

  const formConfig = useMemo(() => [
    {
      fields: [
        { type: 'input', name: 'title', label: 'Title of type' },
        { type: 'textarea', name: 'introductionOfType', label: 'Introduction of type' },
        { type: 'textarea', name: 'structureOfType', label: 'Structure of type' },
        { type: 'file', name: 'structureFileURL', label: 'Upload file of structure' },
        { type: 'textarea', name: 'literatureOfType', label: 'Literature of type' },
        { type: 'file', name: 'literatureFileURL', label: 'Upload file of literature' },
        { type: 'textarea', name: 'methodologyOfType', label: 'Methodology of type' },
        { type: 'file', name: 'methodologyFileURL', label: 'Upload file of methodology' },
        { type: 'textarea', name: 'evalutionOfType', label: 'Evaluation of type' },
        { type: 'file', name: 'evalutionFileURL', label: 'Upload file of evalution' },
        { type: 'textarea', name: 'conclusionOfType', label: 'Conclusion of type' },
        { type: 'file', name: 'conclusionFileURL', label: 'Upload file of conclusion' },
      ]
    }
  ], []);

  const customHeadersAndKeys = [
    { header: 'Title of type', key: 'title' },
    { header: 'Introduction of type', key: 'introductionOfType' },
    { header: 'Structure of type', key: 'structureOfType' },
    { header: 'Upload file of structure', key: 'structureFileURL' },
    { header: 'Literature of type', key: 'literatureOfType' },
    { header: 'Upload file of literature', key: 'literatureFileURL' },
    { header: 'Methodology of type', key: 'methodologyOfType' },
    { header: 'Upload file of methodology', key: 'methodologyFileURL' },
    { header: 'Evaluation of type', key: 'evalutionOfType' },
    { header: 'Upload file of evaluation', key: 'evalutionFileURL' },
    { header: 'Conclusion of type', key: 'conclusionOfType' },
    { header: 'Upload file of conclusion', key: 'conclusionFileURL' },
    { header: 'Likes', key: 'likes', render: (likes) => likes ? Object.keys(likes).length : 0 },
    { header: 'Comments', key: 'comments', render: (comments) => comments ? Object.keys(comments).length : 0 },
  ];

  const handleFormSubmit = useCallback((data, formType) => {
    if (formType === 'add') {
      dispatch(addcourses(data));
      setShowForm(false);
    } else if (formType === 'edit') {
      dispatch(updatecourses({ id: data.id, coursesData: data }));
    }
  }, [dispatch]);

  const handleDelete = useCallback((item) => {
    setItemToDelete(item);
    setConfirmDialogVisible(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (itemToDelete) {
      dispatch(deletecourses(itemToDelete.id));
      setItemToDelete(null);
    }
    setConfirmDialogVisible(false);
  }, [itemToDelete, dispatch]);


  const cancelDelete = () => {
    setItemToDelete(null);
    setConfirmDialogVisible(false);
  };

  const cancelForm = () => {
    setSelectedcourses(null);
    setEditingItem(null);
    setShowForm(false);
    setShowModal(false);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleLike = (coursesId) => {
    if (user) {
      const courses = coursess.find(p => p.id === coursesId);
      if (courses && courses.likes && courses.likes[user.id]) {
        dispatch(removeLike({ coursesId, userName: user.username }));
      } else {
        dispatch(addLike({ coursesId, userName: user.username }));
      }
    }
  };

  const handleCommentChange = (coursesId, text) => {
    setCommentTexts(prev => ({ ...prev, [coursesId]: text }));
  };

  const handleComment = (coursesId) => {
    const commentText = commentTexts[coursesId];
    if (user && commentText && commentText.trim()) {
      dispatch(addComment({ coursesId, userName: user.username, comment: commentText }));
      setCommentTexts(prev => ({ ...prev, [coursesId]: '' }));
    }
  };

  const renderCommentForm = (coursesId) => (
    <Form className='d-flex justify-content-between my-2 mt-4' onSubmit={(e) => { e.preventDefault(); handleComment(coursesId); }}>
      <Form.Group>
        <Form.Control
          type="text"
          placeholder="Add a comment..."
          value={commentTexts[coursesId] || ''}
          onChange={(e) => handleCommentChange(coursesId, e.target.value)}
        />
      </Form.Group>
      <Button type="submit" variant="primary" size="sm">
        Post Comment
      </Button>
    </Form>
  );

  return (
    <div>
      {(loading || saveUpdateLoading) && (
        <Loader loadingMessage={loading ? "Fetching courses..." : "Saving/Updating data..."} />
      )}
      {showForm && !saveUpdateLoading && (
        <div className='my-2'>
          <DynamicForm
            className="shadow-md course-list funky-card"
            formConfig={formConfig}
            onSubmit={handleFormSubmit}
            editingItem={editingItem}
            title={editingItem ? 'Edit courses' : 'Add courses'}
            formType={editingItem ? 'edit' : 'add'}
            cancelConfig={{ label: 'Cancel', onCancel: cancelForm }}
          />
        </div>
      )}
      {!loading && !saveUpdateLoading && (
        <div className='my-2'>
          <DynamicList
            data={reversedcoursess}
            customHeadersAndKeys={customHeadersAndKeys}
            onAddNew={handleAddNew}
            onEdit={handleFormSubmit}
            onDelete={handleDelete}
            onLike={handleLike}
            renderCommentForm={renderCommentForm}
            noRecordMessage="No courses found."
            className="shadow-md course-list funky-card"
            formConfig={formConfig}
            isShowOnDashboard={true}
          />
        </div>
      )}
      <ConfirmDialog
        visible={confirmDialogVisible}
        onHide={cancelDelete}
        message={`Are you sure you want to delete the courses titled "${itemToDelete?.title}"?`}
        header="Confirm Deletion"
        accept={confirmDelete}
        reject={cancelDelete}
      />
      <Modal size='lg' show={showModal} onHide={() => setShowModal(false)}>
        <DynamicForm
          className="shadow-md bg-primary-subtle"
          formConfig={formConfig}
          onSubmit={handleFormSubmit}
          editingItem={selectedcourses}
          title="Edit courses"
          formType="edit"
          buttonLabel="Update"
          cancelConfig={{ label: 'Cancel', onCancel: cancelForm }}
        />
      </Modal>
    </div>
  );
};

export default Courses;
