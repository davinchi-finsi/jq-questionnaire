/**
 * @license
 * Copyright Davinchi. All Rights Reserved.
 */
(function (factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            "jquery",
            // These are only for backcompat
            // TODO: Remove after 1.12
            "./controlgroup",
            "./checkboxradio",
            "../keycode",
            "../widget"
        ], factory);
    }
    else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.widget("ui.jqQuestionnaire", {
        NAMESPACE: "jqQuestionnaire",
        QUERY_HEADER: "[data-jq-questionnaire-header]",
        QUERY_WRAPPER: "[data-jq-questionnaire-wrapper]",
        QUERY_BODY: "[data-jq-questionnaire-body]",
        QUERY_PROPERTIES: "[data-jq-questionnaire-properties]",
        QUERY_QUESTIONS: "[data-jq-questionnaire-questions]",
        QUERY_QUESTION: "[data-jq-questionnaire-question]",
        QUERY_OPTIONS: "[data-jq-questionnaire-options]",
        QUERY_OPTION: "[data-jq-questionnaire-option]",
        QUERY_ACTION_START: "[data-jq-questionnaire-start]",
        QUERY_ACTION_NEXT: "[data-jq-questionnaire-next]",
        QUERY_ACTION_PREV: "[data-jq-questionnaire-prev]",
        QUERY_ACTION_END: "[data-jq-questionnaire-end]",
        QUERY_RENDER_OPTION: "[data-jq-questionnaire-property]",
        QUERY_RENDER_RESULT: "[data-jq-questionnaire-result-item]",
        QUERY_RESULT: "[data-jq-questionnaire-result]",
        QUERY_FEEDBACK: "[data-jq-questionnaire-feedback]",
        IS_CORRECT: "isCorrect",
        ATTR_CURRENT_QUESTION: "data-current-question",
        ATTR_IS_CORRECT: "data-is-correct",
        ATTR_POINTS_FOR_SUCCESS: "data-points-for-success",
        ATTR_FEEDBACK: "data-jq-questionnaire-feedback",
        ATTR_POINTS_FOR_FAIL: "data-points-for-fail",
        ON_QUESTION_HIDE: "jqQuestionnaire:questionHide",
        ON_QUESTION_SHOW: "jqQuestionnaire:questionShow",
        ON_HEADER_HIDE: "jqQuestionnaire:headerHide",
        ON_HEADER_SHOW: "jqQuestionnaire:headerShow",
        ON_BODY_HIDE: "jqQuestionnaire:bodyHide",
        ON_BODY_SHOW: "jqQuestionnaire:bodyShow",
        ON_TRANSITION_END: "jqQuestionnaire:transitionEnd",
        ON_OPTION_CHANGE: "jqQuestionnaire:questionChange",
        ON_START: "jqQuestionnaire:start",
        ON_STARTED: "jqQuestionnaire:started",
        ON_END: "jqQuestionnaire:end",
        FEEDBACK_TYPES: {
            "ok": "ok",
            "ko": "ko"
        },
        STATES: {
            "off": 0,
            "running": 1,
            "result": 2,
            "review": 3
        },
        DISABLE_END: {
            "never": 0,
            "beforeAnswerAll": 1,
            "beforeAnswerAllCorrect": 2
        },
        options: {
            classes: {
                firstQuestion: "jq-questionnaire--first-question",
                lastQuestion: "jq-questionnaire--last-question",
                widget: "jq-questionnaire",
                questionCorrect: "jq-questionnaire--correct",
                questionIncorrect: "jq-questionnaire--incorrect",
                selected: "jq-questionnaire--selected",
                stateResult: "jq-questionnaire--result",
                stateReview: "jq-questionnaire--review",
                stateRunning: "jq-questionnaire--running",
                multichoice: "jq-questionnaire--multi-choice",
                wrapper: "jq-questionnaire__form",
                header: "jq-questionnaire__header",
                body: "jq-quesitonnaire__body",
                startBtn: "jq-questionnaire__start",
                nextBtn: "jq-questionnaire__next",
                prevBtn: "jq-questionnaire__prev",
                endBtn: "jq-questionnaire__end",
                result: "jq-questionnaire__result",
                question: "jq-questionnaire__question",
                option: "jq-questionnaire__option",
                navbar: "jq-questionnaire__navbar",
                button: "jq-questionnaire__action",
                properties: "jq-questionnaire__properties",
                questions: "jq-questionnaire__questions"
            },
            delayOnAutoNext: 500,
            pointsForSuccess: 1,
            pointsForFail: 0,
            cutOffMark: 50,
            immediateFeedback: false,
            disableOptionAfterSelect: true,
            autoGoNext: true,
            showCorrection: true,
            showResult: true,
            multichoice: false,
            disableNextUntilSuccess: false,
            disableEndActionUntil: 0,
            dialog: {
                draggable: false,
                autoOpen: true,
                resizable: false,
                modal: true
            }
        },
        /**
         * @constructor
         * @private
         */
        _create: function () {
            this._getElements();
            this.element.uniqueId();
            this._mapQuestions();
            this._changeState(this.STATES.off);
            this._assignEvents();
            this._renderOptions();
        },
        /**
         * Renderiza una opción escaneando los elementos que coincidan con QUERY_RENDER_OPTION
         * Es posible establecer un valor a renderizar en caso de que el atributo sea true o false usando la sintaxis del operador ternario: nombreOpcion ? valorSiTrue : valorSiFalse
         * @private
         * @example
         * let options = {cutOffMark:50};
         * <span data-questionnaire-render-option="cutOffMark"></span>
         * Renderiza:
         * <span data-questionnaire-render-option="cutOffMark">50</span>
         * @example
         * let options = {immediateFeedback:false};
         * <span data-questionnaire-render-option="immediateFeedback?Si:No"></span>
         * Renderiza:
         * <span data-questionnaire-render-option="immediateFeedback?Si:No">No</span>
         * @see _renderVar
         */
        _renderOptions: function () {
            this._renderVar(this.QUERY_RENDER_OPTION, "jqQuestionnaireProperty");
        },
        /**
         * Renderiza para los elementos indicados una propiedad de un store concreto y un contexto definido
         * Es posible establecer un valor a renderizar en caso de que el atributo sea true o false usando la sintaxis del operador ternario: nombreOpcion ? valorSiTrue : valorSiFalse
         * @param {String}              query           Selector jquery a aplicar para obtener los elementos
         * @param {String}              data            Nombre del atributo para el cual obtener el dato mediante $.data
         * @param {Object}              [store]         Objeto del cual obtener el dato. Por defecto se obtiene de options
         * @param {JQuery}              [context]       Contexto en el cual aplicar la query. Por defecto el element del widget
         * @private
         */
        _renderVar: function (query, data, store, context) {
            context = context || this.element;
            store = store || this.options;
            var $toRender = context.find(query);
            //each element to render
            for (var _i = 0, $toRender_1 = $toRender; _i < $toRender_1.length; _i++) {
                var element = $toRender_1[_i];
                var $element = $(element), optionName = ($element.data(data) || "").trim(), //get the data name and trim it
                optionAsTrue = void 0, optionAsFalse = void 0;
                if (optionName != undefined) {
                    _a = optionName.split("?"), optionName = _a[0], optionAsTrue = _a[1]; //split to get the parts
                    if (optionAsTrue != undefined) {
                        _b = optionAsTrue.split(":"), optionAsTrue = _b[0], optionAsFalse = _b[1]; //destructure
                    }
                    var optionValue = store[optionName]; //get the value of data
                    optionValue = optionValue != undefined ? optionValue : ""; //if undefined, assign empty string
                    if (optionAsTrue != undefined && !!optionValue) {
                        optionValue = optionAsTrue;
                    }
                    else if (optionAsFalse != undefined && !optionValue) {
                        optionValue = optionAsFalse;
                    }
                    $element.html(optionValue);
                }
            }
            var _a, _b;
        },
        /**
         * Obtiene todos los elementos internos
         * @private
         */
        _getElements: function () {
            this._$wrapper = this.element.find(this.QUERY_WRAPPER)
                .addClass(this.options.classes.wrapper);
            this._$header = this.element.find(this.QUERY_HEADER)
                .addClass(this.options.classes.header);
            this._$body = this.element.find(this.QUERY_BODY)
                .addClass(this.options.classes.body);
            this._$body.hide();
            this._$properties = this.element.find(this.QUERY_PROPERTIES)
                .addClass(this.options.classes.properties);
            this._$questionsWrapper = this.element.find(this.QUERY_QUESTIONS)
                .addClass(this.options.classes.questions);
            this._$questions = this._$questionsWrapper.find(this.QUERY_QUESTION)
                .addClass(this.options.classes.question);
            this._$questions.hide();
            this._$startBtn = this._$wrapper.find(this.QUERY_ACTION_START)
                .addClass(this.options.classes.button + " " + this.options.classes.startBtn);
            this._$nextBtn = this._$wrapper.find(this.QUERY_ACTION_NEXT)
                .addClass(this.options.classes.button + " " + this.options.classes.nextBtn);
            this._$prevBtn = this._$wrapper.find(this.QUERY_ACTION_PREV)
                .addClass(this.options.classes.button + " " + this.options.classes.prevBtn);
            this._$endBtn = this._$wrapper.find(this.QUERY_ACTION_END)
                .addClass(this.options.classes.button + " " + this.options.classes.endBtn);
            this._$result = this._$wrapper.find(this.QUERY_RESULT)
                .addClass(this.options.classes.result);
            this._$result.hide();
            //this._$body.hide().detach();
        },
        /**
         * Obtiene y estructura los datos de las preguntas indicadas
         * @param $questions
         * @returns {Array}
         * @private
         */
        _mapQuestions: function () {
            //if the options has checkbox, the questionnaire is multichoice
            var $options = this._$questions.find(this.QUERY_OPTION)
                .find(":checkbox");
            //ensure the type of the inputs
            if ($options.length > 0) {
                $options.attr("type", "checkbox");
                this.options.multichoice = true;
                this.element.addClass(this.options.classes.multichoice);
            }
            else {
                $options.attr("type", "radio");
            }
            var $questions = this._$questions, questions = [], questionsMap = {}, maxScore = 0;
            //map each question
            for (var questionIndex = 0, $questionsLength = $questions.length; questionIndex < $questionsLength; questionIndex++) {
                var $current = $($questions[questionIndex]), parsedQuestion = this._mapQuestion($current);
                questions.push(parsedQuestion);
                questionsMap[parsedQuestion.id] = questionIndex;
                maxScore += parsedQuestion.pointsForSuccess; //increment the max score
            }
            this._questions = questions;
            this._questionsMap = questionsMap;
            this._maxScore = maxScore;
            this._setOption("maxScore", maxScore);
        },
        /**
         * Obtiene y estructura los datos de la pregunta indicada
         * @param $question
         * @returns {Array}
         * @private
         */
        _mapQuestion: function ($question) {
            var $optionsWrapper = $question.find(this.QUERY_OPTIONS), $options = $optionsWrapper.find(this.QUERY_OPTION), name = $options.first()
                .find("input")
                .attr("name"), pointsForSuccess = $question.data(this.ATTR_POINTS_FOR_SUCCESS), pointsForFail = $question.data(this.ATTR_POINTS_FOR_FAIL), _a = this._mapOptions($options), arr = _a.arr, map = _a.map, $feedback = $question.find(this.QUERY_FEEDBACK)
                .not(this.QUERY_OPTION + " " + this.QUERY_FEEDBACK), //feedback of question that are not inside of an option
            id;
            $feedback.hide();
            $question.removeAttr(this.ATTR_POINTS_FOR_FAIL);
            $question.removeAttr(this.ATTR_POINTS_FOR_SUCCESS);
            $question.uniqueId();
            id = $question.attr("id");
            //ensure the same name for the fields
            name = name != undefined ? name : id;
            $options.find("input")
                .attr("name", name);
            var question = {
                id: id,
                $element: $question,
                $optionsWrapper: $optionsWrapper,
                $options: $options,
                options: arr,
                optionsMap: map,
                pointsForSuccess: pointsForSuccess != undefined ? pointsForSuccess : this.options.pointsForSuccess,
                pointsForFail: pointsForFail != undefined ? pointsForFail : this.options.pointsForFail
            };
            //store the feedback founded by type
            for (var _i = 0, $feedback_1 = $feedback; _i < $feedback_1.length; _i++) {
                var feedback = $feedback_1[_i];
                var $feedback_2 = $(feedback), type = $feedback_2.attr(this.ATTR_FEEDBACK);
                switch (type) {
                    case this.FEEDBACK_TYPES.ok:
                        question.$feedbackOk = $feedback_2;
                        break;
                    case this.FEEDBACK_TYPES.ko:
                        question.$feedbackKo = $feedback_2;
                        break;
                    default:
                        question.$feedback = $feedback_2;
                        break;
                }
            }
            question.$feedbackOk = question.$feedbackOk || question.$feedback || $(null);
            question.$feedbackKo = question.$feedbackKo || question.$feedback || $(null);
            return question;
        },
        /**
         * Obtiene y estructura los datos de las opciones indicadas
         * @param $options
         * @returns {Array}
         * @private
         */
        _mapOptions: function ($options) {
            var parsedOptions = [], parsedOptionsMap = {};
            for (var optionIndex = 0, $optionsLength = $options.length; optionIndex < $optionsLength; optionIndex++) {
                var $current = $($options[optionIndex]), parsedOption = this._mapOption($current);
                parsedOptions.push(parsedOption);
                parsedOptionsMap[parsedOption.id] = optionIndex;
            }
            return { arr: parsedOptions, map: parsedOptionsMap };
        },
        /**
         *  Obtiene y estructura los datos de la opcion indicada
         * @param $option
         * @returns {{$element: any, isCorrect: boolean}}
         * @private
         */
        _mapOption: function ($option) {
            var isCorrect = !!$option.data(this.IS_CORRECT), //get if is the correct option
            id, $feedback = $option.find(this.QUERY_FEEDBACK);
            //store the feedback founded by type
            $option.removeAttr(this.ATTR_IS_CORRECT);
            $option.uniqueId();
            id = $option.attr("id");
            var option = {
                id: id,
                $element: $option,
                isCorrect: isCorrect
            };
            for (var _i = 0, $feedback_3 = $feedback; _i < $feedback_3.length; _i++) {
                var feedback = $feedback_3[_i];
                var $feedback_4 = $(feedback), type = $feedback_4.attr(this.ATTR_FEEDBACK);
                switch (type) {
                    case this.FEEDBACK_TYPES.ok:
                        option.$feedbackOk = $feedback_4;
                        break;
                    case this.FEEDBACK_TYPES.ko:
                        option.$feedbackKo = $feedback_4;
                        break;
                    default:
                        option.$feedback = $feedback_4;
                        break;
                }
            }
            option.$feedbackOk = option.$feedbackOk || option.$feedback || $(null);
            option.$feedbackKo = option.$feedbackKo || option.$feedback || $(null);
            $feedback.hide();
            return option;
        },
        _assignEvents: function () {
            this._$startBtn.off(this.NAMESPACE)
                .on("click." + this.NAMESPACE, { instance: this }, this._onStartButtonClick);
            this._$endBtn.off(this.NAMESPACE)
                .on("click." + this.NAMESPACE, { instance: this }, this._onEndButtonClick);
            this._$nextBtn.off(this.NAMESPACE)
                .on("click." + this.NAMESPACE, { instance: this }, this._onNextButtonClick);
            this._$prevBtn.off(this.NAMESPACE)
                .on("click." + this.NAMESPACE, { instance: this }, this._onPrevButtonClick);
            //this._$questions.off(this.NAMESPACE).on(`click.${this.NAMESPACE}`, {instance: this}, this._onOptionClick);
            this._$questions.off(this.NAMESPACE)
                .on("change." + this.NAMESPACE, { instance: this }, this._onOptionChange);
        },
        /**
         * Invocado al pulsarse el botón start. Comienza el cuestionario
         * @param e
         * @private
         */
        _onStartButtonClick: function (e) {
            e.preventDefault();
            e.data.instance.start();
        },
        /**
         * Invocado al pulsarse el botón end. Finaliza el cuestionario
         * @param e
         * @private
         */
        _onEndButtonClick: function (e) {
            e.preventDefault();
            e.data.instance.end();
        },
        /**
         * Invocado al pulsarse el botón siguiente.
         * @param e
         * @private
         */
        _onNextButtonClick: function (e) {
            e.preventDefault();
            e.data.instance.next();
        },
        /**
         * Invocado al pulsarse el botón anterior.
         * @param e
         * @private
         */
        _onPrevButtonClick: function (e) {
            e.preventDefault();
            e.data.instance.prev();
        },
        /**
         * Obtiene la calificación del cuestionario
         * @returns
         * {
         *       maxScore:number;
         *       score:number;
         *       percentage:number;
         *       questionsSuccess:number;
         *       questionsFail:number;
         *       questionsNotAttempted:number;
         *       success:boolean;
         * }
         * @private
         */
        _calificate: function () {
            var currentScore = 0, maxScore = this._maxScore, runtime = this._runtime, questions = this._questions, calification, nSuccess = 0, nFails = 0;
            if (this.options.multichoice != true) {
                var result = this._calificateSingleChoice();
                nSuccess = result.nSuccess;
                nFails = result.nFails;
                currentScore = result.score;
            }
            else {
                var result = this._calificateMultiChoice();
                nSuccess = result.nSuccess;
                nFails = result.nFails;
                currentScore = result.score;
            }
            calification = {
                maxScore: maxScore,
                score: currentScore,
                percentage: (currentScore * 100) / maxScore,
                questionsSuccess: nSuccess,
                questionsFail: nFails,
                questionsNotAttempted: questions.length - (nSuccess + nFails)
            };
            calification.success = calification.percentage >= this.options.cutOffMark;
            return calification;
        },
        _calificateSingleChoice: function () {
            var currentScore = 0, runtime = this._runtime, questions = this._questions, nSuccess = 0, nFails = 0;
            //for each question
            for (var questionIndex = 0, questionsLength = questions.length; questionIndex < questionsLength; questionIndex++) {
                var currentQuestion = questions[questionIndex], questionRuntime = runtime[currentQuestion.id], //get runtime for question
                result = this._calificateSingleChoiceQuestion(currentQuestion.id);
                //if runtime exists, the question has been answered
                if (result != undefined) {
                    //if correct
                    if (result) {
                        currentScore += currentQuestion.pointsForSuccess;
                        nSuccess++;
                    }
                    else {
                        nFails++;
                        //check if is possible substract points
                        if (currentScore >= currentQuestion.pointsForFail) {
                            currentScore -= currentQuestion.pointsForFail;
                        }
                    }
                }
            }
            return {
                nSuccess: nSuccess,
                nFails: nFails,
                score: currentScore
            };
        },
        _calificateSingleChoiceQuestion: function (questionId) {
            var question = this.getQuestionById(questionId), result;
            if (question) {
                var questionRuntime = this._runtime[question.id]; //get runtime for question
                //if runtime exists, the question has been answered
                if (questionRuntime && questionRuntime.options.length > 0) {
                    var questionOptions = question.options, //get the options of the question
                    questionOptionsMap = question.optionsMap, //get the options map of the question
                    selectedOptionId = questionRuntime.options[0], //get the id of the selected question
                    selectedOption = questionOptions[questionOptionsMap[selectedOptionId]];
                    //if correct
                    result = selectedOption.isCorrect;
                    questionRuntime.isCorrect = result;
                }
            }
            return result;
        },
        _calificateMultiChoiceQuestion: function (questionId) {
            var question = this.getQuestionById(questionId), result;
            if (question) {
                var questionRuntime = this._runtime[question.id]; //get runtime for question
                if (questionRuntime) {
                    var questionOptions = question.options, //get the options of the question
                    selectedOptions = questionRuntime.options, //get selected options
                    nCorrectOptionsSelected = 0, //count the success options of the question
                    nCorrectOptions = 0, nIncorrectOptionsSelected = 0;
                    //check if the correct options are all checked
                    for (var questionOptionIndex = 0, questionOptionsLength = questionOptions.length; questionOptionIndex < questionOptionsLength; questionOptionIndex++) {
                        var currentQuestionOption = questionOptions[questionOptionIndex], checked = selectedOptions.indexOf(currentQuestionOption.id) != -1; //is checked
                        if (currentQuestionOption.isCorrect) {
                            nCorrectOptions++; //increase total
                            nCorrectOptionsSelected += checked ? 1 : 0; //increase selected
                        }
                        else {
                            if (checked) {
                                nIncorrectOptionsSelected++;
                                questionOptionIndex = questionOptionsLength;
                            }
                        }
                    }
                    //check if the correct options are all checked
                    result = nIncorrectOptionsSelected == 0 && nCorrectOptionsSelected == nCorrectOptions;
                    questionRuntime.isCorrect = result;
                }
            }
            return result;
        },
        _calificateMultiChoice: function () {
            var currentScore = 0, runtime = this._runtime, questions = this._questions, nSuccess = 0, nFails = 0;
            //for each question
            for (var questionIndex = 0, questionsLength = questions.length; questionIndex < questionsLength; questionIndex++) {
                var currentQuestion = questions[questionIndex], questionRuntime = runtime[currentQuestion.id], //get runtime for question
                result = this._calificateMultiChoiceQuestion(currentQuestion.id);
                //if runtime exists, the question has been answered
                if (result != undefined) {
                    //check if the correct options are all checked
                    if (result) {
                        nSuccess++;
                        currentScore += currentQuestion.pointsForSuccess;
                    }
                    else {
                        nFails++;
                        if (currentScore >= currentQuestion.pointsForFail) {
                            currentScore -= currentQuestion.pointsForFail;
                        }
                    }
                }
            }
            return {
                nSuccess: nSuccess,
                nFails: nFails,
                score: currentScore
            };
        },
        _showOptionStatus: function (questionId, optionId) {
            var question = this.getQuestionById(questionId);
            if (question) {
                var runtime = this._runtime[question.id], option = question.options[question.optionsMap[optionId]];
                if (runtime && option) {
                    var selected = runtime.options.indexOf(optionId) != -1;
                    //if the option is selected
                    if (selected) {
                        option.$element.addClass(option.isCorrect
                            ? this.options.classes.questionCorrect
                            : this.options.classes.questionIncorrect);
                    }
                    else {
                        option.$element.addClass(option.isCorrect ? this.options.classes.questionIncorrect : "");
                    }
                }
                else {
                    option.$element.addClass(option.isCorrect ? this.options.classes.questionIncorrect : "");
                }
            }
        },
        /**
         * Aplica la clase correspondiente al estado de la pregunta.
         * Si la respuesta indicada es correcta añade la clase CLASS_QUESTION_CORRECT
         * Si la respuesta indicada es incorrecta añade la clase CLASS_QUESTION_INCORRECT
         * @param {String}      questionId      Id de la pregunta a actualizar
         * @private
         */
        _showQuestionStatus: function (questionId) {
            var question = this.getQuestionById(questionId);
            if (question) {
                var runtime = this._runtime[question.id];
                if (runtime && runtime.option != undefined) {
                    var options = question.options;
                    if (runtime.isCorrect) {
                        question.$element.addClass(this.options.classes.questionCorrect);
                    }
                    else {
                        question.$element.addClass(this.options.classes.questionIncorrect);
                    }
                    for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
                        var currentOption = options_1[_i];
                        if (currentOption.isCorrect) {
                            currentOption.$element.addClass(this.options.classes.questionCorrect);
                        }
                        else {
                            currentOption.$element.addClass(this.options.classes.questionIncorrect);
                        }
                    }
                }
            }
        },
        _showOptionFeedback: function (questionId, optionId) {
            var question = this.getQuestionById(questionId);
            if (question) {
                var runtime = this._runtime[question.id], option = question.options[question.optionsMap[optionId]];
                if (runtime && option) {
                    var selected = runtime.options.indexOf(optionId) != -1;
                    if (selected) {
                        if (option.isCorrect) {
                            option.$feedbackKo.hide();
                            option.$feedbackOk.show();
                        }
                        else {
                            option.$feedbackOk.hide();
                            option.$feedbackKo.show();
                        }
                    }
                }
            }
        },
        /**
         * Muestra el feedback de una pregunta
         * @param {String}  questionId      Id de la pregunta
         * @private
         */
        _showQuestionFeedback: function (questionId) {
            var question = this.getQuestionById(questionId);
            if (question) {
                var runtime = this._runtime[question.id];
                if (runtime && runtime != undefined) {
                    //todo add control of multi choice
                    var option = this.getOptionById(questionId, runtime.options[0]);
                    if (option.isCorrect) {
                        question.$feedbackKo.hide();
                        question.$feedbackOk.show();
                    }
                    else {
                        question.$feedbackOk.hide();
                        question.$feedbackKo.show();
                    }
                }
            }
        },
        /**
         * Deshabilita todos los campos de una pregunta
         * @param {String}  questionId      Id de la pregunta para la cual deshabilitar los campos
         * @private
         */
        _disableQuestionOptionsField: function (questionId) {
            var question = this.getQuestionById(questionId);
            if (question) {
                if (this.options.multichoice && this._state == this.STATES.running) {
                    question.$element.find(":checked")
                        .attr("disabled", "disabled");
                }
                else {
                    question.$element.find("input")
                        .attr("disabled", "disabled");
                }
            }
        },
        _onOptionClick: function (e) {
            var instance = e.data.instance, $question = $(this), //the event handler it's attached to the question
            questionId = $question.attr("id"), questionRuntime = instance._runtime[questionId] || {};
            if (instance.options.immediateFeedback === true && questionRuntime.option != undefined) {
                e.preventDefault();
            }
        },
        /**
         * Invocado al cambiar el valor de una opción.
         * Registra en el runtime de la pregunta la opción seleccionada.
         * Si se establece immediateFeedback a true, se deshabilitan los campos, se actualiza el status y se muestra el feedback
         * Si se establece immediateFeedback a false, se avanza a la siguiente pregunta automáticamente
         * @param e
         * @private
         */
        _onOptionChange: function (e) {
            var instance = e.data.instance;
            if (instance.options.disabled != true && instance._state == instance.STATES.running) {
                var $option = $(e.target)
                    .parents(instance.QUERY_OPTION), $question = $(this), //the event handler it's attached to the question
                questionId = $question.attr("id"), questionRuntime = instance._runtime[questionId] || {}, options = questionRuntime.options || [], optionId = $option.attr("id");
                questionRuntime.options = options;
                instance._runtime[questionId] = questionRuntime;
                if (instance.options.multichoice) {
                    //if item is selected
                    if (e.target.checked) {
                        //add
                        options.push(optionId);
                        $option.addClass(instance.CLASS_SELECTED);
                    }
                    else {
                        //remove
                        instance._resetOption(questionId, optionId);
                        options.splice(options.indexOf(optionId), 1);
                    }
                    instance._calificateMultiChoiceQuestion(questionId);
                }
                else {
                    if (questionRuntime.options.length > 0) {
                        instance._resetOption(questionId, questionRuntime.options[0]);
                    }
                    options[0] = optionId;
                    $option.addClass(instance.CLASS_SELECTED);
                    instance._calificateSingleChoiceQuestion(questionId);
                }
                //go next if isn't immediateFeedback and isnt multichoice
                if (instance.options.immediateFeedback == true) {
                    if (instance.options.disableOptionAfterSelect == true) {
                        instance._disableQuestionOptionsField(questionId);
                    }
                    else if (instance.options.disableNextUntilSuccess == true) {
                        instance._updateNavigationActionsStates();
                    }
                    instance._showQuestionStatus(questionId);
                    instance._showOptionStatus(questionId, optionId);
                    instance._showOptionFeedback(questionId, optionId);
                    instance._showQuestionFeedback(questionId, optionId);
                }
                else if (instance.options.autoGoNext != false) {
                    if (instance.options.multichoice != true) {
                        setTimeout(function () {
                            instance.next();
                        }, instance.options.delayOnAutoNext);
                    }
                }
                instance.element.triggerHandler(instance.ON_OPTION_CHANGE, [this, questionId, optionId]);
            }
        },
        _resetOption: function (questionId, optionId) {
            var question = this.getQuestionById(questionId);
            if (question) {
                var option = question.options[question.optionsMap[optionId]];
                if (option) {
                    option.$feedbackKo.hide();
                    option.$feedbackOk.hide();
                    option.$element.removeClass(this.options.classes.selected + " " + this.options.classes.questionCorrect + " " + this.options.classes.questionIncorrect);
                }
            }
        },
        _setOption: function (key, value) {
            this._super(key, value);
        },
        /**
         * Ejecuta la animación para ocultar una pregunta.
         * Lanza el evento ON_QUESTION_HIDE. Si el evento devuelve una promesa, no se ejecuta la animación por defecto y en su lugar espera a que se complete la promesa devuelta
         * @param {JQuery}  questionToHide  Pregunta a ocultar
         * @returns {JQueryPromise<T>}  Promesa resulta al finalizarse la animación
         * @private
         */
        _hide: function (questionToHide) {
            var _this = this;
            var hideDefer = $.Deferred();
            var result = this.element.triggerHandler(this.ON_QUESTION_HIDE, [this, questionToHide]);
            //if the event returns a promise
            if (result != undefined && result.hasOwnProperty("then")) {
                //waits for the promise to continue
                result.then(function () {
                    hideDefer.resolveWith(_this);
                });
            }
            else {
                questionToHide.fadeOut(400, function () {
                    hideDefer.resolveWith(_this);
                });
            }
            return hideDefer.promise();
        },
        /**
         * Ejecuta la animación para mostrar una pregunta.
         * Lanza el evento ON_QUESTION_SHOW. Si el evento devuelve una promesa, no se ejecuta la animación por defecto y en su lugar espera a que se complete la promesa devuelta
         * @param {JQuery}  questionToShow  Pregunta a ocultar
         * @returns {JQueryPromise<T>}  Promesa resulta al finalizarse la animación
         * @private
         */
        _show: function (nextQuestion) {
            var _this = this;
            var showDefer = $.Deferred();
            var result = this.element.triggerHandler(this.ON_QUESTION_SHOW, [this, nextQuestion]);
            if (result != undefined && result.hasOwnProperty("then")) {
                result.then(function () {
                    showDefer.resolveWith(_this);
                });
            }
            else {
                nextQuestion.fadeIn(400, function () {
                    showDefer.resolveWith(_this);
                });
            }
            return showDefer.promise();
        },
        /**
         * Invocado al finalizarse la animación de ocultar cabecera.
         * @param defer
         * @private
         */
        _onHeaderHidden: function (defer) {
            //this._$header = this._$header.detach();
            defer.resolveWith(this);
        },
        /**
         * Ejecuta la animación para ocultar la cabecera
         * Lanza el evento ON_HEADER_HIDE. Si el evento devuelve una promesa, no se ejecuta la animación por defecto y en su lugar espera a que se complete la promesa devuelta
         * @returns {JQueryPromise<T>}
         * @private
         */
        _hideHeader: function () {
            var defer = $.Deferred();
            var result = this.element.triggerHandler(this.ON_HEADER_HIDE, [this, this._$header]);
            if (result != undefined && result.hasOwnProperty("then")) {
                result.then(this._onHeaderHidden.bind(this, defer));
            }
            else {
                this._$header.fadeOut(400, this._onHeaderHidden.bind(this, defer));
            }
            return defer.promise();
        },
        /**
         * Ejecuta la animación para mostrar la cabecera
         * Lanza el evento ON_HEADER_SHOW. Si el evento devuelve una promesa, no se ejecuta la animación por defecto y en su lugar espera a que se complete la promesa devuelta
         * @returns {JQueryPromise<T>}
         * @private
         */
        _showHeader: function () {
            var _this = this;
            var defer = $.Deferred();
            //this._$wrapper.prepend(this._$header);
            var result = this.element.triggerHandler(this.ON_HEADER_SHOW, [this, this._$header]);
            if (result != undefined && result.hasOwnProperty("then")) {
                result.then(function () {
                    defer.resolveWith(_this);
                });
            }
            else {
                this._$header.fadeIn(400, function () {
                    defer.resolveWith(_this);
                });
            }
            return defer.promise();
        },
        /**
         * Invocado al ocultarse el cuerpo
         * @param {JQueryDeferred}  defer       Deferred a resolver
         * @private
         */
        _onBodyHidden: function (defer) {
            //this._$body = this._$body.detach();
            defer.resolveWith(this);
        },
        /**
         * Ejecuta la animación para ocultar el cuerpo
         * Lanza el evento ON_BODY_HIDE. Si el evento devuelve una promesa, no se ejecuta la animación por defecto y en su lugar espera a que se complete la promesa devuelta
         * @returns {JQueryPromise<T>}
         * @private
         */
        _hideBody: function () {
            var defer = $.Deferred();
            var result = this.element.triggerHandler(this.ON_BODY_HIDE, [this, this._$body]);
            if (result != undefined && result.hasOwnProperty("then")) {
                result.then(this._onBodyHidden.bind(this, defer));
            }
            else {
                this._$body.fadeOut(400, this._onBodyHidden.bind(this, defer));
            }
            return defer.promise();
        },
        /**
         * Ejecuta la animación para mostrar el cuerpo
         * Lanza el evento ON_BODY_SHOW. Si el evento devuelve una promesa, no se ejecuta la animación por defecto y en su lugar espera a que se complete la promesa devuelta
         * @returns {JQueryPromise<T>}
         * @private
         */
        _showBody: function () {
            var _this = this;
            var defer = $.Deferred();
            //this._$wrapper.prepend(this._$body);
            var result = this.element.triggerHandler(this.ON_BODY_SHOW, [this, this._$body]);
            if (result != undefined && result.hasOwnProperty("then")) {
                result.then(function () {
                    defer.resolveWith(_this);
                });
            }
            else {
                this._$body.fadeIn(400, function () {
                    defer.resolveWith(_this);
                });
            }
            return defer.promise();
        },
        /**
         * Ejecuta la animación de comienzo.
         * @returns {JQueryPromise<T>}
         * @private
         */
        _animationStart: function () {
            var _this = this;
            var defer = $.Deferred(), that = this;
            this._hideHeader()
                .then(function () {
                _this._showBody()
                    .then(function () {
                    defer.resolveWith(that);
                });
            });
            return defer.promise();
        },
        /**
         * Ejecuta la animación de finalización.
         * @returns {JQueryPromise<T>}
         * @private
         */
        _animationStop: function () {
            var _this = this;
            var defer = $.Deferred(), that = this;
            this._hideBody()
                .then(function () {
                _this._showHeader()
                    .then(function () {
                    defer.resolveWith(that);
                });
            });
            return defer.promise();
        },
        /**
         * Deshabilita el botón finalizar
         * @private
         */
        _disableEnd: function () {
            this._$endBtn.prop("disabled", true);
            this._$endBtn.addClass(this.options.classes.disabled);
        },
        /**
         * Habilita el botón finalizar
         * @private
         */
        _enableEnd: function () {
            this._$endBtn.prop("disabled", false);
            this._$endBtn.removeClass(this.options.classes.disabled);
        },
        /**
         * Deshabilita el botón anterior
         * @private
         */
        _disablePrev: function () {
            this._$prevBtn.prop("disabled", true);
            this._$prevBtn.addClass(this.options.classes.disabled);
        },
        /**
         * Habilita el botón anterior
         * @private
         */
        _enablePrev: function () {
            this._$prevBtn.prop("disabled", false);
            this._$prevBtn.removeClass(this.options.classes.disabled);
        },
        /**
         * Deshabilita el botón siguiente
         * @private
         */
        _disableNext: function () {
            this._$nextBtn.prop("disabled", true);
            this._$nextBtn.addClass(this.options.classes.disabled);
        },
        /**
         * Habilita el botón siguiente
         * @private
         */
        _enableNext: function () {
            this._$nextBtn.prop("disabled", false);
            this._$nextBtn.removeClass(this.options.classes.disabled);
        },
        /**
         * Invocado al finalizar la animación  de comienzo. Avanza a la primera página y lanza el evento ON_START
         * @returns {JQueryPromise<T>}
         * @private
         */
        _onAnimationStartEnd: function () {
            this.goTo(0);
            this.element.trigger(this.ON_STARTED, [this]);
        },
        /**
         * Invocado al finalizarse la animación de finalización. Resetea el cuestionario
         * @private
         */
        _onAnimationEndEnd: function () {
            this.reset();
        },
        /**
         * Invocado al finalizar la transición entre preguntas. Actualiza el estado de los botónes de navegación y lanza el evento ON_TRANSITION_END
         * @param oldPage
         * @param newPage
         * @param defer
         * @private
         */
        _onQuestionTransitionEnd: function (oldPage, newPage, defer) {
            this._updateNavigationActionsStates();
            defer.resolveWith(this);
            this.element.triggerHandler(this.ON_TRANSITION_END, [this, oldPage, newPage]);
        },
        /**
         * Resuelve los estados de las acciones de navegación
         * @private
         */
        _updateNavigationActionsStates: function () {
            var question = this.getQuestionByIndex(this._currentQuestionIndex), questionRuntime = this._runtime[question.id];
            if (this._currentQuestionIndex === 0) {
                this._disablePrev();
                this._enableNext();
            }
            else if (this._currentQuestionIndex === this._questions.length - 1) {
                this._disableNext();
                this._enablePrev();
            }
            else {
                this._enablePrev();
                this._enableNext();
            }
            if (this.options.immediateFeedback == true && this.options.disableOptionAfterSelect != true) {
                if (this.options.disableNextUntilSuccess == true && (questionRuntime == undefined || questionRuntime.isCorrect != true)) {
                    this._disableNext();
                }
                switch (this.options.disableEndActionUntil) {
                    case this.DISABLE_END.beforeAnswerAll:
                        Object.keys(this._runtime) == this._questions.length;
                        break;
                    case this.DISABLE_END.beforeAnswerAllCorrect:
                        var correct = 0, runtime = this._runtime;
                        for (var questionId in runtime) {
                            var questionRuntime_1 = runtime[questionId];
                            if (questionRuntime_1.isCorrect) {
                                correct++;
                            }
                        }
                        if (correct == this._questions.length) {
                            this._enableEnd();
                        }
                        else {
                            this._disableEnd();
                        }
                        break;
                }
            }
        },
        /**
         * Invocado al finalizar de ver el resultado. Establece el estado del cuestionario a off
         * @param e
         * @private
         */
        _onEndShowResult: function (e) {
            var instance = e.data.instance;
            instance.end();
        },
        /**
         * Obtiene los puntos máximos que se puede alcanzar en el questionario
         * @returns {any}
         */
        getMaxPoints: function () {
            return this._maxScore;
        },
        /**
         * Obtiene el id del cuestionario
         * @returns {string}
         */
        getId: function () {
            return this.element.attr("id");
        },
        /**
         * Avanza a la siguiente pregunta.
         * @returns {JQueryPromise<T>|null} Si la navegación se realiza, devuelve una promesa que será resuelta al finalizar la transición
         */
        next: function () {
            if (this._currentQuestionIndex != undefined) {
                return this.goTo(this._currentQuestionIndex + 1);
            }
            else {
                return this.goTo(0);
            }
        },
        /**
         * Retrocede a la pregunta anterior
         * @returns {JQueryPromise<T>|null} Si la navegación se realiza, devuelve una promesa que será resuelta al finalizar la transición
         */
        prev: function () {
            if (this._currentQuestionIndex != undefined) {
                return this.goTo(this._currentQuestionIndex - 1);
            }
            else {
                return this.goTo(0);
            }
        },
        /**
         * Navega a una pregunta en concreto
         * @returns {JQueryPromise<T>|null} Si la navegación se realiza, devuelve una promesa que será resuelta al finalizar la transición
         */
        goTo: function (questionIndex) {
            var _this = this;
            var promise;
            if (this._state === this.STATES.running || this._state == this.STATES.review) {
                var nextQuestion_1 = this._questions[questionIndex], currentQuestionIndex = this._currentQuestionIndex, currentQuestion_1 = this._questions[currentQuestionIndex];
                //ensure that next question exists and it's different of the current question
                if (nextQuestion_1 != undefined && (currentQuestion_1 == undefined || currentQuestion_1 != nextQuestion_1)) {
                    var defer_1 = $.Deferred();
                    promise = defer_1.promise();
                    //prevent navigation during transition
                    this._disableNext();
                    this._disablePrev();
                    //store question index
                    this._currentQuestionIndex = questionIndex;
                    if (questionIndex == this._questions.length - 1) {
                        this.element.removeClass(this.options.classes.firstQuestion);
                        this.element.addClass(this.options.classes.lastQuestion);
                    }
                    else if (questionIndex == 0) {
                        this.element.removeClass(this.options.classes.lastQuestion);
                        this.element.addClass(this.options.classes.firstQuestion);
                    }
                    else {
                        this.element.removeClass(this.options.classes.firstQuestion);
                        this.element.removeClass(this.options.classes.lastQuestion);
                    }
                    this.element.attr(this.ATTR_CURRENT_QUESTION, questionIndex);
                    //if current question exists
                    if (currentQuestion_1) {
                        //hide the current question and then show the next
                        this._hide(currentQuestion_1.$element)
                            .then(function () {
                            _this._show(nextQuestion_1.$element)
                                .then(_this._onQuestionTransitionEnd.bind(_this, currentQuestion_1, nextQuestion_1, defer_1));
                        });
                    }
                    else {
                        //if current quesiton doesn't exists
                        this._show(nextQuestion_1.$element)
                            .then(this._onQuestionTransitionEnd.bind(this, currentQuestion_1, nextQuestion_1, defer_1));
                    }
                }
            }
            return promise;
        },
        /**
         * Obtiene las preguntas
         * @returns {any}
         */
        getQuestions: function () {
            return this._questions;
        },
        /**
         * Obtiene una pregunta por índice
         * @param index
         * @returns {any}
         */
        getQuestionByIndex: function (index) {
            return this._questions[index];
        },
        /**
         * Obtiene una pregunta por su id
         * @param id
         * @returns {any}
         */
        getQuestionById: function (id) {
            return this.getQuestionByIndex(this._questionsMap[id]);
        },
        /**
         * Obtiene las opciones de una pregunta
         * @param questionId
         * @returns {any}
         */
        getOptions: function (questionId) {
            return (this.getQuestionById(questionId) || {}).options;
        },
        /**
         * Obtiene una opción por índice para una pregunta
         * @param questionId
         * @param optionIndex
         * @returns {any}
         */
        getOptionByIndex: function (questionId, optionIndex) {
            var options = this.getOptions(questionId), option;
            if (options) {
                option = options[optionIndex];
            }
            return option;
        },
        /**
         * Obtiene una opción por id para una pregunta en concreto
         * @param questionId
         * @param optionId
         * @returns {any}
         */
        getOptionById: function (questionId, optionId) {
            var question = this.getQuestionById(questionId), option;
            if (question) {
                option = question.options[question.optionsMap[optionId]];
            }
            return option;
        },
        update: function () {
        },
        /**
         * Resetea el formulario
         */
        reset: function () {
            this._runtime = {};
            this.element.removeAttr(this.ATTR_CURRENT_QUESTION);
            this.element.removeClass(this.options.classes.firstQuestion);
            this.element.removeClass(this.options.classes.lastQuestion);
            this._$questions.hide();
            this._$questions.first()
                .show();
            this._$questions.find("input")
                .prop("checked", false)
                .removeAttr("disabled");
            this.element.find(this.QUERY_FEEDBACK)
                .hide();
            this.element.find("." + this.options.classes.questionCorrect)
                .removeClass(this.options.classes.questionCorrect);
            this.element.find("." + this.options.classes.questionIncorrect)
                .removeClass(this.options.classes.questionIncorrect);
            this.element.find("." + this.options.classes.selected)
                .removeClass(this.options.classes.selected);
        },
        /**
         * Comienza el cuestionario
         */
        start: function () {
            if (this.options.disabled != true && this._state === this.STATES.off) {
                this._changeState(this.STATES.running);
                this.element.trigger(this.ON_START, [this]);
                this._runtime = {};
                this._animationStart()
                    .then(this._onAnimationStartEnd);
            }
        },
        /**
         * Muestra el resultado del cuestionario
         * @param calification
         */
        showResult: function (calification) {
            if (calification && this.options.showResult && this._$result) {
                this._changeState(this.STATES.result);
                this._renderVar(this.QUERY_RENDER_RESULT, "jqQuestionnaireResultItem", calification, this._$result);
                this._$result.dialog(this.options.dialog)
                    .one("dialogclose", { instance: this }, this._onEndShowResult);
                return true;
            }
            return false;
        },
        /**
         * Muestra la corrección del cuestionario
         * @returns {boolean}
         */
        showCorrection: function () {
            if (this.options.showCorrection) {
                var questions = this._questions;
                for (var questionIndex = 0, questionsLength = questions.length; questionIndex < questionsLength; questionIndex++) {
                    var currentQuestion = questions[questionIndex], options = currentQuestion.options;
                    for (var optionIndex = 0, optionsLength = options.length; optionIndex < optionsLength; optionIndex++) {
                        var currentOption = options[optionIndex];
                        this._showOptionStatus(currentQuestion.id, currentOption.id);
                    }
                    this._disableQuestionOptionsField(currentQuestion.id);
                }
                this._changeState(this.STATES.review);
                this.goTo(0);
                return true;
            }
            else {
                return false;
            }
        },
        _disableAllQuestions: function () {
            var questions = this._questions;
            for (var questionIndex = 0, questionsLength = questions.length; questionIndex < questionsLength; questionIndex++) {
                var currentQuestion = questions[questionIndex];
                this._disableQuestionOptionsField(currentQuestion.id);
            }
        },
        /**
         * Finaliza el cuestionario
         */
        end: function () {
            //if its running
            if (this._state === this.STATES.running) {
                //calificate
                var calification = this._calificate();
                this.lastCalification = calification;
                this._disableAllQuestions();
                //if show result is disabled
                if (!this.showResult(calification)) {
                    //if show correction
                    if (!this.showCorrection()) {
                        this._changeState(this.STATES.off);
                        this._animationStop()
                            .then(this._onAnimationEndEnd);
                        this.element.trigger(this.ON_END, [this, calification]);
                    }
                }
                return calification;
                //if its with result
            }
            else if (this._state == this.STATES.result) {
                //if show correction is distabled
                if (!this.showCorrection()) {
                    this._changeState(this.STATES.off);
                    this._animationStop()
                        .then(this._onAnimationEndEnd);
                    this.element.trigger(this.ON_END, [this, this.lastCalification]);
                }
                return this.lastCalification;
                //if its reviewing
            }
            else if (this._state == this.STATES.review) {
                this._changeState(this.STATES.off);
                this.element.trigger(this.ON_END, [this, this.lastCalification]);
                this._animationStop()
                    .then(this._onAnimationEndEnd);
                return this.lastCalification;
            }
        },
        _changeState: function (state) {
            switch (state) {
                case this.STATES.review:
                    this._state = state;
                    this.element.removeClass(this.options.classes.stateRunning + " " + this.options.classes.stateResult);
                    this.element.addClass(this.options.classes.stateReview);
                    break;
                case this.STATES.running:
                    this._state = state;
                    this.element.removeClass(this.options.classes.stateReview + " " + this.options.classes.stateResult);
                    this.element.addClass(this.options.classes.stateRunning);
                    break;
                case this.STATES.result:
                    this._state = state;
                    this.element.removeClass(this.options.classes.stateReview + " " + this.options.classes.stateRunning);
                    this.element.addClass(this.options.classes.stateResult);
                    break;
                case this.STATES.off:
                    this.element.removeClass(this.options.classes.stateResult + " " + this.options.classes.stateReview + " " + this.options.classes.stateRunning);
                    this._state = state;
                    break;
            }
        },
        destroy: function () {
            this._$wrapper.removeClass(this.options.classes.wrapper);
            this._$header.removeClass(this.options.classes.header);
            this._$body.removeClass(this.options.classes.body);
            this._$body.show();
            this._$properties.removeClass(this.options.classes.properties);
            this._$questionsWrapper.removeClass(this.options.classes.questions);
            this._$questions.removeClass(this.options.classes.question);
            this._$questions.show();
            this._$startBtn.removeClass(this.options.classes.button + " " + this.options.classes.startBtn);
            this._$nextBtn.removeClass(this.options.classes.button + " " + this.options.classes.nextBtn);
            this._$prevBtn.removeClass(this.options.classes.button + " " + this.options.classes.prevBtn);
            this._$endBtn.removeClass(this.options.classes.button + " " + this.options.classes.endBtn);
            this._$result.removeClass(this.options.classes.result);
            if (this._$result.data("uiDialog")) {
                this._$result.dialog("destroy");
            }
        }
    });
    return $.ui.jqQuestionnaire;
}));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcXVlcnkucXVlc3Rpb25uYWlyZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgRGF2aW5jaGkuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKi9cbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgICAgIGRlZmluZShbXG4gICAgICAgICAgICBcImpxdWVyeVwiLFxuICAgICAgICAgICAgLy8gVGhlc2UgYXJlIG9ubHkgZm9yIGJhY2tjb21wYXRcbiAgICAgICAgICAgIC8vIFRPRE86IFJlbW92ZSBhZnRlciAxLjEyXG4gICAgICAgICAgICBcIi4vY29udHJvbGdyb3VwXCIsXG4gICAgICAgICAgICBcIi4vY2hlY2tib3hyYWRpb1wiLFxuICAgICAgICAgICAgXCIuLi9rZXljb2RlXCIsXG4gICAgICAgICAgICBcIi4uL3dpZGdldFwiXG4gICAgICAgIF0sIGZhY3RvcnkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgICB9XG59KGZ1bmN0aW9uICgkKSB7XG4gICAgJC53aWRnZXQoXCJ1aS5qcVF1ZXN0aW9ubmFpcmVcIiwge1xuICAgICAgICBOQU1FU1BBQ0U6IFwianFRdWVzdGlvbm5haXJlXCIsXG4gICAgICAgIFFVRVJZX0hFQURFUjogXCJbZGF0YS1qcS1xdWVzdGlvbm5haXJlLWhlYWRlcl1cIixcbiAgICAgICAgUVVFUllfV1JBUFBFUjogXCJbZGF0YS1qcS1xdWVzdGlvbm5haXJlLXdyYXBwZXJdXCIsXG4gICAgICAgIFFVRVJZX0JPRFk6IFwiW2RhdGEtanEtcXVlc3Rpb25uYWlyZS1ib2R5XVwiLFxuICAgICAgICBRVUVSWV9QUk9QRVJUSUVTOiBcIltkYXRhLWpxLXF1ZXN0aW9ubmFpcmUtcHJvcGVydGllc11cIixcbiAgICAgICAgUVVFUllfUVVFU1RJT05TOiBcIltkYXRhLWpxLXF1ZXN0aW9ubmFpcmUtcXVlc3Rpb25zXVwiLFxuICAgICAgICBRVUVSWV9RVUVTVElPTjogXCJbZGF0YS1qcS1xdWVzdGlvbm5haXJlLXF1ZXN0aW9uXVwiLFxuICAgICAgICBRVUVSWV9PUFRJT05TOiBcIltkYXRhLWpxLXF1ZXN0aW9ubmFpcmUtb3B0aW9uc11cIixcbiAgICAgICAgUVVFUllfT1BUSU9OOiBcIltkYXRhLWpxLXF1ZXN0aW9ubmFpcmUtb3B0aW9uXVwiLFxuICAgICAgICBRVUVSWV9BQ1RJT05fU1RBUlQ6IFwiW2RhdGEtanEtcXVlc3Rpb25uYWlyZS1zdGFydF1cIixcbiAgICAgICAgUVVFUllfQUNUSU9OX05FWFQ6IFwiW2RhdGEtanEtcXVlc3Rpb25uYWlyZS1uZXh0XVwiLFxuICAgICAgICBRVUVSWV9BQ1RJT05fUFJFVjogXCJbZGF0YS1qcS1xdWVzdGlvbm5haXJlLXByZXZdXCIsXG4gICAgICAgIFFVRVJZX0FDVElPTl9FTkQ6IFwiW2RhdGEtanEtcXVlc3Rpb25uYWlyZS1lbmRdXCIsXG4gICAgICAgIFFVRVJZX1JFTkRFUl9PUFRJT046IFwiW2RhdGEtanEtcXVlc3Rpb25uYWlyZS1wcm9wZXJ0eV1cIixcbiAgICAgICAgUVVFUllfUkVOREVSX1JFU1VMVDogXCJbZGF0YS1qcS1xdWVzdGlvbm5haXJlLXJlc3VsdC1pdGVtXVwiLFxuICAgICAgICBRVUVSWV9SRVNVTFQ6IFwiW2RhdGEtanEtcXVlc3Rpb25uYWlyZS1yZXN1bHRdXCIsXG4gICAgICAgIFFVRVJZX0ZFRURCQUNLOiBcIltkYXRhLWpxLXF1ZXN0aW9ubmFpcmUtZmVlZGJhY2tdXCIsXG4gICAgICAgIElTX0NPUlJFQ1Q6IFwiaXNDb3JyZWN0XCIsXG4gICAgICAgIEFUVFJfQ1VSUkVOVF9RVUVTVElPTjogXCJkYXRhLWN1cnJlbnQtcXVlc3Rpb25cIixcbiAgICAgICAgQVRUUl9JU19DT1JSRUNUOiBcImRhdGEtaXMtY29ycmVjdFwiLFxuICAgICAgICBBVFRSX1BPSU5UU19GT1JfU1VDQ0VTUzogXCJkYXRhLXBvaW50cy1mb3Itc3VjY2Vzc1wiLFxuICAgICAgICBBVFRSX0ZFRURCQUNLOiBcImRhdGEtanEtcXVlc3Rpb25uYWlyZS1mZWVkYmFja1wiLFxuICAgICAgICBBVFRSX1BPSU5UU19GT1JfRkFJTDogXCJkYXRhLXBvaW50cy1mb3ItZmFpbFwiLFxuICAgICAgICBPTl9RVUVTVElPTl9ISURFOiBcImpxUXVlc3Rpb25uYWlyZTpxdWVzdGlvbkhpZGVcIixcbiAgICAgICAgT05fUVVFU1RJT05fU0hPVzogXCJqcVF1ZXN0aW9ubmFpcmU6cXVlc3Rpb25TaG93XCIsXG4gICAgICAgIE9OX0hFQURFUl9ISURFOiBcImpxUXVlc3Rpb25uYWlyZTpoZWFkZXJIaWRlXCIsXG4gICAgICAgIE9OX0hFQURFUl9TSE9XOiBcImpxUXVlc3Rpb25uYWlyZTpoZWFkZXJTaG93XCIsXG4gICAgICAgIE9OX0JPRFlfSElERTogXCJqcVF1ZXN0aW9ubmFpcmU6Ym9keUhpZGVcIixcbiAgICAgICAgT05fQk9EWV9TSE9XOiBcImpxUXVlc3Rpb25uYWlyZTpib2R5U2hvd1wiLFxuICAgICAgICBPTl9UUkFOU0lUSU9OX0VORDogXCJqcVF1ZXN0aW9ubmFpcmU6dHJhbnNpdGlvbkVuZFwiLFxuICAgICAgICBPTl9PUFRJT05fQ0hBTkdFOiBcImpxUXVlc3Rpb25uYWlyZTpxdWVzdGlvbkNoYW5nZVwiLFxuICAgICAgICBPTl9TVEFSVDogXCJqcVF1ZXN0aW9ubmFpcmU6c3RhcnRcIixcbiAgICAgICAgT05fU1RBUlRFRDogXCJqcVF1ZXN0aW9ubmFpcmU6c3RhcnRlZFwiLFxuICAgICAgICBPTl9FTkQ6IFwianFRdWVzdGlvbm5haXJlOmVuZFwiLFxuICAgICAgICBGRUVEQkFDS19UWVBFUzoge1xuICAgICAgICAgICAgXCJva1wiOiBcIm9rXCIsXG4gICAgICAgICAgICBcImtvXCI6IFwia29cIlxuICAgICAgICB9LFxuICAgICAgICBTVEFURVM6IHtcbiAgICAgICAgICAgIFwib2ZmXCI6IDAsXG4gICAgICAgICAgICBcInJ1bm5pbmdcIjogMSxcbiAgICAgICAgICAgIFwicmVzdWx0XCI6IDIsXG4gICAgICAgICAgICBcInJldmlld1wiOiAzXG4gICAgICAgIH0sXG4gICAgICAgIERJU0FCTEVfRU5EOiB7XG4gICAgICAgICAgICBcIm5ldmVyXCI6IDAsXG4gICAgICAgICAgICBcImJlZm9yZUFuc3dlckFsbFwiOiAxLFxuICAgICAgICAgICAgXCJiZWZvcmVBbnN3ZXJBbGxDb3JyZWN0XCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgY2xhc3Nlczoge1xuICAgICAgICAgICAgICAgIGZpcnN0UXVlc3Rpb246IFwianEtcXVlc3Rpb25uYWlyZS0tZmlyc3QtcXVlc3Rpb25cIixcbiAgICAgICAgICAgICAgICBsYXN0UXVlc3Rpb246IFwianEtcXVlc3Rpb25uYWlyZS0tbGFzdC1xdWVzdGlvblwiLFxuICAgICAgICAgICAgICAgIHdpZGdldDogXCJqcS1xdWVzdGlvbm5haXJlXCIsXG4gICAgICAgICAgICAgICAgcXVlc3Rpb25Db3JyZWN0OiBcImpxLXF1ZXN0aW9ubmFpcmUtLWNvcnJlY3RcIixcbiAgICAgICAgICAgICAgICBxdWVzdGlvbkluY29ycmVjdDogXCJqcS1xdWVzdGlvbm5haXJlLS1pbmNvcnJlY3RcIixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZDogXCJqcS1xdWVzdGlvbm5haXJlLS1zZWxlY3RlZFwiLFxuICAgICAgICAgICAgICAgIHN0YXRlUmVzdWx0OiBcImpxLXF1ZXN0aW9ubmFpcmUtLXJlc3VsdFwiLFxuICAgICAgICAgICAgICAgIHN0YXRlUmV2aWV3OiBcImpxLXF1ZXN0aW9ubmFpcmUtLXJldmlld1wiLFxuICAgICAgICAgICAgICAgIHN0YXRlUnVubmluZzogXCJqcS1xdWVzdGlvbm5haXJlLS1ydW5uaW5nXCIsXG4gICAgICAgICAgICAgICAgbXVsdGljaG9pY2U6IFwianEtcXVlc3Rpb25uYWlyZS0tbXVsdGktY2hvaWNlXCIsXG4gICAgICAgICAgICAgICAgd3JhcHBlcjogXCJqcS1xdWVzdGlvbm5haXJlX19mb3JtXCIsXG4gICAgICAgICAgICAgICAgaGVhZGVyOiBcImpxLXF1ZXN0aW9ubmFpcmVfX2hlYWRlclwiLFxuICAgICAgICAgICAgICAgIGJvZHk6IFwianEtcXVlc2l0b25uYWlyZV9fYm9keVwiLFxuICAgICAgICAgICAgICAgIHN0YXJ0QnRuOiBcImpxLXF1ZXN0aW9ubmFpcmVfX3N0YXJ0XCIsXG4gICAgICAgICAgICAgICAgbmV4dEJ0bjogXCJqcS1xdWVzdGlvbm5haXJlX19uZXh0XCIsXG4gICAgICAgICAgICAgICAgcHJldkJ0bjogXCJqcS1xdWVzdGlvbm5haXJlX19wcmV2XCIsXG4gICAgICAgICAgICAgICAgZW5kQnRuOiBcImpxLXF1ZXN0aW9ubmFpcmVfX2VuZFwiLFxuICAgICAgICAgICAgICAgIHJlc3VsdDogXCJqcS1xdWVzdGlvbm5haXJlX19yZXN1bHRcIixcbiAgICAgICAgICAgICAgICBxdWVzdGlvbjogXCJqcS1xdWVzdGlvbm5haXJlX19xdWVzdGlvblwiLFxuICAgICAgICAgICAgICAgIG9wdGlvbjogXCJqcS1xdWVzdGlvbm5haXJlX19vcHRpb25cIixcbiAgICAgICAgICAgICAgICBuYXZiYXI6IFwianEtcXVlc3Rpb25uYWlyZV9fbmF2YmFyXCIsXG4gICAgICAgICAgICAgICAgYnV0dG9uOiBcImpxLXF1ZXN0aW9ubmFpcmVfX2FjdGlvblwiLFxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IFwianEtcXVlc3Rpb25uYWlyZV9fcHJvcGVydGllc1wiLFxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uczogXCJqcS1xdWVzdGlvbm5haXJlX19xdWVzdGlvbnNcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRlbGF5T25BdXRvTmV4dDogNTAwLFxuICAgICAgICAgICAgcG9pbnRzRm9yU3VjY2VzczogMSxcbiAgICAgICAgICAgIHBvaW50c0ZvckZhaWw6IDAsXG4gICAgICAgICAgICBjdXRPZmZNYXJrOiA1MCxcbiAgICAgICAgICAgIGltbWVkaWF0ZUZlZWRiYWNrOiBmYWxzZSxcbiAgICAgICAgICAgIGRpc2FibGVPcHRpb25BZnRlclNlbGVjdDogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9Hb05leHQ6IHRydWUsXG4gICAgICAgICAgICBzaG93Q29ycmVjdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIHNob3dSZXN1bHQ6IHRydWUsXG4gICAgICAgICAgICBtdWx0aWNob2ljZTogZmFsc2UsXG4gICAgICAgICAgICBkaXNhYmxlTmV4dFVudGlsU3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBkaXNhYmxlRW5kQWN0aW9uVW50aWw6IDAsXG4gICAgICAgICAgICBkaWFsb2c6IHtcbiAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGF1dG9PcGVuOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlc2l6YWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgbW9kYWw6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX2NyZWF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fZ2V0RWxlbWVudHMoKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC51bmlxdWVJZCgpO1xuICAgICAgICAgICAgdGhpcy5fbWFwUXVlc3Rpb25zKCk7XG4gICAgICAgICAgICB0aGlzLl9jaGFuZ2VTdGF0ZSh0aGlzLlNUQVRFUy5vZmYpO1xuICAgICAgICAgICAgdGhpcy5fYXNzaWduRXZlbnRzKCk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJPcHRpb25zKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW5kZXJpemEgdW5hIG9wY2nDs24gZXNjYW5lYW5kbyBsb3MgZWxlbWVudG9zIHF1ZSBjb2luY2lkYW4gY29uIFFVRVJZX1JFTkRFUl9PUFRJT05cbiAgICAgICAgICogRXMgcG9zaWJsZSBlc3RhYmxlY2VyIHVuIHZhbG9yIGEgcmVuZGVyaXphciBlbiBjYXNvIGRlIHF1ZSBlbCBhdHJpYnV0byBzZWEgdHJ1ZSBvIGZhbHNlIHVzYW5kbyBsYSBzaW50YXhpcyBkZWwgb3BlcmFkb3IgdGVybmFyaW86IG5vbWJyZU9wY2lvbiA/IHZhbG9yU2lUcnVlIDogdmFsb3JTaUZhbHNlXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGxldCBvcHRpb25zID0ge2N1dE9mZk1hcms6NTB9O1xuICAgICAgICAgKiA8c3BhbiBkYXRhLXF1ZXN0aW9ubmFpcmUtcmVuZGVyLW9wdGlvbj1cImN1dE9mZk1hcmtcIj48L3NwYW4+XG4gICAgICAgICAqIFJlbmRlcml6YTpcbiAgICAgICAgICogPHNwYW4gZGF0YS1xdWVzdGlvbm5haXJlLXJlbmRlci1vcHRpb249XCJjdXRPZmZNYXJrXCI+NTA8L3NwYW4+XG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqIGxldCBvcHRpb25zID0ge2ltbWVkaWF0ZUZlZWRiYWNrOmZhbHNlfTtcbiAgICAgICAgICogPHNwYW4gZGF0YS1xdWVzdGlvbm5haXJlLXJlbmRlci1vcHRpb249XCJpbW1lZGlhdGVGZWVkYmFjaz9TaTpOb1wiPjwvc3Bhbj5cbiAgICAgICAgICogUmVuZGVyaXphOlxuICAgICAgICAgKiA8c3BhbiBkYXRhLXF1ZXN0aW9ubmFpcmUtcmVuZGVyLW9wdGlvbj1cImltbWVkaWF0ZUZlZWRiYWNrP1NpOk5vXCI+Tm88L3NwYW4+XG4gICAgICAgICAqIEBzZWUgX3JlbmRlclZhclxuICAgICAgICAgKi9cbiAgICAgICAgX3JlbmRlck9wdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclZhcih0aGlzLlFVRVJZX1JFTkRFUl9PUFRJT04sIFwianFRdWVzdGlvbm5haXJlUHJvcGVydHlcIik7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW5kZXJpemEgcGFyYSBsb3MgZWxlbWVudG9zIGluZGljYWRvcyB1bmEgcHJvcGllZGFkIGRlIHVuIHN0b3JlIGNvbmNyZXRvIHkgdW4gY29udGV4dG8gZGVmaW5pZG9cbiAgICAgICAgICogRXMgcG9zaWJsZSBlc3RhYmxlY2VyIHVuIHZhbG9yIGEgcmVuZGVyaXphciBlbiBjYXNvIGRlIHF1ZSBlbCBhdHJpYnV0byBzZWEgdHJ1ZSBvIGZhbHNlIHVzYW5kbyBsYSBzaW50YXhpcyBkZWwgb3BlcmFkb3IgdGVybmFyaW86IG5vbWJyZU9wY2lvbiA/IHZhbG9yU2lUcnVlIDogdmFsb3JTaUZhbHNlXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSAgICAgICAgICAgICAgcXVlcnkgICAgICAgICAgIFNlbGVjdG9yIGpxdWVyeSBhIGFwbGljYXIgcGFyYSBvYnRlbmVyIGxvcyBlbGVtZW50b3NcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9ICAgICAgICAgICAgICBkYXRhICAgICAgICAgICAgTm9tYnJlIGRlbCBhdHJpYnV0byBwYXJhIGVsIGN1YWwgb2J0ZW5lciBlbCBkYXRvIG1lZGlhbnRlICQuZGF0YVxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gICAgICAgICAgICAgIFtzdG9yZV0gICAgICAgICBPYmpldG8gZGVsIGN1YWwgb2J0ZW5lciBlbCBkYXRvLiBQb3IgZGVmZWN0byBzZSBvYnRpZW5lIGRlIG9wdGlvbnNcbiAgICAgICAgICogQHBhcmFtIHtKUXVlcnl9ICAgICAgICAgICAgICBbY29udGV4dF0gICAgICAgQ29udGV4dG8gZW4gZWwgY3VhbCBhcGxpY2FyIGxhIHF1ZXJ5LiBQb3IgZGVmZWN0byBlbCBlbGVtZW50IGRlbCB3aWRnZXRcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9yZW5kZXJWYXI6IGZ1bmN0aW9uIChxdWVyeSwgZGF0YSwgc3RvcmUsIGNvbnRleHQpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0IHx8IHRoaXMuZWxlbWVudDtcbiAgICAgICAgICAgIHN0b3JlID0gc3RvcmUgfHwgdGhpcy5vcHRpb25zO1xuICAgICAgICAgICAgdmFyICR0b1JlbmRlciA9IGNvbnRleHQuZmluZChxdWVyeSk7XG4gICAgICAgICAgICAvL2VhY2ggZWxlbWVudCB0byByZW5kZXJcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgJHRvUmVuZGVyXzEgPSAkdG9SZW5kZXI7IF9pIDwgJHRvUmVuZGVyXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSAkdG9SZW5kZXJfMVtfaV07XG4gICAgICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KSwgb3B0aW9uTmFtZSA9ICgkZWxlbWVudC5kYXRhKGRhdGEpIHx8IFwiXCIpLnRyaW0oKSwgLy9nZXQgdGhlIGRhdGEgbmFtZSBhbmQgdHJpbSBpdFxuICAgICAgICAgICAgICAgIG9wdGlvbkFzVHJ1ZSA9IHZvaWQgMCwgb3B0aW9uQXNGYWxzZSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9uTmFtZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgX2EgPSBvcHRpb25OYW1lLnNwbGl0KFwiP1wiKSwgb3B0aW9uTmFtZSA9IF9hWzBdLCBvcHRpb25Bc1RydWUgPSBfYVsxXTsgLy9zcGxpdCB0byBnZXQgdGhlIHBhcnRzXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25Bc1RydWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYiA9IG9wdGlvbkFzVHJ1ZS5zcGxpdChcIjpcIiksIG9wdGlvbkFzVHJ1ZSA9IF9iWzBdLCBvcHRpb25Bc0ZhbHNlID0gX2JbMV07IC8vZGVzdHJ1Y3R1cmVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgb3B0aW9uVmFsdWUgPSBzdG9yZVtvcHRpb25OYW1lXTsgLy9nZXQgdGhlIHZhbHVlIG9mIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uVmFsdWUgPSBvcHRpb25WYWx1ZSAhPSB1bmRlZmluZWQgPyBvcHRpb25WYWx1ZSA6IFwiXCI7IC8vaWYgdW5kZWZpbmVkLCBhc3NpZ24gZW1wdHkgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25Bc1RydWUgIT0gdW5kZWZpbmVkICYmICEhb3B0aW9uVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvblZhbHVlID0gb3B0aW9uQXNUcnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbkFzRmFsc2UgIT0gdW5kZWZpbmVkICYmICFvcHRpb25WYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uVmFsdWUgPSBvcHRpb25Bc0ZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICRlbGVtZW50Lmh0bWwob3B0aW9uVmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPYnRpZW5lIHRvZG9zIGxvcyBlbGVtZW50b3MgaW50ZXJub3NcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9nZXRFbGVtZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fJHdyYXBwZXIgPSB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX1dSQVBQRVIpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLndyYXBwZXIpO1xuICAgICAgICAgICAgdGhpcy5fJGhlYWRlciA9IHRoaXMuZWxlbWVudC5maW5kKHRoaXMuUVVFUllfSEVBREVSKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5oZWFkZXIpO1xuICAgICAgICAgICAgdGhpcy5fJGJvZHkgPSB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0JPRFkpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmJvZHkpO1xuICAgICAgICAgICAgdGhpcy5fJGJvZHkuaGlkZSgpO1xuICAgICAgICAgICAgdGhpcy5fJHByb3BlcnRpZXMgPSB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX1BST1BFUlRJRVMpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnByb3BlcnRpZXMpO1xuICAgICAgICAgICAgdGhpcy5fJHF1ZXN0aW9uc1dyYXBwZXIgPSB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX1FVRVNUSU9OUylcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb25zKTtcbiAgICAgICAgICAgIHRoaXMuXyRxdWVzdGlvbnMgPSB0aGlzLl8kcXVlc3Rpb25zV3JhcHBlci5maW5kKHRoaXMuUVVFUllfUVVFU1RJT04pXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuXyRxdWVzdGlvbnMuaGlkZSgpO1xuICAgICAgICAgICAgdGhpcy5fJHN0YXJ0QnRuID0gdGhpcy5fJHdyYXBwZXIuZmluZCh0aGlzLlFVRVJZX0FDVElPTl9TVEFSVClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuYnV0dG9uICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGFydEJ0bik7XG4gICAgICAgICAgICB0aGlzLl8kbmV4dEJ0biA9IHRoaXMuXyR3cmFwcGVyLmZpbmQodGhpcy5RVUVSWV9BQ1RJT05fTkVYVClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuYnV0dG9uICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5uZXh0QnRuKTtcbiAgICAgICAgICAgIHRoaXMuXyRwcmV2QnRuID0gdGhpcy5fJHdyYXBwZXIuZmluZCh0aGlzLlFVRVJZX0FDVElPTl9QUkVWKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5idXR0b24gKyBcIiBcIiArIHRoaXMub3B0aW9ucy5jbGFzc2VzLnByZXZCdG4pO1xuICAgICAgICAgICAgdGhpcy5fJGVuZEJ0biA9IHRoaXMuXyR3cmFwcGVyLmZpbmQodGhpcy5RVUVSWV9BQ1RJT05fRU5EKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5idXR0b24gKyBcIiBcIiArIHRoaXMub3B0aW9ucy5jbGFzc2VzLmVuZEJ0bik7XG4gICAgICAgICAgICB0aGlzLl8kcmVzdWx0ID0gdGhpcy5fJHdyYXBwZXIuZmluZCh0aGlzLlFVRVJZX1JFU1VMVClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMucmVzdWx0KTtcbiAgICAgICAgICAgIHRoaXMuXyRyZXN1bHQuaGlkZSgpO1xuICAgICAgICAgICAgLy90aGlzLl8kYm9keS5oaWRlKCkuZGV0YWNoKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPYnRpZW5lIHkgZXN0cnVjdHVyYSBsb3MgZGF0b3MgZGUgbGFzIHByZWd1bnRhcyBpbmRpY2FkYXNcbiAgICAgICAgICogQHBhcmFtICRxdWVzdGlvbnNcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX21hcFF1ZXN0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy9pZiB0aGUgb3B0aW9ucyBoYXMgY2hlY2tib3gsIHRoZSBxdWVzdGlvbm5haXJlIGlzIG11bHRpY2hvaWNlXG4gICAgICAgICAgICB2YXIgJG9wdGlvbnMgPSB0aGlzLl8kcXVlc3Rpb25zLmZpbmQodGhpcy5RVUVSWV9PUFRJT04pXG4gICAgICAgICAgICAgICAgLmZpbmQoXCI6Y2hlY2tib3hcIik7XG4gICAgICAgICAgICAvL2Vuc3VyZSB0aGUgdHlwZSBvZiB0aGUgaW5wdXRzXG4gICAgICAgICAgICBpZiAoJG9wdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICRvcHRpb25zLmF0dHIoXCJ0eXBlXCIsIFwiY2hlY2tib3hcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLm11bHRpY2hvaWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMubXVsdGljaG9pY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgJG9wdGlvbnMuYXR0cihcInR5cGVcIiwgXCJyYWRpb1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciAkcXVlc3Rpb25zID0gdGhpcy5fJHF1ZXN0aW9ucywgcXVlc3Rpb25zID0gW10sIHF1ZXN0aW9uc01hcCA9IHt9LCBtYXhTY29yZSA9IDA7XG4gICAgICAgICAgICAvL21hcCBlYWNoIHF1ZXN0aW9uXG4gICAgICAgICAgICBmb3IgKHZhciBxdWVzdGlvbkluZGV4ID0gMCwgJHF1ZXN0aW9uc0xlbmd0aCA9ICRxdWVzdGlvbnMubGVuZ3RoOyBxdWVzdGlvbkluZGV4IDwgJHF1ZXN0aW9uc0xlbmd0aDsgcXVlc3Rpb25JbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyICRjdXJyZW50ID0gJCgkcXVlc3Rpb25zW3F1ZXN0aW9uSW5kZXhdKSwgcGFyc2VkUXVlc3Rpb24gPSB0aGlzLl9tYXBRdWVzdGlvbigkY3VycmVudCk7XG4gICAgICAgICAgICAgICAgcXVlc3Rpb25zLnB1c2gocGFyc2VkUXVlc3Rpb24pO1xuICAgICAgICAgICAgICAgIHF1ZXN0aW9uc01hcFtwYXJzZWRRdWVzdGlvbi5pZF0gPSBxdWVzdGlvbkluZGV4O1xuICAgICAgICAgICAgICAgIG1heFNjb3JlICs9IHBhcnNlZFF1ZXN0aW9uLnBvaW50c0ZvclN1Y2Nlc3M7IC8vaW5jcmVtZW50IHRoZSBtYXggc2NvcmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3F1ZXN0aW9ucyA9IHF1ZXN0aW9ucztcbiAgICAgICAgICAgIHRoaXMuX3F1ZXN0aW9uc01hcCA9IHF1ZXN0aW9uc01hcDtcbiAgICAgICAgICAgIHRoaXMuX21heFNjb3JlID0gbWF4U2NvcmU7XG4gICAgICAgICAgICB0aGlzLl9zZXRPcHRpb24oXCJtYXhTY29yZVwiLCBtYXhTY29yZSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPYnRpZW5lIHkgZXN0cnVjdHVyYSBsb3MgZGF0b3MgZGUgbGEgcHJlZ3VudGEgaW5kaWNhZGFcbiAgICAgICAgICogQHBhcmFtICRxdWVzdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfbWFwUXVlc3Rpb246IGZ1bmN0aW9uICgkcXVlc3Rpb24pIHtcbiAgICAgICAgICAgIHZhciAkb3B0aW9uc1dyYXBwZXIgPSAkcXVlc3Rpb24uZmluZCh0aGlzLlFVRVJZX09QVElPTlMpLCAkb3B0aW9ucyA9ICRvcHRpb25zV3JhcHBlci5maW5kKHRoaXMuUVVFUllfT1BUSU9OKSwgbmFtZSA9ICRvcHRpb25zLmZpcnN0KClcbiAgICAgICAgICAgICAgICAuZmluZChcImlucHV0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJuYW1lXCIpLCBwb2ludHNGb3JTdWNjZXNzID0gJHF1ZXN0aW9uLmRhdGEodGhpcy5BVFRSX1BPSU5UU19GT1JfU1VDQ0VTUyksIHBvaW50c0ZvckZhaWwgPSAkcXVlc3Rpb24uZGF0YSh0aGlzLkFUVFJfUE9JTlRTX0ZPUl9GQUlMKSwgX2EgPSB0aGlzLl9tYXBPcHRpb25zKCRvcHRpb25zKSwgYXJyID0gX2EuYXJyLCBtYXAgPSBfYS5tYXAsICRmZWVkYmFjayA9ICRxdWVzdGlvbi5maW5kKHRoaXMuUVVFUllfRkVFREJBQ0spXG4gICAgICAgICAgICAgICAgLm5vdCh0aGlzLlFVRVJZX09QVElPTiArIFwiIFwiICsgdGhpcy5RVUVSWV9GRUVEQkFDSyksIC8vZmVlZGJhY2sgb2YgcXVlc3Rpb24gdGhhdCBhcmUgbm90IGluc2lkZSBvZiBhbiBvcHRpb25cbiAgICAgICAgICAgIGlkO1xuICAgICAgICAgICAgJGZlZWRiYWNrLmhpZGUoKTtcbiAgICAgICAgICAgICRxdWVzdGlvbi5yZW1vdmVBdHRyKHRoaXMuQVRUUl9QT0lOVFNfRk9SX0ZBSUwpO1xuICAgICAgICAgICAgJHF1ZXN0aW9uLnJlbW92ZUF0dHIodGhpcy5BVFRSX1BPSU5UU19GT1JfU1VDQ0VTUyk7XG4gICAgICAgICAgICAkcXVlc3Rpb24udW5pcXVlSWQoKTtcbiAgICAgICAgICAgIGlkID0gJHF1ZXN0aW9uLmF0dHIoXCJpZFwiKTtcbiAgICAgICAgICAgIC8vZW5zdXJlIHRoZSBzYW1lIG5hbWUgZm9yIHRoZSBmaWVsZHNcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lICE9IHVuZGVmaW5lZCA/IG5hbWUgOiBpZDtcbiAgICAgICAgICAgICRvcHRpb25zLmZpbmQoXCJpbnB1dFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwibmFtZVwiLCBuYW1lKTtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHtcbiAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgJGVsZW1lbnQ6ICRxdWVzdGlvbixcbiAgICAgICAgICAgICAgICAkb3B0aW9uc1dyYXBwZXI6ICRvcHRpb25zV3JhcHBlcixcbiAgICAgICAgICAgICAgICAkb3B0aW9uczogJG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogYXJyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnNNYXA6IG1hcCxcbiAgICAgICAgICAgICAgICBwb2ludHNGb3JTdWNjZXNzOiBwb2ludHNGb3JTdWNjZXNzICE9IHVuZGVmaW5lZCA/IHBvaW50c0ZvclN1Y2Nlc3MgOiB0aGlzLm9wdGlvbnMucG9pbnRzRm9yU3VjY2VzcyxcbiAgICAgICAgICAgICAgICBwb2ludHNGb3JGYWlsOiBwb2ludHNGb3JGYWlsICE9IHVuZGVmaW5lZCA/IHBvaW50c0ZvckZhaWwgOiB0aGlzLm9wdGlvbnMucG9pbnRzRm9yRmFpbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vc3RvcmUgdGhlIGZlZWRiYWNrIGZvdW5kZWQgYnkgdHlwZVxuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCAkZmVlZGJhY2tfMSA9ICRmZWVkYmFjazsgX2kgPCAkZmVlZGJhY2tfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZmVlZGJhY2sgPSAkZmVlZGJhY2tfMVtfaV07XG4gICAgICAgICAgICAgICAgdmFyICRmZWVkYmFja18yID0gJChmZWVkYmFjayksIHR5cGUgPSAkZmVlZGJhY2tfMi5hdHRyKHRoaXMuQVRUUl9GRUVEQkFDSyk7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5GRUVEQkFDS19UWVBFUy5vazpcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRmZWVkYmFja09rID0gJGZlZWRiYWNrXzI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSB0aGlzLkZFRURCQUNLX1RZUEVTLmtvOlxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb24uJGZlZWRiYWNrS28gPSAkZmVlZGJhY2tfMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb24uJGZlZWRiYWNrID0gJGZlZWRiYWNrXzI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxdWVzdGlvbi4kZmVlZGJhY2tPayA9IHF1ZXN0aW9uLiRmZWVkYmFja09rIHx8IHF1ZXN0aW9uLiRmZWVkYmFjayB8fCAkKG51bGwpO1xuICAgICAgICAgICAgcXVlc3Rpb24uJGZlZWRiYWNrS28gPSBxdWVzdGlvbi4kZmVlZGJhY2tLbyB8fCBxdWVzdGlvbi4kZmVlZGJhY2sgfHwgJChudWxsKTtcbiAgICAgICAgICAgIHJldHVybiBxdWVzdGlvbjtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9idGllbmUgeSBlc3RydWN0dXJhIGxvcyBkYXRvcyBkZSBsYXMgb3BjaW9uZXMgaW5kaWNhZGFzXG4gICAgICAgICAqIEBwYXJhbSAkb3B0aW9uc1xuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfbWFwT3B0aW9uczogZnVuY3Rpb24gKCRvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgcGFyc2VkT3B0aW9ucyA9IFtdLCBwYXJzZWRPcHRpb25zTWFwID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBvcHRpb25JbmRleCA9IDAsICRvcHRpb25zTGVuZ3RoID0gJG9wdGlvbnMubGVuZ3RoOyBvcHRpb25JbmRleCA8ICRvcHRpb25zTGVuZ3RoOyBvcHRpb25JbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyICRjdXJyZW50ID0gJCgkb3B0aW9uc1tvcHRpb25JbmRleF0pLCBwYXJzZWRPcHRpb24gPSB0aGlzLl9tYXBPcHRpb24oJGN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIHBhcnNlZE9wdGlvbnMucHVzaChwYXJzZWRPcHRpb24pO1xuICAgICAgICAgICAgICAgIHBhcnNlZE9wdGlvbnNNYXBbcGFyc2VkT3B0aW9uLmlkXSA9IG9wdGlvbkluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgYXJyOiBwYXJzZWRPcHRpb25zLCBtYXA6IHBhcnNlZE9wdGlvbnNNYXAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqICBPYnRpZW5lIHkgZXN0cnVjdHVyYSBsb3MgZGF0b3MgZGUgbGEgb3BjaW9uIGluZGljYWRhXG4gICAgICAgICAqIEBwYXJhbSAkb3B0aW9uXG4gICAgICAgICAqIEByZXR1cm5zIHt7JGVsZW1lbnQ6IGFueSwgaXNDb3JyZWN0OiBib29sZWFufX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9tYXBPcHRpb246IGZ1bmN0aW9uICgkb3B0aW9uKSB7XG4gICAgICAgICAgICB2YXIgaXNDb3JyZWN0ID0gISEkb3B0aW9uLmRhdGEodGhpcy5JU19DT1JSRUNUKSwgLy9nZXQgaWYgaXMgdGhlIGNvcnJlY3Qgb3B0aW9uXG4gICAgICAgICAgICBpZCwgJGZlZWRiYWNrID0gJG9wdGlvbi5maW5kKHRoaXMuUVVFUllfRkVFREJBQ0spO1xuICAgICAgICAgICAgLy9zdG9yZSB0aGUgZmVlZGJhY2sgZm91bmRlZCBieSB0eXBlXG4gICAgICAgICAgICAkb3B0aW9uLnJlbW92ZUF0dHIodGhpcy5BVFRSX0lTX0NPUlJFQ1QpO1xuICAgICAgICAgICAgJG9wdGlvbi51bmlxdWVJZCgpO1xuICAgICAgICAgICAgaWQgPSAkb3B0aW9uLmF0dHIoXCJpZFwiKTtcbiAgICAgICAgICAgIHZhciBvcHRpb24gPSB7XG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICRlbGVtZW50OiAkb3B0aW9uLFxuICAgICAgICAgICAgICAgIGlzQ29ycmVjdDogaXNDb3JyZWN0XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCAkZmVlZGJhY2tfMyA9ICRmZWVkYmFjazsgX2kgPCAkZmVlZGJhY2tfMy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZmVlZGJhY2sgPSAkZmVlZGJhY2tfM1tfaV07XG4gICAgICAgICAgICAgICAgdmFyICRmZWVkYmFja180ID0gJChmZWVkYmFjayksIHR5cGUgPSAkZmVlZGJhY2tfNC5hdHRyKHRoaXMuQVRUUl9GRUVEQkFDSyk7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5GRUVEQkFDS19UWVBFUy5vazpcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi4kZmVlZGJhY2tPayA9ICRmZWVkYmFja180O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5GRUVEQkFDS19UWVBFUy5rbzpcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi4kZmVlZGJhY2tLbyA9ICRmZWVkYmFja180O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24uJGZlZWRiYWNrID0gJGZlZWRiYWNrXzQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcHRpb24uJGZlZWRiYWNrT2sgPSBvcHRpb24uJGZlZWRiYWNrT2sgfHwgb3B0aW9uLiRmZWVkYmFjayB8fCAkKG51bGwpO1xuICAgICAgICAgICAgb3B0aW9uLiRmZWVkYmFja0tvID0gb3B0aW9uLiRmZWVkYmFja0tvIHx8IG9wdGlvbi4kZmVlZGJhY2sgfHwgJChudWxsKTtcbiAgICAgICAgICAgICRmZWVkYmFjay5oaWRlKCk7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9uO1xuICAgICAgICB9LFxuICAgICAgICBfYXNzaWduRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl8kc3RhcnRCdG4ub2ZmKHRoaXMuTkFNRVNQQUNFKVxuICAgICAgICAgICAgICAgIC5vbihcImNsaWNrLlwiICsgdGhpcy5OQU1FU1BBQ0UsIHsgaW5zdGFuY2U6IHRoaXMgfSwgdGhpcy5fb25TdGFydEJ1dHRvbkNsaWNrKTtcbiAgICAgICAgICAgIHRoaXMuXyRlbmRCdG4ub2ZmKHRoaXMuTkFNRVNQQUNFKVxuICAgICAgICAgICAgICAgIC5vbihcImNsaWNrLlwiICsgdGhpcy5OQU1FU1BBQ0UsIHsgaW5zdGFuY2U6IHRoaXMgfSwgdGhpcy5fb25FbmRCdXR0b25DbGljayk7XG4gICAgICAgICAgICB0aGlzLl8kbmV4dEJ0bi5vZmYodGhpcy5OQU1FU1BBQ0UpXG4gICAgICAgICAgICAgICAgLm9uKFwiY2xpY2suXCIgKyB0aGlzLk5BTUVTUEFDRSwgeyBpbnN0YW5jZTogdGhpcyB9LCB0aGlzLl9vbk5leHRCdXR0b25DbGljayk7XG4gICAgICAgICAgICB0aGlzLl8kcHJldkJ0bi5vZmYodGhpcy5OQU1FU1BBQ0UpXG4gICAgICAgICAgICAgICAgLm9uKFwiY2xpY2suXCIgKyB0aGlzLk5BTUVTUEFDRSwgeyBpbnN0YW5jZTogdGhpcyB9LCB0aGlzLl9vblByZXZCdXR0b25DbGljayk7XG4gICAgICAgICAgICAvL3RoaXMuXyRxdWVzdGlvbnMub2ZmKHRoaXMuTkFNRVNQQUNFKS5vbihgY2xpY2suJHt0aGlzLk5BTUVTUEFDRX1gLCB7aW5zdGFuY2U6IHRoaXN9LCB0aGlzLl9vbk9wdGlvbkNsaWNrKTtcbiAgICAgICAgICAgIHRoaXMuXyRxdWVzdGlvbnMub2ZmKHRoaXMuTkFNRVNQQUNFKVxuICAgICAgICAgICAgICAgIC5vbihcImNoYW5nZS5cIiArIHRoaXMuTkFNRVNQQUNFLCB7IGluc3RhbmNlOiB0aGlzIH0sIHRoaXMuX29uT3B0aW9uQ2hhbmdlKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEludm9jYWRvIGFsIHB1bHNhcnNlIGVsIGJvdMOzbiBzdGFydC4gQ29taWVuemEgZWwgY3Vlc3Rpb25hcmlvXG4gICAgICAgICAqIEBwYXJhbSBlXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfb25TdGFydEJ1dHRvbkNsaWNrOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5kYXRhLmluc3RhbmNlLnN0YXJ0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbnZvY2FkbyBhbCBwdWxzYXJzZSBlbCBib3TDs24gZW5kLiBGaW5hbGl6YSBlbCBjdWVzdGlvbmFyaW9cbiAgICAgICAgICogQHBhcmFtIGVcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9vbkVuZEJ1dHRvbkNsaWNrOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5kYXRhLmluc3RhbmNlLmVuZCgpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogSW52b2NhZG8gYWwgcHVsc2Fyc2UgZWwgYm90w7NuIHNpZ3VpZW50ZS5cbiAgICAgICAgICogQHBhcmFtIGVcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9vbk5leHRCdXR0b25DbGljazogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuZGF0YS5pbnN0YW5jZS5uZXh0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbnZvY2FkbyBhbCBwdWxzYXJzZSBlbCBib3TDs24gYW50ZXJpb3IuXG4gICAgICAgICAqIEBwYXJhbSBlXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfb25QcmV2QnV0dG9uQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLmRhdGEuaW5zdGFuY2UucHJldigpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogT2J0aWVuZSBsYSBjYWxpZmljYWNpw7NuIGRlbCBjdWVzdGlvbmFyaW9cbiAgICAgICAgICogQHJldHVybnNcbiAgICAgICAgICoge1xuICAgICAgICAgKiAgICAgICBtYXhTY29yZTpudW1iZXI7XG4gICAgICAgICAqICAgICAgIHNjb3JlOm51bWJlcjtcbiAgICAgICAgICogICAgICAgcGVyY2VudGFnZTpudW1iZXI7XG4gICAgICAgICAqICAgICAgIHF1ZXN0aW9uc1N1Y2Nlc3M6bnVtYmVyO1xuICAgICAgICAgKiAgICAgICBxdWVzdGlvbnNGYWlsOm51bWJlcjtcbiAgICAgICAgICogICAgICAgcXVlc3Rpb25zTm90QXR0ZW1wdGVkOm51bWJlcjtcbiAgICAgICAgICogICAgICAgc3VjY2Vzczpib29sZWFuO1xuICAgICAgICAgKiB9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfY2FsaWZpY2F0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTY29yZSA9IDAsIG1heFNjb3JlID0gdGhpcy5fbWF4U2NvcmUsIHJ1bnRpbWUgPSB0aGlzLl9ydW50aW1lLCBxdWVzdGlvbnMgPSB0aGlzLl9xdWVzdGlvbnMsIGNhbGlmaWNhdGlvbiwgblN1Y2Nlc3MgPSAwLCBuRmFpbHMgPSAwO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tdWx0aWNob2ljZSAhPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX2NhbGlmaWNhdGVTaW5nbGVDaG9pY2UoKTtcbiAgICAgICAgICAgICAgICBuU3VjY2VzcyA9IHJlc3VsdC5uU3VjY2VzcztcbiAgICAgICAgICAgICAgICBuRmFpbHMgPSByZXN1bHQubkZhaWxzO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRTY29yZSA9IHJlc3VsdC5zY29yZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9jYWxpZmljYXRlTXVsdGlDaG9pY2UoKTtcbiAgICAgICAgICAgICAgICBuU3VjY2VzcyA9IHJlc3VsdC5uU3VjY2VzcztcbiAgICAgICAgICAgICAgICBuRmFpbHMgPSByZXN1bHQubkZhaWxzO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRTY29yZSA9IHJlc3VsdC5zY29yZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGlmaWNhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICBtYXhTY29yZTogbWF4U2NvcmUsXG4gICAgICAgICAgICAgICAgc2NvcmU6IGN1cnJlbnRTY29yZSxcbiAgICAgICAgICAgICAgICBwZXJjZW50YWdlOiAoY3VycmVudFNjb3JlICogMTAwKSAvIG1heFNjb3JlLFxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uc1N1Y2Nlc3M6IG5TdWNjZXNzLFxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uc0ZhaWw6IG5GYWlscyxcbiAgICAgICAgICAgICAgICBxdWVzdGlvbnNOb3RBdHRlbXB0ZWQ6IHF1ZXN0aW9ucy5sZW5ndGggLSAoblN1Y2Nlc3MgKyBuRmFpbHMpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FsaWZpY2F0aW9uLnN1Y2Nlc3MgPSBjYWxpZmljYXRpb24ucGVyY2VudGFnZSA+PSB0aGlzLm9wdGlvbnMuY3V0T2ZmTWFyaztcbiAgICAgICAgICAgIHJldHVybiBjYWxpZmljYXRpb247XG4gICAgICAgIH0sXG4gICAgICAgIF9jYWxpZmljYXRlU2luZ2xlQ2hvaWNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudFNjb3JlID0gMCwgcnVudGltZSA9IHRoaXMuX3J1bnRpbWUsIHF1ZXN0aW9ucyA9IHRoaXMuX3F1ZXN0aW9ucywgblN1Y2Nlc3MgPSAwLCBuRmFpbHMgPSAwO1xuICAgICAgICAgICAgLy9mb3IgZWFjaCBxdWVzdGlvblxuICAgICAgICAgICAgZm9yICh2YXIgcXVlc3Rpb25JbmRleCA9IDAsIHF1ZXN0aW9uc0xlbmd0aCA9IHF1ZXN0aW9ucy5sZW5ndGg7IHF1ZXN0aW9uSW5kZXggPCBxdWVzdGlvbnNMZW5ndGg7IHF1ZXN0aW9uSW5kZXgrKykge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50UXVlc3Rpb24gPSBxdWVzdGlvbnNbcXVlc3Rpb25JbmRleF0sIHF1ZXN0aW9uUnVudGltZSA9IHJ1bnRpbWVbY3VycmVudFF1ZXN0aW9uLmlkXSwgLy9nZXQgcnVudGltZSBmb3IgcXVlc3Rpb25cbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9jYWxpZmljYXRlU2luZ2xlQ2hvaWNlUXVlc3Rpb24oY3VycmVudFF1ZXN0aW9uLmlkKTtcbiAgICAgICAgICAgICAgICAvL2lmIHJ1bnRpbWUgZXhpc3RzLCB0aGUgcXVlc3Rpb24gaGFzIGJlZW4gYW5zd2VyZWRcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvL2lmIGNvcnJlY3RcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNjb3JlICs9IGN1cnJlbnRRdWVzdGlvbi5wb2ludHNGb3JTdWNjZXNzO1xuICAgICAgICAgICAgICAgICAgICAgICAgblN1Y2Nlc3MrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5GYWlscysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jaGVjayBpZiBpcyBwb3NzaWJsZSBzdWJzdHJhY3QgcG9pbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNjb3JlID49IGN1cnJlbnRRdWVzdGlvbi5wb2ludHNGb3JGYWlsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNjb3JlIC09IGN1cnJlbnRRdWVzdGlvbi5wb2ludHNGb3JGYWlsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuU3VjY2VzczogblN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgbkZhaWxzOiBuRmFpbHMsXG4gICAgICAgICAgICAgICAgc2NvcmU6IGN1cnJlbnRTY29yZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgX2NhbGlmaWNhdGVTaW5nbGVDaG9pY2VRdWVzdGlvbjogZnVuY3Rpb24gKHF1ZXN0aW9uSWQpIHtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHRoaXMuZ2V0UXVlc3Rpb25CeUlkKHF1ZXN0aW9uSWQpLCByZXN1bHQ7XG4gICAgICAgICAgICBpZiAocXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcXVlc3Rpb25SdW50aW1lID0gdGhpcy5fcnVudGltZVtxdWVzdGlvbi5pZF07IC8vZ2V0IHJ1bnRpbWUgZm9yIHF1ZXN0aW9uXG4gICAgICAgICAgICAgICAgLy9pZiBydW50aW1lIGV4aXN0cywgdGhlIHF1ZXN0aW9uIGhhcyBiZWVuIGFuc3dlcmVkXG4gICAgICAgICAgICAgICAgaWYgKHF1ZXN0aW9uUnVudGltZSAmJiBxdWVzdGlvblJ1bnRpbWUub3B0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxdWVzdGlvbk9wdGlvbnMgPSBxdWVzdGlvbi5vcHRpb25zLCAvL2dldCB0aGUgb3B0aW9ucyBvZiB0aGUgcXVlc3Rpb25cbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25PcHRpb25zTWFwID0gcXVlc3Rpb24ub3B0aW9uc01hcCwgLy9nZXQgdGhlIG9wdGlvbnMgbWFwIG9mIHRoZSBxdWVzdGlvblxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZE9wdGlvbklkID0gcXVlc3Rpb25SdW50aW1lLm9wdGlvbnNbMF0sIC8vZ2V0IHRoZSBpZCBvZiB0aGUgc2VsZWN0ZWQgcXVlc3Rpb25cbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRPcHRpb24gPSBxdWVzdGlvbk9wdGlvbnNbcXVlc3Rpb25PcHRpb25zTWFwW3NlbGVjdGVkT3B0aW9uSWRdXTtcbiAgICAgICAgICAgICAgICAgICAgLy9pZiBjb3JyZWN0XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHNlbGVjdGVkT3B0aW9uLmlzQ29ycmVjdDtcbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25SdW50aW1lLmlzQ29ycmVjdCA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuICAgICAgICBfY2FsaWZpY2F0ZU11bHRpQ2hvaWNlUXVlc3Rpb246IGZ1bmN0aW9uIChxdWVzdGlvbklkKSB7XG4gICAgICAgICAgICB2YXIgcXVlc3Rpb24gPSB0aGlzLmdldFF1ZXN0aW9uQnlJZChxdWVzdGlvbklkKSwgcmVzdWx0O1xuICAgICAgICAgICAgaWYgKHF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHF1ZXN0aW9uUnVudGltZSA9IHRoaXMuX3J1bnRpbWVbcXVlc3Rpb24uaWRdOyAvL2dldCBydW50aW1lIGZvciBxdWVzdGlvblxuICAgICAgICAgICAgICAgIGlmIChxdWVzdGlvblJ1bnRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHF1ZXN0aW9uT3B0aW9ucyA9IHF1ZXN0aW9uLm9wdGlvbnMsIC8vZ2V0IHRoZSBvcHRpb25zIG9mIHRoZSBxdWVzdGlvblxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZE9wdGlvbnMgPSBxdWVzdGlvblJ1bnRpbWUub3B0aW9ucywgLy9nZXQgc2VsZWN0ZWQgb3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICBuQ29ycmVjdE9wdGlvbnNTZWxlY3RlZCA9IDAsIC8vY291bnQgdGhlIHN1Y2Nlc3Mgb3B0aW9ucyBvZiB0aGUgcXVlc3Rpb25cbiAgICAgICAgICAgICAgICAgICAgbkNvcnJlY3RPcHRpb25zID0gMCwgbkluY29ycmVjdE9wdGlvbnNTZWxlY3RlZCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIC8vY2hlY2sgaWYgdGhlIGNvcnJlY3Qgb3B0aW9ucyBhcmUgYWxsIGNoZWNrZWRcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgcXVlc3Rpb25PcHRpb25JbmRleCA9IDAsIHF1ZXN0aW9uT3B0aW9uc0xlbmd0aCA9IHF1ZXN0aW9uT3B0aW9ucy5sZW5ndGg7IHF1ZXN0aW9uT3B0aW9uSW5kZXggPCBxdWVzdGlvbk9wdGlvbnNMZW5ndGg7IHF1ZXN0aW9uT3B0aW9uSW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRRdWVzdGlvbk9wdGlvbiA9IHF1ZXN0aW9uT3B0aW9uc1txdWVzdGlvbk9wdGlvbkluZGV4XSwgY2hlY2tlZCA9IHNlbGVjdGVkT3B0aW9ucy5pbmRleE9mKGN1cnJlbnRRdWVzdGlvbk9wdGlvbi5pZCkgIT0gLTE7IC8vaXMgY2hlY2tlZFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWVzdGlvbk9wdGlvbi5pc0NvcnJlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuQ29ycmVjdE9wdGlvbnMrKzsgLy9pbmNyZWFzZSB0b3RhbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5Db3JyZWN0T3B0aW9uc1NlbGVjdGVkICs9IGNoZWNrZWQgPyAxIDogMDsgLy9pbmNyZWFzZSBzZWxlY3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbkluY29ycmVjdE9wdGlvbnNTZWxlY3RlZCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbk9wdGlvbkluZGV4ID0gcXVlc3Rpb25PcHRpb25zTGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL2NoZWNrIGlmIHRoZSBjb3JyZWN0IG9wdGlvbnMgYXJlIGFsbCBjaGVja2VkXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5JbmNvcnJlY3RPcHRpb25zU2VsZWN0ZWQgPT0gMCAmJiBuQ29ycmVjdE9wdGlvbnNTZWxlY3RlZCA9PSBuQ29ycmVjdE9wdGlvbnM7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uUnVudGltZS5pc0NvcnJlY3QgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgX2NhbGlmaWNhdGVNdWx0aUNob2ljZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTY29yZSA9IDAsIHJ1bnRpbWUgPSB0aGlzLl9ydW50aW1lLCBxdWVzdGlvbnMgPSB0aGlzLl9xdWVzdGlvbnMsIG5TdWNjZXNzID0gMCwgbkZhaWxzID0gMDtcbiAgICAgICAgICAgIC8vZm9yIGVhY2ggcXVlc3Rpb25cbiAgICAgICAgICAgIGZvciAodmFyIHF1ZXN0aW9uSW5kZXggPSAwLCBxdWVzdGlvbnNMZW5ndGggPSBxdWVzdGlvbnMubGVuZ3RoOyBxdWVzdGlvbkluZGV4IDwgcXVlc3Rpb25zTGVuZ3RoOyBxdWVzdGlvbkluZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudFF1ZXN0aW9uID0gcXVlc3Rpb25zW3F1ZXN0aW9uSW5kZXhdLCBxdWVzdGlvblJ1bnRpbWUgPSBydW50aW1lW2N1cnJlbnRRdWVzdGlvbi5pZF0sIC8vZ2V0IHJ1bnRpbWUgZm9yIHF1ZXN0aW9uXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fY2FsaWZpY2F0ZU11bHRpQ2hvaWNlUXVlc3Rpb24oY3VycmVudFF1ZXN0aW9uLmlkKTtcbiAgICAgICAgICAgICAgICAvL2lmIHJ1bnRpbWUgZXhpc3RzLCB0aGUgcXVlc3Rpb24gaGFzIGJlZW4gYW5zd2VyZWRcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvL2NoZWNrIGlmIHRoZSBjb3JyZWN0IG9wdGlvbnMgYXJlIGFsbCBjaGVja2VkXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5TdWNjZXNzKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U2NvcmUgKz0gY3VycmVudFF1ZXN0aW9uLnBvaW50c0ZvclN1Y2Nlc3M7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuRmFpbHMrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2NvcmUgPj0gY3VycmVudFF1ZXN0aW9uLnBvaW50c0ZvckZhaWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U2NvcmUgLT0gY3VycmVudFF1ZXN0aW9uLnBvaW50c0ZvckZhaWw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG5TdWNjZXNzOiBuU3VjY2VzcyxcbiAgICAgICAgICAgICAgICBuRmFpbHM6IG5GYWlscyxcbiAgICAgICAgICAgICAgICBzY29yZTogY3VycmVudFNjb3JlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBfc2hvd09wdGlvblN0YXR1czogZnVuY3Rpb24gKHF1ZXN0aW9uSWQsIG9wdGlvbklkKSB7XG4gICAgICAgICAgICB2YXIgcXVlc3Rpb24gPSB0aGlzLmdldFF1ZXN0aW9uQnlJZChxdWVzdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChxdWVzdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBydW50aW1lID0gdGhpcy5fcnVudGltZVtxdWVzdGlvbi5pZF0sIG9wdGlvbiA9IHF1ZXN0aW9uLm9wdGlvbnNbcXVlc3Rpb24ub3B0aW9uc01hcFtvcHRpb25JZF1dO1xuICAgICAgICAgICAgICAgIGlmIChydW50aW1lICYmIG9wdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSBydW50aW1lLm9wdGlvbnMuaW5kZXhPZihvcHRpb25JZCkgIT0gLTE7XG4gICAgICAgICAgICAgICAgICAgIC8vaWYgdGhlIG9wdGlvbiBpcyBzZWxlY3RlZFxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi4kZWxlbWVudC5hZGRDbGFzcyhvcHRpb24uaXNDb3JyZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkNvcnJlY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uSW5jb3JyZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi4kZWxlbWVudC5hZGRDbGFzcyhvcHRpb24uaXNDb3JyZWN0ID8gdGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb25JbmNvcnJlY3QgOiBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRlbGVtZW50LmFkZENsYXNzKG9wdGlvbi5pc0NvcnJlY3QgPyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkluY29ycmVjdCA6IFwiXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFwbGljYSBsYSBjbGFzZSBjb3JyZXNwb25kaWVudGUgYWwgZXN0YWRvIGRlIGxhIHByZWd1bnRhLlxuICAgICAgICAgKiBTaSBsYSByZXNwdWVzdGEgaW5kaWNhZGEgZXMgY29ycmVjdGEgYcOxYWRlIGxhIGNsYXNlIENMQVNTX1FVRVNUSU9OX0NPUlJFQ1RcbiAgICAgICAgICogU2kgbGEgcmVzcHVlc3RhIGluZGljYWRhIGVzIGluY29ycmVjdGEgYcOxYWRlIGxhIGNsYXNlIENMQVNTX1FVRVNUSU9OX0lOQ09SUkVDVFxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gICAgICBxdWVzdGlvbklkICAgICAgSWQgZGUgbGEgcHJlZ3VudGEgYSBhY3R1YWxpemFyXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfc2hvd1F1ZXN0aW9uU3RhdHVzOiBmdW5jdGlvbiAocXVlc3Rpb25JZCkge1xuICAgICAgICAgICAgdmFyIHF1ZXN0aW9uID0gdGhpcy5nZXRRdWVzdGlvbkJ5SWQocXVlc3Rpb25JZCk7XG4gICAgICAgICAgICBpZiAocXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcnVudGltZSA9IHRoaXMuX3J1bnRpbWVbcXVlc3Rpb24uaWRdO1xuICAgICAgICAgICAgICAgIGlmIChydW50aW1lICYmIHJ1bnRpbWUub3B0aW9uICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHF1ZXN0aW9uLm9wdGlvbnM7XG4gICAgICAgICAgICAgICAgICAgIGlmIChydW50aW1lLmlzQ29ycmVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb24uJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb25Db3JyZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRlbGVtZW50LmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uSW5jb3JyZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIG9wdGlvbnNfMSA9IG9wdGlvbnM7IF9pIDwgb3B0aW9uc18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRPcHRpb24gPSBvcHRpb25zXzFbX2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRPcHRpb24uaXNDb3JyZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE9wdGlvbi4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkNvcnJlY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE9wdGlvbi4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkluY29ycmVjdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9zaG93T3B0aW9uRmVlZGJhY2s6IGZ1bmN0aW9uIChxdWVzdGlvbklkLCBvcHRpb25JZCkge1xuICAgICAgICAgICAgdmFyIHF1ZXN0aW9uID0gdGhpcy5nZXRRdWVzdGlvbkJ5SWQocXVlc3Rpb25JZCk7XG4gICAgICAgICAgICBpZiAocXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcnVudGltZSA9IHRoaXMuX3J1bnRpbWVbcXVlc3Rpb24uaWRdLCBvcHRpb24gPSBxdWVzdGlvbi5vcHRpb25zW3F1ZXN0aW9uLm9wdGlvbnNNYXBbb3B0aW9uSWRdXTtcbiAgICAgICAgICAgICAgICBpZiAocnVudGltZSAmJiBvcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gcnVudGltZS5vcHRpb25zLmluZGV4T2Yob3B0aW9uSWQpICE9IC0xO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb24uaXNDb3JyZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRmZWVkYmFja0tvLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24uJGZlZWRiYWNrT2suc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRmZWVkYmFja09rLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24uJGZlZWRiYWNrS28uc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogTXVlc3RyYSBlbCBmZWVkYmFjayBkZSB1bmEgcHJlZ3VudGFcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9ICBxdWVzdGlvbklkICAgICAgSWQgZGUgbGEgcHJlZ3VudGFcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9zaG93UXVlc3Rpb25GZWVkYmFjazogZnVuY3Rpb24gKHF1ZXN0aW9uSWQpIHtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHRoaXMuZ2V0UXVlc3Rpb25CeUlkKHF1ZXN0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKHF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJ1bnRpbWUgPSB0aGlzLl9ydW50aW1lW3F1ZXN0aW9uLmlkXTtcbiAgICAgICAgICAgICAgICBpZiAocnVudGltZSAmJiBydW50aW1lICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvL3RvZG8gYWRkIGNvbnRyb2wgb2YgbXVsdGkgY2hvaWNlXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb24gPSB0aGlzLmdldE9wdGlvbkJ5SWQocXVlc3Rpb25JZCwgcnVudGltZS5vcHRpb25zWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbi5pc0NvcnJlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRmZWVkYmFja0tvLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRmZWVkYmFja09rLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRmZWVkYmFja09rLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRmZWVkYmFja0tvLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlc2hhYmlsaXRhIHRvZG9zIGxvcyBjYW1wb3MgZGUgdW5hIHByZWd1bnRhXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSAgcXVlc3Rpb25JZCAgICAgIElkIGRlIGxhIHByZWd1bnRhIHBhcmEgbGEgY3VhbCBkZXNoYWJpbGl0YXIgbG9zIGNhbXBvc1xuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX2Rpc2FibGVRdWVzdGlvbk9wdGlvbnNGaWVsZDogZnVuY3Rpb24gKHF1ZXN0aW9uSWQpIHtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHRoaXMuZ2V0UXVlc3Rpb25CeUlkKHF1ZXN0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKHF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tdWx0aWNob2ljZSAmJiB0aGlzLl9zdGF0ZSA9PSB0aGlzLlNUQVRFUy5ydW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRlbGVtZW50LmZpbmQoXCI6Y2hlY2tlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb24uJGVsZW1lbnQuZmluZChcImlucHV0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfb25PcHRpb25DbGljazogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBpbnN0YW5jZSA9IGUuZGF0YS5pbnN0YW5jZSwgJHF1ZXN0aW9uID0gJCh0aGlzKSwgLy90aGUgZXZlbnQgaGFuZGxlciBpdCdzIGF0dGFjaGVkIHRvIHRoZSBxdWVzdGlvblxuICAgICAgICAgICAgcXVlc3Rpb25JZCA9ICRxdWVzdGlvbi5hdHRyKFwiaWRcIiksIHF1ZXN0aW9uUnVudGltZSA9IGluc3RhbmNlLl9ydW50aW1lW3F1ZXN0aW9uSWRdIHx8IHt9O1xuICAgICAgICAgICAgaWYgKGluc3RhbmNlLm9wdGlvbnMuaW1tZWRpYXRlRmVlZGJhY2sgPT09IHRydWUgJiYgcXVlc3Rpb25SdW50aW1lLm9wdGlvbiAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbnZvY2FkbyBhbCBjYW1iaWFyIGVsIHZhbG9yIGRlIHVuYSBvcGNpw7NuLlxuICAgICAgICAgKiBSZWdpc3RyYSBlbiBlbCBydW50aW1lIGRlIGxhIHByZWd1bnRhIGxhIG9wY2nDs24gc2VsZWNjaW9uYWRhLlxuICAgICAgICAgKiBTaSBzZSBlc3RhYmxlY2UgaW1tZWRpYXRlRmVlZGJhY2sgYSB0cnVlLCBzZSBkZXNoYWJpbGl0YW4gbG9zIGNhbXBvcywgc2UgYWN0dWFsaXphIGVsIHN0YXR1cyB5IHNlIG11ZXN0cmEgZWwgZmVlZGJhY2tcbiAgICAgICAgICogU2kgc2UgZXN0YWJsZWNlIGltbWVkaWF0ZUZlZWRiYWNrIGEgZmFsc2UsIHNlIGF2YW56YSBhIGxhIHNpZ3VpZW50ZSBwcmVndW50YSBhdXRvbcOhdGljYW1lbnRlXG4gICAgICAgICAqIEBwYXJhbSBlXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfb25PcHRpb25DaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgaW5zdGFuY2UgPSBlLmRhdGEuaW5zdGFuY2U7XG4gICAgICAgICAgICBpZiAoaW5zdGFuY2Uub3B0aW9ucy5kaXNhYmxlZCAhPSB0cnVlICYmIGluc3RhbmNlLl9zdGF0ZSA9PSBpbnN0YW5jZS5TVEFURVMucnVubmluZykge1xuICAgICAgICAgICAgICAgIHZhciAkb3B0aW9uID0gJChlLnRhcmdldClcbiAgICAgICAgICAgICAgICAgICAgLnBhcmVudHMoaW5zdGFuY2UuUVVFUllfT1BUSU9OKSwgJHF1ZXN0aW9uID0gJCh0aGlzKSwgLy90aGUgZXZlbnQgaGFuZGxlciBpdCdzIGF0dGFjaGVkIHRvIHRoZSBxdWVzdGlvblxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uSWQgPSAkcXVlc3Rpb24uYXR0cihcImlkXCIpLCBxdWVzdGlvblJ1bnRpbWUgPSBpbnN0YW5jZS5fcnVudGltZVtxdWVzdGlvbklkXSB8fCB7fSwgb3B0aW9ucyA9IHF1ZXN0aW9uUnVudGltZS5vcHRpb25zIHx8IFtdLCBvcHRpb25JZCA9ICRvcHRpb24uYXR0cihcImlkXCIpO1xuICAgICAgICAgICAgICAgIHF1ZXN0aW9uUnVudGltZS5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5fcnVudGltZVtxdWVzdGlvbklkXSA9IHF1ZXN0aW9uUnVudGltZTtcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2Uub3B0aW9ucy5tdWx0aWNob2ljZSkge1xuICAgICAgICAgICAgICAgICAgICAvL2lmIGl0ZW0gaXMgc2VsZWN0ZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0LmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYWRkXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnB1c2gob3B0aW9uSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJG9wdGlvbi5hZGRDbGFzcyhpbnN0YW5jZS5DTEFTU19TRUxFQ1RFRCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlbW92ZVxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuX3Jlc2V0T3B0aW9uKHF1ZXN0aW9uSWQsIG9wdGlvbklkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc3BsaWNlKG9wdGlvbnMuaW5kZXhPZihvcHRpb25JZCksIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLl9jYWxpZmljYXRlTXVsdGlDaG9pY2VRdWVzdGlvbihxdWVzdGlvbklkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChxdWVzdGlvblJ1bnRpbWUub3B0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fcmVzZXRPcHRpb24ocXVlc3Rpb25JZCwgcXVlc3Rpb25SdW50aW1lLm9wdGlvbnNbMF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnNbMF0gPSBvcHRpb25JZDtcbiAgICAgICAgICAgICAgICAgICAgJG9wdGlvbi5hZGRDbGFzcyhpbnN0YW5jZS5DTEFTU19TRUxFQ1RFRCk7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLl9jYWxpZmljYXRlU2luZ2xlQ2hvaWNlUXVlc3Rpb24ocXVlc3Rpb25JZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vZ28gbmV4dCBpZiBpc24ndCBpbW1lZGlhdGVGZWVkYmFjayBhbmQgaXNudCBtdWx0aWNob2ljZVxuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5vcHRpb25zLmltbWVkaWF0ZUZlZWRiYWNrID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLm9wdGlvbnMuZGlzYWJsZU9wdGlvbkFmdGVyU2VsZWN0ID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLl9kaXNhYmxlUXVlc3Rpb25PcHRpb25zRmllbGQocXVlc3Rpb25JZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaW5zdGFuY2Uub3B0aW9ucy5kaXNhYmxlTmV4dFVudGlsU3VjY2VzcyA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fdXBkYXRlTmF2aWdhdGlvbkFjdGlvbnNTdGF0ZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fc2hvd1F1ZXN0aW9uU3RhdHVzKHF1ZXN0aW9uSWQpO1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fc2hvd09wdGlvblN0YXR1cyhxdWVzdGlvbklkLCBvcHRpb25JZCk7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLl9zaG93T3B0aW9uRmVlZGJhY2socXVlc3Rpb25JZCwgb3B0aW9uSWQpO1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fc2hvd1F1ZXN0aW9uRmVlZGJhY2socXVlc3Rpb25JZCwgb3B0aW9uSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpbnN0YW5jZS5vcHRpb25zLmF1dG9Hb05leHQgIT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLm9wdGlvbnMubXVsdGljaG9pY2UgIT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UubmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgaW5zdGFuY2Uub3B0aW9ucy5kZWxheU9uQXV0b05leHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc3RhbmNlLmVsZW1lbnQudHJpZ2dlckhhbmRsZXIoaW5zdGFuY2UuT05fT1BUSU9OX0NIQU5HRSwgW3RoaXMsIHF1ZXN0aW9uSWQsIG9wdGlvbklkXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9yZXNldE9wdGlvbjogZnVuY3Rpb24gKHF1ZXN0aW9uSWQsIG9wdGlvbklkKSB7XG4gICAgICAgICAgICB2YXIgcXVlc3Rpb24gPSB0aGlzLmdldFF1ZXN0aW9uQnlJZChxdWVzdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChxdWVzdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBvcHRpb24gPSBxdWVzdGlvbi5vcHRpb25zW3F1ZXN0aW9uLm9wdGlvbnNNYXBbb3B0aW9uSWRdXTtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi4kZmVlZGJhY2tLby5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi4kZmVlZGJhY2tPay5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi4kZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zZWxlY3RlZCArIFwiIFwiICsgdGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb25Db3JyZWN0ICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkluY29ycmVjdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfc2V0T3B0aW9uOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fc3VwZXIoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFamVjdXRhIGxhIGFuaW1hY2nDs24gcGFyYSBvY3VsdGFyIHVuYSBwcmVndW50YS5cbiAgICAgICAgICogTGFuemEgZWwgZXZlbnRvIE9OX1FVRVNUSU9OX0hJREUuIFNpIGVsIGV2ZW50byBkZXZ1ZWx2ZSB1bmEgcHJvbWVzYSwgbm8gc2UgZWplY3V0YSBsYSBhbmltYWNpw7NuIHBvciBkZWZlY3RvIHkgZW4gc3UgbHVnYXIgZXNwZXJhIGEgcXVlIHNlIGNvbXBsZXRlIGxhIHByb21lc2EgZGV2dWVsdGFcbiAgICAgICAgICogQHBhcmFtIHtKUXVlcnl9ICBxdWVzdGlvblRvSGlkZSAgUHJlZ3VudGEgYSBvY3VsdGFyXG4gICAgICAgICAqIEByZXR1cm5zIHtKUXVlcnlQcm9taXNlPFQ+fSAgUHJvbWVzYSByZXN1bHRhIGFsIGZpbmFsaXphcnNlIGxhIGFuaW1hY2nDs25cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9oaWRlOiBmdW5jdGlvbiAocXVlc3Rpb25Ub0hpZGUpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgaGlkZURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuZWxlbWVudC50cmlnZ2VySGFuZGxlcih0aGlzLk9OX1FVRVNUSU9OX0hJREUsIFt0aGlzLCBxdWVzdGlvblRvSGlkZV0pO1xuICAgICAgICAgICAgLy9pZiB0aGUgZXZlbnQgcmV0dXJucyBhIHByb21pc2VcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT0gdW5kZWZpbmVkICYmIHJlc3VsdC5oYXNPd25Qcm9wZXJ0eShcInRoZW5cIikpIHtcbiAgICAgICAgICAgICAgICAvL3dhaXRzIGZvciB0aGUgcHJvbWlzZSB0byBjb250aW51ZVxuICAgICAgICAgICAgICAgIHJlc3VsdC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaGlkZURlZmVyLnJlc29sdmVXaXRoKF90aGlzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1ZXN0aW9uVG9IaWRlLmZhZGVPdXQoNDAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGhpZGVEZWZlci5yZXNvbHZlV2l0aChfdGhpcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaGlkZURlZmVyLnByb21pc2UoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVqZWN1dGEgbGEgYW5pbWFjacOzbiBwYXJhIG1vc3RyYXIgdW5hIHByZWd1bnRhLlxuICAgICAgICAgKiBMYW56YSBlbCBldmVudG8gT05fUVVFU1RJT05fU0hPVy4gU2kgZWwgZXZlbnRvIGRldnVlbHZlIHVuYSBwcm9tZXNhLCBubyBzZSBlamVjdXRhIGxhIGFuaW1hY2nDs24gcG9yIGRlZmVjdG8geSBlbiBzdSBsdWdhciBlc3BlcmEgYSBxdWUgc2UgY29tcGxldGUgbGEgcHJvbWVzYSBkZXZ1ZWx0YVxuICAgICAgICAgKiBAcGFyYW0ge0pRdWVyeX0gIHF1ZXN0aW9uVG9TaG93ICBQcmVndW50YSBhIG9jdWx0YXJcbiAgICAgICAgICogQHJldHVybnMge0pRdWVyeVByb21pc2U8VD59ICBQcm9tZXNhIHJlc3VsdGEgYWwgZmluYWxpemFyc2UgbGEgYW5pbWFjacOzblxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX3Nob3c6IGZ1bmN0aW9uIChuZXh0UXVlc3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgc2hvd0RlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuZWxlbWVudC50cmlnZ2VySGFuZGxlcih0aGlzLk9OX1FVRVNUSU9OX1NIT1csIFt0aGlzLCBuZXh0UXVlc3Rpb25dKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT0gdW5kZWZpbmVkICYmIHJlc3VsdC5oYXNPd25Qcm9wZXJ0eShcInRoZW5cIikpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNob3dEZWZlci5yZXNvbHZlV2l0aChfdGhpcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXh0UXVlc3Rpb24uZmFkZUluKDQwMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzaG93RGVmZXIucmVzb2x2ZVdpdGgoX3RoaXMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNob3dEZWZlci5wcm9taXNlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbnZvY2FkbyBhbCBmaW5hbGl6YXJzZSBsYSBhbmltYWNpw7NuIGRlIG9jdWx0YXIgY2FiZWNlcmEuXG4gICAgICAgICAqIEBwYXJhbSBkZWZlclxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX29uSGVhZGVySGlkZGVuOiBmdW5jdGlvbiAoZGVmZXIpIHtcbiAgICAgICAgICAgIC8vdGhpcy5fJGhlYWRlciA9IHRoaXMuXyRoZWFkZXIuZGV0YWNoKCk7XG4gICAgICAgICAgICBkZWZlci5yZXNvbHZlV2l0aCh0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVqZWN1dGEgbGEgYW5pbWFjacOzbiBwYXJhIG9jdWx0YXIgbGEgY2FiZWNlcmFcbiAgICAgICAgICogTGFuemEgZWwgZXZlbnRvIE9OX0hFQURFUl9ISURFLiBTaSBlbCBldmVudG8gZGV2dWVsdmUgdW5hIHByb21lc2EsIG5vIHNlIGVqZWN1dGEgbGEgYW5pbWFjacOzbiBwb3IgZGVmZWN0byB5IGVuIHN1IGx1Z2FyIGVzcGVyYSBhIHF1ZSBzZSBjb21wbGV0ZSBsYSBwcm9tZXNhIGRldnVlbHRhXG4gICAgICAgICAqIEByZXR1cm5zIHtKUXVlcnlQcm9taXNlPFQ+fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX2hpZGVIZWFkZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmVsZW1lbnQudHJpZ2dlckhhbmRsZXIodGhpcy5PTl9IRUFERVJfSElERSwgW3RoaXMsIHRoaXMuXyRoZWFkZXJdKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT0gdW5kZWZpbmVkICYmIHJlc3VsdC5oYXNPd25Qcm9wZXJ0eShcInRoZW5cIikpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudGhlbih0aGlzLl9vbkhlYWRlckhpZGRlbi5iaW5kKHRoaXMsIGRlZmVyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl8kaGVhZGVyLmZhZGVPdXQoNDAwLCB0aGlzLl9vbkhlYWRlckhpZGRlbi5iaW5kKHRoaXMsIGRlZmVyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogRWplY3V0YSBsYSBhbmltYWNpw7NuIHBhcmEgbW9zdHJhciBsYSBjYWJlY2VyYVxuICAgICAgICAgKiBMYW56YSBlbCBldmVudG8gT05fSEVBREVSX1NIT1cuIFNpIGVsIGV2ZW50byBkZXZ1ZWx2ZSB1bmEgcHJvbWVzYSwgbm8gc2UgZWplY3V0YSBsYSBhbmltYWNpw7NuIHBvciBkZWZlY3RvIHkgZW4gc3UgbHVnYXIgZXNwZXJhIGEgcXVlIHNlIGNvbXBsZXRlIGxhIHByb21lc2EgZGV2dWVsdGFcbiAgICAgICAgICogQHJldHVybnMge0pRdWVyeVByb21pc2U8VD59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfc2hvd0hlYWRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgIC8vdGhpcy5fJHdyYXBwZXIucHJlcGVuZCh0aGlzLl8kaGVhZGVyKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmVsZW1lbnQudHJpZ2dlckhhbmRsZXIodGhpcy5PTl9IRUFERVJfU0hPVywgW3RoaXMsIHRoaXMuXyRoZWFkZXJdKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT0gdW5kZWZpbmVkICYmIHJlc3VsdC5oYXNPd25Qcm9wZXJ0eShcInRoZW5cIikpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlc29sdmVXaXRoKF90aGlzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuXyRoZWFkZXIuZmFkZUluKDQwMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlV2l0aChfdGhpcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogSW52b2NhZG8gYWwgb2N1bHRhcnNlIGVsIGN1ZXJwb1xuICAgICAgICAgKiBAcGFyYW0ge0pRdWVyeURlZmVycmVkfSAgZGVmZXIgICAgICAgRGVmZXJyZWQgYSByZXNvbHZlclxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX29uQm9keUhpZGRlbjogZnVuY3Rpb24gKGRlZmVyKSB7XG4gICAgICAgICAgICAvL3RoaXMuXyRib2R5ID0gdGhpcy5fJGJvZHkuZGV0YWNoKCk7XG4gICAgICAgICAgICBkZWZlci5yZXNvbHZlV2l0aCh0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVqZWN1dGEgbGEgYW5pbWFjacOzbiBwYXJhIG9jdWx0YXIgZWwgY3VlcnBvXG4gICAgICAgICAqIExhbnphIGVsIGV2ZW50byBPTl9CT0RZX0hJREUuIFNpIGVsIGV2ZW50byBkZXZ1ZWx2ZSB1bmEgcHJvbWVzYSwgbm8gc2UgZWplY3V0YSBsYSBhbmltYWNpw7NuIHBvciBkZWZlY3RvIHkgZW4gc3UgbHVnYXIgZXNwZXJhIGEgcXVlIHNlIGNvbXBsZXRlIGxhIHByb21lc2EgZGV2dWVsdGFcbiAgICAgICAgICogQHJldHVybnMge0pRdWVyeVByb21pc2U8VD59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfaGlkZUJvZHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmVsZW1lbnQudHJpZ2dlckhhbmRsZXIodGhpcy5PTl9CT0RZX0hJREUsIFt0aGlzLCB0aGlzLl8kYm9keV0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPSB1bmRlZmluZWQgJiYgcmVzdWx0Lmhhc093blByb3BlcnR5KFwidGhlblwiKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC50aGVuKHRoaXMuX29uQm9keUhpZGRlbi5iaW5kKHRoaXMsIGRlZmVyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl8kYm9keS5mYWRlT3V0KDQwMCwgdGhpcy5fb25Cb2R5SGlkZGVuLmJpbmQodGhpcywgZGVmZXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFamVjdXRhIGxhIGFuaW1hY2nDs24gcGFyYSBtb3N0cmFyIGVsIGN1ZXJwb1xuICAgICAgICAgKiBMYW56YSBlbCBldmVudG8gT05fQk9EWV9TSE9XLiBTaSBlbCBldmVudG8gZGV2dWVsdmUgdW5hIHByb21lc2EsIG5vIHNlIGVqZWN1dGEgbGEgYW5pbWFjacOzbiBwb3IgZGVmZWN0byB5IGVuIHN1IGx1Z2FyIGVzcGVyYSBhIHF1ZSBzZSBjb21wbGV0ZSBsYSBwcm9tZXNhIGRldnVlbHRhXG4gICAgICAgICAqIEByZXR1cm5zIHtKUXVlcnlQcm9taXNlPFQ+fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX3Nob3dCb2R5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIGRlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgLy90aGlzLl8kd3JhcHBlci5wcmVwZW5kKHRoaXMuXyRib2R5KTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmVsZW1lbnQudHJpZ2dlckhhbmRsZXIodGhpcy5PTl9CT0RZX1NIT1csIFt0aGlzLCB0aGlzLl8kYm9keV0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPSB1bmRlZmluZWQgJiYgcmVzdWx0Lmhhc093blByb3BlcnR5KFwidGhlblwiKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZVdpdGgoX3RoaXMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fJGJvZHkuZmFkZUluKDQwMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlV2l0aChfdGhpcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogRWplY3V0YSBsYSBhbmltYWNpw7NuIGRlIGNvbWllbnpvLlxuICAgICAgICAgKiBAcmV0dXJucyB7SlF1ZXJ5UHJvbWlzZTxUPn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9hbmltYXRpb25TdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKSwgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLl9oaWRlSGVhZGVyKClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuX3Nob3dCb2R5KClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlV2l0aCh0aGF0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVqZWN1dGEgbGEgYW5pbWFjacOzbiBkZSBmaW5hbGl6YWNpw7NuLlxuICAgICAgICAgKiBAcmV0dXJucyB7SlF1ZXJ5UHJvbWlzZTxUPn1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9hbmltYXRpb25TdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIGRlZmVyID0gJC5EZWZlcnJlZCgpLCB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuX2hpZGVCb2R5KClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuX3Nob3dIZWFkZXIoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlc29sdmVXaXRoKHRoYXQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogRGVzaGFiaWxpdGEgZWwgYm90w7NuIGZpbmFsaXphclxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX2Rpc2FibGVFbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuXyRlbmRCdG4ucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5fJGVuZEJ0bi5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5kaXNhYmxlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIYWJpbGl0YSBlbCBib3TDs24gZmluYWxpemFyXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfZW5hYmxlRW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl8kZW5kQnRuLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLl8kZW5kQnRuLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmRpc2FibGVkKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlc2hhYmlsaXRhIGVsIGJvdMOzbiBhbnRlcmlvclxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX2Rpc2FibGVQcmV2OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl8kcHJldkJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLl8kcHJldkJ0bi5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5kaXNhYmxlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIYWJpbGl0YSBlbCBib3TDs24gYW50ZXJpb3JcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9lbmFibGVQcmV2OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl8kcHJldkJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5fJHByZXZCdG4ucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuZGlzYWJsZWQpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogRGVzaGFiaWxpdGEgZWwgYm90w7NuIHNpZ3VpZW50ZVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX2Rpc2FibGVOZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl8kbmV4dEJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLl8kbmV4dEJ0bi5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5kaXNhYmxlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIYWJpbGl0YSBlbCBib3TDs24gc2lndWllbnRlXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfZW5hYmxlTmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fJG5leHRCdG4ucHJvcChcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuXyRuZXh0QnRuLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmRpc2FibGVkKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEludm9jYWRvIGFsIGZpbmFsaXphciBsYSBhbmltYWNpw7NuICBkZSBjb21pZW56by4gQXZhbnphIGEgbGEgcHJpbWVyYSBww6FnaW5hIHkgbGFuemEgZWwgZXZlbnRvIE9OX1NUQVJUXG4gICAgICAgICAqIEByZXR1cm5zIHtKUXVlcnlQcm9taXNlPFQ+fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX29uQW5pbWF0aW9uU3RhcnRFbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZ29UbygwKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC50cmlnZ2VyKHRoaXMuT05fU1RBUlRFRCwgW3RoaXNdKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEludm9jYWRvIGFsIGZpbmFsaXphcnNlIGxhIGFuaW1hY2nDs24gZGUgZmluYWxpemFjacOzbi4gUmVzZXRlYSBlbCBjdWVzdGlvbmFyaW9cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9vbkFuaW1hdGlvbkVuZEVuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogSW52b2NhZG8gYWwgZmluYWxpemFyIGxhIHRyYW5zaWNpw7NuIGVudHJlIHByZWd1bnRhcy4gQWN0dWFsaXphIGVsIGVzdGFkbyBkZSBsb3MgYm90w7NuZXMgZGUgbmF2ZWdhY2nDs24geSBsYW56YSBlbCBldmVudG8gT05fVFJBTlNJVElPTl9FTkRcbiAgICAgICAgICogQHBhcmFtIG9sZFBhZ2VcbiAgICAgICAgICogQHBhcmFtIG5ld1BhZ2VcbiAgICAgICAgICogQHBhcmFtIGRlZmVyXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfb25RdWVzdGlvblRyYW5zaXRpb25FbmQ6IGZ1bmN0aW9uIChvbGRQYWdlLCBuZXdQYWdlLCBkZWZlcikge1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlTmF2aWdhdGlvbkFjdGlvbnNTdGF0ZXMoKTtcbiAgICAgICAgICAgIGRlZmVyLnJlc29sdmVXaXRoKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnRyaWdnZXJIYW5kbGVyKHRoaXMuT05fVFJBTlNJVElPTl9FTkQsIFt0aGlzLCBvbGRQYWdlLCBuZXdQYWdlXSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN1ZWx2ZSBsb3MgZXN0YWRvcyBkZSBsYXMgYWNjaW9uZXMgZGUgbmF2ZWdhY2nDs25cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF91cGRhdGVOYXZpZ2F0aW9uQWN0aW9uc1N0YXRlczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHF1ZXN0aW9uID0gdGhpcy5nZXRRdWVzdGlvbkJ5SW5kZXgodGhpcy5fY3VycmVudFF1ZXN0aW9uSW5kZXgpLCBxdWVzdGlvblJ1bnRpbWUgPSB0aGlzLl9ydW50aW1lW3F1ZXN0aW9uLmlkXTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jdXJyZW50UXVlc3Rpb25JbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVQcmV2KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZW5hYmxlTmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5fY3VycmVudFF1ZXN0aW9uSW5kZXggPT09IHRoaXMuX3F1ZXN0aW9ucy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5leHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVQcmV2KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVQcmV2KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZW5hYmxlTmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbW1lZGlhdGVGZWVkYmFjayA9PSB0cnVlICYmIHRoaXMub3B0aW9ucy5kaXNhYmxlT3B0aW9uQWZ0ZXJTZWxlY3QgIT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGlzYWJsZU5leHRVbnRpbFN1Y2Nlc3MgPT0gdHJ1ZSAmJiAocXVlc3Rpb25SdW50aW1lID09IHVuZGVmaW5lZCB8fCBxdWVzdGlvblJ1bnRpbWUuaXNDb3JyZWN0ICE9IHRydWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOZXh0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5vcHRpb25zLmRpc2FibGVFbmRBY3Rpb25VbnRpbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHRoaXMuRElTQUJMRV9FTkQuYmVmb3JlQW5zd2VyQWxsOlxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXModGhpcy5fcnVudGltZSkgPT0gdGhpcy5fcXVlc3Rpb25zLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHRoaXMuRElTQUJMRV9FTkQuYmVmb3JlQW5zd2VyQWxsQ29ycmVjdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb3JyZWN0ID0gMCwgcnVudGltZSA9IHRoaXMuX3J1bnRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBxdWVzdGlvbklkIGluIHJ1bnRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcXVlc3Rpb25SdW50aW1lXzEgPSBydW50aW1lW3F1ZXN0aW9uSWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWVzdGlvblJ1bnRpbWVfMS5pc0NvcnJlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ycmVjdCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb3JyZWN0ID09IHRoaXMuX3F1ZXN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVFbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVFbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEludm9jYWRvIGFsIGZpbmFsaXphciBkZSB2ZXIgZWwgcmVzdWx0YWRvLiBFc3RhYmxlY2UgZWwgZXN0YWRvIGRlbCBjdWVzdGlvbmFyaW8gYSBvZmZcbiAgICAgICAgICogQHBhcmFtIGVcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9vbkVuZFNob3dSZXN1bHQ6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgaW5zdGFuY2UgPSBlLmRhdGEuaW5zdGFuY2U7XG4gICAgICAgICAgICBpbnN0YW5jZS5lbmQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9idGllbmUgbG9zIHB1bnRvcyBtw6F4aW1vcyBxdWUgc2UgcHVlZGUgYWxjYW56YXIgZW4gZWwgcXVlc3Rpb25hcmlvXG4gICAgICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICAgICAqL1xuICAgICAgICBnZXRNYXhQb2ludHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYXhTY29yZTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9idGllbmUgZWwgaWQgZGVsIGN1ZXN0aW9uYXJpb1xuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0SWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuYXR0cihcImlkXCIpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogQXZhbnphIGEgbGEgc2lndWllbnRlIHByZWd1bnRhLlxuICAgICAgICAgKiBAcmV0dXJucyB7SlF1ZXJ5UHJvbWlzZTxUPnxudWxsfSBTaSBsYSBuYXZlZ2FjacOzbiBzZSByZWFsaXphLCBkZXZ1ZWx2ZSB1bmEgcHJvbWVzYSBxdWUgc2Vyw6EgcmVzdWVsdGEgYWwgZmluYWxpemFyIGxhIHRyYW5zaWNpw7NuXG4gICAgICAgICAqL1xuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY3VycmVudFF1ZXN0aW9uSW5kZXggIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ29Ubyh0aGlzLl9jdXJyZW50UXVlc3Rpb25JbmRleCArIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ29UbygwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHJvY2VkZSBhIGxhIHByZWd1bnRhIGFudGVyaW9yXG4gICAgICAgICAqIEByZXR1cm5zIHtKUXVlcnlQcm9taXNlPFQ+fG51bGx9IFNpIGxhIG5hdmVnYWNpw7NuIHNlIHJlYWxpemEsIGRldnVlbHZlIHVuYSBwcm9tZXNhIHF1ZSBzZXLDoSByZXN1ZWx0YSBhbCBmaW5hbGl6YXIgbGEgdHJhbnNpY2nDs25cbiAgICAgICAgICovXG4gICAgICAgIHByZXY6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jdXJyZW50UXVlc3Rpb25JbmRleCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nb1RvKHRoaXMuX2N1cnJlbnRRdWVzdGlvbkluZGV4IC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nb1RvKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogTmF2ZWdhIGEgdW5hIHByZWd1bnRhIGVuIGNvbmNyZXRvXG4gICAgICAgICAqIEByZXR1cm5zIHtKUXVlcnlQcm9taXNlPFQ+fG51bGx9IFNpIGxhIG5hdmVnYWNpw7NuIHNlIHJlYWxpemEsIGRldnVlbHZlIHVuYSBwcm9tZXNhIHF1ZSBzZXLDoSByZXN1ZWx0YSBhbCBmaW5hbGl6YXIgbGEgdHJhbnNpY2nDs25cbiAgICAgICAgICovXG4gICAgICAgIGdvVG86IGZ1bmN0aW9uIChxdWVzdGlvbkluZGV4KSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIHByb21pc2U7XG4gICAgICAgICAgICBpZiAodGhpcy5fc3RhdGUgPT09IHRoaXMuU1RBVEVTLnJ1bm5pbmcgfHwgdGhpcy5fc3RhdGUgPT0gdGhpcy5TVEFURVMucmV2aWV3KSB7XG4gICAgICAgICAgICAgICAgdmFyIG5leHRRdWVzdGlvbl8xID0gdGhpcy5fcXVlc3Rpb25zW3F1ZXN0aW9uSW5kZXhdLCBjdXJyZW50UXVlc3Rpb25JbmRleCA9IHRoaXMuX2N1cnJlbnRRdWVzdGlvbkluZGV4LCBjdXJyZW50UXVlc3Rpb25fMSA9IHRoaXMuX3F1ZXN0aW9uc1tjdXJyZW50UXVlc3Rpb25JbmRleF07XG4gICAgICAgICAgICAgICAgLy9lbnN1cmUgdGhhdCBuZXh0IHF1ZXN0aW9uIGV4aXN0cyBhbmQgaXQncyBkaWZmZXJlbnQgb2YgdGhlIGN1cnJlbnQgcXVlc3Rpb25cbiAgICAgICAgICAgICAgICBpZiAobmV4dFF1ZXN0aW9uXzEgIT0gdW5kZWZpbmVkICYmIChjdXJyZW50UXVlc3Rpb25fMSA9PSB1bmRlZmluZWQgfHwgY3VycmVudFF1ZXN0aW9uXzEgIT0gbmV4dFF1ZXN0aW9uXzEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWZlcl8xID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgICAgICAgICBwcm9taXNlID0gZGVmZXJfMS5wcm9taXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vcHJldmVudCBuYXZpZ2F0aW9uIGR1cmluZyB0cmFuc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVQcmV2KCk7XG4gICAgICAgICAgICAgICAgICAgIC8vc3RvcmUgcXVlc3Rpb24gaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudFF1ZXN0aW9uSW5kZXggPSBxdWVzdGlvbkluZGV4O1xuICAgICAgICAgICAgICAgICAgICBpZiAocXVlc3Rpb25JbmRleCA9PSB0aGlzLl9xdWVzdGlvbnMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmZpcnN0UXVlc3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmxhc3RRdWVzdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocXVlc3Rpb25JbmRleCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMubGFzdFF1ZXN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5maXJzdFF1ZXN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5maXJzdFF1ZXN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5sYXN0UXVlc3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hdHRyKHRoaXMuQVRUUl9DVVJSRU5UX1FVRVNUSU9OLCBxdWVzdGlvbkluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgLy9pZiBjdXJyZW50IHF1ZXN0aW9uIGV4aXN0c1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFF1ZXN0aW9uXzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaGlkZSB0aGUgY3VycmVudCBxdWVzdGlvbiBhbmQgdGhlbiBzaG93IHRoZSBuZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9oaWRlKGN1cnJlbnRRdWVzdGlvbl8xLiRlbGVtZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fc2hvdyhuZXh0UXVlc3Rpb25fMS4kZWxlbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oX3RoaXMuX29uUXVlc3Rpb25UcmFuc2l0aW9uRW5kLmJpbmQoX3RoaXMsIGN1cnJlbnRRdWVzdGlvbl8xLCBuZXh0UXVlc3Rpb25fMSwgZGVmZXJfMSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2lmIGN1cnJlbnQgcXVlc2l0b24gZG9lc24ndCBleGlzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Nob3cobmV4dFF1ZXN0aW9uXzEuJGVsZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25RdWVzdGlvblRyYW5zaXRpb25FbmQuYmluZCh0aGlzLCBjdXJyZW50UXVlc3Rpb25fMSwgbmV4dFF1ZXN0aW9uXzEsIGRlZmVyXzEpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogT2J0aWVuZSBsYXMgcHJlZ3VudGFzXG4gICAgICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICAgICAqL1xuICAgICAgICBnZXRRdWVzdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9xdWVzdGlvbnM7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPYnRpZW5lIHVuYSBwcmVndW50YSBwb3Igw61uZGljZVxuICAgICAgICAgKiBAcGFyYW0gaW5kZXhcbiAgICAgICAgICogQHJldHVybnMge2FueX1cbiAgICAgICAgICovXG4gICAgICAgIGdldFF1ZXN0aW9uQnlJbmRleDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcXVlc3Rpb25zW2luZGV4XTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE9idGllbmUgdW5hIHByZWd1bnRhIHBvciBzdSBpZFxuICAgICAgICAgKiBAcGFyYW0gaWRcbiAgICAgICAgICogQHJldHVybnMge2FueX1cbiAgICAgICAgICovXG4gICAgICAgIGdldFF1ZXN0aW9uQnlJZDogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRRdWVzdGlvbkJ5SW5kZXgodGhpcy5fcXVlc3Rpb25zTWFwW2lkXSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPYnRpZW5lIGxhcyBvcGNpb25lcyBkZSB1bmEgcHJlZ3VudGFcbiAgICAgICAgICogQHBhcmFtIHF1ZXN0aW9uSWRcbiAgICAgICAgICogQHJldHVybnMge2FueX1cbiAgICAgICAgICovXG4gICAgICAgIGdldE9wdGlvbnM6IGZ1bmN0aW9uIChxdWVzdGlvbklkKSB7XG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuZ2V0UXVlc3Rpb25CeUlkKHF1ZXN0aW9uSWQpIHx8IHt9KS5vcHRpb25zO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogT2J0aWVuZSB1bmEgb3BjacOzbiBwb3Igw61uZGljZSBwYXJhIHVuYSBwcmVndW50YVxuICAgICAgICAgKiBAcGFyYW0gcXVlc3Rpb25JZFxuICAgICAgICAgKiBAcGFyYW0gb3B0aW9uSW5kZXhcbiAgICAgICAgICogQHJldHVybnMge2FueX1cbiAgICAgICAgICovXG4gICAgICAgIGdldE9wdGlvbkJ5SW5kZXg6IGZ1bmN0aW9uIChxdWVzdGlvbklkLCBvcHRpb25JbmRleCkge1xuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnMocXVlc3Rpb25JZCksIG9wdGlvbjtcbiAgICAgICAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9uID0gb3B0aW9uc1tvcHRpb25JbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9uO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogT2J0aWVuZSB1bmEgb3BjacOzbiBwb3IgaWQgcGFyYSB1bmEgcHJlZ3VudGEgZW4gY29uY3JldG9cbiAgICAgICAgICogQHBhcmFtIHF1ZXN0aW9uSWRcbiAgICAgICAgICogQHBhcmFtIG9wdGlvbklkXG4gICAgICAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgICAgICAqL1xuICAgICAgICBnZXRPcHRpb25CeUlkOiBmdW5jdGlvbiAocXVlc3Rpb25JZCwgb3B0aW9uSWQpIHtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHRoaXMuZ2V0UXVlc3Rpb25CeUlkKHF1ZXN0aW9uSWQpLCBvcHRpb247XG4gICAgICAgICAgICBpZiAocXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICBvcHRpb24gPSBxdWVzdGlvbi5vcHRpb25zW3F1ZXN0aW9uLm9wdGlvbnNNYXBbb3B0aW9uSWRdXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvcHRpb247XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzZXRlYSBlbCBmb3JtdWxhcmlvXG4gICAgICAgICAqL1xuICAgICAgICByZXNldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fcnVudGltZSA9IHt9O1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHIodGhpcy5BVFRSX0NVUlJFTlRfUVVFU1RJT04pO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmZpcnN0UXVlc3Rpb24pO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmxhc3RRdWVzdGlvbik7XG4gICAgICAgICAgICB0aGlzLl8kcXVlc3Rpb25zLmhpZGUoKTtcbiAgICAgICAgICAgIHRoaXMuXyRxdWVzdGlvbnMuZmlyc3QoKVxuICAgICAgICAgICAgICAgIC5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLl8kcXVlc3Rpb25zLmZpbmQoXCJpbnB1dFwiKVxuICAgICAgICAgICAgICAgIC5wcm9wKFwiY2hlY2tlZFwiLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cihcImRpc2FibGVkXCIpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9GRUVEQkFDSylcbiAgICAgICAgICAgICAgICAuaGlkZSgpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmZpbmQoXCIuXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkNvcnJlY3QpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uQ29ycmVjdCk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuZmluZChcIi5cIiArIHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uSW5jb3JyZWN0KVxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkluY29ycmVjdCk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuZmluZChcIi5cIiArIHRoaXMub3B0aW9ucy5jbGFzc2VzLnNlbGVjdGVkKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zZWxlY3RlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb21pZW56YSBlbCBjdWVzdGlvbmFyaW9cbiAgICAgICAgICovXG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRpc2FibGVkICE9IHRydWUgJiYgdGhpcy5fc3RhdGUgPT09IHRoaXMuU1RBVEVTLm9mZikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NoYW5nZVN0YXRlKHRoaXMuU1RBVEVTLnJ1bm5pbmcpO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC50cmlnZ2VyKHRoaXMuT05fU1RBUlQsIFt0aGlzXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcnVudGltZSA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMuX2FuaW1hdGlvblN0YXJ0KClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25BbmltYXRpb25TdGFydEVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNdWVzdHJhIGVsIHJlc3VsdGFkbyBkZWwgY3Vlc3Rpb25hcmlvXG4gICAgICAgICAqIEBwYXJhbSBjYWxpZmljYXRpb25cbiAgICAgICAgICovXG4gICAgICAgIHNob3dSZXN1bHQ6IGZ1bmN0aW9uIChjYWxpZmljYXRpb24pIHtcbiAgICAgICAgICAgIGlmIChjYWxpZmljYXRpb24gJiYgdGhpcy5vcHRpb25zLnNob3dSZXN1bHQgJiYgdGhpcy5fJHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NoYW5nZVN0YXRlKHRoaXMuU1RBVEVTLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVuZGVyVmFyKHRoaXMuUVVFUllfUkVOREVSX1JFU1VMVCwgXCJqcVF1ZXN0aW9ubmFpcmVSZXN1bHRJdGVtXCIsIGNhbGlmaWNhdGlvbiwgdGhpcy5fJHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fJHJlc3VsdC5kaWFsb2codGhpcy5vcHRpb25zLmRpYWxvZylcbiAgICAgICAgICAgICAgICAgICAgLm9uZShcImRpYWxvZ2Nsb3NlXCIsIHsgaW5zdGFuY2U6IHRoaXMgfSwgdGhpcy5fb25FbmRTaG93UmVzdWx0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIE11ZXN0cmEgbGEgY29ycmVjY2nDs24gZGVsIGN1ZXN0aW9uYXJpb1xuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHNob3dDb3JyZWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNob3dDb3JyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHF1ZXN0aW9ucyA9IHRoaXMuX3F1ZXN0aW9ucztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBxdWVzdGlvbkluZGV4ID0gMCwgcXVlc3Rpb25zTGVuZ3RoID0gcXVlc3Rpb25zLmxlbmd0aDsgcXVlc3Rpb25JbmRleCA8IHF1ZXN0aW9uc0xlbmd0aDsgcXVlc3Rpb25JbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50UXVlc3Rpb24gPSBxdWVzdGlvbnNbcXVlc3Rpb25JbmRleF0sIG9wdGlvbnMgPSBjdXJyZW50UXVlc3Rpb24ub3B0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgb3B0aW9uSW5kZXggPSAwLCBvcHRpb25zTGVuZ3RoID0gb3B0aW9ucy5sZW5ndGg7IG9wdGlvbkluZGV4IDwgb3B0aW9uc0xlbmd0aDsgb3B0aW9uSW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRPcHRpb24gPSBvcHRpb25zW29wdGlvbkluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Nob3dPcHRpb25TdGF0dXMoY3VycmVudFF1ZXN0aW9uLmlkLCBjdXJyZW50T3B0aW9uLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlUXVlc3Rpb25PcHRpb25zRmllbGQoY3VycmVudFF1ZXN0aW9uLmlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fY2hhbmdlU3RhdGUodGhpcy5TVEFURVMucmV2aWV3KTtcbiAgICAgICAgICAgICAgICB0aGlzLmdvVG8oMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9kaXNhYmxlQWxsUXVlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcXVlc3Rpb25zID0gdGhpcy5fcXVlc3Rpb25zO1xuICAgICAgICAgICAgZm9yICh2YXIgcXVlc3Rpb25JbmRleCA9IDAsIHF1ZXN0aW9uc0xlbmd0aCA9IHF1ZXN0aW9ucy5sZW5ndGg7IHF1ZXN0aW9uSW5kZXggPCBxdWVzdGlvbnNMZW5ndGg7IHF1ZXN0aW9uSW5kZXgrKykge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50UXVlc3Rpb24gPSBxdWVzdGlvbnNbcXVlc3Rpb25JbmRleF07XG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZVF1ZXN0aW9uT3B0aW9uc0ZpZWxkKGN1cnJlbnRRdWVzdGlvbi5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaW5hbGl6YSBlbCBjdWVzdGlvbmFyaW9cbiAgICAgICAgICovXG4gICAgICAgIGVuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy9pZiBpdHMgcnVubmluZ1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N0YXRlID09PSB0aGlzLlNUQVRFUy5ydW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgLy9jYWxpZmljYXRlXG4gICAgICAgICAgICAgICAgdmFyIGNhbGlmaWNhdGlvbiA9IHRoaXMuX2NhbGlmaWNhdGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RDYWxpZmljYXRpb24gPSBjYWxpZmljYXRpb247XG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZUFsbFF1ZXN0aW9ucygpO1xuICAgICAgICAgICAgICAgIC8vaWYgc2hvdyByZXN1bHQgaXMgZGlzYWJsZWRcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2hvd1Jlc3VsdChjYWxpZmljYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vaWYgc2hvdyBjb3JyZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5zaG93Q29ycmVjdGlvbigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VTdGF0ZSh0aGlzLlNUQVRFUy5vZmYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uU3RvcCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25BbmltYXRpb25FbmRFbmQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnRyaWdnZXIodGhpcy5PTl9FTkQsIFt0aGlzLCBjYWxpZmljYXRpb25dKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsaWZpY2F0aW9uO1xuICAgICAgICAgICAgICAgIC8vaWYgaXRzIHdpdGggcmVzdWx0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLl9zdGF0ZSA9PSB0aGlzLlNUQVRFUy5yZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAvL2lmIHNob3cgY29ycmVjdGlvbiBpcyBkaXN0YWJsZWRcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2hvd0NvcnJlY3Rpb24oKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VTdGF0ZSh0aGlzLlNUQVRFUy5vZmYpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hbmltYXRpb25TdG9wKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uQW5pbWF0aW9uRW5kRW5kKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnRyaWdnZXIodGhpcy5PTl9FTkQsIFt0aGlzLCB0aGlzLmxhc3RDYWxpZmljYXRpb25dKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFzdENhbGlmaWNhdGlvbjtcbiAgICAgICAgICAgICAgICAvL2lmIGl0cyByZXZpZXdpbmdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuX3N0YXRlID09IHRoaXMuU1RBVEVTLnJldmlldykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NoYW5nZVN0YXRlKHRoaXMuU1RBVEVTLm9mZik7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnRyaWdnZXIodGhpcy5PTl9FTkQsIFt0aGlzLCB0aGlzLmxhc3RDYWxpZmljYXRpb25dKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hbmltYXRpb25TdG9wKClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25BbmltYXRpb25FbmRFbmQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxhc3RDYWxpZmljYXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9jaGFuZ2VTdGF0ZTogZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSB0aGlzLlNUQVRFUy5yZXZpZXc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3N0YXRlID0gc3RhdGU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGF0ZVJ1bm5pbmcgKyBcIiBcIiArIHRoaXMub3B0aW9ucy5jbGFzc2VzLnN0YXRlUmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnN0YXRlUmV2aWV3KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0aGlzLlNUQVRFUy5ydW5uaW5nOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuc3RhdGVSZXZpZXcgKyBcIiBcIiArIHRoaXMub3B0aW9ucy5jbGFzc2VzLnN0YXRlUmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnN0YXRlUnVubmluZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5TVEFURVMucmVzdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuc3RhdGVSZXZpZXcgKyBcIiBcIiArIHRoaXMub3B0aW9ucy5jbGFzc2VzLnN0YXRlUnVubmluZyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGF0ZVJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5TVEFURVMub2ZmOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuc3RhdGVSZXN1bHQgKyBcIiBcIiArIHRoaXMub3B0aW9ucy5jbGFzc2VzLnN0YXRlUmV2aWV3ICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGF0ZVJ1bm5pbmcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fJHdyYXBwZXIucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMud3JhcHBlcik7XG4gICAgICAgICAgICB0aGlzLl8kaGVhZGVyLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmhlYWRlcik7XG4gICAgICAgICAgICB0aGlzLl8kYm9keS5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5ib2R5KTtcbiAgICAgICAgICAgIHRoaXMuXyRib2R5LnNob3coKTtcbiAgICAgICAgICAgIHRoaXMuXyRwcm9wZXJ0aWVzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnByb3BlcnRpZXMpO1xuICAgICAgICAgICAgdGhpcy5fJHF1ZXN0aW9uc1dyYXBwZXIucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb25zKTtcbiAgICAgICAgICAgIHRoaXMuXyRxdWVzdGlvbnMucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb24pO1xuICAgICAgICAgICAgdGhpcy5fJHF1ZXN0aW9ucy5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLl8kc3RhcnRCdG4ucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuYnV0dG9uICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGFydEJ0bik7XG4gICAgICAgICAgICB0aGlzLl8kbmV4dEJ0bi5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5idXR0b24gKyBcIiBcIiArIHRoaXMub3B0aW9ucy5jbGFzc2VzLm5leHRCdG4pO1xuICAgICAgICAgICAgdGhpcy5fJHByZXZCdG4ucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuYnV0dG9uICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5wcmV2QnRuKTtcbiAgICAgICAgICAgIHRoaXMuXyRlbmRCdG4ucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuYnV0dG9uICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5lbmRCdG4pO1xuICAgICAgICAgICAgdGhpcy5fJHJlc3VsdC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5yZXN1bHQpO1xuICAgICAgICAgICAgaWYgKHRoaXMuXyRyZXN1bHQuZGF0YShcInVpRGlhbG9nXCIpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fJHJlc3VsdC5kaWFsb2coXCJkZXN0cm95XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuICQudWkuanFRdWVzdGlvbm5haXJlO1xufSkpO1xuIl0sImZpbGUiOiJqcXVlcnkucXVlc3Rpb25uYWlyZS5qcyJ9
