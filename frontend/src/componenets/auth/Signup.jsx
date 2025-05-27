import React, { useEffect, useState } from 'react';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff } from 'lucide-react';
function Signup({ formData, handleChange, handleSubmit, switchToLogin ,setFormData}) {

  useEffect(() => {
      setFormData({ email: "", password: "" }); // Reset both fields on mount
    }, []);
   const [showPassword, setShowPassword] = useState(true);
  const handleLoginWithGoogle = () => {
    window.location.href = "https://waverbackend-production.up.railway.app/google";
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg  rounded-xl p-6 md:p-10  overflow-auto"
    >
      <h2 className="text-2xl font-bold mb-3 text-left text-[#F8F8F8]">Create your account</h2>
      <span className="block mb-6 text-[#F8F8F8] text-sm">
        Already have an account?{' '}
        <span
          className="font-bold cursor-pointer underline"
          onClick={switchToLogin}
        >
          Log in
        </span>
      </span>
      <div className="flex gap-4 mb-4">
  <input
    id="firstname"
    type="text"
    value={formData.firstname}
    onChange={handleChange}
    className="w-1/2 px-3 py-2 text-sm border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="First Name"
  />
  
  <input
    id="lastname"
    type="text"
    value={formData.lastname}
    onChange={handleChange}
    className="w-1/2 px-3 py-2 text-sm border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Last Name"
  />
</div>


      <div className="mb-4">
        <input
          id="email"
          type="email"
          autoComplete="username" 
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
        />
      </div>

      <div className="mb-6 relative">
      <input
        id="password"
        type={!showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange}
        className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Password"
        autoComplete="current-password" 
      />
      <span
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </span>
    </div>

      {/* <div className="mb-6 flex items-center space-x-2">
        <input
          id="termsAccepted"
          type="checkbox"
          checked={formData.termsAccepted}
          onChange={handleChange}
          className="form-checkbox rounded"
        />
        <label htmlFor="termsAccepted" className="text-sm text-[#F8F8F8]">
          I agree to the terms and conditions
        </label>
      </div> */}

      <button
        type="submit"
        className="w-full bg-white hover:bg-[#74D4FF] text-[#374957] py-1 rounded-2xl transition duration-200"
      >
        Sign Up
      </button>

            {/* Divider + OAuth */}
            {/* <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-white/40" />
              <span className="mx-3 text-sm text-[#F8F8F8]">or register with</span>
              <div className="flex-grow h-px bg-white/40" />
            </div> */}
      
      <div className="flex items-center justify-center space-x-6">
  {/* <div className="bg-white p-4 rounded-full shadow cursor-pointer hover:scale-110 transition text-[32px]">
    <FcGoogle onClick={handleLoginWithGoogle} />
  </div> */}
  {/* <div className="bg-white p-4 rounded-full shadow cursor-pointer hover:scale-110 transition text-[32px]">
    <FaApple />
  </div> */}
</div>
    </form>
  );
}

export default Signup;
