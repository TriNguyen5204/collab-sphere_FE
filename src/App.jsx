import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AcademicList from './pages/academic/AcademicList';
import AcademicDetail from './pages/academic/AcademicDetail';
import AcademicCreate from './pages/academic/AcademicCreate';
import Layout from './components/layout/Layout';
import StaffPage from './pages/staff/StaffPage';
import LecturerListStaff from './pages/staff/LecturerListStaff';
import ClassListStaff from './pages/staff/ClassListStaff';
import ClassDetail from './pages/staff/ClassDetail';
import LoginPage from './pages/LoginPage';
import ConnectForm from './test/ConnectForm';
import { LiveVideo } from './test/LiveVideo';
import { useNavigate } from 'react-router-dom';
import AgoraRTC, { AgoraRTCProvider, useRTCClient } from 'agora-rtc-react';

function App() {
  const navigate = useNavigate();
  const agoraClient = useRTCClient(
    AgoraRTC.createClient({ codec: 'vp8', mode: 'rtc' })
  ); // Initialize Agora Client

  const handleConnect = channelName => {
    navigate(`/via/${channelName}`); // on form submit, navigate to new route
  };
  return (
    <>
        <Routes>
          <Route path='/academic' element={<AcademicList />} />
          <Route path='/academic/new' element={<AcademicCreate />} />
          <Route path='/academic/:id' element={<AcademicDetail />} />
          <Route element={<Layout />}>
            <Route path='/' element={<StaffPage />} />
            <Route path='/lecturers' element={<LecturerListStaff />} />
            <Route path='/classes' element={<ClassListStaff />} />
            <Route path='/classes/:id' element={<ClassDetail />} />
            <Route
              path='/meet'
              element={<ConnectForm connectToVideo={handleConnect} />}
            />
            <Route path='/login' element={<LoginPage />} />
            <Route
              path='/via/:channelName'
              element={
                <AgoraRTCProvider client={agoraClient}>
                  <LiveVideo />
                </AgoraRTCProvider>
              }
            />
          </Route>
        </Routes>
    </>
  );
}

export default App;
