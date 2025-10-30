import React, { useContext, useState } from 'react'
import bg from '../assets/authBg.png'
import { LuEye ,LuEyeClosed} from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { userDataContext } from '../context/userContext';
const SignIn = () => {
    const[showPassword,setShowPassword] = useState(false)
    const navigate = useNavigate()
    const [email , setEmail] = useState("")
    const [password,setPassword] = useState("")
    const {serverUrl,userData ,setUserData} = useContext(userDataContext)
    const [loading,setLoading] = useState(false)
    const [error,setError] = useState("")

    const handleSignIn = async (e)=>{
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            let result = await axios.post(`${serverUrl}/api/auth/signin`,{
                email,password
            }, {withCredentials:true})

            setUserData(result.data)
            setLoading(false)
             navigate("/")

        } catch (error) {
            console.log(error)
            setUserData(null)
            setLoading(false)
            setError(error.response.data.message)
        }
    }

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' 
    style={{backgroundImage:`url( ${bg})`}}>

      <form className='w-[90%] h-[600px] max-w-[500px] bg-[#00000055] backdrop-blur shadow-lg 
      shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]' onSubmit={handleSignIn}>

        <h1 className='text-white text-[30px] text-semibold mb-[30px]'>Sign in to <span className='text-blue-400'>Virtual Assistant</span></h1>

        <input type='email' placeholder='Email' className='w-full h-[60px] outline-none border-2 border-white 
        bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px] required'onChange={(e)=>setEmail(e.target.value)} value={email}/>

        <div className='w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative'>

            <input type={showPassword?'text':'password'} placeholder='Password' className='w-full h-full rounded-full 
            outline-none bg-transparent placeholder-gray-300 px-[20px] py-[10px]  required'onChange={(e)=>setPassword(e.target.value)} value={password}/>

            {!showPassword && <LuEye className='absolute top-[17px] right-[20px] w-[25px] h-[25px] 
            text-[white] cursor-pointer'onClick={()=>setShowPassword(true)}/> }

            {showPassword && <LuEyeClosed className='absolute top-[17px] right-[20px] w-[25px] h-[25px] 
            text-[white] cursor-pointer'onClick={()=>setShowPassword(false)}/> }

        </div>
        {error.length >0 && <p className='text-red-500 text-[18px]'> *{error} </p>}
        <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold text-[19px] bg-white
         cursor-pointer rounded-full' disabled={loading}>{loading?"Loading...":"Sign In"}</button>

        <p className='text-white text-[18px]'> create new account ? <span onClick={()=>navigate('/signup')} className='text-blue-400 cursor-pointer'>Sign up</span></p>

      </form>
    </div>

  )
}

export default SignIn
