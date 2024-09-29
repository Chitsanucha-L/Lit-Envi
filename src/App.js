import React, { useState } from 'react';
import questions from './data'; // Importing questions from the data file

function App() {
  const [test, setTest] = useState("home");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const startTest = () => {
    setTest("start");
    setCurrentQuestionIndex(0);
  };

  const reTest = () => {
    setTest("home");
  };

  const handleAnswerSelect = () => {
    // Move to the next question after selecting an answer
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // After the last question, show the summary
      setTest("end"); // Reset the test to show summary
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="w-full max-w-xl p-6 bg-white rounded-lg shadow-md">
        {test === "home" ? (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6">Welcome to the Test</h1>
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-lg text-lg"
              onClick={startTest}
            >
              Start Test
            </button>
          </div>
        ) : test === "start" && currentQuestionIndex < questions.length ? (
          <div>
            <h1 className="text-2xl font-bold mb-6">Question {currentQuestionIndex + 1}</h1>
            <p className="mb-4 text-xl">{questions[currentQuestionIndex].question}</p>

            {/* Display choices */}
            <div className="mb-4">
              {questions[currentQuestionIndex].choices.map((choice, index) => (
                <button
                  key={index}
                  className="block w-full shadow-sm hover:bg-blue-400 text-left p-2 my-3 rounded-lg bg-gray-200"
                  onClick={handleAnswerSelect}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        ) : test === "end" ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-6">Test Completed!</h1>
            <p className="mt-4 text-lg text-gray-700">You've answered all the questions.</p>
            <h2 className="mt-4 text-xl font-semibold">Summary:</h2>
            <p className="mt-2 text-lg">Thank you for completing the test!</p>
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-lg mt-4"
              onClick={reTest} // Restart the test
            >
              Restart Test
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
