import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, ref, get, update, remove } from '../Config/firebase';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import Loader from '../Components/Loader';

const DetailPoem = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { poem } = location.state || {};
    const [isLoading, setIsLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [totalLikes, setTotalLikes] = useState(0);
    const [editingComment, setEditingComment] = useState(null);
    const [editingPoem, setEditingPoem] = useState(null);
    const [newCommentText, setNewCommentText] = useState('');
    const [newTitleValue, setNewTitleValue] = useState('');
    const [newPoemContent, setNewPoemContent] = useState('');
    const [newBackgroundOfPoem, setNewBackgroundOfPoem] = useState('');

    console.log(JSON.stringify(poem))
    useEffect(() => {
        const fetchLikesAndComments = async () => {
            setIsLoading(true);
            try {
                if (!poem || !poem.id) {
                    setIsLoading(false);
                    return;
                }

                const likesSnapshot = await get(ref(db, `AllPoems/${poem.id}/likes`));

                if (likesSnapshot.exists()) {
                    const likesData = likesSnapshot.val();
                    const likesCount = Object.keys(likesData).length;
                    setTotalLikes(likesCount);
                } else {
                    setTotalLikes(0);
                }

                const commentsSnapshot = await get(ref(db, `AllPoems/${poem.id}/comments`));
                if (commentsSnapshot.exists()) {
                    const commentsData = commentsSnapshot.val();
                    const commentsWithUserData = [];

                    for (const commentId in commentsData) {
                        const comment = commentsData[commentId];
                        const userSnapshot = await get(ref(db, `users/${comment.userId}`));

                        if (userSnapshot.exists()) {
                            const userData = userSnapshot.val();
                            commentsWithUserData.push({
                                ...comment,
                                id: commentId,
                                user: {
                                    username: userData.username
                                },
                                time: new Date(comment.time).toLocaleString(),
                            });
                        } else {
                            console.warn(`User data not found for comment with ID: ${commentId}`);
                        }
                    }

                    commentsWithUserData.sort((a, b) => new Date(b.time) - new Date(a.time));
                    setComments(commentsWithUserData);
                }
            } catch (error) {
                console.error('Error fetching likes and comments:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (poem && poem.id) {
            fetchLikesAndComments();
        } else {
            setIsLoading(false);
        }
    }, [poem]);

    const handleDeleteComment = async (commentId) => {
        try {
            await remove(ref(db, `AllPoems/${poem.id}/comments/${commentId}`));
            setComments(comments.filter(comment => comment.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleEditComment = (comment) => {
        setEditingComment(comment);
        setNewCommentText(comment.text);
    };

    const handleSaveComment = async () => {
        try {
            await update(ref(db, `AllPoems/${poem.id}/comments/${editingComment.id}`), {
                text: newCommentText,
                time: Date.now(),
            });

            setComments(comments.map(comment =>
                comment.id === editingComment.id ? { ...comment, text: newCommentText, time: new Date().toLocaleString() } : comment
            ));

            setEditingComment(null);
            setNewCommentText('');
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleCancelEditComment = () => {
        setEditingComment(null);
        setNewCommentText('');
    };

    const handleEditPoem = () => {
        setEditingPoem(poem);
        setNewTitleValue(poem.titleValue);
        setNewPoemContent(poem.poemContent);
        setNewBackgroundOfPoem(poem.backgroundOfPoem);
    };

    const handleSavePoem = async () => {
        try {
            const updates = {
                titleValue: newTitleValue,
                poemContent: newPoemContent,
                backgroundOfPoem: newBackgroundOfPoem,
                timestamp: Date.now(),
            };

            await update(ref(db, `AllPoems/${poem.id}`), updates);
            setEditingPoem(null);
            // Update local poem object (if needed)
            poem.titleValue = newTitleValue;
            poem.poemContent = newPoemContent;
            poem.backgroundOfPoem = newBackgroundOfPoem;
        } catch (error) {
            console.error('Error updating poem:', error);
        }
    };

    const handleCancelEditPoem = () => {
        setEditingPoem(null);
        // Reset form fields or revert to original poem values
        setNewTitleValue(poem.titleValue);
        setNewPoemContent(poem.poemContent);
        setNewBackgroundOfPoem(poem.backgroundOfPoem);
    };

    const handleDeletePoem = async () => {
        try {
            await remove(ref(db, `AllPoems/${poem.id}`));
            navigate('/PoemForm'); // Redirect to home or another appropriate page
        } catch (error) {
            console.error('Error deleting poem:', error);
        }
    };

    return (
        <div className="container">
      {isLoading ? (  <Loader loadingMessage="Loading poem data.." />
      ) : (
            <div className="row justify-content-center">
                <div className="col-md-8">
                    {poem && (
                        <div className="card text-center mb-4">
                            {editingPoem ? (
                                <>
                                    <div className='flex-column d-flex gap-2'>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newTitleValue}
                                            onChange={(e) => setNewTitleValue(e.target.value)}
                                            style={{ color: poem.fontColor, backgroundColor: poem.cardColor }}
                                        />
                                        <ReactQuill
                                            value={newBackgroundOfPoem}
                                            onChange={setNewBackgroundOfPoem}
                                            style={{ color: poem.fontColor, backgroundColor: poem.cardColor }}
                                        />
                                        <ReactQuill
                                            value={newPoemContent}
                                            onChange={setNewPoemContent}
                                            style={{ color: poem.fontColor, backgroundColor: poem.cardColor }}
                                        />

                                        <div className='flex-row d-flex justify-content-evenly align-items-center'>
                                            <button className="btn btn-success" onClick={handleSavePoem}><FaSave /></button>
                                            <button className="btn btn-secondary ml-2" onClick={handleCancelEditPoem}><FaTimes /></button>
                                        </div>
                                    </div>

                                </>
                            ) : (
                                <>
                                    <div className="card p-2" style={{
                                        backgroundColor: poem.cardColor,
                                        backgroundImage: poem.fileUrl ? `url(${poem.fileUrl})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        minHeight: '500px',
                                        // position: 'relative',
                                        // overflow: 'hidden' 
                                    }}>
                                        <div className="display-4" style={{ color: poem.fontColor }}>{poem.titleValue}</div>
                                        <div className="card-body" style={{ color: poem.fontColor }} dangerouslySetInnerHTML={{ __html: poem.backgroundOfPoem }} />
                                        <div className="card-body" style={{ color: poem.fontColor }} dangerouslySetInnerHTML={{ __html: poem.poemContent }} />
                                        <div className='flex-row d-flex justify-content-evenly align-items-center'>
                                            <button className="btn btn-warning" onClick={handleEditPoem}><FaEdit /></button>
                                            <button className="btn btn-danger" onClick={handleDeletePoem}><FaTrash /></button>
                                        </div>
                                    </div>


                                </>
                            )}
                        </div>
                    )}

                    <div className="text-center">
                        <h5>Total Likes</h5>
                        <p className="display-6">{totalLikes}</p>
                    </div>

                    {comments.length > 0 && (

                        <div className="col-12">
                            <h5>Comments:</h5>
                            {comments.map(comment => (
                                <div key={comment.id} className="card mb-2">
                                    <div className="card-body">
                                        {editingComment && editingComment.id === comment.id ? (
                                            <>
                                                <textarea
                                                    value={newCommentText}
                                                    onChange={(e) => setNewCommentText(e.target.value)}
                                                />
                                                <div className="mt-2">
                                                    <button className="btn btn-success" onClick={handleSaveComment}><FaSave /></button>
                                                    <button className="btn btn-secondary ml-2" onClick={handleCancelEditComment}><FaTimes /></button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className='flex-column d-flex gap-2'>
                                                    <div className="card-text">{comment.text}</div>
                                                    <div className="card-text">Commented by: {comment.user?.username || 'Anonymous'}</div>
                                                    <div className='flex-row d-flex justify-content-evenly align-items-center'>
                                                        <div>
                                                            <p className="card-text">Time: {comment.time}</p>
                                                        </div>
                                                        <div>
                                                            <button className="btn btn-danger mt-2" onClick={() => handleDeleteComment(comment.id)}><FaTrash /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                    )}
                </div>
            </div>
      )}
        </div>
    );

};

export default DetailPoem;
