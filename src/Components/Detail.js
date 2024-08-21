import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Container,  } from 'react-bootstrap';
import DOMPurify from 'dompurify';

const Detail = () => {
  const { state } = useLocation();
  const { item } = state;
  
  const sanitizeHTML = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  return (
    <Container className="d-flex justify-content-center my-5">
      <Card className="w-75 d-flex gap-4 flex-column p-4">
        <div className='text-center fs-4'>{item.type.toUpperCase()}</div>
        <div>{item.title}</div>
        <div>
        {item.htmlSubtitle && <div className="card-text" dangerouslySetInnerHTML={sanitizeHTML(item.htmlSubtitle)}></div>}
        </div>
        <div>
        {item.htmlContent && <div className="card-text" dangerouslySetInnerHTML={sanitizeHTML(item.htmlContent)}></div>}
        </div>

          <div>
            <p>Likes: {item.likes || 0}</p>
          </div>
          <div>
            <h5>Comments:</h5>
            {item.comments?.length > 0 ? (
              item.comments.map((comment, index) => (
                <div key={index}>
                  <p>{comment.comment}</p>
                  <p>- {comment.userId}</p>
                </div>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
          </div>


      </Card>
    </Container>
  );
};

export default Detail;