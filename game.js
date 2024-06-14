const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("option"));

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

const loader = document.getElementById("loader");
const container = document.getElementById("container");

let questions = [];

fetch(
    'https://opentdb.com/api.php?amount=250&category=9&difficulty=easy&type=multiple'
)
    .then((res) => {
        return res.json();
    })
    .then((loadedQuestions) => {
        questions = loadedQuestions.results.map((loadedQuestion) => {
            const formattedQuestion = {
                question: loadedQuestion.question,
            };

            const answerChoices = [...loadedQuestion.incorrect_answers];
            formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
            answerChoices.splice(
                formattedQuestion.answer - 1,
                0,
                loadedQuestion.correct_answer
            );

            answerChoices.forEach((choice, index) => {
                formattedQuestion['choice' + (index + 1)] = choice;
            });

            return formattedQuestion;
        });
        loader.style.display = "none";
        container.style.display = "flex";
        startQuiz();
    })
    .catch((err) => {
        console.error(err);
    });

const CorrectBonus = 10;
const maxQuestions = 10;

startQuiz = () => {
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions];
    getNewQuestion();
};

getNewQuestion = () => {
    if (availableQuestions.length === 0 || questionCounter >= maxQuestions) {
        localStorage.setItem("mostRecentScore", score);
        return window.location.assign("end.html");
    }
    questionCounter++;
    const progressPercentage = questionCounter / maxQuestions * 100;
    document.getElementById("progress").style.width = progressPercentage + "%";
    const quesCountDisplay = document.getElementById("quesCountDisplay");
    quesCountDisplay.innerText = questionCounter + "/" + maxQuestions;

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    question.innerText = currentQuestion.question;

    choices.forEach(choice => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
    });

    availableQuestions.splice(questionIndex, 1);
    acceptingAnswers = true;
};

choices.forEach(choice => {
    choice.addEventListener("click", e => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset["number"];

        const classToApply =
            (selectedAnswer == currentQuestion.answer ? "correct" : "incorrect");

        selectedChoice.classList.add(classToApply);

        if (selectedAnswer == currentQuestion.answer) {
            score += CorrectBonus;
        }
        else{
            choices.forEach(choice => {
                if(choice.dataset["number"]==currentQuestion.answer){
                    choice.classList.add("correct");
                }
            });
        }
        const scoreDisplay = document.getElementById("scoreDisplay");
        scoreDisplay.innerText = score;

        setTimeout(() => {
            selectedChoice.classList.remove(classToApply);
            choices.forEach(choice => {
                if(choice.dataset["number"]==currentQuestion.answer){
                    choice.classList.remove("correct");
                }
            });
            getNewQuestion();
        }, 1000);
    });
});
