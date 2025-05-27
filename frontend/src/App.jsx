import { useEffect, useRef, useState } from 'react'
import './App.css'
import MainAuth from './componenets/auth/MainAuth';
import {BrowserRouter as Router , Routes , Route, useNavigate, useLocation} from 'react-router-dom'
import Home from './componenets/home/Home';
import Errorpg from './componenets/error/Errorpg';
import { loadUser } from './action/userAction';
import { useDispatch, useSelector } from 'react-redux';
// import Globe from './componenets/midlayer/Globe';
import { useSocketContext } from './socket/socket';
import IncomingVoiceCall from './componenets/midlayer/calling/IncomingVoiceCall';
import { useCall } from './socket/Callcontext';
import CallingBody from './componenets/midlayer/calling/CallingBody';
import Settings from './componenets/home/Settings';
import Message from './componenets/midlayer/Message';
import MainLayout from './MainLayout';
import Group from './componenets/midlayer/Group';
import Call from './componenets/midlayer/Call';
import ShowProfile from './componenets/home/profile/ShowProfile';
import UploadImage from './componenets/home/profile/UploadImage';
import Loading from './loading/Loading';
import { UseNotification } from './socket/Notification';
import ProfileEdit from './componenets/home/profile/ProfileEdit';
import Search from './componenets/search/Search'
import { toast } from 'react-toastify';
import CookieConsent from './CookieConsent';
function App() {
  const navigate = useNavigate();
  const location = useLocation()
  const dispatch = useDispatch();
  const {socket} = useSocketContext();
  const {setIncomingCall,incomingCall,onCall} = useCall()
  const {isAuthenticated , loading,error } = useSelector((state) => state.user)
  const[pendingSignal, setPendingSignal] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  // const [loading,setLoading] = useState(false);
  const {setNotification} = UseNotification()
  // Fetch user data on load
  
   useEffect(() => {
    const fetchUser = async () => {
      try {
        dispatch(loadUser());
      } catch (error) {
        console.log('User not authenticated');
      } finally {
        setAppLoading(false)
      }
    };

    fetchUser();
    if(!loading) setAppLoading(false)
  }, [dispatch]);

  useEffect(() => {
    // console.log(appLoading, isAuthenticated, location.pathname)
    if (!appLoading && !isAuthenticated && !loading) {
      navigate('/auth');
    }
    if (isAuthenticated && (location.pathname === '/auth' || location.pathname === '/')) {
      navigate('/');
    }
  }, [appLoading, isAuthenticated]);

  
  const audioUnlocked = useRef(false);
  
  useEffect(() => {
    const unlockAudio = () => {
      // Try to play any silent audio to "unlock" audio permission
      const silentAudio = new Audio("/sounds/notify.mp3");
      silentAudio.volume = 0;
      silentAudio.play().catch(() => {});
      audioUnlocked.current = true;
      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);

    return () => {
      window.removeEventListener("click", unlockAudio);
    };
  }, []);

  
  useEffect(()=>{
    if(!socket) return;
    socket.on('incomingCall',(callData)=>{
      console.log("incoming call...",callData)
      setIncomingCall(callData)
    })
    const handleReceiveSignal = ({ signal, callType }) => {
          setPendingSignal(signal);
      };
      
      const handleNewReq = (data) => {
        // console.log("notification",data)
        if (audioUnlocked.current) {
          new Audio("/sounds/notify.mp3").play().catch((err) => console.warn("Play failed", err));
        }    
        setNotification(Date.now());
      }
      const handleRemoveReq = (data) => {
        setNotification(Date.now());
      }
      socket.on("newMessage", (newMessage) => {
          new Audio("/sounds/messageRing.mp3").play().catch((err) => console.warn("Play failed", err));
           if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]); // Vibrate 200ms, pause 100ms, vibrate 200ms
  }
      })
          socket.on('receiveSignal', handleReceiveSignal);
          socket.on('removeReq', handleRemoveReq)
          socket.on('newReq', handleNewReq)
    
    return () =>{
      socket.off('incomingCall')
      socket.off('receiveSignal');
      socket.off('removeReq')
      socket.off('newReq')
      socket.off('newMessage')
    }
  },[socket])

   if (appLoading) return (<div className='flex-1 h-[90vh] justify-center items-center'><Loading /></div>);
  return (
  <>
    <div className="flex">
      {incomingCall && !onCall && <IncomingVoiceCall pendingSignal={pendingSignal} setPendingSignal={setPendingSignal} />}
      {incomingCall && onCall && <CallingBody />}
      {/* <CookieConsent/> */}
      <Routes>
        <Route path="/auth" element={<MainAuth />} />
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/message" element={<MainLayout><Message /></MainLayout>} />
        <Route path="/call" element={<MainLayout><Call /></MainLayout>} />
        <Route path="/search" element={<MainLayout><Search /></MainLayout>} />
        <Route path="/profile/:id" element={<MainLayout><ShowProfile /></MainLayout>} />
        <Route path="/me/post" element={<MainLayout><UploadImage /></MainLayout>} />
        <Route path="/edit/me" element={<MainLayout><ProfileEdit /></MainLayout> } />
        <Route path="*" element={<Errorpg />} />
      </Routes>
    </div>
  </>
);
}

export default App
