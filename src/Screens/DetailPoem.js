import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db, ref, get, child } from '../Config/firebase'; // Adjust Firebase imports as per your setup
import { format } from 'date-fns';

const DetailPoem = () => {
    const location = useLocation();
    const { poem } = location.state || {};
    const [isLoading, setIsLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [totalLikes, setTotalLikes] = useState(0); // State to hold total likes
    const formattedTime = poem?.timestamp ? format(new Date(poem.timestamp), 'MMM dd, yyyy') : ''; // Use optional chaining to handle potential undefined

    useEffect(() => {
        const fetchLikesAndComments = async () => {
            setIsLoading(true);
            try {
                if (!poem || !poem.id) {
                    setIsLoading(false);
                    return;
                }

                // Fetch likes data
                const likesSnapshot = await get(ref(db, `AllPoems/${poem.id}/likes`));

                if (likesSnapshot.exists()) {
                    // Calculate total likes
                    const likesData = likesSnapshot.val();
                    const likesCount = Object.keys(likesData).length;
                    setTotalLikes(likesCount);
                } else {
                    setTotalLikes(0); // If no likes, set total likes to 0
                }

                // Fetch comments data
                const commentsSnapshot = await get(ref(db, `AllPoems/${poem.id}/comments`));
                if (commentsSnapshot.exists()) {
                    const commentsData = commentsSnapshot.val();

                    // Prepare array to hold comments with user data
                    const commentsWithUserData = [];

                    // Iterate through each comment to fetch user data
                    for (const commentId in commentsData) {
                        const comment = commentsData[commentId];
                        const userSnapshot = await get(child(ref(db, 'users'), comment.userId));

                        if (userSnapshot.exists()) {
                            const userData = userSnapshot.val();
                            // Append username to comment object
                            commentsWithUserData.push({
                                ...comment,
                                id: commentId,
                                user: {
                                    username: userData.username // Assuming username is stored in user object
                                },
                                time: new Date(comment.time).toLocaleString(),
                            });
                        } else {
                            // Handle case where user data doesn't exist
                            console.warn(`User data not found for comment with ID: ${commentId}`);
                        }
                    }

                    // Sort comments by time descending
                    commentsWithUserData.sort((a, b) => b.time - a.time);
                    // Set comments array with user data
                    setComments(commentsWithUserData);
                }
            } catch (error) {
                console.error('Error fetching likes and comments:', error);
            } finally {
                setIsLoading(false); // Set loading to false when fetching completes
            }
        };

        // Check if poem and poem.id are valid before fetching data
        if (poem && poem.id) {
            fetchLikesAndComments();
        } else {
            setIsLoading(false); // Handle case where poem data is not available
        }
    }, [poem]);

    const handleDeleteComment = async (commentId) => {
        // Implement logic to delete the comment from Firebase or your database
        // Example: You would perform an operation like delete(ref(db, `AllPoems/${poem.id}/comments/${commentId}`))
        // Make sure to handle this deletion operation securely and update state accordingly
    };

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="">
                    {poem && ( // Check if poem is defined before accessing its properties
                        <div
                            className="card text-center mb-4"
                            style={{
                                backgroundImage: poem.fileUrl ? `url(${poem.fileUrl})` : 'none',
                                backgroundColor: poem.fileUrl ? 'transparent' : poem.cardColor
                            }}
                        >
                            <h2 className="display-4" style={{ color: poem.fontColor }}>{poem.titleValue}</h2>

                            {poem.fileUrl ? (
                                <img src={poem.fileUrl} alt="Poem Background" className="img-fluid" style={{ display: 'none' }} />
                            ) : (
                                <div style={{ backgroundColor: poem.cardColor, height: '100%', width: '100%' }}></div>
                            )}

                            <div style={{ color: poem.fontColor }} dangerouslySetInnerHTML={{ __html: poem.backgroundOfPoem }}></div>
                            <div style={{ color: poem.fontColor }} dangerouslySetInnerHTML={{ __html: poem.poemContent }}></div>

                            {poem.timestamp && <p style={{ color: poem.fontColor }} className="">Written on: {formattedTime}</p>}
                        </div>
                    )}
                    <div className="col-md-2 text-center">
                        <h5>Total Likes</h5>
                        <p className="display-6">{totalLikes}</p>
                    </div>
                    {poem && poem.comments && ( // Check if poem and its comments are defined before rendering comments
                        <div>
                            <h5>Comments:</h5>
                            {Object.values(poem.comments).map(comment => (
                                <div key={comment.time} className="card mb-2">
                                    <div className="card-body">
                                        <p className="card-text">{comment.text}</p>
                                        <p className="card-text">Commented by: {comment.user?.username || 'Anonymous'}</p>
                                        <p className="card-text">Time: {format(new Date(comment.time), 'MMM dd, yyyy HH:mm:ss')}</p>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDeleteComment(comment.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailPoem;
