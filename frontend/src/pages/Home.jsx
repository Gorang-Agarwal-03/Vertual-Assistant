import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { CgMenuRight } from "react-icons/cg";
import { GiSplitCross } from "react-icons/gi";
import axios from 'axios'
import userImg from '../assets/user.gif'
import aiImg from '../assets/ai.gif'

const Home = () => {
  const navigate = useNavigate()
  const {userData,serverUrl,setUserData,getGeminiResponse} = useContext(userDataContext)
  const[listening,setListening] = useState(false)
  const [userText,setUserText] = useState("")
  const [aiText,setAiText] = useState("")
  const [hem , setHem] = useState(false) 
  const isSpeakingRef = useRef(false)
  const isrecognizingRef = useRef(false)
  const recognitionRef = useRef(false)


    const handleLogOut=async ()=>{
      try {
        const result = await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
        setUserData(null)
        navigate("/signin")

      } catch (error) {
        setUserData(null)
        console.log(error)
      }
    }

    const speak = (text) => {
  if (!text) return;

  // stop any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  isSpeakingRef.current = true;

  // 🔹 show AI text instantly (no delay)
  setAiText(text);

  // 🔹 speak immediately
  window.speechSynthesis.speak(utterance);

  // when speech finishes, clear the text
  utterance.onend = () => {
    isSpeakingRef.current = false;
    setAiText("");
  };
};


  const handleCommand = (data) => {
  const { type, userInput, response } = data;
  speak(response);

  // ✅ Safe opener function (handles popup blockers)
  const safeOpen = (url) => {
    try {
      const newTab = window.open("", "_blank"); // try to open new tab first
      if (newTab) {
        newTab.location.href = url; // if new tab allowed
      } else {
        // fallback: open in same tab if blocked
        window.location.href = url;
      }
    } catch (err) {
      console.error("❌ Error opening link:", err);
      window.location.href = url;
    }
  };

  // 🔗 Command handling
  if (type === 'google_search') {
    const query = encodeURIComponent(userInput);
    safeOpen(`https://www.google.com/search?q=${query}`);
  } 
  else if (type === 'calculator_open') {
    safeOpen(`https://www.google.com/search?q=calculator`);
  } 
  else if (type === 'instagram_open') {
    safeOpen(`https://www.instagram.com/`);
  } 
  else if (type === 'facebook_open') {
    safeOpen(`https://www.facebook.com/`);
  } 
  else if (type === 'whatsapp_open') {
    safeOpen(`https://web.whatsapp.com/`);
  } 
  else if (type === 'maps_open') {
    safeOpen(`https://www.google.com/maps/`);
  } 
  else if (type === 'weather_show') {
    safeOpen(`https://www.google.com/search?q=show+weather`);
  } 
  else if (type === 'email_send') {
    safeOpen(`https://mail.google.com/mail/`);
  } 
  else if (type === 'calendar_open') {
    safeOpen(`https://calendar.google.com/calendar/`);
  } 
  else if (type === 'youtube_search' || type === 'youtube_play') {
    const query = encodeURIComponent(userInput);
    safeOpen(`https://www.youtube.com/results?search_query=${query}`);
  }
};



    useEffect(()=>{
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      const recognition = new SpeechRecognition()
      recognition.continuous = true,
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognitionRef.current = recognition

      let isMounted = true;

      const startTimeOut = setTimeout(()=>{
        if(isMounted && !isSpeakingRef.current && !isrecognizingRef.current){
          try {
            recognition.start();
          } catch (error) {
            if(error.name !== "InvalidStateError"){
              console.log(error)
            }
            
          }
        }
      },1000)

      const startRecognize = ()=>{
        if(!isSpeakingRef.current && !isrecognizingRef.current){
          try {
            recognitionRef.current.start()
          } catch (error) {
            if(error.name !== "InvalidStateError"){
              console.error("Start error: ",error)
            }
          }
        }
      }

      recognition.onstart= ()=>{
        isrecognizingRef.current = true;
        setListening(true);
      }

      recognition.onend = ()=>{
        isrecognizingRef.current = false;
        setListening(false);

        if(isMounted && !isSpeakingRef.current){
          setTimeout(()=>{
            if(isMounted){
              try {
                recognition.start()
              } catch (e) {
                if(e.name !== "InvalidStateError"){
                  console.log(e)
                }   
              }
            }
          },1000)
        }
      };

      recognition.onerror = (event) => {
  console.warn("Recognition error: ", event.error);
  isrecognizingRef.current = false;
  setListening(false);

  // ⚠️ Do not restart if it's a normal abort (like after recognition.stop())
  if (event.error === "aborted") {
    console.log("Recognition stopped intentionally — no restart needed.");
    return;
  }

  // Restart only if it's a genuine error (network, no-speech, etc.)
  if (isMounted && !isSpeakingRef.current) {
    setTimeout(() => {
      if (isMounted) {
        try {
          recognition.start();
        } catch (e) {
          if (e.name !== "InvalidStateError") console.log(e);
        }
      }
    }, 1000);
  }
};


      recognition.onresult= async(e)=>{
        const transcript = e.results[e.results.length-1][0].transcript.trim()
        console.log("Heard: " +transcript)

        if(transcript.toLowerCase().includes(userData.assistantName.toLowerCase())){
          setAiText("")
          setUserText(transcript)
          recognition.stop()
          isrecognizingRef.current = false
          setListening(false)
          const data= await getGeminiResponse(transcript)
          handleCommand(data)
          setAiText(data.response)
          setUserText("")

        }
      }
      const fallback = setInterval(()=>{
         if(!isSpeakingRef.current && !isrecognizingRef.current){
          startRecognize()
         }
      },10000)

        const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name},what can i help you ?`);
        greeting.lang ='en-US';

        window.speechSynthesis.speak(greeting);
      

      return ()=>{
        isMounted = false;
        clearTimeout(startTimeOut);
        recognition.stop()
        setListening(false)
        isrecognizingRef.current = false
      }

    },[userData,getGeminiResponse])

    
  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] overflow-hidden
    flex justify-center items-center flex-col relative gap-[15px]'>
      <CgMenuRight className='lg:hidden cursor-pointer text-white absolute top-[20px] right-[20px] h-[25px] w-[25px]'
      onClick={()=>{
        setHem(true)
      }}
      />

      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] 
        items-start ${hem?"translate-x-0":"translate-x-full"} transition-transform`}>
      <GiSplitCross  className=' text-white cursor-pointer absolute top-[20px] right-[20px] h-[25px] w-[25px]'
      onClick={()=>{
        setHem(false)
      }}
      />

      <button className='min-w-[150px] h-[60px]   text-black font-semibold text-[19px] bg-white
         cursor-pointer rounded-full'
         onClick={()=>navigate("/customize")}>
          Customize
          </button>

          <button className='min-w-[150px] h-[60px]  text-black font-semibold text-[19px] bg-white
         cursor-pointer rounded-full'
         onClick={()=>handleLogOut()}>
          LogOut
          </button>

          <div className='w-full h-[1px] bg-gray-400'></div>
          <h1 className='text-white font-semibold text-[19px]'>History</h1>
          <div className='w-full h-[60%] overflow-auto flex flex-col gap-[20px]'>
           {userData.history?.map((hist)=>(
            <span className='text-gray-300 text-[18px]  '>{hist}</span>
           ))}
          </div>

      </div>

       <button className='min-w-[150px] h-[60px] mt-[30px] absolute hidden lg:block top-[20px] right-[20px] text-black font-semibold text-[19px] bg-white
         cursor-pointer rounded-full'
         onClick={()=>navigate("/customize")}>
          Customize
          </button>
          
          <button className='min-w-[150px] h-[60px] mt-[30px] absolute hidden lg:block top-[20px] right-[190px] text-black font-semibold text-[19px] bg-white
         cursor-pointer rounded-full'
         onClick={()=>handleLogOut()}>
          LogOut
          </button>
      <div className='w-[300px] h-[400px] flex justify-center items-center rounded-4xl overflow-hidden shadow-lg'>
        <img src={userData?.assistantImage} className='h-full object-cover'/>
      </div>
      <h1 className='text-white font-semibold text-[20px] '>{`I'm ${userData?.assistantName}`}</h1>

      {!aiText && <img src={userImg} alt="" className='w-[200px]' />}
      {aiText && <img src={aiImg} alt="" className='w-[200px]' />}
      <h1 className='text-white text-[17px] font-semibold text-wrap '>{userText?userText:aiText?aiText:null}</h1>
      
    </div>
  )
}

export default Home
