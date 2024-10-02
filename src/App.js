import React, { useState, useEffect, useRef } from "react";
import questions from "./data"; // Importing questions from the data file
import { Heart, HeartCrack } from "lucide-react";
import { CSSTransition } from "react-transition-group";
import "./App.css";

function App() {
  const [step, setStep] = useState("home"); // Changed to 'step' for clarity
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userName, setUserName] = useState("");
  const [hp, setHp] = useState(3);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current.play();
  },);

  const handleNameSubmit = (event) => {
    event.preventDefault();
    setStep("null");
    setTimeout(() => {
      setStep("content");
    }, 510);
  };

  const handleAnswerSelect = (choice) => {
    // You can implement your logic here to handle the answer
    const correctAnswers = questions[currentQuestionIndex].answer;
    if (correctAnswers.includes(choice)) {
      console.log("Correct!");
    } else {
      console.log("Incorrect!");
      setHp((prevHp) => {
        if (prevHp === 1) {
          setStep("null");
          setTimeout(() => {
            setStep("fail");
          }, 510);
          return 0; // Set HP to 0
        }
        return prevHp - 1; // Decrease HP
      });
    }

    // Move to the next question after answering
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStep("null");
      setTimeout(() => {
        setStep("end");
      }, 510);
    }
  };

  return (
    <div className="noto-sans min-h-screen bg-gray-100 flex flex-col justify-center items-center text-gray-900">
      <audio id="background-music" ref={audioRef} loop>
        <source src="/music.mp3" type="audio/mp3" />
        Your browser does not support the audio tag.
      </audio>
      <div className="w-full h-full bg-white rounded-lg shadow-md">
        <CSSTransition
          in={step === "home"}
          timeout={500}
          classNames="fade"
          mountOnEnter
          unmountOnExit
        >
          <div className="relative w-full h-screen">
            {/* Video Background */}
            <video
              autoPlay
              muted
              loop
              className="absolute inset-0 w-full h-full object-cover z-0"
            >
              <source src="/home.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Overlay content */}
            <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4 py-1 bg-black bg-opacity-50">
              <h1 className="text-3xl font-bold mb-12 py-2 text-white">
                กรุงเทพฯ เมืองใต้น้ำ และวิถีชีวิต
              </h1>
              <button
                className="px-6 py-2 shadow-md bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-lg"
                onClick={() => {
                  setStep("null");
                  setTimeout(() => {
                    setStep("rules");
                  }, 510);
                }}
              >
                เข้าสู่เนื้อเรื่อง
              </button>
            </div>
          </div>
        </CSSTransition>
        <CSSTransition
          in={step === "rules"}
          timeout={500}
          classNames="fade"
          mountOnEnter
          unmountOnExit
        >
          <div className="text-center p-6">
            <h1 className="text-3xl font-bold mb-4 py-2 text-black">กติกา</h1>
            <p className="mb-6 text-lg text-start">
              ผู้เล่นมีหัวใจอยู่ 3 ดวง หากตอบผิดจะโดนหักหัวใจ 1 ดวงต่อครั้ง
              ซึ่งตอบผิดเกิน 3 ครั้ง (หัวใจหมด)
              ผู้เล่นจะเห็นจุดจบของการสำรวจและได้รับข้อมูลเพิ่มเติมเกี่ยวกับสถานการณ์น้ำท่วมในกรุงเทพฯ
              และแนวทางแก้ไข ขณะเดียวกัน หากผู้เล่นตอบถูกทั้งหมด
              พวกเขาจะได้รับรางวัล เช่น
              ข้อมูลเชิงลึกเพิ่มเติมเกี่ยวกับโครงการที่กำลังพัฒนาเพื่อป้องกันน้ำท่วมในอนาคต
            </p>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 shadow-md bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-lg"
                onClick={() => {
                  setStep("null");
                  setTimeout(() => {
                    setStep("name");
                  }, 510);
                }}
              >
                ต่อไป
              </button>
            </div>
          </div>
        </CSSTransition>
        <CSSTransition
          in={step === "name"}
          timeout={500}
          classNames="fade"
          mountOnEnter
          unmountOnExit
        >
          <div className="text-center p-6">
            <h1 className="text-3xl font-bold py-1 mb-10 text-black">
              ใส่ชื่อนักเดินทาง
            </h1>
            <form
              onSubmit={handleNameSubmit}
              className="flex flex-col space-y-2 mb-4 px-4"
            >
              <input
                type="text"
                placeholder="ชื่อนักเดินทาง"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="p-2 border border-gray-300 rounded mb-4"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 shadow-md bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-lg"
              >
                เริ่มต้นเดินทาง
              </button>
            </form>
          </div>
        </CSSTransition>
        <CSSTransition
          in={step === "content"}
          timeout={500}
          classNames="fade"
          mountOnEnter
          unmountOnExit
        >
          <div className="text-center p-6">
            <h1 className="text-2xl font-bold mb-6 text-black">
              สวัสดีคุณ {userName}!
            </h1>
            <p className="mb-6 text-lg text-start">
              <span className="font-bold text-black">เนื้อเรื่อง:</span>{" "}
              ในอนาคตกรุงเทพฯ เผชิญกับการท่วมครั้งใหญ่
              ทุกพื้นที่ต่ำถูกน้ำท่วมล้นจนกลายเป็นทะเลสาบขนาดใหญ่
              คุณและทีมของคุณเป็นกลุ่มนักสำรวจที่ได้รับมอบหมายให้รวบรวมข้อมูลและหาแนวทางแก้ไขสถานการณ์ให้กับเมือง
              แต่ระหว่างการเดินทาง คุณต้องตอบคำถามเกี่ยวกับกรุงเทพฯ
              และสถานการณ์น้ำท่วมให้ถูกต้องเพื่อเอาชีวิตรอด ทุกครั้งที่ตอบผิด HP
              ของคุณจะลดลง!
            </p>
            <div className="flex justify-end">
              <button
                className="px-6 py-2 shadow-md bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-lg"
                onClick={() => {
                  setStep("null");
                  setTimeout(() => {
                    setStep("start");
                  }, 510);
                }}
              >
                มาเริ่มกันเลย!
              </button>
            </div>
          </div>
        </CSSTransition>
        <CSSTransition
          in={step === "start" && currentQuestionIndex < questions.length}
          timeout={500}
          classNames="fade"
          mountOnEnter
          unmountOnExit
        >
          <div className="p-6">
            <div className="flex justify-end space-x-0.5 mb-2">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="inline-block">
                  {index < hp ? (
                    <div>
                      <Heart fill="red" color="red" />
                    </div>
                  ) : (
                    <HeartCrack color="#4f4f4f" />
                  )}
                </div>
              ))}
            </div>
            <p className="mb-9 text-lg text-start font-semibold text-black">
              <span className="mr-1">{currentQuestionIndex + 1}.</span>
              {questions[currentQuestionIndex].question.replaceAll(
                "(ชื่อผู้เล่น)",
                userName
              )}
            </p>
            <div className="mb-3">
              {questions[currentQuestionIndex].choices.map((choice, index) => (
                <button
                  key={index}
                  className="block w-full shadow-md text-left p-3 my-4 rounded-lg bg-gray-200 hover:bg-blue-400"
                  onClick={() => handleAnswerSelect(choice)}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        </CSSTransition>
        <CSSTransition
          in={step === "end"}
          timeout={500}
          classNames="fade"
          mountOnEnter
          unmountOnExit
        >
          <div className="text-center p-6">
            <h1 className="text-2xl font-bold mb-6">Test Completed!</h1>
            <p className="mt-4 text-lg text-gray-700">
              You've answered all the questions.
            </p>
            <h2 className="mt-4 text-xl font-semibold">Summary:</h2>
            <p className="mt-2 text-lg">
              Thank you for completing the test, {userName}!
            </p>
            <button
              className="px-6 py-2 shadow-md bg-blue-500 text-white rounded-lg mt-4"
              onClick={() => {
                setStep("null");
                setTimeout(() => {
                  setStep("home");
                  setCurrentQuestionIndex(0);
                  setUserName("");
                  setHp(3);
                }, 510);
              }}
            >
              Restart Test
            </button>
          </div>
        </CSSTransition>
        <CSSTransition
          in={step === "fail"}
          timeout={500}
          classNames="fade"
          mountOnEnter
          unmountOnExit
        >
          <div className="text-center p-6">
            <h1 className="text-2xl font-bold mb-6">Test Failed!</h1>
            <p className="mt-4 text-lg text-gray-700">
              You have run out of hearts.
            </p>
            <h2 className="mt-4 text-xl font-semibold">Summary:</h2>
            <p className="mt-2 text-lg">Thank you for playing, {userName}!</p>
            <button
              className="px-6 py-2 shadow-md bg-blue-500 text-white rounded-lg mt-4"
              onClick={() => {
                setStep("null");
                setTimeout(() => {
                  setStep("home");
                  setCurrentQuestionIndex(0);
                  setUserName("");
                  setHp(3);
                }, 510);
              }}
            >
              Restart Test
            </button>
          </div>
        </CSSTransition>
      </div>
    </div>
  );
}

export default App;
