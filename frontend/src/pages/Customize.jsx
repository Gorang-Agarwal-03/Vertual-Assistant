import React, { useContext, useRef, useState } from 'react'
import { IoArrowBackSharp } from "react-icons/io5";
import { IoMdCloudUpload } from "react-icons/io";
import Card from '../component/Card'
import image1 from "../assets/image1.png"
import image2 from "../assets/image2.jpg"
import image3 from "../assets/authBg.png"
import image4 from "../assets/image4.png"
import image5 from "../assets/image5.png"
import image6 from "../assets/image6.jpeg"
import image7 from "../assets/image7.jpeg"
import { userDataContext } from '../context/userContext';
import { useNavigate } from 'react-router-dom';

const Customize = () => {
    const {serverUrl,userData ,setUserData,backendImage,setBackendImage,
        frontendImage,setFrontendImage,selectedImage , setSelectedImage} = useContext(userDataContext)
    const inputImage = useRef()
    const navigate = useNavigate()

    const handleImage=(e)=>{
        const file = e.target.files[0]
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col relative'>

      <IoArrowBackSharp className='absolute top-[30px] left-[30px] 
                        text-white w-[25px] h-[25px] cursor-pointer' 
                        onClick={()=>navigate("/")}/>

        <h1 className='text-white font-semibold text-[30px]'>Select your <span className='text-blue-200'>Assistant Image</span></h1>
        <div className='w-full max-w-[60%] mt-[20px] flex justify-center items-center flex-wrap gap-[15px]'>
            <Card image={image1}/>
            <Card image={image2}/>
            <Card image={image3}/>
            <Card image={image4}/>
            <Card image={image5}/>
            <Card image={image6}/>
            <Card image={image7}/>
            <div className={`w-[80px] h-[180px] lg:w-[150px] lg:h-[250px] bg-[#030326] border-2 border-[#0000ff66] rounded-2xl
                 overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-3 hover:border-white flex 
                 items-center justify-center ${selectedImage=="input"?'border-3 border-white shadow-2xl shadow-blue-950':null}`} 
                 onClick={()=>{inputImage.current.click()
                 setSelectedImage("input")
                 }}>
                    {!frontendImage && <IoMdCloudUpload  className='text-white h-[30px] w-[30px]'/>}
                    {frontendImage && <img src={frontendImage} className='h-full object-cover'/>}
                    
            </div>
            <input type='file' accept='image/*' ref={inputImage} hidden onChange={handleImage}/>
        </div>
        {selectedImage && <button className='min-w-[150px] h-[60px] mt-[30px] text-black 
          font-semibold text-[19px] bg-white cursor-pointer rounded-full' onClick={()=>navigate("/customize2")}>Next</button>}
            
    </div>
  )
}

export default Customize
