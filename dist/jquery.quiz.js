/**
 * jqQuiz plugin v0.5.0
 * https://github.com/davinchi-finsi/jq-quiz
 * 
 * Copyright Davinchi and other contributors
 * Released under the MIT license
 * https://github.com/davinchi-finsi/jq-quiz/blob/master/LICENSE
 * 
 * Build: 07/07/2017 14:18
 */

(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "./controlgroup",
            "./checkboxradio",
            "../keycode",
            "../widget"
        ], factory);
    }
    else {
        factory(jQuery);
    }
}(function ($) {
    $.widget("ui.jqQuiz", {
        NAMESPACE: "jqQuiz",
        QUERY_HEADER: "[data-jq-quiz-header]",
        QUERY_WRAPPER: "[data-jq-quiz-wrapper]",
        QUERY_BODY: "[data-jq-quiz-body]",
        QUERY_PROPERTIES: "[data-jq-quiz-properties]",
        QUERY_QUESTIONS: "[data-jq-quiz-questions]",
        QUERY_QUESTION: "[data-jq-quiz-question]",
        QUERY_OPTIONS: "[data-jq-quiz-options]",
        QUERY_OPTION: "[data-jq-quiz-option]",
        QUERY_ACTION_START: "[data-jq-quiz-start]",
        QUERY_ACTION_NEXT: "[data-jq-quiz-next]",
        QUERY_ACTION_PREV: "[data-jq-quiz-prev]",
        QUERY_ACTION_END: "[data-jq-quiz-end]",
        QUERY_RENDER_OPTION: "[data-jq-quiz-property]",
        QUERY_RENDER_RESULT: "[data-jq-quiz-result-item]",
        QUERY_RESULT: "[data-jq-quiz-result]",
        QUERY_FEEDBACK: "[data-jq-quiz-feedback]",
        IS_CORRECT: "isCorrect",
        ATTR_CURRENT_QUESTION: "data-current-question",
        ATTR_IS_CORRECT: "data-is-correct",
        ATTR_POINTS_FOR_SUCCESS: "data-points-for-success",
        ATTR_FEEDBACK: "data-jq-quiz-feedback",
        ATTR_POINTS_FOR_FAIL: "data-points-for-fail",
        ON_QUESTION_HIDE: "jqQuiz:questionHide",
        ON_QUESTION_SHOW: "jqQuiz:questionShow",
        ON_HEADER_HIDE: "jqQuiz:headerHide",
        ON_HEADER_SHOW: "jqQuiz:headerShow",
        ON_BODY_HIDE: "jqQuiz:bodyHide",
        ON_BODY_SHOW: "jqQuiz:bodyShow",
        ON_TRANSITION_END: "jqQuiz:transitionEnd",
        ON_OPTION_CHANGE: "jqQuiz:questionChange",
        ON_START: "jqQuiz:start",
        ON_STARTED: "jqQuiz:started",
        ON_END: "jqQuiz:end",
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
                firstQuestion: "jq-quiz--first-question",
                lastQuestion: "jq-quiz--last-question",
                widget: "jq-quiz",
                questionCorrect: "jq-quiz--correct",
                questionIncorrect: "jq-quiz--incorrect",
                selected: "jq-quiz--selected",
                stateResult: "jq-quiz--result",
                stateReview: "jq-quiz--review",
                stateRunning: "jq-quiz--running",
                multichoice: "jq-quiz--multi-choice",
                wrapper: "jq-quiz__form",
                header: "jq-quiz__header",
                body: "jq-quesitonnaire__body",
                startBtn: "jq-quiz__start",
                nextBtn: "jq-quiz__next",
                prevBtn: "jq-quiz__prev",
                endBtn: "jq-quiz__end",
                result: "jq-quiz__result",
                question: "jq-quiz__question",
                option: "jq-quiz__option",
                navbar: "jq-quiz__navbar",
                button: "jq-quiz__action",
                properties: "jq-quiz__properties",
                questions: "jq-quiz__questions"
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
        _create: function () {
            this._getElements();
            this.element.uniqueId();
            this._mapQuestions();
            this._changeState(this.STATES.off);
            this._assignEvents();
            this._renderOptions();
        },
        _renderOptions: function () {
            this._renderVar(this.QUERY_RENDER_OPTION, "jqQuizProperty");
        },
        _renderVar: function (query, data, store, context) {
            context = context || this.element;
            store = store || this.options;
            var $toRender = context.find(query);
            for (var _i = 0, $toRender_1 = $toRender; _i < $toRender_1.length; _i++) {
                var element = $toRender_1[_i];
                var $element = $(element), optionName = ($element.data(data) || ""), optionAsTrue = void 0, optionAsFalse = void 0;
                if (optionName != undefined) {
                    _a = optionName.split("?"), optionName = _a[0], optionAsTrue = _a[1];
                    optionName = optionName.trim();
                    if (optionAsTrue != undefined) {
                        _b = optionAsTrue.split(":"), optionAsTrue = _b[0], optionAsFalse = _b[1];
                        optionAsTrue.trim();
                        optionAsFalse.trim();
                    }
                    var optionValue = store[optionName];
                    optionValue = optionValue != undefined ? optionValue : "";
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
        },
        _mapQuestions: function () {
            var $options = this._$questions.find(this.QUERY_OPTION)
                .find(":checkbox");
            if ($options.length > 0) {
                $options.attr("type", "checkbox");
                this.options.multichoice = true;
                this.element.addClass(this.options.classes.multichoice);
            }
            else {
                $options.attr("type", "radio");
            }
            var $questions = this._$questions, questions = [], questionsMap = {}, maxScore = 0;
            for (var questionIndex = 0, $questionsLength = $questions.length; questionIndex < $questionsLength; questionIndex++) {
                var $current = $($questions[questionIndex]), parsedQuestion = this._mapQuestion($current);
                questions.push(parsedQuestion);
                questionsMap[parsedQuestion.id] = questionIndex;
                maxScore += parsedQuestion.pointsForSuccess;
            }
            this._questions = questions;
            this._questionsMap = questionsMap;
            this._maxScore = maxScore;
            this._setOption("maxScore", maxScore);
        },
        _mapQuestion: function ($question) {
            var $optionsWrapper = $question.find(this.QUERY_OPTIONS), $options = $optionsWrapper.find(this.QUERY_OPTION), name = $options.first()
                .find("input")
                .attr("name"), pointsForSuccess = $question.data(this.ATTR_POINTS_FOR_SUCCESS), pointsForFail = $question.data(this.ATTR_POINTS_FOR_FAIL), _a = this._mapOptions($options), arr = _a.arr, map = _a.map, $feedback = $question.find(this.QUERY_FEEDBACK)
                .not(this.QUERY_OPTION + " " + this.QUERY_FEEDBACK), id;
            $feedback.hide();
            $question.removeAttr(this.ATTR_POINTS_FOR_FAIL);
            $question.removeAttr(this.ATTR_POINTS_FOR_SUCCESS);
            $question.uniqueId();
            id = $question.attr("id");
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
        _mapOptions: function ($options) {
            var parsedOptions = [], parsedOptionsMap = {};
            for (var optionIndex = 0, $optionsLength = $options.length; optionIndex < $optionsLength; optionIndex++) {
                var $current = $($options[optionIndex]), parsedOption = this._mapOption($current);
                parsedOptions.push(parsedOption);
                parsedOptionsMap[parsedOption.id] = optionIndex;
            }
            return { arr: parsedOptions, map: parsedOptionsMap };
        },
        _mapOption: function ($option) {
            var isCorrect = !!$option.data(this.IS_CORRECT), id, $feedback = $option.find(this.QUERY_FEEDBACK);
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
            this._$questions.off(this.NAMESPACE)
                .on("change." + this.NAMESPACE, { instance: this }, this._onOptionChange);
        },
        _onStartButtonClick: function (e) {
            e.preventDefault();
            e.data.instance.start();
        },
        _onEndButtonClick: function (e) {
            e.preventDefault();
            e.data.instance.end();
        },
        _onNextButtonClick: function (e) {
            e.preventDefault();
            e.data.instance.next();
        },
        _onPrevButtonClick: function (e) {
            e.preventDefault();
            e.data.instance.prev();
        },
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
            for (var questionIndex = 0, questionsLength = questions.length; questionIndex < questionsLength; questionIndex++) {
                var currentQuestion = questions[questionIndex], questionRuntime = runtime[currentQuestion.id], result = this._calificateSingleChoiceQuestion(currentQuestion.id);
                if (result != undefined) {
                    if (result) {
                        currentScore += currentQuestion.pointsForSuccess;
                        nSuccess++;
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
        _calificateSingleChoiceQuestion: function (questionId) {
            var question = this.getQuestionById(questionId), result;
            if (question) {
                var questionRuntime = this._runtime[question.id];
                if (questionRuntime && questionRuntime.options.length > 0) {
                    var questionOptions = question.options, questionOptionsMap = question.optionsMap, selectedOptionId = questionRuntime.options[0], selectedOption = questionOptions[questionOptionsMap[selectedOptionId]];
                    result = selectedOption.isCorrect;
                    questionRuntime.isCorrect = result;
                }
            }
            return result;
        },
        _calificateMultiChoiceQuestion: function (questionId) {
            var question = this.getQuestionById(questionId), result;
            if (question) {
                var questionRuntime = this._runtime[question.id];
                if (questionRuntime) {
                    var questionOptions = question.options, selectedOptions = questionRuntime.options, nCorrectOptionsSelected = 0, nCorrectOptions = 0, nIncorrectOptionsSelected = 0;
                    for (var questionOptionIndex = 0, questionOptionsLength = questionOptions.length; questionOptionIndex < questionOptionsLength; questionOptionIndex++) {
                        var currentQuestionOption = questionOptions[questionOptionIndex], checked = selectedOptions.indexOf(currentQuestionOption.id) != -1;
                        if (currentQuestionOption.isCorrect) {
                            nCorrectOptions++;
                            nCorrectOptionsSelected += checked ? 1 : 0;
                        }
                        else {
                            if (checked) {
                                nIncorrectOptionsSelected++;
                                questionOptionIndex = questionOptionsLength;
                            }
                        }
                    }
                    result = nIncorrectOptionsSelected == 0 && nCorrectOptionsSelected == nCorrectOptions;
                    questionRuntime.isCorrect = result;
                }
            }
            return result;
        },
        _calificateMultiChoice: function () {
            var currentScore = 0, runtime = this._runtime, questions = this._questions, nSuccess = 0, nFails = 0;
            for (var questionIndex = 0, questionsLength = questions.length; questionIndex < questionsLength; questionIndex++) {
                var currentQuestion = questions[questionIndex], questionRuntime = runtime[currentQuestion.id], result = this._calificateMultiChoiceQuestion(currentQuestion.id);
                if (result != undefined) {
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
        _showQuestionFeedback: function (questionId) {
            var question = this.getQuestionById(questionId);
            if (question) {
                var runtime = this._runtime[question.id];
                if (runtime && runtime != undefined) {
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
            var instance = e.data.instance, $question = $(this), questionId = $question.attr("id"), questionRuntime = instance._runtime[questionId] || {};
            if (instance.options.immediateFeedback === true && questionRuntime.option != undefined) {
                e.preventDefault();
            }
        },
        _onOptionChange: function (e) {
            var instance = e.data.instance;
            if (instance.options.disabled != true && instance._state == instance.STATES.running) {
                var $option = $(e.target)
                    .parents(instance.QUERY_OPTION), $question = $(this), questionId = $question.attr("id"), questionRuntime = instance._runtime[questionId] || {}, options = questionRuntime.options || [], optionId = $option.attr("id");
                questionRuntime.options = options;
                instance._runtime[questionId] = questionRuntime;
                if (instance.options.multichoice) {
                    if (e.target.checked) {
                        options.push(optionId);
                        $option.addClass(instance.CLASS_SELECTED);
                    }
                    else {
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
                if (instance.options.autoGoNext != false) {
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
            if (key === "disabled") {
                if (value) {
                    this._disable();
                }
                else {
                    this._enable();
                }
            }
        },
        _hide: function (questionToHide) {
            var _this = this;
            var hideDefer = $.Deferred();
            var result = this.element.triggerHandler(this.ON_QUESTION_HIDE, [this, questionToHide]);
            if (result != undefined && result.hasOwnProperty("then")) {
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
        _onHeaderHidden: function (defer) {
            defer.resolveWith(this);
        },
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
        _showHeader: function () {
            var _this = this;
            var defer = $.Deferred();
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
        _onBodyHidden: function (defer) {
            defer.resolveWith(this);
        },
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
        _showBody: function () {
            var _this = this;
            var defer = $.Deferred();
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
        _disableEnd: function () {
            this._$endBtn.prop("disabled", true);
            this._$endBtn.addClass(this.options.classes.disabled);
        },
        _enableEnd: function () {
            this._$endBtn.prop("disabled", false);
            this._$endBtn.removeClass(this.options.classes.disabled);
        },
        _disablePrev: function () {
            this._$prevBtn.prop("disabled", true);
            this._$prevBtn.addClass(this.options.classes.disabled);
        },
        _enablePrev: function () {
            this._$prevBtn.prop("disabled", false);
            this._$prevBtn.removeClass(this.options.classes.disabled);
        },
        _disableNext: function () {
            this._$nextBtn.prop("disabled", true);
            this._$nextBtn.addClass(this.options.classes.disabled);
        },
        _enableNext: function () {
            this._$nextBtn.prop("disabled", false);
            this._$nextBtn.removeClass(this.options.classes.disabled);
        },
        _disableStart: function () {
            this._$startBtn.prop("disabled", true);
            this._$startBtn.addClass(this.options.classes.disabled);
        },
        _enableStart: function () {
            this._$startBtn.prop("disabled", false);
            this._$startBtn.removeClass(this.options.classes.disabled);
        },
        _onAnimationStartEnd: function () {
            this.goTo(0);
            this.element.trigger(this.ON_STARTED, [this]);
        },
        _onAnimationEndEnd: function () {
            this.reset();
        },
        _onQuestionTransitionEnd: function (oldPage, newPage, defer) {
            this._updateNavigationActionsStates();
            defer.resolveWith(this);
            this.element.triggerHandler(this.ON_TRANSITION_END, [this, oldPage, newPage]);
        },
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
        _onEndShowResult: function (e) {
            var instance = e.data.instance;
            instance.end();
        },
        getMaxPoints: function () {
            return this._maxScore;
        },
        getId: function () {
            return this.element.attr("id");
        },
        next: function () {
            if (this._currentQuestionIndex != undefined) {
                return this.goTo(this._currentQuestionIndex + 1);
            }
            else {
                return this.goTo(0);
            }
        },
        prev: function () {
            if (this._currentQuestionIndex != undefined) {
                return this.goTo(this._currentQuestionIndex - 1);
            }
            else {
                return this.goTo(0);
            }
        },
        goTo: function (questionIndex) {
            var _this = this;
            var promise;
            if (this._state === this.STATES.running || this._state == this.STATES.review) {
                var nextQuestion_1 = this._questions[questionIndex], currentQuestionIndex = this._currentQuestionIndex, currentQuestion_1 = this._questions[currentQuestionIndex];
                if (nextQuestion_1 != undefined && (currentQuestion_1 == undefined || currentQuestion_1 != nextQuestion_1)) {
                    var defer_1 = $.Deferred();
                    promise = defer_1.promise();
                    this._disableNext();
                    this._disablePrev();
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
                    if (currentQuestion_1) {
                        this._hide(currentQuestion_1.$element)
                            .then(function () {
                            _this._show(nextQuestion_1.$element)
                                .then(_this._onQuestionTransitionEnd.bind(_this, currentQuestion_1, nextQuestion_1, defer_1));
                        });
                    }
                    else {
                        this._show(nextQuestion_1.$element)
                            .then(this._onQuestionTransitionEnd.bind(this, currentQuestion_1, nextQuestion_1, defer_1));
                    }
                }
            }
            return promise;
        },
        getQuestions: function () {
            return this._questions;
        },
        getQuestionByIndex: function (index) {
            return this._questions[index];
        },
        getQuestionById: function (id) {
            return this.getQuestionByIndex(this._questionsMap[id]);
        },
        getOptions: function (questionId) {
            return (this.getQuestionById(questionId) || {}).options;
        },
        getOptionByIndex: function (questionId, optionIndex) {
            var options = this.getOptions(questionId), option;
            if (options) {
                option = options[optionIndex];
            }
            return option;
        },
        getOptionById: function (questionId, optionId) {
            var question = this.getQuestionById(questionId), option;
            if (question) {
                option = question.options[question.optionsMap[optionId]];
            }
            return option;
        },
        update: function () {
        },
        redrawProperties: function () {
            this._renderOptions();
        },
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
        start: function () {
            if (this.options.disabled != true && this._state === this.STATES.off) {
                this._changeState(this.STATES.running);
                this.element.trigger(this.ON_START, [this]);
                this._runtime = {};
                this._animationStart()
                    .then(this._onAnimationStartEnd);
            }
        },
        showResult: function (calification) {
            if (calification && this.options.showResult && this._$result) {
                this._changeState(this.STATES.result);
                this._renderVar(this.QUERY_RENDER_RESULT, "jqQuizResultItem", calification, this._$result);
                this._$result.dialog(this.options.dialog)
                    .one("dialogclose", { instance: this }, this._onEndShowResult);
                return true;
            }
            return false;
        },
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
        end: function () {
            if (this._state === this.STATES.running) {
                var calification = this._calificate();
                this.lastCalification = calification;
                this._disableAllQuestions();
                if (!this.showResult(calification)) {
                    if (!this.showCorrection()) {
                        this._changeState(this.STATES.off);
                        this._animationStop()
                            .then(this._onAnimationEndEnd);
                        this.element.trigger(this.ON_END, [this, calification]);
                    }
                }
                return calification;
            }
            else if (this._state == this.STATES.result) {
                if (!this.showCorrection()) {
                    this._changeState(this.STATES.off);
                    this._animationStop()
                        .then(this._onAnimationEndEnd);
                    this.element.trigger(this.ON_END, [this, this.lastCalification]);
                }
                return this.lastCalification;
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
        _disable: function () {
            this._disableStart();
        },
        _enable: function () {
            this._enableStart();
        },
        disable: function () {
            this._super();
            this._disable();
        },
        enable: function () {
            this._super();
            this._enable();
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
    return $.ui.jqQuiz;
}));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcXVlcnkucXVpei5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcbiAgICAgICAgICAgIFwianF1ZXJ5XCIsXG4gICAgICAgICAgICBcIi4vY29udHJvbGdyb3VwXCIsXG4gICAgICAgICAgICBcIi4vY2hlY2tib3hyYWRpb1wiLFxuICAgICAgICAgICAgXCIuLi9rZXljb2RlXCIsXG4gICAgICAgICAgICBcIi4uL3dpZGdldFwiXG4gICAgICAgIF0sIGZhY3RvcnkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZmFjdG9yeShqUXVlcnkpO1xuICAgIH1cbn0oZnVuY3Rpb24gKCQpIHtcbiAgICAkLndpZGdldChcInVpLmpxUXVpelwiLCB7XG4gICAgICAgIE5BTUVTUEFDRTogXCJqcVF1aXpcIixcbiAgICAgICAgUVVFUllfSEVBREVSOiBcIltkYXRhLWpxLXF1aXotaGVhZGVyXVwiLFxuICAgICAgICBRVUVSWV9XUkFQUEVSOiBcIltkYXRhLWpxLXF1aXotd3JhcHBlcl1cIixcbiAgICAgICAgUVVFUllfQk9EWTogXCJbZGF0YS1qcS1xdWl6LWJvZHldXCIsXG4gICAgICAgIFFVRVJZX1BST1BFUlRJRVM6IFwiW2RhdGEtanEtcXVpei1wcm9wZXJ0aWVzXVwiLFxuICAgICAgICBRVUVSWV9RVUVTVElPTlM6IFwiW2RhdGEtanEtcXVpei1xdWVzdGlvbnNdXCIsXG4gICAgICAgIFFVRVJZX1FVRVNUSU9OOiBcIltkYXRhLWpxLXF1aXotcXVlc3Rpb25dXCIsXG4gICAgICAgIFFVRVJZX09QVElPTlM6IFwiW2RhdGEtanEtcXVpei1vcHRpb25zXVwiLFxuICAgICAgICBRVUVSWV9PUFRJT046IFwiW2RhdGEtanEtcXVpei1vcHRpb25dXCIsXG4gICAgICAgIFFVRVJZX0FDVElPTl9TVEFSVDogXCJbZGF0YS1qcS1xdWl6LXN0YXJ0XVwiLFxuICAgICAgICBRVUVSWV9BQ1RJT05fTkVYVDogXCJbZGF0YS1qcS1xdWl6LW5leHRdXCIsXG4gICAgICAgIFFVRVJZX0FDVElPTl9QUkVWOiBcIltkYXRhLWpxLXF1aXotcHJldl1cIixcbiAgICAgICAgUVVFUllfQUNUSU9OX0VORDogXCJbZGF0YS1qcS1xdWl6LWVuZF1cIixcbiAgICAgICAgUVVFUllfUkVOREVSX09QVElPTjogXCJbZGF0YS1qcS1xdWl6LXByb3BlcnR5XVwiLFxuICAgICAgICBRVUVSWV9SRU5ERVJfUkVTVUxUOiBcIltkYXRhLWpxLXF1aXotcmVzdWx0LWl0ZW1dXCIsXG4gICAgICAgIFFVRVJZX1JFU1VMVDogXCJbZGF0YS1qcS1xdWl6LXJlc3VsdF1cIixcbiAgICAgICAgUVVFUllfRkVFREJBQ0s6IFwiW2RhdGEtanEtcXVpei1mZWVkYmFja11cIixcbiAgICAgICAgSVNfQ09SUkVDVDogXCJpc0NvcnJlY3RcIixcbiAgICAgICAgQVRUUl9DVVJSRU5UX1FVRVNUSU9OOiBcImRhdGEtY3VycmVudC1xdWVzdGlvblwiLFxuICAgICAgICBBVFRSX0lTX0NPUlJFQ1Q6IFwiZGF0YS1pcy1jb3JyZWN0XCIsXG4gICAgICAgIEFUVFJfUE9JTlRTX0ZPUl9TVUNDRVNTOiBcImRhdGEtcG9pbnRzLWZvci1zdWNjZXNzXCIsXG4gICAgICAgIEFUVFJfRkVFREJBQ0s6IFwiZGF0YS1qcS1xdWl6LWZlZWRiYWNrXCIsXG4gICAgICAgIEFUVFJfUE9JTlRTX0ZPUl9GQUlMOiBcImRhdGEtcG9pbnRzLWZvci1mYWlsXCIsXG4gICAgICAgIE9OX1FVRVNUSU9OX0hJREU6IFwianFRdWl6OnF1ZXN0aW9uSGlkZVwiLFxuICAgICAgICBPTl9RVUVTVElPTl9TSE9XOiBcImpxUXVpejpxdWVzdGlvblNob3dcIixcbiAgICAgICAgT05fSEVBREVSX0hJREU6IFwianFRdWl6OmhlYWRlckhpZGVcIixcbiAgICAgICAgT05fSEVBREVSX1NIT1c6IFwianFRdWl6OmhlYWRlclNob3dcIixcbiAgICAgICAgT05fQk9EWV9ISURFOiBcImpxUXVpejpib2R5SGlkZVwiLFxuICAgICAgICBPTl9CT0RZX1NIT1c6IFwianFRdWl6OmJvZHlTaG93XCIsXG4gICAgICAgIE9OX1RSQU5TSVRJT05fRU5EOiBcImpxUXVpejp0cmFuc2l0aW9uRW5kXCIsXG4gICAgICAgIE9OX09QVElPTl9DSEFOR0U6IFwianFRdWl6OnF1ZXN0aW9uQ2hhbmdlXCIsXG4gICAgICAgIE9OX1NUQVJUOiBcImpxUXVpejpzdGFydFwiLFxuICAgICAgICBPTl9TVEFSVEVEOiBcImpxUXVpejpzdGFydGVkXCIsXG4gICAgICAgIE9OX0VORDogXCJqcVF1aXo6ZW5kXCIsXG4gICAgICAgIEZFRURCQUNLX1RZUEVTOiB7XG4gICAgICAgICAgICBcIm9rXCI6IFwib2tcIixcbiAgICAgICAgICAgIFwia29cIjogXCJrb1wiXG4gICAgICAgIH0sXG4gICAgICAgIFNUQVRFUzoge1xuICAgICAgICAgICAgXCJvZmZcIjogMCxcbiAgICAgICAgICAgIFwicnVubmluZ1wiOiAxLFxuICAgICAgICAgICAgXCJyZXN1bHRcIjogMixcbiAgICAgICAgICAgIFwicmV2aWV3XCI6IDNcbiAgICAgICAgfSxcbiAgICAgICAgRElTQUJMRV9FTkQ6IHtcbiAgICAgICAgICAgIFwibmV2ZXJcIjogMCxcbiAgICAgICAgICAgIFwiYmVmb3JlQW5zd2VyQWxsXCI6IDEsXG4gICAgICAgICAgICBcImJlZm9yZUFuc3dlckFsbENvcnJlY3RcIjogMlxuICAgICAgICB9LFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBjbGFzc2VzOiB7XG4gICAgICAgICAgICAgICAgZmlyc3RRdWVzdGlvbjogXCJqcS1xdWl6LS1maXJzdC1xdWVzdGlvblwiLFxuICAgICAgICAgICAgICAgIGxhc3RRdWVzdGlvbjogXCJqcS1xdWl6LS1sYXN0LXF1ZXN0aW9uXCIsXG4gICAgICAgICAgICAgICAgd2lkZ2V0OiBcImpxLXF1aXpcIixcbiAgICAgICAgICAgICAgICBxdWVzdGlvbkNvcnJlY3Q6IFwianEtcXVpei0tY29ycmVjdFwiLFxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uSW5jb3JyZWN0OiBcImpxLXF1aXotLWluY29ycmVjdFwiLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBcImpxLXF1aXotLXNlbGVjdGVkXCIsXG4gICAgICAgICAgICAgICAgc3RhdGVSZXN1bHQ6IFwianEtcXVpei0tcmVzdWx0XCIsXG4gICAgICAgICAgICAgICAgc3RhdGVSZXZpZXc6IFwianEtcXVpei0tcmV2aWV3XCIsXG4gICAgICAgICAgICAgICAgc3RhdGVSdW5uaW5nOiBcImpxLXF1aXotLXJ1bm5pbmdcIixcbiAgICAgICAgICAgICAgICBtdWx0aWNob2ljZTogXCJqcS1xdWl6LS1tdWx0aS1jaG9pY2VcIixcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiBcImpxLXF1aXpfX2Zvcm1cIixcbiAgICAgICAgICAgICAgICBoZWFkZXI6IFwianEtcXVpel9faGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgYm9keTogXCJqcS1xdWVzaXRvbm5haXJlX19ib2R5XCIsXG4gICAgICAgICAgICAgICAgc3RhcnRCdG46IFwianEtcXVpel9fc3RhcnRcIixcbiAgICAgICAgICAgICAgICBuZXh0QnRuOiBcImpxLXF1aXpfX25leHRcIixcbiAgICAgICAgICAgICAgICBwcmV2QnRuOiBcImpxLXF1aXpfX3ByZXZcIixcbiAgICAgICAgICAgICAgICBlbmRCdG46IFwianEtcXVpel9fZW5kXCIsXG4gICAgICAgICAgICAgICAgcmVzdWx0OiBcImpxLXF1aXpfX3Jlc3VsdFwiLFxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiBcImpxLXF1aXpfX3F1ZXN0aW9uXCIsXG4gICAgICAgICAgICAgICAgb3B0aW9uOiBcImpxLXF1aXpfX29wdGlvblwiLFxuICAgICAgICAgICAgICAgIG5hdmJhcjogXCJqcS1xdWl6X19uYXZiYXJcIixcbiAgICAgICAgICAgICAgICBidXR0b246IFwianEtcXVpel9fYWN0aW9uXCIsXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogXCJqcS1xdWl6X19wcm9wZXJ0aWVzXCIsXG4gICAgICAgICAgICAgICAgcXVlc3Rpb25zOiBcImpxLXF1aXpfX3F1ZXN0aW9uc1wiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGVsYXlPbkF1dG9OZXh0OiA1MDAsXG4gICAgICAgICAgICBwb2ludHNGb3JTdWNjZXNzOiAxLFxuICAgICAgICAgICAgcG9pbnRzRm9yRmFpbDogMCxcbiAgICAgICAgICAgIGN1dE9mZk1hcms6IDUwLFxuICAgICAgICAgICAgaW1tZWRpYXRlRmVlZGJhY2s6IGZhbHNlLFxuICAgICAgICAgICAgZGlzYWJsZU9wdGlvbkFmdGVyU2VsZWN0OiB0cnVlLFxuICAgICAgICAgICAgYXV0b0dvTmV4dDogdHJ1ZSxcbiAgICAgICAgICAgIHNob3dDb3JyZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgc2hvd1Jlc3VsdDogdHJ1ZSxcbiAgICAgICAgICAgIG11bHRpY2hvaWNlOiBmYWxzZSxcbiAgICAgICAgICAgIGRpc2FibGVOZXh0VW50aWxTdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGRpc2FibGVFbmRBY3Rpb25VbnRpbDogMCxcbiAgICAgICAgICAgIGRpYWxvZzoge1xuICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgYXV0b09wZW46IHRydWUsXG4gICAgICAgICAgICAgICAgcmVzaXphYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBtb2RhbDogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfY3JlYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9nZXRFbGVtZW50cygpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnVuaXF1ZUlkKCk7XG4gICAgICAgICAgICB0aGlzLl9tYXBRdWVzdGlvbnMoKTtcbiAgICAgICAgICAgIHRoaXMuX2NoYW5nZVN0YXRlKHRoaXMuU1RBVEVTLm9mZik7XG4gICAgICAgICAgICB0aGlzLl9hc3NpZ25FdmVudHMoKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlck9wdGlvbnMoKTtcbiAgICAgICAgfSxcbiAgICAgICAgX3JlbmRlck9wdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlclZhcih0aGlzLlFVRVJZX1JFTkRFUl9PUFRJT04sIFwianFRdWl6UHJvcGVydHlcIik7XG4gICAgICAgIH0sXG4gICAgICAgIF9yZW5kZXJWYXI6IGZ1bmN0aW9uIChxdWVyeSwgZGF0YSwgc3RvcmUsIGNvbnRleHQpIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0IHx8IHRoaXMuZWxlbWVudDtcbiAgICAgICAgICAgIHN0b3JlID0gc3RvcmUgfHwgdGhpcy5vcHRpb25zO1xuICAgICAgICAgICAgdmFyICR0b1JlbmRlciA9IGNvbnRleHQuZmluZChxdWVyeSk7XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsICR0b1JlbmRlcl8xID0gJHRvUmVuZGVyOyBfaSA8ICR0b1JlbmRlcl8xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gJHRvUmVuZGVyXzFbX2ldO1xuICAgICAgICAgICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCksIG9wdGlvbk5hbWUgPSAoJGVsZW1lbnQuZGF0YShkYXRhKSB8fCBcIlwiKSwgb3B0aW9uQXNUcnVlID0gdm9pZCAwLCBvcHRpb25Bc0ZhbHNlID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25OYW1lICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBfYSA9IG9wdGlvbk5hbWUuc3BsaXQoXCI/XCIpLCBvcHRpb25OYW1lID0gX2FbMF0sIG9wdGlvbkFzVHJ1ZSA9IF9hWzFdO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25OYW1lID0gb3B0aW9uTmFtZS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25Bc1RydWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYiA9IG9wdGlvbkFzVHJ1ZS5zcGxpdChcIjpcIiksIG9wdGlvbkFzVHJ1ZSA9IF9iWzBdLCBvcHRpb25Bc0ZhbHNlID0gX2JbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25Bc1RydWUudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uQXNGYWxzZS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvblZhbHVlID0gc3RvcmVbb3B0aW9uTmFtZV07XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvblZhbHVlID0gb3B0aW9uVmFsdWUgIT0gdW5kZWZpbmVkID8gb3B0aW9uVmFsdWUgOiBcIlwiO1xuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9uQXNUcnVlICE9IHVuZGVmaW5lZCAmJiAhIW9wdGlvblZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25WYWx1ZSA9IG9wdGlvbkFzVHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChvcHRpb25Bc0ZhbHNlICE9IHVuZGVmaW5lZCAmJiAhb3B0aW9uVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvblZhbHVlID0gb3B0aW9uQXNGYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAkZWxlbWVudC5odG1sKG9wdGlvblZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgX2EsIF9iO1xuICAgICAgICB9LFxuICAgICAgICBfZ2V0RWxlbWVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuXyR3cmFwcGVyID0gdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9XUkFQUEVSKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy53cmFwcGVyKTtcbiAgICAgICAgICAgIHRoaXMuXyRoZWFkZXIgPSB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0hFQURFUilcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuaGVhZGVyKTtcbiAgICAgICAgICAgIHRoaXMuXyRib2R5ID0gdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9CT0RZKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5ib2R5KTtcbiAgICAgICAgICAgIHRoaXMuXyRib2R5LmhpZGUoKTtcbiAgICAgICAgICAgIHRoaXMuXyRwcm9wZXJ0aWVzID0gdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9QUk9QRVJUSUVTKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5wcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgIHRoaXMuXyRxdWVzdGlvbnNXcmFwcGVyID0gdGhpcy5lbGVtZW50LmZpbmQodGhpcy5RVUVSWV9RVUVTVElPTlMpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLl8kcXVlc3Rpb25zID0gdGhpcy5fJHF1ZXN0aW9uc1dyYXBwZXIuZmluZCh0aGlzLlFVRVJZX1FVRVNUSU9OKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbik7XG4gICAgICAgICAgICB0aGlzLl8kcXVlc3Rpb25zLmhpZGUoKTtcbiAgICAgICAgICAgIHRoaXMuXyRzdGFydEJ0biA9IHRoaXMuXyR3cmFwcGVyLmZpbmQodGhpcy5RVUVSWV9BQ1RJT05fU1RBUlQpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmJ1dHRvbiArIFwiIFwiICsgdGhpcy5vcHRpb25zLmNsYXNzZXMuc3RhcnRCdG4pO1xuICAgICAgICAgICAgdGhpcy5fJG5leHRCdG4gPSB0aGlzLl8kd3JhcHBlci5maW5kKHRoaXMuUVVFUllfQUNUSU9OX05FWFQpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmJ1dHRvbiArIFwiIFwiICsgdGhpcy5vcHRpb25zLmNsYXNzZXMubmV4dEJ0bik7XG4gICAgICAgICAgICB0aGlzLl8kcHJldkJ0biA9IHRoaXMuXyR3cmFwcGVyLmZpbmQodGhpcy5RVUVSWV9BQ1RJT05fUFJFVilcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuYnV0dG9uICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5wcmV2QnRuKTtcbiAgICAgICAgICAgIHRoaXMuXyRlbmRCdG4gPSB0aGlzLl8kd3JhcHBlci5maW5kKHRoaXMuUVVFUllfQUNUSU9OX0VORClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuYnV0dG9uICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5lbmRCdG4pO1xuICAgICAgICAgICAgdGhpcy5fJHJlc3VsdCA9IHRoaXMuXyR3cmFwcGVyLmZpbmQodGhpcy5RVUVSWV9SRVNVTFQpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnJlc3VsdCk7XG4gICAgICAgICAgICB0aGlzLl8kcmVzdWx0LmhpZGUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgX21hcFF1ZXN0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyICRvcHRpb25zID0gdGhpcy5fJHF1ZXN0aW9ucy5maW5kKHRoaXMuUVVFUllfT1BUSU9OKVxuICAgICAgICAgICAgICAgIC5maW5kKFwiOmNoZWNrYm94XCIpO1xuICAgICAgICAgICAgaWYgKCRvcHRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAkb3B0aW9ucy5hdHRyKFwidHlwZVwiLCBcImNoZWNrYm94XCIpO1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5tdWx0aWNob2ljZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLm11bHRpY2hvaWNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICRvcHRpb25zLmF0dHIoXCJ0eXBlXCIsIFwicmFkaW9cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgJHF1ZXN0aW9ucyA9IHRoaXMuXyRxdWVzdGlvbnMsIHF1ZXN0aW9ucyA9IFtdLCBxdWVzdGlvbnNNYXAgPSB7fSwgbWF4U2NvcmUgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgcXVlc3Rpb25JbmRleCA9IDAsICRxdWVzdGlvbnNMZW5ndGggPSAkcXVlc3Rpb25zLmxlbmd0aDsgcXVlc3Rpb25JbmRleCA8ICRxdWVzdGlvbnNMZW5ndGg7IHF1ZXN0aW9uSW5kZXgrKykge1xuICAgICAgICAgICAgICAgIHZhciAkY3VycmVudCA9ICQoJHF1ZXN0aW9uc1txdWVzdGlvbkluZGV4XSksIHBhcnNlZFF1ZXN0aW9uID0gdGhpcy5fbWFwUXVlc3Rpb24oJGN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIHF1ZXN0aW9ucy5wdXNoKHBhcnNlZFF1ZXN0aW9uKTtcbiAgICAgICAgICAgICAgICBxdWVzdGlvbnNNYXBbcGFyc2VkUXVlc3Rpb24uaWRdID0gcXVlc3Rpb25JbmRleDtcbiAgICAgICAgICAgICAgICBtYXhTY29yZSArPSBwYXJzZWRRdWVzdGlvbi5wb2ludHNGb3JTdWNjZXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fcXVlc3Rpb25zID0gcXVlc3Rpb25zO1xuICAgICAgICAgICAgdGhpcy5fcXVlc3Rpb25zTWFwID0gcXVlc3Rpb25zTWFwO1xuICAgICAgICAgICAgdGhpcy5fbWF4U2NvcmUgPSBtYXhTY29yZTtcbiAgICAgICAgICAgIHRoaXMuX3NldE9wdGlvbihcIm1heFNjb3JlXCIsIG1heFNjb3JlKTtcbiAgICAgICAgfSxcbiAgICAgICAgX21hcFF1ZXN0aW9uOiBmdW5jdGlvbiAoJHF1ZXN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgJG9wdGlvbnNXcmFwcGVyID0gJHF1ZXN0aW9uLmZpbmQodGhpcy5RVUVSWV9PUFRJT05TKSwgJG9wdGlvbnMgPSAkb3B0aW9uc1dyYXBwZXIuZmluZCh0aGlzLlFVRVJZX09QVElPTiksIG5hbWUgPSAkb3B0aW9ucy5maXJzdCgpXG4gICAgICAgICAgICAgICAgLmZpbmQoXCJpbnB1dFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwibmFtZVwiKSwgcG9pbnRzRm9yU3VjY2VzcyA9ICRxdWVzdGlvbi5kYXRhKHRoaXMuQVRUUl9QT0lOVFNfRk9SX1NVQ0NFU1MpLCBwb2ludHNGb3JGYWlsID0gJHF1ZXN0aW9uLmRhdGEodGhpcy5BVFRSX1BPSU5UU19GT1JfRkFJTCksIF9hID0gdGhpcy5fbWFwT3B0aW9ucygkb3B0aW9ucyksIGFyciA9IF9hLmFyciwgbWFwID0gX2EubWFwLCAkZmVlZGJhY2sgPSAkcXVlc3Rpb24uZmluZCh0aGlzLlFVRVJZX0ZFRURCQUNLKVxuICAgICAgICAgICAgICAgIC5ub3QodGhpcy5RVUVSWV9PUFRJT04gKyBcIiBcIiArIHRoaXMuUVVFUllfRkVFREJBQ0spLCBpZDtcbiAgICAgICAgICAgICRmZWVkYmFjay5oaWRlKCk7XG4gICAgICAgICAgICAkcXVlc3Rpb24ucmVtb3ZlQXR0cih0aGlzLkFUVFJfUE9JTlRTX0ZPUl9GQUlMKTtcbiAgICAgICAgICAgICRxdWVzdGlvbi5yZW1vdmVBdHRyKHRoaXMuQVRUUl9QT0lOVFNfRk9SX1NVQ0NFU1MpO1xuICAgICAgICAgICAgJHF1ZXN0aW9uLnVuaXF1ZUlkKCk7XG4gICAgICAgICAgICBpZCA9ICRxdWVzdGlvbi5hdHRyKFwiaWRcIik7XG4gICAgICAgICAgICBuYW1lID0gbmFtZSAhPSB1bmRlZmluZWQgPyBuYW1lIDogaWQ7XG4gICAgICAgICAgICAkb3B0aW9ucy5maW5kKFwiaW5wdXRcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcIm5hbWVcIiwgbmFtZSk7XG4gICAgICAgICAgICB2YXIgcXVlc3Rpb24gPSB7XG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICRlbGVtZW50OiAkcXVlc3Rpb24sXG4gICAgICAgICAgICAgICAgJG9wdGlvbnNXcmFwcGVyOiAkb3B0aW9uc1dyYXBwZXIsXG4gICAgICAgICAgICAgICAgJG9wdGlvbnM6ICRvcHRpb25zLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGFycixcbiAgICAgICAgICAgICAgICBvcHRpb25zTWFwOiBtYXAsXG4gICAgICAgICAgICAgICAgcG9pbnRzRm9yU3VjY2VzczogcG9pbnRzRm9yU3VjY2VzcyAhPSB1bmRlZmluZWQgPyBwb2ludHNGb3JTdWNjZXNzIDogdGhpcy5vcHRpb25zLnBvaW50c0ZvclN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgcG9pbnRzRm9yRmFpbDogcG9pbnRzRm9yRmFpbCAhPSB1bmRlZmluZWQgPyBwb2ludHNGb3JGYWlsIDogdGhpcy5vcHRpb25zLnBvaW50c0ZvckZhaWxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsICRmZWVkYmFja18xID0gJGZlZWRiYWNrOyBfaSA8ICRmZWVkYmFja18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIHZhciBmZWVkYmFjayA9ICRmZWVkYmFja18xW19pXTtcbiAgICAgICAgICAgICAgICB2YXIgJGZlZWRiYWNrXzIgPSAkKGZlZWRiYWNrKSwgdHlwZSA9ICRmZWVkYmFja18yLmF0dHIodGhpcy5BVFRSX0ZFRURCQUNLKTtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSB0aGlzLkZFRURCQUNLX1RZUEVTLm9rOlxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb24uJGZlZWRiYWNrT2sgPSAkZmVlZGJhY2tfMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHRoaXMuRkVFREJBQ0tfVFlQRVMua286XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbi4kZmVlZGJhY2tLbyA9ICRmZWVkYmFja18yO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbi4kZmVlZGJhY2sgPSAkZmVlZGJhY2tfMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHF1ZXN0aW9uLiRmZWVkYmFja09rID0gcXVlc3Rpb24uJGZlZWRiYWNrT2sgfHwgcXVlc3Rpb24uJGZlZWRiYWNrIHx8ICQobnVsbCk7XG4gICAgICAgICAgICBxdWVzdGlvbi4kZmVlZGJhY2tLbyA9IHF1ZXN0aW9uLiRmZWVkYmFja0tvIHx8IHF1ZXN0aW9uLiRmZWVkYmFjayB8fCAkKG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuIHF1ZXN0aW9uO1xuICAgICAgICB9LFxuICAgICAgICBfbWFwT3B0aW9uczogZnVuY3Rpb24gKCRvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgcGFyc2VkT3B0aW9ucyA9IFtdLCBwYXJzZWRPcHRpb25zTWFwID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBvcHRpb25JbmRleCA9IDAsICRvcHRpb25zTGVuZ3RoID0gJG9wdGlvbnMubGVuZ3RoOyBvcHRpb25JbmRleCA8ICRvcHRpb25zTGVuZ3RoOyBvcHRpb25JbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyICRjdXJyZW50ID0gJCgkb3B0aW9uc1tvcHRpb25JbmRleF0pLCBwYXJzZWRPcHRpb24gPSB0aGlzLl9tYXBPcHRpb24oJGN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIHBhcnNlZE9wdGlvbnMucHVzaChwYXJzZWRPcHRpb24pO1xuICAgICAgICAgICAgICAgIHBhcnNlZE9wdGlvbnNNYXBbcGFyc2VkT3B0aW9uLmlkXSA9IG9wdGlvbkluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgYXJyOiBwYXJzZWRPcHRpb25zLCBtYXA6IHBhcnNlZE9wdGlvbnNNYXAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgX21hcE9wdGlvbjogZnVuY3Rpb24gKCRvcHRpb24pIHtcbiAgICAgICAgICAgIHZhciBpc0NvcnJlY3QgPSAhISRvcHRpb24uZGF0YSh0aGlzLklTX0NPUlJFQ1QpLCBpZCwgJGZlZWRiYWNrID0gJG9wdGlvbi5maW5kKHRoaXMuUVVFUllfRkVFREJBQ0spO1xuICAgICAgICAgICAgJG9wdGlvbi5yZW1vdmVBdHRyKHRoaXMuQVRUUl9JU19DT1JSRUNUKTtcbiAgICAgICAgICAgICRvcHRpb24udW5pcXVlSWQoKTtcbiAgICAgICAgICAgIGlkID0gJG9wdGlvbi5hdHRyKFwiaWRcIik7XG4gICAgICAgICAgICB2YXIgb3B0aW9uID0ge1xuICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICAkZWxlbWVudDogJG9wdGlvbixcbiAgICAgICAgICAgICAgICBpc0NvcnJlY3Q6IGlzQ29ycmVjdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgJGZlZWRiYWNrXzMgPSAkZmVlZGJhY2s7IF9pIDwgJGZlZWRiYWNrXzMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZlZWRiYWNrID0gJGZlZWRiYWNrXzNbX2ldO1xuICAgICAgICAgICAgICAgIHZhciAkZmVlZGJhY2tfNCA9ICQoZmVlZGJhY2spLCB0eXBlID0gJGZlZWRiYWNrXzQuYXR0cih0aGlzLkFUVFJfRkVFREJBQ0spO1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHRoaXMuRkVFREJBQ0tfVFlQRVMub2s6XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24uJGZlZWRiYWNrT2sgPSAkZmVlZGJhY2tfNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHRoaXMuRkVFREJBQ0tfVFlQRVMua286XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24uJGZlZWRiYWNrS28gPSAkZmVlZGJhY2tfNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRmZWVkYmFjayA9ICRmZWVkYmFja180O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3B0aW9uLiRmZWVkYmFja09rID0gb3B0aW9uLiRmZWVkYmFja09rIHx8IG9wdGlvbi4kZmVlZGJhY2sgfHwgJChudWxsKTtcbiAgICAgICAgICAgIG9wdGlvbi4kZmVlZGJhY2tLbyA9IG9wdGlvbi4kZmVlZGJhY2tLbyB8fCBvcHRpb24uJGZlZWRiYWNrIHx8ICQobnVsbCk7XG4gICAgICAgICAgICAkZmVlZGJhY2suaGlkZSgpO1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbjtcbiAgICAgICAgfSxcbiAgICAgICAgX2Fzc2lnbkV2ZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fJHN0YXJ0QnRuLm9mZih0aGlzLk5BTUVTUEFDRSlcbiAgICAgICAgICAgICAgICAub24oXCJjbGljay5cIiArIHRoaXMuTkFNRVNQQUNFLCB7IGluc3RhbmNlOiB0aGlzIH0sIHRoaXMuX29uU3RhcnRCdXR0b25DbGljayk7XG4gICAgICAgICAgICB0aGlzLl8kZW5kQnRuLm9mZih0aGlzLk5BTUVTUEFDRSlcbiAgICAgICAgICAgICAgICAub24oXCJjbGljay5cIiArIHRoaXMuTkFNRVNQQUNFLCB7IGluc3RhbmNlOiB0aGlzIH0sIHRoaXMuX29uRW5kQnV0dG9uQ2xpY2spO1xuICAgICAgICAgICAgdGhpcy5fJG5leHRCdG4ub2ZmKHRoaXMuTkFNRVNQQUNFKVxuICAgICAgICAgICAgICAgIC5vbihcImNsaWNrLlwiICsgdGhpcy5OQU1FU1BBQ0UsIHsgaW5zdGFuY2U6IHRoaXMgfSwgdGhpcy5fb25OZXh0QnV0dG9uQ2xpY2spO1xuICAgICAgICAgICAgdGhpcy5fJHByZXZCdG4ub2ZmKHRoaXMuTkFNRVNQQUNFKVxuICAgICAgICAgICAgICAgIC5vbihcImNsaWNrLlwiICsgdGhpcy5OQU1FU1BBQ0UsIHsgaW5zdGFuY2U6IHRoaXMgfSwgdGhpcy5fb25QcmV2QnV0dG9uQ2xpY2spO1xuICAgICAgICAgICAgdGhpcy5fJHF1ZXN0aW9ucy5vZmYodGhpcy5OQU1FU1BBQ0UpXG4gICAgICAgICAgICAgICAgLm9uKFwiY2hhbmdlLlwiICsgdGhpcy5OQU1FU1BBQ0UsIHsgaW5zdGFuY2U6IHRoaXMgfSwgdGhpcy5fb25PcHRpb25DaGFuZ2UpO1xuICAgICAgICB9LFxuICAgICAgICBfb25TdGFydEJ1dHRvbkNsaWNrOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5kYXRhLmluc3RhbmNlLnN0YXJ0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9vbkVuZEJ1dHRvbkNsaWNrOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5kYXRhLmluc3RhbmNlLmVuZCgpO1xuICAgICAgICB9LFxuICAgICAgICBfb25OZXh0QnV0dG9uQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLmRhdGEuaW5zdGFuY2UubmV4dCgpO1xuICAgICAgICB9LFxuICAgICAgICBfb25QcmV2QnV0dG9uQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLmRhdGEuaW5zdGFuY2UucHJldigpO1xuICAgICAgICB9LFxuICAgICAgICBfY2FsaWZpY2F0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTY29yZSA9IDAsIG1heFNjb3JlID0gdGhpcy5fbWF4U2NvcmUsIHJ1bnRpbWUgPSB0aGlzLl9ydW50aW1lLCBxdWVzdGlvbnMgPSB0aGlzLl9xdWVzdGlvbnMsIGNhbGlmaWNhdGlvbiwgblN1Y2Nlc3MgPSAwLCBuRmFpbHMgPSAwO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tdWx0aWNob2ljZSAhPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX2NhbGlmaWNhdGVTaW5nbGVDaG9pY2UoKTtcbiAgICAgICAgICAgICAgICBuU3VjY2VzcyA9IHJlc3VsdC5uU3VjY2VzcztcbiAgICAgICAgICAgICAgICBuRmFpbHMgPSByZXN1bHQubkZhaWxzO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRTY29yZSA9IHJlc3VsdC5zY29yZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9jYWxpZmljYXRlTXVsdGlDaG9pY2UoKTtcbiAgICAgICAgICAgICAgICBuU3VjY2VzcyA9IHJlc3VsdC5uU3VjY2VzcztcbiAgICAgICAgICAgICAgICBuRmFpbHMgPSByZXN1bHQubkZhaWxzO1xuICAgICAgICAgICAgICAgIGN1cnJlbnRTY29yZSA9IHJlc3VsdC5zY29yZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGlmaWNhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICBtYXhTY29yZTogbWF4U2NvcmUsXG4gICAgICAgICAgICAgICAgc2NvcmU6IGN1cnJlbnRTY29yZSxcbiAgICAgICAgICAgICAgICBwZXJjZW50YWdlOiAoY3VycmVudFNjb3JlICogMTAwKSAvIG1heFNjb3JlLFxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uc1N1Y2Nlc3M6IG5TdWNjZXNzLFxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uc0ZhaWw6IG5GYWlscyxcbiAgICAgICAgICAgICAgICBxdWVzdGlvbnNOb3RBdHRlbXB0ZWQ6IHF1ZXN0aW9ucy5sZW5ndGggLSAoblN1Y2Nlc3MgKyBuRmFpbHMpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FsaWZpY2F0aW9uLnN1Y2Nlc3MgPSBjYWxpZmljYXRpb24ucGVyY2VudGFnZSA+PSB0aGlzLm9wdGlvbnMuY3V0T2ZmTWFyaztcbiAgICAgICAgICAgIHJldHVybiBjYWxpZmljYXRpb247XG4gICAgICAgIH0sXG4gICAgICAgIF9jYWxpZmljYXRlU2luZ2xlQ2hvaWNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudFNjb3JlID0gMCwgcnVudGltZSA9IHRoaXMuX3J1bnRpbWUsIHF1ZXN0aW9ucyA9IHRoaXMuX3F1ZXN0aW9ucywgblN1Y2Nlc3MgPSAwLCBuRmFpbHMgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgcXVlc3Rpb25JbmRleCA9IDAsIHF1ZXN0aW9uc0xlbmd0aCA9IHF1ZXN0aW9ucy5sZW5ndGg7IHF1ZXN0aW9uSW5kZXggPCBxdWVzdGlvbnNMZW5ndGg7IHF1ZXN0aW9uSW5kZXgrKykge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50UXVlc3Rpb24gPSBxdWVzdGlvbnNbcXVlc3Rpb25JbmRleF0sIHF1ZXN0aW9uUnVudGltZSA9IHJ1bnRpbWVbY3VycmVudFF1ZXN0aW9uLmlkXSwgcmVzdWx0ID0gdGhpcy5fY2FsaWZpY2F0ZVNpbmdsZUNob2ljZVF1ZXN0aW9uKGN1cnJlbnRRdWVzdGlvbi5pZCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNjb3JlICs9IGN1cnJlbnRRdWVzdGlvbi5wb2ludHNGb3JTdWNjZXNzO1xuICAgICAgICAgICAgICAgICAgICAgICAgblN1Y2Nlc3MrKztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5GYWlscysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTY29yZSA+PSBjdXJyZW50UXVlc3Rpb24ucG9pbnRzRm9yRmFpbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTY29yZSAtPSBjdXJyZW50UXVlc3Rpb24ucG9pbnRzRm9yRmFpbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgblN1Y2Nlc3M6IG5TdWNjZXNzLFxuICAgICAgICAgICAgICAgIG5GYWlsczogbkZhaWxzLFxuICAgICAgICAgICAgICAgIHNjb3JlOiBjdXJyZW50U2NvcmVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIF9jYWxpZmljYXRlU2luZ2xlQ2hvaWNlUXVlc3Rpb246IGZ1bmN0aW9uIChxdWVzdGlvbklkKSB7XG4gICAgICAgICAgICB2YXIgcXVlc3Rpb24gPSB0aGlzLmdldFF1ZXN0aW9uQnlJZChxdWVzdGlvbklkKSwgcmVzdWx0O1xuICAgICAgICAgICAgaWYgKHF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHF1ZXN0aW9uUnVudGltZSA9IHRoaXMuX3J1bnRpbWVbcXVlc3Rpb24uaWRdO1xuICAgICAgICAgICAgICAgIGlmIChxdWVzdGlvblJ1bnRpbWUgJiYgcXVlc3Rpb25SdW50aW1lLm9wdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcXVlc3Rpb25PcHRpb25zID0gcXVlc3Rpb24ub3B0aW9ucywgcXVlc3Rpb25PcHRpb25zTWFwID0gcXVlc3Rpb24ub3B0aW9uc01hcCwgc2VsZWN0ZWRPcHRpb25JZCA9IHF1ZXN0aW9uUnVudGltZS5vcHRpb25zWzBdLCBzZWxlY3RlZE9wdGlvbiA9IHF1ZXN0aW9uT3B0aW9uc1txdWVzdGlvbk9wdGlvbnNNYXBbc2VsZWN0ZWRPcHRpb25JZF1dO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBzZWxlY3RlZE9wdGlvbi5pc0NvcnJlY3Q7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uUnVudGltZS5pc0NvcnJlY3QgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgX2NhbGlmaWNhdGVNdWx0aUNob2ljZVF1ZXN0aW9uOiBmdW5jdGlvbiAocXVlc3Rpb25JZCkge1xuICAgICAgICAgICAgdmFyIHF1ZXN0aW9uID0gdGhpcy5nZXRRdWVzdGlvbkJ5SWQocXVlc3Rpb25JZCksIHJlc3VsdDtcbiAgICAgICAgICAgIGlmIChxdWVzdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBxdWVzdGlvblJ1bnRpbWUgPSB0aGlzLl9ydW50aW1lW3F1ZXN0aW9uLmlkXTtcbiAgICAgICAgICAgICAgICBpZiAocXVlc3Rpb25SdW50aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxdWVzdGlvbk9wdGlvbnMgPSBxdWVzdGlvbi5vcHRpb25zLCBzZWxlY3RlZE9wdGlvbnMgPSBxdWVzdGlvblJ1bnRpbWUub3B0aW9ucywgbkNvcnJlY3RPcHRpb25zU2VsZWN0ZWQgPSAwLCBuQ29ycmVjdE9wdGlvbnMgPSAwLCBuSW5jb3JyZWN0T3B0aW9uc1NlbGVjdGVkID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgcXVlc3Rpb25PcHRpb25JbmRleCA9IDAsIHF1ZXN0aW9uT3B0aW9uc0xlbmd0aCA9IHF1ZXN0aW9uT3B0aW9ucy5sZW5ndGg7IHF1ZXN0aW9uT3B0aW9uSW5kZXggPCBxdWVzdGlvbk9wdGlvbnNMZW5ndGg7IHF1ZXN0aW9uT3B0aW9uSW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRRdWVzdGlvbk9wdGlvbiA9IHF1ZXN0aW9uT3B0aW9uc1txdWVzdGlvbk9wdGlvbkluZGV4XSwgY2hlY2tlZCA9IHNlbGVjdGVkT3B0aW9ucy5pbmRleE9mKGN1cnJlbnRRdWVzdGlvbk9wdGlvbi5pZCkgIT0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFF1ZXN0aW9uT3B0aW9uLmlzQ29ycmVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5Db3JyZWN0T3B0aW9ucysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5Db3JyZWN0T3B0aW9uc1NlbGVjdGVkICs9IGNoZWNrZWQgPyAxIDogMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5JbmNvcnJlY3RPcHRpb25zU2VsZWN0ZWQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25PcHRpb25JbmRleCA9IHF1ZXN0aW9uT3B0aW9uc0xlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbkluY29ycmVjdE9wdGlvbnNTZWxlY3RlZCA9PSAwICYmIG5Db3JyZWN0T3B0aW9uc1NlbGVjdGVkID09IG5Db3JyZWN0T3B0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25SdW50aW1lLmlzQ29ycmVjdCA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuICAgICAgICBfY2FsaWZpY2F0ZU11bHRpQ2hvaWNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudFNjb3JlID0gMCwgcnVudGltZSA9IHRoaXMuX3J1bnRpbWUsIHF1ZXN0aW9ucyA9IHRoaXMuX3F1ZXN0aW9ucywgblN1Y2Nlc3MgPSAwLCBuRmFpbHMgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgcXVlc3Rpb25JbmRleCA9IDAsIHF1ZXN0aW9uc0xlbmd0aCA9IHF1ZXN0aW9ucy5sZW5ndGg7IHF1ZXN0aW9uSW5kZXggPCBxdWVzdGlvbnNMZW5ndGg7IHF1ZXN0aW9uSW5kZXgrKykge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50UXVlc3Rpb24gPSBxdWVzdGlvbnNbcXVlc3Rpb25JbmRleF0sIHF1ZXN0aW9uUnVudGltZSA9IHJ1bnRpbWVbY3VycmVudFF1ZXN0aW9uLmlkXSwgcmVzdWx0ID0gdGhpcy5fY2FsaWZpY2F0ZU11bHRpQ2hvaWNlUXVlc3Rpb24oY3VycmVudFF1ZXN0aW9uLmlkKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuU3VjY2VzcysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNjb3JlICs9IGN1cnJlbnRRdWVzdGlvbi5wb2ludHNGb3JTdWNjZXNzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbkZhaWxzKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNjb3JlID49IGN1cnJlbnRRdWVzdGlvbi5wb2ludHNGb3JGYWlsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNjb3JlIC09IGN1cnJlbnRRdWVzdGlvbi5wb2ludHNGb3JGYWlsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuU3VjY2VzczogblN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgbkZhaWxzOiBuRmFpbHMsXG4gICAgICAgICAgICAgICAgc2NvcmU6IGN1cnJlbnRTY29yZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgX3Nob3dPcHRpb25TdGF0dXM6IGZ1bmN0aW9uIChxdWVzdGlvbklkLCBvcHRpb25JZCkge1xuICAgICAgICAgICAgdmFyIHF1ZXN0aW9uID0gdGhpcy5nZXRRdWVzdGlvbkJ5SWQocXVlc3Rpb25JZCk7XG4gICAgICAgICAgICBpZiAocXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcnVudGltZSA9IHRoaXMuX3J1bnRpbWVbcXVlc3Rpb24uaWRdLCBvcHRpb24gPSBxdWVzdGlvbi5vcHRpb25zW3F1ZXN0aW9uLm9wdGlvbnNNYXBbb3B0aW9uSWRdXTtcbiAgICAgICAgICAgICAgICBpZiAocnVudGltZSAmJiBvcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gcnVudGltZS5vcHRpb25zLmluZGV4T2Yob3B0aW9uSWQpICE9IC0xO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi4kZWxlbWVudC5hZGRDbGFzcyhvcHRpb24uaXNDb3JyZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkNvcnJlY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uSW5jb3JyZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi4kZWxlbWVudC5hZGRDbGFzcyhvcHRpb24uaXNDb3JyZWN0ID8gdGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb25JbmNvcnJlY3QgOiBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRlbGVtZW50LmFkZENsYXNzKG9wdGlvbi5pc0NvcnJlY3QgPyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkluY29ycmVjdCA6IFwiXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgX3Nob3dRdWVzdGlvblN0YXR1czogZnVuY3Rpb24gKHF1ZXN0aW9uSWQpIHtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHRoaXMuZ2V0UXVlc3Rpb25CeUlkKHF1ZXN0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKHF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJ1bnRpbWUgPSB0aGlzLl9ydW50aW1lW3F1ZXN0aW9uLmlkXTtcbiAgICAgICAgICAgICAgICBpZiAocnVudGltZSAmJiBydW50aW1lLm9wdGlvbiAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSBxdWVzdGlvbi5vcHRpb25zO1xuICAgICAgICAgICAgICAgICAgICBpZiAocnVudGltZS5pc0NvcnJlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRlbGVtZW50LmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uQ29ycmVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbi4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkluY29ycmVjdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBvcHRpb25zXzEgPSBvcHRpb25zOyBfaSA8IG9wdGlvbnNfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50T3B0aW9uID0gb3B0aW9uc18xW19pXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50T3B0aW9uLmlzQ29ycmVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRPcHRpb24uJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb25Db3JyZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRPcHRpb24uJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb25JbmNvcnJlY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfc2hvd09wdGlvbkZlZWRiYWNrOiBmdW5jdGlvbiAocXVlc3Rpb25JZCwgb3B0aW9uSWQpIHtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHRoaXMuZ2V0UXVlc3Rpb25CeUlkKHF1ZXN0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKHF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJ1bnRpbWUgPSB0aGlzLl9ydW50aW1lW3F1ZXN0aW9uLmlkXSwgb3B0aW9uID0gcXVlc3Rpb24ub3B0aW9uc1txdWVzdGlvbi5vcHRpb25zTWFwW29wdGlvbklkXV07XG4gICAgICAgICAgICAgICAgaWYgKHJ1bnRpbWUgJiYgb3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IHJ1bnRpbWUub3B0aW9ucy5pbmRleE9mKG9wdGlvbklkKSAhPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9uLmlzQ29ycmVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi4kZmVlZGJhY2tLby5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRmZWVkYmFja09rLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi4kZmVlZGJhY2tPay5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRmZWVkYmFja0tvLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgX3Nob3dRdWVzdGlvbkZlZWRiYWNrOiBmdW5jdGlvbiAocXVlc3Rpb25JZCkge1xuICAgICAgICAgICAgdmFyIHF1ZXN0aW9uID0gdGhpcy5nZXRRdWVzdGlvbkJ5SWQocXVlc3Rpb25JZCk7XG4gICAgICAgICAgICBpZiAocXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcnVudGltZSA9IHRoaXMuX3J1bnRpbWVbcXVlc3Rpb24uaWRdO1xuICAgICAgICAgICAgICAgIGlmIChydW50aW1lICYmIHJ1bnRpbWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb24gPSB0aGlzLmdldE9wdGlvbkJ5SWQocXVlc3Rpb25JZCwgcnVudGltZS5vcHRpb25zWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbi5pc0NvcnJlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRmZWVkYmFja0tvLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRmZWVkYmFja09rLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRmZWVkYmFja09rLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRmZWVkYmFja0tvLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgX2Rpc2FibGVRdWVzdGlvbk9wdGlvbnNGaWVsZDogZnVuY3Rpb24gKHF1ZXN0aW9uSWQpIHtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHRoaXMuZ2V0UXVlc3Rpb25CeUlkKHF1ZXN0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKHF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tdWx0aWNob2ljZSAmJiB0aGlzLl9zdGF0ZSA9PSB0aGlzLlNUQVRFUy5ydW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRlbGVtZW50LmZpbmQoXCI6Y2hlY2tlZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkaXNhYmxlZFwiLCBcImRpc2FibGVkXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb24uJGVsZW1lbnQuZmluZChcImlucHV0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfb25PcHRpb25DbGljazogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBpbnN0YW5jZSA9IGUuZGF0YS5pbnN0YW5jZSwgJHF1ZXN0aW9uID0gJCh0aGlzKSwgcXVlc3Rpb25JZCA9ICRxdWVzdGlvbi5hdHRyKFwiaWRcIiksIHF1ZXN0aW9uUnVudGltZSA9IGluc3RhbmNlLl9ydW50aW1lW3F1ZXN0aW9uSWRdIHx8IHt9O1xuICAgICAgICAgICAgaWYgKGluc3RhbmNlLm9wdGlvbnMuaW1tZWRpYXRlRmVlZGJhY2sgPT09IHRydWUgJiYgcXVlc3Rpb25SdW50aW1lLm9wdGlvbiAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9vbk9wdGlvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBpbnN0YW5jZSA9IGUuZGF0YS5pbnN0YW5jZTtcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5vcHRpb25zLmRpc2FibGVkICE9IHRydWUgJiYgaW5zdGFuY2UuX3N0YXRlID09IGluc3RhbmNlLlNUQVRFUy5ydW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgdmFyICRvcHRpb24gPSAkKGUudGFyZ2V0KVxuICAgICAgICAgICAgICAgICAgICAucGFyZW50cyhpbnN0YW5jZS5RVUVSWV9PUFRJT04pLCAkcXVlc3Rpb24gPSAkKHRoaXMpLCBxdWVzdGlvbklkID0gJHF1ZXN0aW9uLmF0dHIoXCJpZFwiKSwgcXVlc3Rpb25SdW50aW1lID0gaW5zdGFuY2UuX3J1bnRpbWVbcXVlc3Rpb25JZF0gfHwge30sIG9wdGlvbnMgPSBxdWVzdGlvblJ1bnRpbWUub3B0aW9ucyB8fCBbXSwgb3B0aW9uSWQgPSAkb3B0aW9uLmF0dHIoXCJpZFwiKTtcbiAgICAgICAgICAgICAgICBxdWVzdGlvblJ1bnRpbWUub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuX3J1bnRpbWVbcXVlc3Rpb25JZF0gPSBxdWVzdGlvblJ1bnRpbWU7XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLm9wdGlvbnMubXVsdGljaG9pY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0LmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucHVzaChvcHRpb25JZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkb3B0aW9uLmFkZENsYXNzKGluc3RhbmNlLkNMQVNTX1NFTEVDVEVEKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLl9yZXNldE9wdGlvbihxdWVzdGlvbklkLCBvcHRpb25JZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnNwbGljZShvcHRpb25zLmluZGV4T2Yob3B0aW9uSWQpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fY2FsaWZpY2F0ZU11bHRpQ2hvaWNlUXVlc3Rpb24ocXVlc3Rpb25JZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAocXVlc3Rpb25SdW50aW1lLm9wdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuX3Jlc2V0T3B0aW9uKHF1ZXN0aW9uSWQsIHF1ZXN0aW9uUnVudGltZS5vcHRpb25zWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zWzBdID0gb3B0aW9uSWQ7XG4gICAgICAgICAgICAgICAgICAgICRvcHRpb24uYWRkQ2xhc3MoaW5zdGFuY2UuQ0xBU1NfU0VMRUNURUQpO1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fY2FsaWZpY2F0ZVNpbmdsZUNob2ljZVF1ZXN0aW9uKHF1ZXN0aW9uSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2Uub3B0aW9ucy5pbW1lZGlhdGVGZWVkYmFjayA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5vcHRpb25zLmRpc2FibGVPcHRpb25BZnRlclNlbGVjdCA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fZGlzYWJsZVF1ZXN0aW9uT3B0aW9uc0ZpZWxkKHF1ZXN0aW9uSWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGluc3RhbmNlLm9wdGlvbnMuZGlzYWJsZU5leHRVbnRpbFN1Y2Nlc3MgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuX3VwZGF0ZU5hdmlnYXRpb25BY3Rpb25zU3RhdGVzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuX3Nob3dRdWVzdGlvblN0YXR1cyhxdWVzdGlvbklkKTtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuX3Nob3dPcHRpb25TdGF0dXMocXVlc3Rpb25JZCwgb3B0aW9uSWQpO1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fc2hvd09wdGlvbkZlZWRiYWNrKHF1ZXN0aW9uSWQsIG9wdGlvbklkKTtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuX3Nob3dRdWVzdGlvbkZlZWRiYWNrKHF1ZXN0aW9uSWQsIG9wdGlvbklkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlLm9wdGlvbnMuYXV0b0dvTmV4dCAhPSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2Uub3B0aW9ucy5tdWx0aWNob2ljZSAhPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBpbnN0YW5jZS5vcHRpb25zLmRlbGF5T25BdXRvTmV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UuZWxlbWVudC50cmlnZ2VySGFuZGxlcihpbnN0YW5jZS5PTl9PUFRJT05fQ0hBTkdFLCBbdGhpcywgcXVlc3Rpb25JZCwgb3B0aW9uSWRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgX3Jlc2V0T3B0aW9uOiBmdW5jdGlvbiAocXVlc3Rpb25JZCwgb3B0aW9uSWQpIHtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHRoaXMuZ2V0UXVlc3Rpb25CeUlkKHF1ZXN0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKHF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbiA9IHF1ZXN0aW9uLm9wdGlvbnNbcXVlc3Rpb24ub3B0aW9uc01hcFtvcHRpb25JZF1dO1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRmZWVkYmFja0tvLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRmZWVkYmFja09rLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRlbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnNlbGVjdGVkICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkNvcnJlY3QgKyBcIiBcIiArIHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uSW5jb3JyZWN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9zZXRPcHRpb246IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9zdXBlcihrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IFwiZGlzYWJsZWRcIikge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9oaWRlOiBmdW5jdGlvbiAocXVlc3Rpb25Ub0hpZGUpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgaGlkZURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuZWxlbWVudC50cmlnZ2VySGFuZGxlcih0aGlzLk9OX1FVRVNUSU9OX0hJREUsIFt0aGlzLCBxdWVzdGlvblRvSGlkZV0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPSB1bmRlZmluZWQgJiYgcmVzdWx0Lmhhc093blByb3BlcnR5KFwidGhlblwiKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaGlkZURlZmVyLnJlc29sdmVXaXRoKF90aGlzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1ZXN0aW9uVG9IaWRlLmZhZGVPdXQoNDAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGhpZGVEZWZlci5yZXNvbHZlV2l0aChfdGhpcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaGlkZURlZmVyLnByb21pc2UoKTtcbiAgICAgICAgfSxcbiAgICAgICAgX3Nob3c6IGZ1bmN0aW9uIChuZXh0UXVlc3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgc2hvd0RlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuZWxlbWVudC50cmlnZ2VySGFuZGxlcih0aGlzLk9OX1FVRVNUSU9OX1NIT1csIFt0aGlzLCBuZXh0UXVlc3Rpb25dKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT0gdW5kZWZpbmVkICYmIHJlc3VsdC5oYXNPd25Qcm9wZXJ0eShcInRoZW5cIikpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNob3dEZWZlci5yZXNvbHZlV2l0aChfdGhpcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXh0UXVlc3Rpb24uZmFkZUluKDQwMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzaG93RGVmZXIucmVzb2x2ZVdpdGgoX3RoaXMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNob3dEZWZlci5wcm9taXNlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9vbkhlYWRlckhpZGRlbjogZnVuY3Rpb24gKGRlZmVyKSB7XG4gICAgICAgICAgICBkZWZlci5yZXNvbHZlV2l0aCh0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgX2hpZGVIZWFkZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmVsZW1lbnQudHJpZ2dlckhhbmRsZXIodGhpcy5PTl9IRUFERVJfSElERSwgW3RoaXMsIHRoaXMuXyRoZWFkZXJdKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT0gdW5kZWZpbmVkICYmIHJlc3VsdC5oYXNPd25Qcm9wZXJ0eShcInRoZW5cIikpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudGhlbih0aGlzLl9vbkhlYWRlckhpZGRlbi5iaW5kKHRoaXMsIGRlZmVyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl8kaGVhZGVyLmZhZGVPdXQoNDAwLCB0aGlzLl9vbkhlYWRlckhpZGRlbi5iaW5kKHRoaXMsIGRlZmVyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9LFxuICAgICAgICBfc2hvd0hlYWRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmVsZW1lbnQudHJpZ2dlckhhbmRsZXIodGhpcy5PTl9IRUFERVJfU0hPVywgW3RoaXMsIHRoaXMuXyRoZWFkZXJdKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT0gdW5kZWZpbmVkICYmIHJlc3VsdC5oYXNPd25Qcm9wZXJ0eShcInRoZW5cIikpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlc29sdmVXaXRoKF90aGlzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuXyRoZWFkZXIuZmFkZUluKDQwMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlV2l0aChfdGhpcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9LFxuICAgICAgICBfb25Cb2R5SGlkZGVuOiBmdW5jdGlvbiAoZGVmZXIpIHtcbiAgICAgICAgICAgIGRlZmVyLnJlc29sdmVXaXRoKHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBfaGlkZUJvZHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmVsZW1lbnQudHJpZ2dlckhhbmRsZXIodGhpcy5PTl9CT0RZX0hJREUsIFt0aGlzLCB0aGlzLl8kYm9keV0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPSB1bmRlZmluZWQgJiYgcmVzdWx0Lmhhc093blByb3BlcnR5KFwidGhlblwiKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC50aGVuKHRoaXMuX29uQm9keUhpZGRlbi5iaW5kKHRoaXMsIGRlZmVyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl8kYm9keS5mYWRlT3V0KDQwMCwgdGhpcy5fb25Cb2R5SGlkZGVuLmJpbmQodGhpcywgZGVmZXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9zaG93Qm9keTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmVsZW1lbnQudHJpZ2dlckhhbmRsZXIodGhpcy5PTl9CT0RZX1NIT1csIFt0aGlzLCB0aGlzLl8kYm9keV0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPSB1bmRlZmluZWQgJiYgcmVzdWx0Lmhhc093blByb3BlcnR5KFwidGhlblwiKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZVdpdGgoX3RoaXMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fJGJvZHkuZmFkZUluKDQwMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlV2l0aChfdGhpcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9LFxuICAgICAgICBfYW5pbWF0aW9uU3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCksIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5faGlkZUhlYWRlcigpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzLl9zaG93Qm9keSgpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZVdpdGgodGhhdCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9hbmltYXRpb25TdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIGRlZmVyID0gJC5EZWZlcnJlZCgpLCB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuX2hpZGVCb2R5KClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuX3Nob3dIZWFkZXIoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlc29sdmVXaXRoKHRoYXQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9LFxuICAgICAgICBfZGlzYWJsZUVuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fJGVuZEJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLl8kZW5kQnRuLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmRpc2FibGVkKTtcbiAgICAgICAgfSxcbiAgICAgICAgX2VuYWJsZUVuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fJGVuZEJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5fJGVuZEJ0bi5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5kaXNhYmxlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9kaXNhYmxlUHJldjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fJHByZXZCdG4ucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5fJHByZXZCdG4uYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuZGlzYWJsZWQpO1xuICAgICAgICB9LFxuICAgICAgICBfZW5hYmxlUHJldjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fJHByZXZCdG4ucHJvcChcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuXyRwcmV2QnRuLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmRpc2FibGVkKTtcbiAgICAgICAgfSxcbiAgICAgICAgX2Rpc2FibGVOZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl8kbmV4dEJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLl8kbmV4dEJ0bi5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5kaXNhYmxlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9lbmFibGVOZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl8kbmV4dEJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5fJG5leHRCdG4ucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuZGlzYWJsZWQpO1xuICAgICAgICB9LFxuICAgICAgICBfZGlzYWJsZVN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl8kc3RhcnRCdG4ucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5fJHN0YXJ0QnRuLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmRpc2FibGVkKTtcbiAgICAgICAgfSxcbiAgICAgICAgX2VuYWJsZVN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl8kc3RhcnRCdG4ucHJvcChcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuXyRzdGFydEJ0bi5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5kaXNhYmxlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9vbkFuaW1hdGlvblN0YXJ0RW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmdvVG8oMCk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQudHJpZ2dlcih0aGlzLk9OX1NUQVJURUQsIFt0aGlzXSk7XG4gICAgICAgIH0sXG4gICAgICAgIF9vbkFuaW1hdGlvbkVuZEVuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB9LFxuICAgICAgICBfb25RdWVzdGlvblRyYW5zaXRpb25FbmQ6IGZ1bmN0aW9uIChvbGRQYWdlLCBuZXdQYWdlLCBkZWZlcikge1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlTmF2aWdhdGlvbkFjdGlvbnNTdGF0ZXMoKTtcbiAgICAgICAgICAgIGRlZmVyLnJlc29sdmVXaXRoKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnRyaWdnZXJIYW5kbGVyKHRoaXMuT05fVFJBTlNJVElPTl9FTkQsIFt0aGlzLCBvbGRQYWdlLCBuZXdQYWdlXSk7XG4gICAgICAgIH0sXG4gICAgICAgIF91cGRhdGVOYXZpZ2F0aW9uQWN0aW9uc1N0YXRlczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHF1ZXN0aW9uID0gdGhpcy5nZXRRdWVzdGlvbkJ5SW5kZXgodGhpcy5fY3VycmVudFF1ZXN0aW9uSW5kZXgpLCBxdWVzdGlvblJ1bnRpbWUgPSB0aGlzLl9ydW50aW1lW3F1ZXN0aW9uLmlkXTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jdXJyZW50UXVlc3Rpb25JbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVQcmV2KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZW5hYmxlTmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5fY3VycmVudFF1ZXN0aW9uSW5kZXggPT09IHRoaXMuX3F1ZXN0aW9ucy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5leHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVQcmV2KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVQcmV2KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZW5hYmxlTmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbW1lZGlhdGVGZWVkYmFjayA9PSB0cnVlICYmIHRoaXMub3B0aW9ucy5kaXNhYmxlT3B0aW9uQWZ0ZXJTZWxlY3QgIT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGlzYWJsZU5leHRVbnRpbFN1Y2Nlc3MgPT0gdHJ1ZSAmJiAocXVlc3Rpb25SdW50aW1lID09IHVuZGVmaW5lZCB8fCBxdWVzdGlvblJ1bnRpbWUuaXNDb3JyZWN0ICE9IHRydWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVOZXh0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5vcHRpb25zLmRpc2FibGVFbmRBY3Rpb25VbnRpbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHRoaXMuRElTQUJMRV9FTkQuYmVmb3JlQW5zd2VyQWxsOlxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXModGhpcy5fcnVudGltZSkgPT0gdGhpcy5fcXVlc3Rpb25zLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHRoaXMuRElTQUJMRV9FTkQuYmVmb3JlQW5zd2VyQWxsQ29ycmVjdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb3JyZWN0ID0gMCwgcnVudGltZSA9IHRoaXMuX3J1bnRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBxdWVzdGlvbklkIGluIHJ1bnRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcXVlc3Rpb25SdW50aW1lXzEgPSBydW50aW1lW3F1ZXN0aW9uSWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxdWVzdGlvblJ1bnRpbWVfMS5pc0NvcnJlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ycmVjdCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb3JyZWN0ID09IHRoaXMuX3F1ZXN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVFbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVFbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgX29uRW5kU2hvd1Jlc3VsdDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBpbnN0YW5jZSA9IGUuZGF0YS5pbnN0YW5jZTtcbiAgICAgICAgICAgIGluc3RhbmNlLmVuZCgpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRNYXhQb2ludHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYXhTY29yZTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0SWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuYXR0cihcImlkXCIpO1xuICAgICAgICB9LFxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY3VycmVudFF1ZXN0aW9uSW5kZXggIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ29Ubyh0aGlzLl9jdXJyZW50UXVlc3Rpb25JbmRleCArIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ29UbygwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcHJldjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRRdWVzdGlvbkluZGV4ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdvVG8odGhpcy5fY3VycmVudFF1ZXN0aW9uSW5kZXggLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdvVG8oMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGdvVG86IGZ1bmN0aW9uIChxdWVzdGlvbkluZGV4KSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIHByb21pc2U7XG4gICAgICAgICAgICBpZiAodGhpcy5fc3RhdGUgPT09IHRoaXMuU1RBVEVTLnJ1bm5pbmcgfHwgdGhpcy5fc3RhdGUgPT0gdGhpcy5TVEFURVMucmV2aWV3KSB7XG4gICAgICAgICAgICAgICAgdmFyIG5leHRRdWVzdGlvbl8xID0gdGhpcy5fcXVlc3Rpb25zW3F1ZXN0aW9uSW5kZXhdLCBjdXJyZW50UXVlc3Rpb25JbmRleCA9IHRoaXMuX2N1cnJlbnRRdWVzdGlvbkluZGV4LCBjdXJyZW50UXVlc3Rpb25fMSA9IHRoaXMuX3F1ZXN0aW9uc1tjdXJyZW50UXVlc3Rpb25JbmRleF07XG4gICAgICAgICAgICAgICAgaWYgKG5leHRRdWVzdGlvbl8xICE9IHVuZGVmaW5lZCAmJiAoY3VycmVudFF1ZXN0aW9uXzEgPT0gdW5kZWZpbmVkIHx8IGN1cnJlbnRRdWVzdGlvbl8xICE9IG5leHRRdWVzdGlvbl8xKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGVmZXJfMSA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZSA9IGRlZmVyXzEucHJvbWlzZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlUHJldigpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50UXVlc3Rpb25JbmRleCA9IHF1ZXN0aW9uSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChxdWVzdGlvbkluZGV4ID09IHRoaXMuX3F1ZXN0aW9ucy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuZmlyc3RRdWVzdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMubGFzdFF1ZXN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChxdWVzdGlvbkluZGV4ID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5sYXN0UXVlc3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmZpcnN0UXVlc3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmZpcnN0UXVlc3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmxhc3RRdWVzdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmF0dHIodGhpcy5BVFRSX0NVUlJFTlRfUVVFU1RJT04sIHF1ZXN0aW9uSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFF1ZXN0aW9uXzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2hpZGUoY3VycmVudFF1ZXN0aW9uXzEuJGVsZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9zaG93KG5leHRRdWVzdGlvbl8xLiRlbGVtZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihfdGhpcy5fb25RdWVzdGlvblRyYW5zaXRpb25FbmQuYmluZChfdGhpcywgY3VycmVudFF1ZXN0aW9uXzEsIG5leHRRdWVzdGlvbl8xLCBkZWZlcl8xKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Nob3cobmV4dFF1ZXN0aW9uXzEuJGVsZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25RdWVzdGlvblRyYW5zaXRpb25FbmQuYmluZCh0aGlzLCBjdXJyZW50UXVlc3Rpb25fMSwgbmV4dFF1ZXN0aW9uXzEsIGRlZmVyXzEpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9LFxuICAgICAgICBnZXRRdWVzdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9xdWVzdGlvbnM7XG4gICAgICAgIH0sXG4gICAgICAgIGdldFF1ZXN0aW9uQnlJbmRleDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcXVlc3Rpb25zW2luZGV4XTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0UXVlc3Rpb25CeUlkOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFF1ZXN0aW9uQnlJbmRleCh0aGlzLl9xdWVzdGlvbnNNYXBbaWRdKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0T3B0aW9uczogZnVuY3Rpb24gKHF1ZXN0aW9uSWQpIHtcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5nZXRRdWVzdGlvbkJ5SWQocXVlc3Rpb25JZCkgfHwge30pLm9wdGlvbnM7XG4gICAgICAgIH0sXG4gICAgICAgIGdldE9wdGlvbkJ5SW5kZXg6IGZ1bmN0aW9uIChxdWVzdGlvbklkLCBvcHRpb25JbmRleCkge1xuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnMocXVlc3Rpb25JZCksIG9wdGlvbjtcbiAgICAgICAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9uID0gb3B0aW9uc1tvcHRpb25JbmRleF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9uO1xuICAgICAgICB9LFxuICAgICAgICBnZXRPcHRpb25CeUlkOiBmdW5jdGlvbiAocXVlc3Rpb25JZCwgb3B0aW9uSWQpIHtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHRoaXMuZ2V0UXVlc3Rpb25CeUlkKHF1ZXN0aW9uSWQpLCBvcHRpb247XG4gICAgICAgICAgICBpZiAocXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICBvcHRpb24gPSBxdWVzdGlvbi5vcHRpb25zW3F1ZXN0aW9uLm9wdGlvbnNNYXBbb3B0aW9uSWRdXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvcHRpb247XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB9LFxuICAgICAgICByZWRyYXdQcm9wZXJ0aWVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJPcHRpb25zKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9ydW50aW1lID0ge307XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cih0aGlzLkFUVFJfQ1VSUkVOVF9RVUVTVElPTik7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuZmlyc3RRdWVzdGlvbik7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMubGFzdFF1ZXN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuXyRxdWVzdGlvbnMuaGlkZSgpO1xuICAgICAgICAgICAgdGhpcy5fJHF1ZXN0aW9ucy5maXJzdCgpXG4gICAgICAgICAgICAgICAgLnNob3coKTtcbiAgICAgICAgICAgIHRoaXMuXyRxdWVzdGlvbnMuZmluZChcImlucHV0XCIpXG4gICAgICAgICAgICAgICAgLnByb3AoXCJjaGVja2VkXCIsIGZhbHNlKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0ZFRURCQUNLKVxuICAgICAgICAgICAgICAgIC5oaWRlKCk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuZmluZChcIi5cIiArIHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uQ29ycmVjdClcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb25Db3JyZWN0KTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5maW5kKFwiLlwiICsgdGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb25JbmNvcnJlY3QpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uSW5jb3JyZWN0KTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5maW5kKFwiLlwiICsgdGhpcy5vcHRpb25zLmNsYXNzZXMuc2VsZWN0ZWQpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnNlbGVjdGVkKTtcbiAgICAgICAgfSxcbiAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGlzYWJsZWQgIT0gdHJ1ZSAmJiB0aGlzLl9zdGF0ZSA9PT0gdGhpcy5TVEFURVMub2ZmKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2hhbmdlU3RhdGUodGhpcy5TVEFURVMucnVubmluZyk7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnRyaWdnZXIodGhpcy5PTl9TVEFSVCwgW3RoaXNdKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9ydW50aW1lID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uU3RhcnQoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbih0aGlzLl9vbkFuaW1hdGlvblN0YXJ0RW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc2hvd1Jlc3VsdDogZnVuY3Rpb24gKGNhbGlmaWNhdGlvbikge1xuICAgICAgICAgICAgaWYgKGNhbGlmaWNhdGlvbiAmJiB0aGlzLm9wdGlvbnMuc2hvd1Jlc3VsdCAmJiB0aGlzLl8kcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2hhbmdlU3RhdGUodGhpcy5TVEFURVMucmVzdWx0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW5kZXJWYXIodGhpcy5RVUVSWV9SRU5ERVJfUkVTVUxULCBcImpxUXVpelJlc3VsdEl0ZW1cIiwgY2FsaWZpY2F0aW9uLCB0aGlzLl8kcmVzdWx0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl8kcmVzdWx0LmRpYWxvZyh0aGlzLm9wdGlvbnMuZGlhbG9nKVxuICAgICAgICAgICAgICAgICAgICAub25lKFwiZGlhbG9nY2xvc2VcIiwgeyBpbnN0YW5jZTogdGhpcyB9LCB0aGlzLl9vbkVuZFNob3dSZXN1bHQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBzaG93Q29ycmVjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaG93Q29ycmVjdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBxdWVzdGlvbnMgPSB0aGlzLl9xdWVzdGlvbnM7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcXVlc3Rpb25JbmRleCA9IDAsIHF1ZXN0aW9uc0xlbmd0aCA9IHF1ZXN0aW9ucy5sZW5ndGg7IHF1ZXN0aW9uSW5kZXggPCBxdWVzdGlvbnNMZW5ndGg7IHF1ZXN0aW9uSW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFF1ZXN0aW9uID0gcXVlc3Rpb25zW3F1ZXN0aW9uSW5kZXhdLCBvcHRpb25zID0gY3VycmVudFF1ZXN0aW9uLm9wdGlvbnM7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIG9wdGlvbkluZGV4ID0gMCwgb3B0aW9uc0xlbmd0aCA9IG9wdGlvbnMubGVuZ3RoOyBvcHRpb25JbmRleCA8IG9wdGlvbnNMZW5ndGg7IG9wdGlvbkluZGV4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50T3B0aW9uID0gb3B0aW9uc1tvcHRpb25JbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zaG93T3B0aW9uU3RhdHVzKGN1cnJlbnRRdWVzdGlvbi5pZCwgY3VycmVudE9wdGlvbi5pZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZVF1ZXN0aW9uT3B0aW9uc0ZpZWxkKGN1cnJlbnRRdWVzdGlvbi5pZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2NoYW5nZVN0YXRlKHRoaXMuU1RBVEVTLnJldmlldyk7XG4gICAgICAgICAgICAgICAgdGhpcy5nb1RvKDApO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfZGlzYWJsZUFsbFF1ZXN0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHF1ZXN0aW9ucyA9IHRoaXMuX3F1ZXN0aW9ucztcbiAgICAgICAgICAgIGZvciAodmFyIHF1ZXN0aW9uSW5kZXggPSAwLCBxdWVzdGlvbnNMZW5ndGggPSBxdWVzdGlvbnMubGVuZ3RoOyBxdWVzdGlvbkluZGV4IDwgcXVlc3Rpb25zTGVuZ3RoOyBxdWVzdGlvbkluZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VycmVudFF1ZXN0aW9uID0gcXVlc3Rpb25zW3F1ZXN0aW9uSW5kZXhdO1xuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVRdWVzdGlvbk9wdGlvbnNGaWVsZChjdXJyZW50UXVlc3Rpb24uaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdGF0ZSA9PT0gdGhpcy5TVEFURVMucnVubmluZykge1xuICAgICAgICAgICAgICAgIHZhciBjYWxpZmljYXRpb24gPSB0aGlzLl9jYWxpZmljYXRlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0Q2FsaWZpY2F0aW9uID0gY2FsaWZpY2F0aW9uO1xuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVBbGxRdWVzdGlvbnMoKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2hvd1Jlc3VsdChjYWxpZmljYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5zaG93Q29ycmVjdGlvbigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VTdGF0ZSh0aGlzLlNUQVRFUy5vZmYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uU3RvcCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25BbmltYXRpb25FbmRFbmQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnRyaWdnZXIodGhpcy5PTl9FTkQsIFt0aGlzLCBjYWxpZmljYXRpb25dKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsaWZpY2F0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5fc3RhdGUgPT0gdGhpcy5TVEFURVMucmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNob3dDb3JyZWN0aW9uKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2hhbmdlU3RhdGUodGhpcy5TVEFURVMub2ZmKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uU3RvcCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbih0aGlzLl9vbkFuaW1hdGlvbkVuZEVuZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC50cmlnZ2VyKHRoaXMuT05fRU5ELCBbdGhpcywgdGhpcy5sYXN0Q2FsaWZpY2F0aW9uXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxhc3RDYWxpZmljYXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLl9zdGF0ZSA9PSB0aGlzLlNUQVRFUy5yZXZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VTdGF0ZSh0aGlzLlNUQVRFUy5vZmYpO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC50cmlnZ2VyKHRoaXMuT05fRU5ELCBbdGhpcywgdGhpcy5sYXN0Q2FsaWZpY2F0aW9uXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uU3RvcCgpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uQW5pbWF0aW9uRW5kRW5kKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sYXN0Q2FsaWZpY2F0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfY2hhbmdlU3RhdGU6IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAgICAgc3dpdGNoIChzdGF0ZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5TVEFURVMucmV2aWV3OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuc3RhdGVSdW5uaW5nICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGF0ZVJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGF0ZVJldmlldyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5TVEFURVMucnVubmluZzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnN0YXRlUmV2aWV3ICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGF0ZVJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGF0ZVJ1bm5pbmcpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHRoaXMuU1RBVEVTLnJlc3VsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnN0YXRlUmV2aWV3ICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGF0ZVJ1bm5pbmcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuc3RhdGVSZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHRoaXMuU1RBVEVTLm9mZjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnN0YXRlUmVzdWx0ICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGF0ZVJldmlldyArIFwiIFwiICsgdGhpcy5vcHRpb25zLmNsYXNzZXMuc3RhdGVSdW5uaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9kaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9kaXNhYmxlU3RhcnQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgX2VuYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fZW5hYmxlU3RhcnQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fc3VwZXIoKTtcbiAgICAgICAgICAgIHRoaXMuX2Rpc2FibGUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9zdXBlcigpO1xuICAgICAgICAgICAgdGhpcy5fZW5hYmxlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuXyR3cmFwcGVyLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLndyYXBwZXIpO1xuICAgICAgICAgICAgdGhpcy5fJGhlYWRlci5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5oZWFkZXIpO1xuICAgICAgICAgICAgdGhpcy5fJGJvZHkucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuYm9keSk7XG4gICAgICAgICAgICB0aGlzLl8kYm9keS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLl8kcHJvcGVydGllcy5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5wcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgIHRoaXMuXyRxdWVzdGlvbnNXcmFwcGVyLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLl8kcXVlc3Rpb25zLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuXyRxdWVzdGlvbnMuc2hvdygpO1xuICAgICAgICAgICAgdGhpcy5fJHN0YXJ0QnRuLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmJ1dHRvbiArIFwiIFwiICsgdGhpcy5vcHRpb25zLmNsYXNzZXMuc3RhcnRCdG4pO1xuICAgICAgICAgICAgdGhpcy5fJG5leHRCdG4ucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuYnV0dG9uICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5uZXh0QnRuKTtcbiAgICAgICAgICAgIHRoaXMuXyRwcmV2QnRuLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmJ1dHRvbiArIFwiIFwiICsgdGhpcy5vcHRpb25zLmNsYXNzZXMucHJldkJ0bik7XG4gICAgICAgICAgICB0aGlzLl8kZW5kQnRuLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmJ1dHRvbiArIFwiIFwiICsgdGhpcy5vcHRpb25zLmNsYXNzZXMuZW5kQnRuKTtcbiAgICAgICAgICAgIHRoaXMuXyRyZXN1bHQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMucmVzdWx0KTtcbiAgICAgICAgICAgIGlmICh0aGlzLl8kcmVzdWx0LmRhdGEoXCJ1aURpYWxvZ1wiKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuXyRyZXN1bHQuZGlhbG9nKFwiZGVzdHJveVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiAkLnVpLmpxUXVpejtcbn0pKTtcbiJdLCJmaWxlIjoianF1ZXJ5LnF1aXouanMifQ==
