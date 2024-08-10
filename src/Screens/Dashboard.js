import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../redux/dashboardSlice';
import Loader from '../Components/Loader';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaRegAngry, FaRegSadTear, FaRegUserCircle, FaUsers } from 'react-icons/fa';
import { MdAutoStories } from "react-icons/md";
import { IoBookSharp } from "react-icons/io5";
import { TiSortAlphabetically } from "react-icons/ti";
import { BiHappy } from 'react-icons/bi';
import { BsFillEmojiFrownFill } from 'react-icons/bs';
import { GiVomiting } from 'react-icons/gi';
import { AiFillAlert } from 'react-icons/ai';
import ResponsiveCard from '../Components/ResponsiveCard';


const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, dashboardPoems, booksLength, storyLength, novelLength, status, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);


  const handleEmotionClick = (type) => {
    switch (type) {
      case 'storyAndNovel':
        navigate('/storyAndNovel');
        break;
      case 'AdminAndUser':
        navigate('/User');
        break;
        case 'mybook':
          navigate('/About');
          break;
      default:
        navigate(`/ItemList/${type}`);
    }
  };


  if (status === 'loading') return <Loader loadingMessage="Fetching data..." />;
  if (status === 'failed') return <div>Error: {error}</div>;

  const adminCount = users.filter(user => user.role === 'admin').length;
  const userCount = users.filter(user => user.role === 'user').length;
  const happinessCount = dashboardPoems.emotionsCount.happiness;
  const sadnessCount = dashboardPoems.emotionsCount.sadness;
  const angerCount = dashboardPoems.emotionsCount.anger;
  const disgustCount = dashboardPoems.emotionsCount.disgust;
  const fearCount = dashboardPoems.emotionsCount.fear;
  const surpriseCount = dashboardPoems.emotionsCount.surprise;

  return (
    <Container>
      <Row>
        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={FaRegUserCircle} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Admins"
          count={adminCount || 0}  onClick={() => handleEmotionClick('AdminAndUser')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={FaUsers} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Users"
          count={userCount || 0} onClick={() => handleEmotionClick('AdminAndUser')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={FaBook} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Books"
          count={booksLength} onClick={() => handleEmotionClick('mybook')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={MdAutoStories} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Stories"
          count={storyLength} onClick={() => handleEmotionClick('storyAndNovel')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={IoBookSharp} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Novels"
          count={novelLength} onClick={() => handleEmotionClick('storyAndNovel')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={TiSortAlphabetically} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="All poems"
          count={dashboardPoems.totalPoems} onClick={() => handleEmotionClick('showall')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={BiHappy} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Happy"
          count={happinessCount} onClick={() => handleEmotionClick('happiness')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={FaRegSadTear} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Sad"
          count={sadnessCount} onClick={() => handleEmotionClick('sadness')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={FaRegAngry} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Angry"
          count={angerCount} onClick={() => handleEmotionClick('anger')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={GiVomiting} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Disgust"
          count={disgustCount} onClick={() => handleEmotionClick('disgust')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={BsFillEmojiFrownFill} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Fear"
          count={fearCount} onClick={() => handleEmotionClick('fear')}
        />

        <ResponsiveCard xs={12} sm={6} md={4} lg={6} icon={AiFillAlert} iconSize={50}
          customshadow="shadow-lg" bgGradient="bg-gradient-primary" textColor="text-light" title="Surprise"
          count={surpriseCount || 0} onClick={() => handleEmotionClick('surprise')}
        />
      </Row>
    </Container>
  );
};

export default Dashboard;
