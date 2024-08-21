import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chart } from 'primereact/chart';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { FaRegUserCircle, FaUsers, FaBook } from 'react-icons/fa';
import { MdAutoStories } from 'react-icons/md';
import { IoBookSharp } from 'react-icons/io5';
import { TiSortAlphabetically } from 'react-icons/ti';
import { BiHappy } from 'react-icons/bi';
import { BsFillEmojiFrownFill } from 'react-icons/bs';
import { GiVomiting } from 'react-icons/gi';
import { AiFillAlert } from 'react-icons/ai';
import ResponsiveCard from '../Components/ResponsiveCard';

import { fetchBooks } from '../redux/booksSlice';
import { fetchCourses } from '../redux/courseSlice';
import { fetchNarrativeCounts } from '../redux/NarrativeSlice';
import { fetchPoemCounts } from '../redux/poemSlice';
import { fetchDashboardData } from '../redux/dashboardSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { BookData } = useSelector((state) => state.books);
  const { totalStory, totalNovel, totalNarrative } = useSelector((state) => state.Narrative);
  const { totalPoems, totalHappiness, totalSadness, totalAnger, totalFear, totalDisgust, totalSurprise, } = useSelector((state) => state.poem);
  const { CourseData } = useSelector((state) => state.courses);
  const { users } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchBooks());
    dispatch(fetchCourses());
    dispatch(fetchNarrativeCounts());
    dispatch(fetchPoemCounts());
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const handleEmotionClick = (type) => {
    switch (type) {
      case 'showAllNarrative':
      case 'story':
      case 'novel':
        navigate(`/NarrativeList/${type}`);
        break;
      case 'showAllPoems':
      case 'happiness':
      case 'sadness':
      case 'anger':
      case 'fear':
      case 'disgust':
      case 'surprise':
        navigate(`/PoemList/${type}`);
        break;
      case 'AdminAndUser':
        navigate('/User');
        break;
      case 'Books':
        navigate('/Books');
        break;
      case 'Courses':
        navigate('/Courses');
        break;
      default:
        navigate(`/ItemList/${type}`);
    }
  };

  const adminCount = users.filter(user => user.role === 'admin').length;
  const userCount = users.filter(user => user.role === 'user').length;

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#333',
          font: {
            size: function(context) {
              let width = context.chart.width;
              return width < 768 ? 12 : 14;
            },
            family: 'Arial',
            weight: 'bold'
          }
        }
      }
    },
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#ddd',
        },
        ticks: {
          color: '#333',
          font: {
            size: function(context) {
              let width = context.chart.width;
              return width < 768 ? 10 : 12;
            },
          }
        }
      },
      x: {
        grid: {
          color: '#ddd',
        },
        ticks: {
          color: '#333',
          font: {
            size: function(context) {
              let width = context.chart.width;
              return width < 768 ? 10 : 12;
            },
          }
        }
      }
    }
  };

  const userData = {
    labels: ['Admins', 'Users'],
    datasets: [
      {
        label: 'User Roles',
        backgroundColor: ['#42A5F5', '#66BB6A'],
        data: [adminCount, userCount],
        hoverOffset: 4
      },
    ],
  };

  const narrativeData = {
    labels: ['Stories', 'Novels', 'All Narrative'],
    datasets: [
      {
        label: 'Narratives',
        backgroundColor: ['#FFA726', '#42A5F5', '#66BB6A'],
        data: [totalStory, totalNovel, totalNarrative],
        hoverOffset: 4
      },
    ],
  };

  const poemData = {
    labels: ['Happiness', 'Sadness', 'Anger', 'Fear', 'Disgust', 'Surprise'],
    datasets: [
      {
        label: 'Poem Emotions',
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#FFCD56', '#4BC0C0'],
        data: [totalHappiness, totalSadness, totalAnger, totalFear, totalDisgust, totalSurprise],
        hoverOffset: 4
      },
    ],
  };

  return (
    <Container fluid className="p-4">
      <Row>
        <Col md={4} className="mb-4">
          <div className="chart-container bg-light p-3 shadow-sm rounded">
            <h4 className="text-center mb-3">User Roles</h4>
            <Chart type="pie" data={userData} options={chartOptions} />
          </div>
        </Col>
        <Col md={4} className="mb-4">
          <div className="chart-container bg-light p-3 shadow-sm rounded">
            <h4 className="text-center mb-3">Narrative Types</h4>
            <Chart type="bar" data={narrativeData} options={chartOptions} />
          </div>
        </Col>

        <Col md={4}>
          <div className="chart-container bg-light p-3 shadow-sm rounded">
            <h4 className="text-center mb-3">Poem Emotions</h4>
            <Chart type="doughnut" data={poemData} options={chartOptions} />
          </div>
        </Col>
      </Row>
      <Row className="mt-4">
        <ResponsiveCard xs={12} sm={6} md={6} lg={6} icon={FaRegUserCircle} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Admins"
          count={adminCount || 0} onClick={() => handleEmotionClick('AdminAndUser')}
        />

        <ResponsiveCard xs={12} sm={6} md={6} lg={6} icon={FaUsers} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Users"
          count={userCount || 0} onClick={() => handleEmotionClick('AdminAndUser')}
        />

        <ResponsiveCard xs={12} sm={6} md={6} lg={6} icon={FaBook} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Courses"
          count={CourseData.length} onClick={() => handleEmotionClick('Courses')}
        />

        <ResponsiveCard xs={12} sm={6} md={6} lg={6} icon={FaBook} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Books"
          count={BookData.length} onClick={() => handleEmotionClick('Books')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={MdAutoStories} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="All Narrative"
          count={totalNarrative} onClick={() => handleEmotionClick('showAllNarrative')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={MdAutoStories} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Stories"
          count={totalStory} onClick={() => handleEmotionClick('story')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={IoBookSharp} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Novels"
          count={totalNovel} onClick={() => handleEmotionClick('novel')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={TiSortAlphabetically} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="All poems"
          count={totalPoems} onClick={() => handleEmotionClick('showAllPoems')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={BiHappy} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Happy"
          count={totalHappiness} onClick={() => handleEmotionClick('happiness')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={BsFillEmojiFrownFill} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Sad"
          count={totalSadness} onClick={() => handleEmotionClick('sadness')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={GiVomiting} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Disgust"
          count={totalDisgust} onClick={() => handleEmotionClick('disgust')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={AiFillAlert} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Surprise"
          count={totalSurprise} onClick={() => handleEmotionClick('surprise')}
        />
      </Row>
    </Container>
  );
};

export default Dashboard;
