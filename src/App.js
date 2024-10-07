import React, { useEffect, useState, useRef } from "react";
import questions from "./data"; // Importing questions from the data file
import { Heart, HeartCrack, Check, X } from "lucide-react";
import { CSSTransition } from "react-transition-group";
import "./App.css";
import axios from "axios";
import gsap from "gsap";

const apiClient = axios.create({
  baseURL: "https://gened-project.vercel.app",
});

const App = () => {
  const [step, setStep] = useState(null);
  const [userName, setUserName] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [choiceDisabled, setChoiceDisabled] = useState(false);
  const [hp, setHp] = useState(3);
  const [point, setPoint] = useState(0);
  const max = questions.length;
  const audioRef = useRef(null);
  const [currentHeart, setCurrentHeart] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const tabs = [
    {
      content: `สวัสดีคุณ ${userName}! ตอนนี้คุณได้อยู่ที่กรุงเทพมหานครฯ`,
    },
    {
      content:
        "ในขณะนี้กรุงเทพฯ กำลังเผชิญกับการท่วมครั้งใหญ่\nทุกพื้นที่ต่ำถูกน้ำท่วมล้นจนกลายเป็นทะเลสาบขนาดใหญ่",
    },
    {
      content:
        "คุณและทีมของคุณเป็นกลุ่มนักสำรวจที่ได้รับมอบหมาย\nให้รวบรวมข้อมูลและหาแนวทางแก้ไขสถานการณ์ให้กับเมือง",
    },
    {
      content:
        "แต่ระหว่างการเดินทาง คุณต้องตอบคำถามเกี่ยวกับกรุงเทพฯ\nและสถานการณ์น้ำท่วมให้ถูกต้องเพื่อเอาชีวิตรอด",
    },
    {
      content: "แต่ทุกครั้งที่คุณตอบผิดนั้น HP ของคุณจะลดลง!",
    },
  ];

  const playAudio = async () => {
    try {
      audioRef.current.volume = 0.3;
      await audioRef.current.play();
    } catch (error) {
      console.error("Audio playback failed", error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setStep("home");
    }, 510);
  }, []);

  useEffect(() => {
    if ((step === "home" || step === "rules") && audioRef) playAudio();
  }, [step, audioRef]);

  // Image preloading
  const preloadImage = (src) => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsImageLoaded(true);
  };

  useEffect(() => {
    preloadImage("home.png");
    preloadImage("rules.png");
    preloadImage("name.png");
  }, []);

  const handleNameSubmit = (event) => {
    event.preventDefault();
    setStep("null");
    setTimeout(() => {
      setStep("content");
    }, 510);
  };

  const [shuffledChoices, setShuffledChoices] = useState([]);

  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];
    const shuffled = shuffleArray(currentQuestion.choices);
    setShuffledChoices(shuffled);
  }, [currentQuestionIndex]);

  const shuffleArray = (array) => {
    let shuffledArray = array.slice(); // Create a copy of the array
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  };

  const handleAnswerSelect = (choice, index) => {
    setChoiceDisabled(true);
    const correctAnswers = questions[currentQuestionIndex].answer;
    apiClient
      .put(
        `/number/${currentQuestionIndex + 1}/choice${
          questions[currentQuestionIndex].choices.indexOf(choice) + 1
        }`
      )
      .catch((error) => {
        console.error("Failed to send choice to the server", error);
      });
    if (hp <= 0) {
      setStep("null");
      setTimeout(() => {
        setStep("fail");
      }, 510);
      return 0;
    }
    setSelectedAnswerIndex(index);
    if (correctAnswers.includes(choice)) {
      console.log("Correct!");
      const correctSound = document.getElementById("correct");
      correctSound.volume = 1;
      correctSound.play().catch((error) => {
        console.error("Error playing sound", error);
      });
      setFeedback("correct");
      setPoint((prevPoint) => {
        return prevPoint + 1;
      });
    } else {
      console.log("Incorrect!");
      const wrongSound = document.getElementById("wrong");
      wrongSound.volume = 0.85;
      wrongSound.play().catch((error) => {
        console.error("Error playing sound", error);
      });
      setFeedback("incorrect");
      setHp((prevHp) => {
        if (prevHp > 1) {
          return prevHp - 1; // Decrease HP
        }
        setStep("null");
        setTimeout(() => {
          setStep("fail");
        }, 510);
        return 0; // Set HP to 0
      });
    }

    // Move to the next question after answering
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setSelectedAnswerIndex(null); // Reset selected answer index
        setFeedback(null);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setChoiceDisabled(false);
      }, 2000);
    } else {
      setStep("null");
      setTimeout(() => {
        setStep("end");
      }, 510);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeart((prev) => (prev + 1) % 3); // Cycle through 0, 1, 2
    }, 1200); // matches the animation duration

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Ensure GSAP waits for the title element to be available
  useEffect(() => {
    if (step === "home") {
      const element1 = document.getElementById("home-title");
      const element2 = document.getElementById("home-button");
      if (element1 && element2) {
        gsap.fromTo(
          "#home-title",
          {
            opacity: 0,
            y: "-4vw",
            delay: 0.6,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
          }
        );
        gsap.fromTo(
          "#home-button",
          {
            opacity: 0,
            y: "4vw",
            delay: 0.6,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
          }
        );
      }
    } else if (step === "rules") {
      const element1 = document.getElementById("rules-content");
      if (element1) {
        gsap.fromTo(
          "#rules-content",
          {
            y: "4vw",
            delay: 0.6,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
          }
        );
      }
    } else if (step === "name") {
      const element1 = document.getElementById("name-content");
      if (element1) {
        gsap.fromTo(
          "#name-content",
          {
            y: "4vw",
            delay: 0.6,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
          }
        );
      }
    }
  }, [step]);

  const [fadeClass, setFadeClass] = useState("fade-in");
  const [contentDisabled, setContentDisabled] = useState(false);

  const handleContent = () => {
    setFadeClass("fade-out");
    setContentDisabled(true);

    if (currentTab === tabs.length - 1) {
      setTimeout(() => {
        setStep(null);
        setTimeout(() => {
          setStep("start");
        }, 510);
      }, 600);
      return;
    }

    setTimeout(() => {
      setCurrentTab((prevTab) => (prevTab + 1) % tabs.length);
      setFadeClass("fade-in");
      setTimeout(() => {
        setContentDisabled(false);
      }, 900);
    }, 600);
  };

  return (
    <div className="noto-sans bg-gray-100 flex justify-center items-center w-screen max-h-screen p-0 m-0">
      <audio id="correct" src="/correct.mp3" preload="auto"></audio>
      <audio id="wrong" src="/wrong.mp3" preload="auto"></audio>
      {isImageLoaded && (
        <>
          <audio id="audio" loop autoPlay ref={audioRef}>
            <source src="/music.mp3" type="audio/mp3" />
          </audio>
          <div className="flex justify-center items-center w-full min-h-screen h-full">
            <CSSTransition
              in={step === "home"}
              timeout={500}
              classNames="fade"
              mountOnEnter
              unmountOnExit
            >
              <div className="relative w-full h-full">
                <img
                  className="w-full h-full object-contain z-0"
                  src="home.png"
                  alt="Background"
                />

                {/* Video Background 
            <video
              autoPlay
              muted
              loop
              className="absolute inset-0 w-full h-full object-cover z-0"
            >
              <source src="/home.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>*/}

                {/* Overlay content */}
                <div className="absolute inset-0 flex flex-col justify-center items-center z-10 bg-black bg-opacity-25">
                  <h1
                    id="home-title"
                    className="xl:text-[1.8vw] lg:text-[2vw] md:text-[2.2vw] text-[2.4vw] font-bold lg:mb-[3.5vw] mb-[5vw] py-[0.4vw] text-white"
                    style={{ textShadow: "0px 1px 30px #000" }}
                  >
                    กรุงเทพฯ เมืองใต้น้ำ และวิถีชีวิต
                  </h1>
                  <button
                    id="home-button"
                    className="lg:px-[1.2vw] lg:py-[0.4vw] px-[1.4vw] py-[0.6vw] shadow-lg bg-gradient-to-tr from-[#58c2ff] to-[#3d45cb] hover:bg-blue-600 text-white lg:rounded-[0.6vw] rounded-[0.8vw] xl:text-[1vw] lg:text-[1.2vw] md:text-[1.4vw] text-[1.6vw]"
                    onClick={() => {
                      playAudio();
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
              <div className="relative w-full h-full">
                <img
                  className="w-full h-full object-contain z-0"
                  src="rules.png"
                  alt="Background"
                />
                <div
                  id="rules-content"
                  className="absolute inset-0 z-10 shadow-xl flex flex-col justify-center items-center opacity-0"
                >
                  <div className="text-center lg:p-[1.4vw] p-[1.6vw] xl:max-w-[35vw] lg:max-w-[40vw] md:max-w-[45vw] max-w-[50vw] w-full bg-white bg-opacity-75 lg:rounded-[0.6vw] rounded-[0.8vw] shadow-lg">
                    <h1 className="xl:text-[1.6vw] lg:text-[1.8vw] md:text-[2vw] text-[2.2vw] font-bold lg:mb-[0.4vw] mb-[0.6vw] py-[0.5vw] text-black">
                      กติกา
                    </h1>
                    <p className="lg:mb-[0.8vw] mb-[1.2vw] xl:text-[1vw] lg:text-[1.2vw] md:text-[1.4vw] text-[1.6vw] text-start">
                      ผู้เล่นมีหัวใจอยู่ 3 ดวง หากตอบผิดจะโดนหักหัวใจ 1
                      ดวงต่อครั้ง ซึ่งตอบผิดเกิน 3 ครั้ง (หัวใจหมด)
                      ผู้เล่นจะเห็นจุดจบของการสำรวจและได้รับข้อมูลเพิ่มเติมเกี่ยวกับสถานการณ์น้ำท่วมในกรุงเทพฯ
                      และแนวทางแก้ไข ขณะเดียวกัน หากผู้เล่นตอบถูกทั้งหมด
                      พวกเขาจะได้รับรางวัล เช่น
                      ข้อมูลเชิงลึกเพิ่มเติมเกี่ยวกับโครงการที่กำลังพัฒนาเพื่อป้องกันน้ำท่วมในอนาคต
                    </p>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="lg:px-[1.2vw] lg:py-[0.4vw] px-[1.4vw] py-[0.6vw] shadow-lg bg-gradient-to-tr from-[#58c2ff] to-[#3d45cb] hover:bg-blue-600 text-white lg:rounded-[0.6vw] rounded-[0.8vw] xl:text-[1vw] lg:text-[1.2vw] md:text-[1.4vw] text-[1.6vw]"
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
              <div className="relative w-full h-full">
                <img
                  className="w-full h-full object-contain object-center 2xl:object-cover z-0"
                  src="name.png"
                  alt="Background"
                />
                <div
                  id="name-content"
                  className="absolute inset-0 z-10 shadow-xl flex flex-col justify-center items-center opacity-0"
                >
                  <div className="text-center lg:p-[1.4vw] p-[1.6vw] xl:max-w-[35vw] lg:max-w-[40vw] md:max-w-[45vw] max-w-[50vw] w-full bg-white bg-opacity-75 lg:rounded-[0.6vw] rounded-[0.8vw] shadow-lg">
                    <h1 className="xl:text-[1.6vw] lg:text-[1.8vw] md:text-[2vw] text-[2.2vw] font-bold py-[0.25vw] lg:mb-[2.2vw] mb-[3.3vw] text-black">
                      ใส่ชื่อนักเดินทาง
                    </h1>
                    <form
                      onSubmit={handleNameSubmit}
                      className="relative flex flex-col space-y-[0.6vw] mb-[0.6vw] px-[1vw]"
                    >
                      <input
                        type="text"
                        placeholder="ชื่อนักเดินทาง"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="lg:p-[0.4vw] p-[0.6vw] border border-gray-300 outline-none lg:rounded-[0.6vw] rounded-[0.8vw] lg:mb-[0.8vw] mb-[1.2vw] xl:text-[1vw] lg:text-[1.2vw] md:text-[1.4vw] text-[1.6vw]"
                        required
                      />
                      <button
                        type="submit"
                        className="lg:px-[1.2vw] lg:py-[0.45vw] px-[1.4vw] py-[0.65vw] shadow-lg bg-gradient-to-tr from-[#58c2ff] to-[#3d45cb] hover:bg-blue-600 text-white lg:rounded-[0.6vw] rounded-[0.8vw] xl:text-[1vw] lg:text-[1.2vw] md:text-[1.4vw] text-[1.6vw]"
                      >
                        เริ่มต้นเดินทาง
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </CSSTransition>
            <CSSTransition
              in={step === "content"}
              timeout={500}
              classNames="fade"
              mountOnEnter
              unmountOnExit
            >
              <button
                className="relative w-full h-full"
                onClick={handleContent}
                disabled={contentDisabled}
              >
                <img
                  className="w-full h-full object-contain object-center 2xl:object-cover z-0"
                  src="name.png"
                  alt="Background"
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center z-10 bg-black bg-opacity-25">
                  <div
                    className={`${fadeClass} xl:text-[1.8vw] lg:text-[2vw] md:text-[2.2vw] text-[2.4vw] font-bold text-white opacity-0`}
                  >
                    {tabs[currentTab].content.split("\n").map((line, index) => (
                      <p
                        key={index}
                        style={{ textShadow: "0px 1px 30px #000" }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </button>
            </CSSTransition>
            <CSSTransition
              in={step === "start" && currentQuestionIndex < questions.length}
              timeout={500}
              classNames="fade"
              mountOnEnter
              unmountOnExit
            >
              <div className="lg:p-[1.4vw] p-[1.6vw] xl:max-w-[35vw] lg:max-w-[40vw] md:max-w-[45vw] max-w-[50vw] w-full bg-white lg:rounded-[0.6vw] rounded-[0.8vw] shadow-xl">
                <div className="flex justify-end space-x-[0.1vw] lg:mb-[0.45vw] mb-[0.625vw]">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div key={index}>
                      {index < hp ? (
                        <Heart
                          fill="red"
                          color="red"
                          className="lg:w-[1.25vw] lg:h-[1.25vw] w-[1.75vw] h-[1.75vw] heart-animation"
                          style={{
                            animation:
                              currentHeart === index
                                ? "moveHeart 0.6s ease-in-out"
                                : "none",
                          }}
                        />
                      ) : (
                        <HeartCrack
                          color="#4f4f4f"
                          className="lg:w-[1.25vw] lg:h-[1.25vw] w-[1.75vw] h-[1.75vw] heart-animation"
                          style={{
                            animation:
                              currentHeart === index
                                ? "moveHeart 0.6s ease-in-out"
                                : "none",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <p className="lg:mb-[1.6vw] mb-[2.4vw] xl:text-[1vw] lg:text-[1.2vw] md:text-[1.4vw] text-[1.6vw] text-start font-semibold text-black">
                  <span className="mr-[0.2vw]">
                    {currentQuestionIndex + 1}.
                  </span>
                  {questions[currentQuestionIndex].question.replaceAll(
                    "(ชื่อผู้เล่น)",
                    userName
                  )}
                </p>
                <div className="lg:mb-[0.6vw] mb-[0.9vw]">
                  {shuffledChoices.map((choice, index) => (
                    <button
                      key={index}
                      disabled={choiceDisabled}
                      className={`w-full flex justify-between items-center shadow-md lg:p-[0.6vw] p-[0.9vw] lg:my-[0.85vw] my-[1.275vw] lg:rounded-[0.6vw] rounded-[0.8vw] ${
                        selectedAnswerIndex === index
                          ? feedback === "correct"
                            ? "bg-[#a1f3be]"
                            : "bg-[#fdb8b8]"
                          : "bg-gray-200"
                      }`}
                      onClick={() => handleAnswerSelect(choice, index)}
                    >
                      <div className="text-left xl:text-[0.95vw] lg:text-[1.15vw] md:text-[1.35vw] text-[1.55vw]">
                        {choice.replaceAll("(ชื่อผู้เล่น)", userName)}
                      </div>
                      {selectedAnswerIndex === index && feedback && (
                        <div className="items-end lg:ml-[0.35vw] ml-[0.525vw]">
                          {feedback === "correct" ? (
                            <Check
                              strokeWidth={3.5}
                              className="text-green-500 lg:w-[1.30vw] lg:h-[1.30vw] w-[1.80vw] h-[1.80vw]"
                            />
                          ) : (
                            <X
                              strokeWidth={3.5}
                              className="text-red-500 lg:w-[1.30vw] lg:h-[1.30vw] w-[1.80vw] h-[1.80vw]"
                            />
                          )}
                        </div>
                      )}
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
              <div className="text-center lg:p-[1.4vw] p-[1.6vw] xl:max-w-[35vw] lg:max-w-[40vw] md:max-w-[45vw] max-w-[50vw] w-full bg-white lg:rounded-[0.6vw] rounded-[0.8vw] shadow-xl">
                <h1 className="xl:text-[1.6vw] lg:text-[1.8vw] md:text-[2vw] text-[2.2vw] font-bold mb-[1.2vw]">
                  เย้! ยินดีด้วยย
                </h1>
                <p className="mt-[0.8vw] xl:text-[1vw] lg:text-[1.2vw] md:text-[1.4vw] text-[1.6vw]">
                  คุณ {userName} ได้ผ่านบททดสอบและได้คะแนน {point} เต็ม {max}
                </p>
                <p className="mt-[0.8vw] xl:text-[1vw] lg:text-[1.2vw] md:text-[1.4vw] text-[1.6vw]">
                  ขอบคุณที่เข้ามาเล่นน้าา คุณ {userName}!
                </p>
                <button
                  className="lg:px-[1.2vw] lg:py-[0.45vw] px-[1.4vw] py-[0.65vw] shadow-lg bg-gradient-to-tr from-[#58c2ff] to-[#3d45cb] text-white lg:rounded-[0.6vw] rounded-[0.8vw] mt-[1.8vw] xl:text-[1vw] lg:text-[1.2vw] md:text-[1.4vw] text-[1.6vw]"
                  onClick={() => {
                    setStep("null");
                    setTimeout(() => {
                      setStep("home");
                      setCurrentQuestionIndex(0);
                      setUserName("");
                      setHp(3);
                      selectedAnswerIndex(null);
                      setChoiceDisabled(false);
                      setFeedback(null);
                      setContentDisabled(false);
                      setCurrentHeart(0);
                      setCurrentTab(0);
                      setPoint(0);
                      setIsImageLoaded(false);
                    }, 510);
                  }}
                >
                  ลองใหม่อีกครั้ง
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
              <div className="text-center lg:p-[1.4vw] p-[1.6vw] xl:max-w-[35vw] lg:max-w-[40vw] md:max-w-[45vw] max-w-[50vw] w-full bg-white lg:rounded-[0.6vw] rounded-[0.8vw] shadow-xl">
                <h1 className="xl:text-[1.6vw] lg:text-[1.8vw] md:text-[2vw] text-[2.2vw] font-bold mb-[1.2vw]">
                  เสียใจด้วยย!
                </h1>
                <p className="mt-[0.8vw] xl:text-[1vw] lg:text-[1.2vw] md:text-[1.4vw] text-[1.6vw]">
                  คุณได้ตอบผิดครบ 3 ครั้งแล้วว T^T
                </p>
                <p className="mt-[0.8vw] xl:text-[1vw] lg:text-[1.2vw] md:text-[1.4vw] text-[1.6vw]">
                  ขอบคุณที่เข้ามาเล่นน้าา คุณ {userName}!
                </p>
                <button
                  className="lg:px-[1.2vw] lg:py-[0.45vw] px-[1.4vw] py-[0.65vw] shadow-lg bg-gradient-to-tr from-[#58c2ff] to-[#3d45cb] text-white lg:rounded-[0.6vw] rounded-[0.8vw] mt-[1.8vw] xl:text-[1vw] lg:text-[1.2vw] md:text-[1.4vw] text-[1.6vw]"
                  onClick={() => {
                    setStep("null");
                    setTimeout(() => {
                      setStep("home");
                      setCurrentQuestionIndex(0);
                      setUserName("");
                      setHp(3);
                      selectedAnswerIndex(null);
                      setChoiceDisabled(false);
                      setFeedback(null);
                      setContentDisabled(false);
                      setCurrentHeart(0);
                      setCurrentTab(0);
                      setPoint(0);
                      setIsImageLoaded(false);
                    }, 510);
                  }}
                >
                  ลองใหม่อีกครั้ง
                </button>
              </div>
            </CSSTransition>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
