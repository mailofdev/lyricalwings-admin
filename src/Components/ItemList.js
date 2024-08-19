import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPoemCounts, addPoem, updatePoem, clearError } from '../redux/poemSlice';
import { Card, Container, Row, Col } from 'react-bootstrap';
const ItemList = () => {
  const {
    totalCount,
    typeCounts,
    loadingMessage,
    error
} = useSelector((state) => state.poem);

const { type } = useParams();
console.log("...."+type)

  return (
    <Container className="my-4">

    </Container>
  );
};

export default ItemList;
