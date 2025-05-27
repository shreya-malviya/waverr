import React, { useEffect, useState } from 'react';
import loginpicture from '../../assets/login.svg';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { clearErrors, login, register } from '../../action/userAction';
import 'react-toastify/dist/ReactToastify.css';
import Login from './Login';
import Signup from './Signup';
import { useDispatch, useSelector } from 'react-redux';
import Loading from '../../loading/Loading';
import ImageLoading from '../../loading/ImageLoading';

function MainAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isImageLoading, setImageLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const { error, loading, isAuthenticated } = useSelector((state) => state.user)
  const [cookieError,setCookieError] = useState(true);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    termsAccepted: false,
  });
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { firstname, lastname, email, password, termsAccepted } = formData;

    if (isLogin) {
      //handling login submittion----------
      if (!email || !password) {
        toast.warn('Please enter both email and password!');
        return;
      }
      dispatch(login(email, password))
    } else {
      //handling signup --------------------
      if (!firstname || !lastname || !email || !password) {
        toast.warn('Please fill in all fields!');
        return;
      }
      dispatch(register(firstname, lastname, email, password))
    }
  };
  useEffect(() => {
    if (error && email?.value) {
      
        toast.error(error)
      
      dispatch(clearErrors());
    }
    if (isAuthenticated) {
      navigate("/");
    }
  }, [dispatch, error, isAuthenticated, navigate]);

  return (
    <>
    {
      loading?(
      <div className='h-[90vh] flex-1 justify-center items-center'> <Loading/> </div>):(
      <div className="flex justify-center flex-col md:flex-row min-h-screen h-100vh w-full bg-[#9EE1FF] overflow-hidden">
      {/* Left: Illustration */}
      <div className="w-full hidden md:w-[50%] md:flex items-center justify-center px-4 py-6 pt-6 mt-20">
      {isImageLoading && (
        <div className="flex items-center justify-center w-full h-full">
          <ImageLoading />
        </div>
      )}

      <img
        src={loginpicture}
        alt="Login Illustration"
        className={`w-full max-w-[450px] h-auto object-contain ${
          isImageLoading ? "hidden" : "block"
        }`}
        onLoad={() => setImageLoading(false)}
        onError={() => setImageLoading(false)}
      />
    </div>

      {/* Right: Form Container */}
      <div className="w-full md:w-[50%] flex items-center justify-center p-6">
        {isLogin ? (
          <Login
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            switchToSignup={() => setIsLogin(false)}
            setFormData={setFormData}
          />
        ) : (
          <Signup
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            switchToLogin={() => setIsLogin(true)}
            setFormData={setFormData}
          />
        )}
      </div>

      
    </div>)
    }
    <ToastContainer position="top-center" autoClose={2000} />
    </>
    
  );
}

export default MainAuth;
