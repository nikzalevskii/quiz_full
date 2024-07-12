import {UrlManager} from "../utils/url-manager.js";
import {Auth} from "../services/auth.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class Answer {


    constructor() {

        this.optionsElement = null;
        this.testName = null;
        this.email = null;
        this.userInfo = null;
        this.result = null;
        this.routeParams = UrlManager.getQueryParams();
        this.rightUserAnswers = [];
        this.wrongUserAnswers = [];


        this.init();

    }

    async init() {
        this.userInfo = Auth.getUserInfo();
        // console.log(this.userInfo);
        if (!this.userInfo) {
            location.href = '#/';
        }
        if (this.routeParams.id) {
            try {
                this.result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id +
                    '/result/details?userId=' + this.userInfo.userId);


                if (this.result) {
                    if (this.result.error) {
                        throw new Error(this.result.error);
                    }
                    for (let i = 0; i < this.result.test.questions.length; i++) {
                        for (let j = 0; j < this.result.test.questions[i].answers.length; j++) {
                            if (this.result.test.questions[i].answers[j].correct) {
                                this.rightUserAnswers.push(this.result.test.questions[i].answers[j].id);
                            }

                            if (this.result.test.questions[i].answers[j].correct === false) {
                                this.wrongUserAnswers.push(this.result.test.questions[i].answers[j].id)
                            }
                        }
                        if (!this.rightUserAnswers[i]) {
                            this.rightUserAnswers[i] = 0;
                        }
                        if (!this.wrongUserAnswers[i]) {
                            this.wrongUserAnswers[i] = 0;
                        }
                    }

                    this.showQuestion();


                    const backToResult = document.getElementById('watch-result');
                    const that = this;
                    backToResult.onclick = function () {
                        location.href = '#/result?id=' + that.routeParams.id;
                    }

                    return;
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    showQuestion() {
        this.optionsElement = document.getElementById('options');
        this.testName = document.getElementById('test-name');
        this.testUserInfo = document.getElementById('answer-user-info');
        this.testName.innerText = this.result.test.name;
        this.email = localStorage.getItem(Auth.userEmailKey);
        this.testUserInfo.innerText = this.userInfo.fullName + ', ' + this.email;

        this.optionsElement.innerHTML = '';
        let answerBlock = [];
        let questionTitle = [];
        let answerBlockOption = [];
        let questionAnswerCircle = [];
        let questionAnswerText = [];

        for (let i = 0; i < this.result.test.questions.length; i++) {
            answerBlock[i] = document.createElement('div');
            answerBlock[i].className = 'answer-block';
            questionTitle[i] = document.createElement('div');
            questionTitle[i].className = 'answer-block-title';
            questionTitle[i].innerHTML = '<span>Вопрос ' + (i + 1)
                + ':</span> ' + this.result.test.questions[i].question;
            answerBlockOption[i] = [];
            questionAnswerCircle[i] = [];
            questionAnswerText[i] = [];
            this.optionsElement.appendChild(answerBlock[i]);
            answerBlock[i].appendChild(questionTitle[i]);
            for (let j = 0; j < this.result.test.questions[i].answers.length; j++) {
                answerBlockOption[i][j] = document.createElement('div');
                answerBlockOption[i][j].className = 'answer-block-option';
                questionAnswerCircle[i][j] = document.createElement('div');
                questionAnswerCircle[i][j].className = 'answer-block-option-circle';
                questionAnswerText[i][j] = document.createElement('div');
                questionAnswerText[i][j].className = 'answer-block-option-text';
                questionAnswerText[i][j].innerText = this.result.test.questions[i].answers[j].answer;

                if (this.rightUserAnswers[i] === this.result.test.questions[i].answers[j].id) {
                    questionAnswerCircle[i][j].classList.add('right-answer');
                    questionAnswerText[i][j].classList.add('right-answer-text');
                } else if (this.wrongUserAnswers[i] === this.result.test.questions[i].answers[j].id) {
                    questionAnswerCircle[i][j].classList.add('wrong-answer');
                    questionAnswerText[i][j].classList.add('wrong-answer-text');
                }


                answerBlockOption[i][j].appendChild(questionAnswerCircle[i][j]);
                answerBlockOption[i][j].appendChild(questionAnswerText[i][j]);
                answerBlock[i].appendChild(answerBlockOption[i][j]);
            }

        }
    }


}