(function (factory) {
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "jquery-ui/ui/widget",
            "jquery-ui/ui/unique-id",
            "jquery-ui/ui/widgets/controlgroup",
            "jquery-ui/ui/widgets/checkboxradio"
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
                body: "jq-quiz__body",
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
                questions: "jq-quiz__questions",
                disabled: "jq-quiz--disabled"
            },
            delayOnAutoNext: 500,
            pointsForSuccess: 1,
            pointsForFail: 0,
            cutOffMark: 50,
            immediateFeedback: false,
            disableOptionAfterSelect: true,
            allowChangeOption: false,
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
            },
            initialQuestion: 0,
            autoStart: false
        },
        _create: function () {
            this._getElements();
            this.element.uniqueId();
            this._mapQuestions();
            this._changeState(this.STATES.off);
            this._assignEvents();
            this._renderOptions();
            if (this.options.autoStart) {
                this.start();
            }
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
                    for (var _i = 0, _a = question.options; _i < _a.length; _i++) {
                        var option = _a[_i];
                        if (option.$element.find(":checked").length > 0) {
                            option.$element.addClass(this.options.classes.disabled);
                        }
                    }
                }
                else {
                    question.$element.addClass(this.options.classes.disabled);
                    question.$options.addClass(this.options.classes.disabled);
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
                    .parents(instance.QUERY_OPTION), $question = $(this), questionId = $question.attr("id"), questionRuntime = instance._runtime[questionId] || {}, options = questionRuntime.options || [], optionsValues = questionRuntime.optionsValues || [], optionId = $option.attr("id"), optionValue = $option.find("input").attr("value");
                questionRuntime.options = options;
                questionRuntime.optionsValues = optionsValues;
                instance._runtime[questionId] = questionRuntime;
                if (instance.options.multichoice) {
                    if (e.target.checked) {
                        options.push(optionId);
                        if (optionValue) {
                            optionsValues.push(optionValue);
                        }
                        $option.addClass(instance.options.classes.selected);
                    }
                    else {
                        instance._resetOption(questionId, optionId);
                        options.splice(options.indexOf(optionId), 1);
                        if (optionValue) {
                            optionsValues.splice(optionsValues.indexOf(optionValue), 1);
                        }
                    }
                    instance._calificateMultiChoiceQuestion(questionId);
                }
                else {
                    if (questionRuntime.options.length > 0) {
                        instance._resetOption(questionId, questionRuntime.options[0]);
                    }
                    options[0] = optionId;
                    if (optionValue) {
                        optionsValues[0] = optionValue;
                    }
                    $option.addClass(instance.options.classes.selected);
                    instance._calificateSingleChoiceQuestion(questionId);
                }
                if (instance.options.allowChangeOption != true) {
                    instance._disableQuestionOptionsField(questionId);
                }
                if (instance.options.immediateFeedback == true) {
                    if ((instance.options.allowChangeOption != undefined && instance.options.allowChangeOption != true) || instance.options.disableOptionAfterSelect == true) {
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
                instance.element.triggerHandler(instance.ON_OPTION_CHANGE, [instance, questionId, optionId, optionValue, questionRuntime]);
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
            if (this._$header.length > 0) {
                var result = this.element.triggerHandler(this.ON_HEADER_HIDE, [this, this._$header]);
                if (result != undefined && result.hasOwnProperty("then")) {
                    result.then(this._onHeaderHidden.bind(this, defer));
                }
                else {
                    this._$header.fadeOut(400, this._onHeaderHidden.bind(this, defer));
                }
            }
            else {
                this._onHeaderHidden(defer);
            }
            return defer.promise();
        },
        _showHeader: function () {
            var _this = this;
            var defer = $.Deferred();
            if (this._$header.length > 0) {
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
            }
            else {
                defer.resolveWith(this);
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
            if (this.options.initialQuestion != undefined) {
                this.goTo(this.options.initialQuestion);
            }
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
                if (nextQuestion_1 != undefined) {
                    if (currentQuestion_1 == undefined || currentQuestion_1 != nextQuestion_1) {
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
                else {
                    if (currentQuestion_1) {
                        var defer = $.Deferred();
                        promise = defer.promise();
                        this._hide(currentQuestion_1.$element).then(this._onQuestionTransitionEnd.bind(this, currentQuestion_1, null, defer));
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
            this._currentQuestionIndex = null;
            this._$questions.hide();
            this._$questions.first()
                .show();
            this._$questions.find("input")
                .prop("checked", false)
                .removeAttr("disabled");
            this._$questions.find("." + this.options.classes.disabled).removeClass(this.options.classes.disabled);
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
            if (calification && this.options.showResult && this._$result.length > 0) {
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
                this.element.trigger(this.ON_END, [this, calification]);
                if (!this.showResult(calification)) {
                    if (!this.showCorrection()) {
                        this._changeState(this.STATES.off);
                        this._animationStop()
                            .then(this._onAnimationEndEnd);
                    }
                }
                return calification;
            }
            else if (this._state == this.STATES.result) {
                if (!this.showCorrection()) {
                    this._changeState(this.STATES.off);
                    this._animationStop()
                        .then(this._onAnimationEndEnd);
                }
                return this.lastCalification;
            }
            else if (this._state == this.STATES.review) {
                this._changeState(this.STATES.off);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcXVlcnkucXVpei5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtcbiAgICAgICAgICAgIFwianF1ZXJ5XCIsXG4gICAgICAgICAgICBcImpxdWVyeS11aS91aS93aWRnZXRcIixcbiAgICAgICAgICAgIFwianF1ZXJ5LXVpL3VpL3VuaXF1ZS1pZFwiLFxuICAgICAgICAgICAgXCJqcXVlcnktdWkvdWkvd2lkZ2V0cy9jb250cm9sZ3JvdXBcIixcbiAgICAgICAgICAgIFwianF1ZXJ5LXVpL3VpL3dpZGdldHMvY2hlY2tib3hyYWRpb1wiXG4gICAgICAgIF0sIGZhY3RvcnkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZmFjdG9yeShqUXVlcnkpO1xuICAgIH1cbn0oZnVuY3Rpb24gKCQpIHtcbiAgICAkLndpZGdldChcInVpLmpxUXVpelwiLCB7XG4gICAgICAgIE5BTUVTUEFDRTogXCJqcVF1aXpcIixcbiAgICAgICAgUVVFUllfSEVBREVSOiBcIltkYXRhLWpxLXF1aXotaGVhZGVyXVwiLFxuICAgICAgICBRVUVSWV9XUkFQUEVSOiBcIltkYXRhLWpxLXF1aXotd3JhcHBlcl1cIixcbiAgICAgICAgUVVFUllfQk9EWTogXCJbZGF0YS1qcS1xdWl6LWJvZHldXCIsXG4gICAgICAgIFFVRVJZX1BST1BFUlRJRVM6IFwiW2RhdGEtanEtcXVpei1wcm9wZXJ0aWVzXVwiLFxuICAgICAgICBRVUVSWV9RVUVTVElPTlM6IFwiW2RhdGEtanEtcXVpei1xdWVzdGlvbnNdXCIsXG4gICAgICAgIFFVRVJZX1FVRVNUSU9OOiBcIltkYXRhLWpxLXF1aXotcXVlc3Rpb25dXCIsXG4gICAgICAgIFFVRVJZX09QVElPTlM6IFwiW2RhdGEtanEtcXVpei1vcHRpb25zXVwiLFxuICAgICAgICBRVUVSWV9PUFRJT046IFwiW2RhdGEtanEtcXVpei1vcHRpb25dXCIsXG4gICAgICAgIFFVRVJZX0FDVElPTl9TVEFSVDogXCJbZGF0YS1qcS1xdWl6LXN0YXJ0XVwiLFxuICAgICAgICBRVUVSWV9BQ1RJT05fTkVYVDogXCJbZGF0YS1qcS1xdWl6LW5leHRdXCIsXG4gICAgICAgIFFVRVJZX0FDVElPTl9QUkVWOiBcIltkYXRhLWpxLXF1aXotcHJldl1cIixcbiAgICAgICAgUVVFUllfQUNUSU9OX0VORDogXCJbZGF0YS1qcS1xdWl6LWVuZF1cIixcbiAgICAgICAgUVVFUllfUkVOREVSX09QVElPTjogXCJbZGF0YS1qcS1xdWl6LXByb3BlcnR5XVwiLFxuICAgICAgICBRVUVSWV9SRU5ERVJfUkVTVUxUOiBcIltkYXRhLWpxLXF1aXotcmVzdWx0LWl0ZW1dXCIsXG4gICAgICAgIFFVRVJZX1JFU1VMVDogXCJbZGF0YS1qcS1xdWl6LXJlc3VsdF1cIixcbiAgICAgICAgUVVFUllfRkVFREJBQ0s6IFwiW2RhdGEtanEtcXVpei1mZWVkYmFja11cIixcbiAgICAgICAgSVNfQ09SUkVDVDogXCJpc0NvcnJlY3RcIixcbiAgICAgICAgQVRUUl9DVVJSRU5UX1FVRVNUSU9OOiBcImRhdGEtY3VycmVudC1xdWVzdGlvblwiLFxuICAgICAgICBBVFRSX0lTX0NPUlJFQ1Q6IFwiZGF0YS1pcy1jb3JyZWN0XCIsXG4gICAgICAgIEFUVFJfUE9JTlRTX0ZPUl9TVUNDRVNTOiBcImRhdGEtcG9pbnRzLWZvci1zdWNjZXNzXCIsXG4gICAgICAgIEFUVFJfRkVFREJBQ0s6IFwiZGF0YS1qcS1xdWl6LWZlZWRiYWNrXCIsXG4gICAgICAgIEFUVFJfUE9JTlRTX0ZPUl9GQUlMOiBcImRhdGEtcG9pbnRzLWZvci1mYWlsXCIsXG4gICAgICAgIE9OX1FVRVNUSU9OX0hJREU6IFwianFRdWl6OnF1ZXN0aW9uSGlkZVwiLFxuICAgICAgICBPTl9RVUVTVElPTl9TSE9XOiBcImpxUXVpejpxdWVzdGlvblNob3dcIixcbiAgICAgICAgT05fSEVBREVSX0hJREU6IFwianFRdWl6OmhlYWRlckhpZGVcIixcbiAgICAgICAgT05fSEVBREVSX1NIT1c6IFwianFRdWl6OmhlYWRlclNob3dcIixcbiAgICAgICAgT05fQk9EWV9ISURFOiBcImpxUXVpejpib2R5SGlkZVwiLFxuICAgICAgICBPTl9CT0RZX1NIT1c6IFwianFRdWl6OmJvZHlTaG93XCIsXG4gICAgICAgIE9OX1RSQU5TSVRJT05fRU5EOiBcImpxUXVpejp0cmFuc2l0aW9uRW5kXCIsXG4gICAgICAgIE9OX09QVElPTl9DSEFOR0U6IFwianFRdWl6OnF1ZXN0aW9uQ2hhbmdlXCIsXG4gICAgICAgIE9OX1NUQVJUOiBcImpxUXVpejpzdGFydFwiLFxuICAgICAgICBPTl9TVEFSVEVEOiBcImpxUXVpejpzdGFydGVkXCIsXG4gICAgICAgIE9OX0VORDogXCJqcVF1aXo6ZW5kXCIsXG4gICAgICAgIEZFRURCQUNLX1RZUEVTOiB7XG4gICAgICAgICAgICBcIm9rXCI6IFwib2tcIixcbiAgICAgICAgICAgIFwia29cIjogXCJrb1wiXG4gICAgICAgIH0sXG4gICAgICAgIFNUQVRFUzoge1xuICAgICAgICAgICAgXCJvZmZcIjogMCxcbiAgICAgICAgICAgIFwicnVubmluZ1wiOiAxLFxuICAgICAgICAgICAgXCJyZXN1bHRcIjogMixcbiAgICAgICAgICAgIFwicmV2aWV3XCI6IDNcbiAgICAgICAgfSxcbiAgICAgICAgRElTQUJMRV9FTkQ6IHtcbiAgICAgICAgICAgIFwibmV2ZXJcIjogMCxcbiAgICAgICAgICAgIFwiYmVmb3JlQW5zd2VyQWxsXCI6IDEsXG4gICAgICAgICAgICBcImJlZm9yZUFuc3dlckFsbENvcnJlY3RcIjogMlxuICAgICAgICB9LFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBjbGFzc2VzOiB7XG4gICAgICAgICAgICAgICAgZmlyc3RRdWVzdGlvbjogXCJqcS1xdWl6LS1maXJzdC1xdWVzdGlvblwiLFxuICAgICAgICAgICAgICAgIGxhc3RRdWVzdGlvbjogXCJqcS1xdWl6LS1sYXN0LXF1ZXN0aW9uXCIsXG4gICAgICAgICAgICAgICAgd2lkZ2V0OiBcImpxLXF1aXpcIixcbiAgICAgICAgICAgICAgICBxdWVzdGlvbkNvcnJlY3Q6IFwianEtcXVpei0tY29ycmVjdFwiLFxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uSW5jb3JyZWN0OiBcImpxLXF1aXotLWluY29ycmVjdFwiLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkOiBcImpxLXF1aXotLXNlbGVjdGVkXCIsXG4gICAgICAgICAgICAgICAgc3RhdGVSZXN1bHQ6IFwianEtcXVpei0tcmVzdWx0XCIsXG4gICAgICAgICAgICAgICAgc3RhdGVSZXZpZXc6IFwianEtcXVpei0tcmV2aWV3XCIsXG4gICAgICAgICAgICAgICAgc3RhdGVSdW5uaW5nOiBcImpxLXF1aXotLXJ1bm5pbmdcIixcbiAgICAgICAgICAgICAgICBtdWx0aWNob2ljZTogXCJqcS1xdWl6LS1tdWx0aS1jaG9pY2VcIixcbiAgICAgICAgICAgICAgICB3cmFwcGVyOiBcImpxLXF1aXpfX2Zvcm1cIixcbiAgICAgICAgICAgICAgICBoZWFkZXI6IFwianEtcXVpel9faGVhZGVyXCIsXG4gICAgICAgICAgICAgICAgYm9keTogXCJqcS1xdWl6X19ib2R5XCIsXG4gICAgICAgICAgICAgICAgc3RhcnRCdG46IFwianEtcXVpel9fc3RhcnRcIixcbiAgICAgICAgICAgICAgICBuZXh0QnRuOiBcImpxLXF1aXpfX25leHRcIixcbiAgICAgICAgICAgICAgICBwcmV2QnRuOiBcImpxLXF1aXpfX3ByZXZcIixcbiAgICAgICAgICAgICAgICBlbmRCdG46IFwianEtcXVpel9fZW5kXCIsXG4gICAgICAgICAgICAgICAgcmVzdWx0OiBcImpxLXF1aXpfX3Jlc3VsdFwiLFxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiBcImpxLXF1aXpfX3F1ZXN0aW9uXCIsXG4gICAgICAgICAgICAgICAgb3B0aW9uOiBcImpxLXF1aXpfX29wdGlvblwiLFxuICAgICAgICAgICAgICAgIG5hdmJhcjogXCJqcS1xdWl6X19uYXZiYXJcIixcbiAgICAgICAgICAgICAgICBidXR0b246IFwianEtcXVpel9fYWN0aW9uXCIsXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogXCJqcS1xdWl6X19wcm9wZXJ0aWVzXCIsXG4gICAgICAgICAgICAgICAgcXVlc3Rpb25zOiBcImpxLXF1aXpfX3F1ZXN0aW9uc1wiLFxuICAgICAgICAgICAgICAgIGRpc2FibGVkOiBcImpxLXF1aXotLWRpc2FibGVkXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZWxheU9uQXV0b05leHQ6IDUwMCxcbiAgICAgICAgICAgIHBvaW50c0ZvclN1Y2Nlc3M6IDEsXG4gICAgICAgICAgICBwb2ludHNGb3JGYWlsOiAwLFxuICAgICAgICAgICAgY3V0T2ZmTWFyazogNTAsXG4gICAgICAgICAgICBpbW1lZGlhdGVGZWVkYmFjazogZmFsc2UsXG4gICAgICAgICAgICBkaXNhYmxlT3B0aW9uQWZ0ZXJTZWxlY3Q6IHRydWUsXG4gICAgICAgICAgICBhbGxvd0NoYW5nZU9wdGlvbjogZmFsc2UsXG4gICAgICAgICAgICBhdXRvR29OZXh0OiB0cnVlLFxuICAgICAgICAgICAgc2hvd0NvcnJlY3Rpb246IHRydWUsXG4gICAgICAgICAgICBzaG93UmVzdWx0OiB0cnVlLFxuICAgICAgICAgICAgbXVsdGljaG9pY2U6IGZhbHNlLFxuICAgICAgICAgICAgZGlzYWJsZU5leHRVbnRpbFN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZGlzYWJsZUVuZEFjdGlvblVudGlsOiAwLFxuICAgICAgICAgICAgZGlhbG9nOiB7XG4gICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhdXRvT3BlbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICByZXNpemFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG1vZGFsOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaW5pdGlhbFF1ZXN0aW9uOiAwLFxuICAgICAgICAgICAgYXV0b1N0YXJ0OiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBfY3JlYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9nZXRFbGVtZW50cygpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnVuaXF1ZUlkKCk7XG4gICAgICAgICAgICB0aGlzLl9tYXBRdWVzdGlvbnMoKTtcbiAgICAgICAgICAgIHRoaXMuX2NoYW5nZVN0YXRlKHRoaXMuU1RBVEVTLm9mZik7XG4gICAgICAgICAgICB0aGlzLl9hc3NpZ25FdmVudHMoKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlck9wdGlvbnMoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b1N0YXJ0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfcmVuZGVyT3B0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyVmFyKHRoaXMuUVVFUllfUkVOREVSX09QVElPTiwgXCJqcVF1aXpQcm9wZXJ0eVwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgX3JlbmRlclZhcjogZnVuY3Rpb24gKHF1ZXJ5LCBkYXRhLCBzdG9yZSwgY29udGV4dCkge1xuICAgICAgICAgICAgY29udGV4dCA9IGNvbnRleHQgfHwgdGhpcy5lbGVtZW50O1xuICAgICAgICAgICAgc3RvcmUgPSBzdG9yZSB8fCB0aGlzLm9wdGlvbnM7XG4gICAgICAgICAgICB2YXIgJHRvUmVuZGVyID0gY29udGV4dC5maW5kKHF1ZXJ5KTtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgJHRvUmVuZGVyXzEgPSAkdG9SZW5kZXI7IF9pIDwgJHRvUmVuZGVyXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSAkdG9SZW5kZXJfMVtfaV07XG4gICAgICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KSwgb3B0aW9uTmFtZSA9ICgkZWxlbWVudC5kYXRhKGRhdGEpIHx8IFwiXCIpLCBvcHRpb25Bc1RydWUgPSB2b2lkIDAsIG9wdGlvbkFzRmFsc2UgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbk5hbWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIF9hID0gb3B0aW9uTmFtZS5zcGxpdChcIj9cIiksIG9wdGlvbk5hbWUgPSBfYVswXSwgb3B0aW9uQXNUcnVlID0gX2FbMV07XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbk5hbWUgPSBvcHRpb25OYW1lLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbkFzVHJ1ZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9iID0gb3B0aW9uQXNUcnVlLnNwbGl0KFwiOlwiKSwgb3B0aW9uQXNUcnVlID0gX2JbMF0sIG9wdGlvbkFzRmFsc2UgPSBfYlsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbkFzVHJ1ZS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25Bc0ZhbHNlLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgb3B0aW9uVmFsdWUgPSBzdG9yZVtvcHRpb25OYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uVmFsdWUgPSBvcHRpb25WYWx1ZSAhPSB1bmRlZmluZWQgPyBvcHRpb25WYWx1ZSA6IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25Bc1RydWUgIT0gdW5kZWZpbmVkICYmICEhb3B0aW9uVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvblZhbHVlID0gb3B0aW9uQXNUcnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbkFzRmFsc2UgIT0gdW5kZWZpbmVkICYmICFvcHRpb25WYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uVmFsdWUgPSBvcHRpb25Bc0ZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICRlbGVtZW50Lmh0bWwob3B0aW9uVmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgIH0sXG4gICAgICAgIF9nZXRFbGVtZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fJHdyYXBwZXIgPSB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX1dSQVBQRVIpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLndyYXBwZXIpO1xuICAgICAgICAgICAgdGhpcy5fJGhlYWRlciA9IHRoaXMuZWxlbWVudC5maW5kKHRoaXMuUVVFUllfSEVBREVSKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5oZWFkZXIpO1xuICAgICAgICAgICAgdGhpcy5fJGJvZHkgPSB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX0JPRFkpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmJvZHkpO1xuICAgICAgICAgICAgdGhpcy5fJGJvZHkuaGlkZSgpO1xuICAgICAgICAgICAgdGhpcy5fJHByb3BlcnRpZXMgPSB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX1BST1BFUlRJRVMpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnByb3BlcnRpZXMpO1xuICAgICAgICAgICAgdGhpcy5fJHF1ZXN0aW9uc1dyYXBwZXIgPSB0aGlzLmVsZW1lbnQuZmluZCh0aGlzLlFVRVJZX1FVRVNUSU9OUylcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb25zKTtcbiAgICAgICAgICAgIHRoaXMuXyRxdWVzdGlvbnMgPSB0aGlzLl8kcXVlc3Rpb25zV3JhcHBlci5maW5kKHRoaXMuUVVFUllfUVVFU1RJT04pXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuXyRxdWVzdGlvbnMuaGlkZSgpO1xuICAgICAgICAgICAgdGhpcy5fJHN0YXJ0QnRuID0gdGhpcy5fJHdyYXBwZXIuZmluZCh0aGlzLlFVRVJZX0FDVElPTl9TVEFSVClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuYnV0dG9uICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGFydEJ0bik7XG4gICAgICAgICAgICB0aGlzLl8kbmV4dEJ0biA9IHRoaXMuXyR3cmFwcGVyLmZpbmQodGhpcy5RVUVSWV9BQ1RJT05fTkVYVClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuYnV0dG9uICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5uZXh0QnRuKTtcbiAgICAgICAgICAgIHRoaXMuXyRwcmV2QnRuID0gdGhpcy5fJHdyYXBwZXIuZmluZCh0aGlzLlFVRVJZX0FDVElPTl9QUkVWKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5idXR0b24gKyBcIiBcIiArIHRoaXMub3B0aW9ucy5jbGFzc2VzLnByZXZCdG4pO1xuICAgICAgICAgICAgdGhpcy5fJGVuZEJ0biA9IHRoaXMuXyR3cmFwcGVyLmZpbmQodGhpcy5RVUVSWV9BQ1RJT05fRU5EKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5idXR0b24gKyBcIiBcIiArIHRoaXMub3B0aW9ucy5jbGFzc2VzLmVuZEJ0bik7XG4gICAgICAgICAgICB0aGlzLl8kcmVzdWx0ID0gdGhpcy5fJHdyYXBwZXIuZmluZCh0aGlzLlFVRVJZX1JFU1VMVClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMucmVzdWx0KTtcbiAgICAgICAgICAgIHRoaXMuXyRyZXN1bHQuaGlkZSgpO1xuICAgICAgICB9LFxuICAgICAgICBfbWFwUXVlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJG9wdGlvbnMgPSB0aGlzLl8kcXVlc3Rpb25zLmZpbmQodGhpcy5RVUVSWV9PUFRJT04pXG4gICAgICAgICAgICAgICAgLmZpbmQoXCI6Y2hlY2tib3hcIik7XG4gICAgICAgICAgICBpZiAoJG9wdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICRvcHRpb25zLmF0dHIoXCJ0eXBlXCIsIFwiY2hlY2tib3hcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLm11bHRpY2hvaWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMubXVsdGljaG9pY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgJG9wdGlvbnMuYXR0cihcInR5cGVcIiwgXCJyYWRpb1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciAkcXVlc3Rpb25zID0gdGhpcy5fJHF1ZXN0aW9ucywgcXVlc3Rpb25zID0gW10sIHF1ZXN0aW9uc01hcCA9IHt9LCBtYXhTY29yZSA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBxdWVzdGlvbkluZGV4ID0gMCwgJHF1ZXN0aW9uc0xlbmd0aCA9ICRxdWVzdGlvbnMubGVuZ3RoOyBxdWVzdGlvbkluZGV4IDwgJHF1ZXN0aW9uc0xlbmd0aDsgcXVlc3Rpb25JbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyICRjdXJyZW50ID0gJCgkcXVlc3Rpb25zW3F1ZXN0aW9uSW5kZXhdKSwgcGFyc2VkUXVlc3Rpb24gPSB0aGlzLl9tYXBRdWVzdGlvbigkY3VycmVudCk7XG4gICAgICAgICAgICAgICAgcXVlc3Rpb25zLnB1c2gocGFyc2VkUXVlc3Rpb24pO1xuICAgICAgICAgICAgICAgIHF1ZXN0aW9uc01hcFtwYXJzZWRRdWVzdGlvbi5pZF0gPSBxdWVzdGlvbkluZGV4O1xuICAgICAgICAgICAgICAgIG1heFNjb3JlICs9IHBhcnNlZFF1ZXN0aW9uLnBvaW50c0ZvclN1Y2Nlc3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9xdWVzdGlvbnMgPSBxdWVzdGlvbnM7XG4gICAgICAgICAgICB0aGlzLl9xdWVzdGlvbnNNYXAgPSBxdWVzdGlvbnNNYXA7XG4gICAgICAgICAgICB0aGlzLl9tYXhTY29yZSA9IG1heFNjb3JlO1xuICAgICAgICAgICAgdGhpcy5fc2V0T3B0aW9uKFwibWF4U2NvcmVcIiwgbWF4U2NvcmUpO1xuICAgICAgICB9LFxuICAgICAgICBfbWFwUXVlc3Rpb246IGZ1bmN0aW9uICgkcXVlc3Rpb24pIHtcbiAgICAgICAgICAgIHZhciAkb3B0aW9uc1dyYXBwZXIgPSAkcXVlc3Rpb24uZmluZCh0aGlzLlFVRVJZX09QVElPTlMpLCAkb3B0aW9ucyA9ICRvcHRpb25zV3JhcHBlci5maW5kKHRoaXMuUVVFUllfT1BUSU9OKSwgbmFtZSA9ICRvcHRpb25zLmZpcnN0KClcbiAgICAgICAgICAgICAgICAuZmluZChcImlucHV0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJuYW1lXCIpLCBwb2ludHNGb3JTdWNjZXNzID0gJHF1ZXN0aW9uLmRhdGEodGhpcy5BVFRSX1BPSU5UU19GT1JfU1VDQ0VTUyksIHBvaW50c0ZvckZhaWwgPSAkcXVlc3Rpb24uZGF0YSh0aGlzLkFUVFJfUE9JTlRTX0ZPUl9GQUlMKSwgX2EgPSB0aGlzLl9tYXBPcHRpb25zKCRvcHRpb25zKSwgYXJyID0gX2EuYXJyLCBtYXAgPSBfYS5tYXAsICRmZWVkYmFjayA9ICRxdWVzdGlvbi5maW5kKHRoaXMuUVVFUllfRkVFREJBQ0spXG4gICAgICAgICAgICAgICAgLm5vdCh0aGlzLlFVRVJZX09QVElPTiArIFwiIFwiICsgdGhpcy5RVUVSWV9GRUVEQkFDSyksIGlkO1xuICAgICAgICAgICAgJGZlZWRiYWNrLmhpZGUoKTtcbiAgICAgICAgICAgICRxdWVzdGlvbi5yZW1vdmVBdHRyKHRoaXMuQVRUUl9QT0lOVFNfRk9SX0ZBSUwpO1xuICAgICAgICAgICAgJHF1ZXN0aW9uLnJlbW92ZUF0dHIodGhpcy5BVFRSX1BPSU5UU19GT1JfU1VDQ0VTUyk7XG4gICAgICAgICAgICAkcXVlc3Rpb24udW5pcXVlSWQoKTtcbiAgICAgICAgICAgIGlkID0gJHF1ZXN0aW9uLmF0dHIoXCJpZFwiKTtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lICE9IHVuZGVmaW5lZCA/IG5hbWUgOiBpZDtcbiAgICAgICAgICAgICRvcHRpb25zLmZpbmQoXCJpbnB1dFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwibmFtZVwiLCBuYW1lKTtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHtcbiAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgJGVsZW1lbnQ6ICRxdWVzdGlvbixcbiAgICAgICAgICAgICAgICAkb3B0aW9uc1dyYXBwZXI6ICRvcHRpb25zV3JhcHBlcixcbiAgICAgICAgICAgICAgICAkb3B0aW9uczogJG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogYXJyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnNNYXA6IG1hcCxcbiAgICAgICAgICAgICAgICBwb2ludHNGb3JTdWNjZXNzOiBwb2ludHNGb3JTdWNjZXNzICE9IHVuZGVmaW5lZCA/IHBvaW50c0ZvclN1Y2Nlc3MgOiB0aGlzLm9wdGlvbnMucG9pbnRzRm9yU3VjY2VzcyxcbiAgICAgICAgICAgICAgICBwb2ludHNGb3JGYWlsOiBwb2ludHNGb3JGYWlsICE9IHVuZGVmaW5lZCA/IHBvaW50c0ZvckZhaWwgOiB0aGlzLm9wdGlvbnMucG9pbnRzRm9yRmFpbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgJGZlZWRiYWNrXzEgPSAkZmVlZGJhY2s7IF9pIDwgJGZlZWRiYWNrXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZlZWRiYWNrID0gJGZlZWRiYWNrXzFbX2ldO1xuICAgICAgICAgICAgICAgIHZhciAkZmVlZGJhY2tfMiA9ICQoZmVlZGJhY2spLCB0eXBlID0gJGZlZWRiYWNrXzIuYXR0cih0aGlzLkFUVFJfRkVFREJBQ0spO1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHRoaXMuRkVFREJBQ0tfVFlQRVMub2s6XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbi4kZmVlZGJhY2tPayA9ICRmZWVkYmFja18yO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5GRUVEQkFDS19UWVBFUy5rbzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRmZWVkYmFja0tvID0gJGZlZWRiYWNrXzI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRmZWVkYmFjayA9ICRmZWVkYmFja18yO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVlc3Rpb24uJGZlZWRiYWNrT2sgPSBxdWVzdGlvbi4kZmVlZGJhY2tPayB8fCBxdWVzdGlvbi4kZmVlZGJhY2sgfHwgJChudWxsKTtcbiAgICAgICAgICAgIHF1ZXN0aW9uLiRmZWVkYmFja0tvID0gcXVlc3Rpb24uJGZlZWRiYWNrS28gfHwgcXVlc3Rpb24uJGZlZWRiYWNrIHx8ICQobnVsbCk7XG4gICAgICAgICAgICByZXR1cm4gcXVlc3Rpb247XG4gICAgICAgIH0sXG4gICAgICAgIF9tYXBPcHRpb25zOiBmdW5jdGlvbiAoJG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBwYXJzZWRPcHRpb25zID0gW10sIHBhcnNlZE9wdGlvbnNNYXAgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIG9wdGlvbkluZGV4ID0gMCwgJG9wdGlvbnNMZW5ndGggPSAkb3B0aW9ucy5sZW5ndGg7IG9wdGlvbkluZGV4IDwgJG9wdGlvbnNMZW5ndGg7IG9wdGlvbkluZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgJGN1cnJlbnQgPSAkKCRvcHRpb25zW29wdGlvbkluZGV4XSksIHBhcnNlZE9wdGlvbiA9IHRoaXMuX21hcE9wdGlvbigkY3VycmVudCk7XG4gICAgICAgICAgICAgICAgcGFyc2VkT3B0aW9ucy5wdXNoKHBhcnNlZE9wdGlvbik7XG4gICAgICAgICAgICAgICAgcGFyc2VkT3B0aW9uc01hcFtwYXJzZWRPcHRpb24uaWRdID0gb3B0aW9uSW5kZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBhcnI6IHBhcnNlZE9wdGlvbnMsIG1hcDogcGFyc2VkT3B0aW9uc01hcCB9O1xuICAgICAgICB9LFxuICAgICAgICBfbWFwT3B0aW9uOiBmdW5jdGlvbiAoJG9wdGlvbikge1xuICAgICAgICAgICAgdmFyIGlzQ29ycmVjdCA9ICEhJG9wdGlvbi5kYXRhKHRoaXMuSVNfQ09SUkVDVCksIGlkLCAkZmVlZGJhY2sgPSAkb3B0aW9uLmZpbmQodGhpcy5RVUVSWV9GRUVEQkFDSyk7XG4gICAgICAgICAgICAkb3B0aW9uLnJlbW92ZUF0dHIodGhpcy5BVFRSX0lTX0NPUlJFQ1QpO1xuICAgICAgICAgICAgJG9wdGlvbi51bmlxdWVJZCgpO1xuICAgICAgICAgICAgaWQgPSAkb3B0aW9uLmF0dHIoXCJpZFwiKTtcbiAgICAgICAgICAgIHZhciBvcHRpb24gPSB7XG4gICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICRlbGVtZW50OiAkb3B0aW9uLFxuICAgICAgICAgICAgICAgIGlzQ29ycmVjdDogaXNDb3JyZWN0XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCAkZmVlZGJhY2tfMyA9ICRmZWVkYmFjazsgX2kgPCAkZmVlZGJhY2tfMy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZmVlZGJhY2sgPSAkZmVlZGJhY2tfM1tfaV07XG4gICAgICAgICAgICAgICAgdmFyICRmZWVkYmFja180ID0gJChmZWVkYmFjayksIHR5cGUgPSAkZmVlZGJhY2tfNC5hdHRyKHRoaXMuQVRUUl9GRUVEQkFDSyk7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5GRUVEQkFDS19UWVBFUy5vazpcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi4kZmVlZGJhY2tPayA9ICRmZWVkYmFja180O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5GRUVEQkFDS19UWVBFUy5rbzpcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi4kZmVlZGJhY2tLbyA9ICRmZWVkYmFja180O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24uJGZlZWRiYWNrID0gJGZlZWRiYWNrXzQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcHRpb24uJGZlZWRiYWNrT2sgPSBvcHRpb24uJGZlZWRiYWNrT2sgfHwgb3B0aW9uLiRmZWVkYmFjayB8fCAkKG51bGwpO1xuICAgICAgICAgICAgb3B0aW9uLiRmZWVkYmFja0tvID0gb3B0aW9uLiRmZWVkYmFja0tvIHx8IG9wdGlvbi4kZmVlZGJhY2sgfHwgJChudWxsKTtcbiAgICAgICAgICAgICRmZWVkYmFjay5oaWRlKCk7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9uO1xuICAgICAgICB9LFxuICAgICAgICBfYXNzaWduRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl8kc3RhcnRCdG4ub2ZmKHRoaXMuTkFNRVNQQUNFKVxuICAgICAgICAgICAgICAgIC5vbihcImNsaWNrLlwiICsgdGhpcy5OQU1FU1BBQ0UsIHsgaW5zdGFuY2U6IHRoaXMgfSwgdGhpcy5fb25TdGFydEJ1dHRvbkNsaWNrKTtcbiAgICAgICAgICAgIHRoaXMuXyRlbmRCdG4ub2ZmKHRoaXMuTkFNRVNQQUNFKVxuICAgICAgICAgICAgICAgIC5vbihcImNsaWNrLlwiICsgdGhpcy5OQU1FU1BBQ0UsIHsgaW5zdGFuY2U6IHRoaXMgfSwgdGhpcy5fb25FbmRCdXR0b25DbGljayk7XG4gICAgICAgICAgICB0aGlzLl8kbmV4dEJ0bi5vZmYodGhpcy5OQU1FU1BBQ0UpXG4gICAgICAgICAgICAgICAgLm9uKFwiY2xpY2suXCIgKyB0aGlzLk5BTUVTUEFDRSwgeyBpbnN0YW5jZTogdGhpcyB9LCB0aGlzLl9vbk5leHRCdXR0b25DbGljayk7XG4gICAgICAgICAgICB0aGlzLl8kcHJldkJ0bi5vZmYodGhpcy5OQU1FU1BBQ0UpXG4gICAgICAgICAgICAgICAgLm9uKFwiY2xpY2suXCIgKyB0aGlzLk5BTUVTUEFDRSwgeyBpbnN0YW5jZTogdGhpcyB9LCB0aGlzLl9vblByZXZCdXR0b25DbGljayk7XG4gICAgICAgICAgICB0aGlzLl8kcXVlc3Rpb25zLm9mZih0aGlzLk5BTUVTUEFDRSlcbiAgICAgICAgICAgICAgICAub24oXCJjaGFuZ2UuXCIgKyB0aGlzLk5BTUVTUEFDRSwgeyBpbnN0YW5jZTogdGhpcyB9LCB0aGlzLl9vbk9wdGlvbkNoYW5nZSk7XG4gICAgICAgIH0sXG4gICAgICAgIF9vblN0YXJ0QnV0dG9uQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLmRhdGEuaW5zdGFuY2Uuc3RhcnQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgX29uRW5kQnV0dG9uQ2xpY2s6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLmRhdGEuaW5zdGFuY2UuZW5kKCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9vbk5leHRCdXR0b25DbGljazogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuZGF0YS5pbnN0YW5jZS5uZXh0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9vblByZXZCdXR0b25DbGljazogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuZGF0YS5pbnN0YW5jZS5wcmV2KCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9jYWxpZmljYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudFNjb3JlID0gMCwgbWF4U2NvcmUgPSB0aGlzLl9tYXhTY29yZSwgcnVudGltZSA9IHRoaXMuX3J1bnRpbWUsIHF1ZXN0aW9ucyA9IHRoaXMuX3F1ZXN0aW9ucywgY2FsaWZpY2F0aW9uLCBuU3VjY2VzcyA9IDAsIG5GYWlscyA9IDA7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm11bHRpY2hvaWNlICE9IHRydWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fY2FsaWZpY2F0ZVNpbmdsZUNob2ljZSgpO1xuICAgICAgICAgICAgICAgIG5TdWNjZXNzID0gcmVzdWx0Lm5TdWNjZXNzO1xuICAgICAgICAgICAgICAgIG5GYWlscyA9IHJlc3VsdC5uRmFpbHM7XG4gICAgICAgICAgICAgICAgY3VycmVudFNjb3JlID0gcmVzdWx0LnNjb3JlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX2NhbGlmaWNhdGVNdWx0aUNob2ljZSgpO1xuICAgICAgICAgICAgICAgIG5TdWNjZXNzID0gcmVzdWx0Lm5TdWNjZXNzO1xuICAgICAgICAgICAgICAgIG5GYWlscyA9IHJlc3VsdC5uRmFpbHM7XG4gICAgICAgICAgICAgICAgY3VycmVudFNjb3JlID0gcmVzdWx0LnNjb3JlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FsaWZpY2F0aW9uID0ge1xuICAgICAgICAgICAgICAgIG1heFNjb3JlOiBtYXhTY29yZSxcbiAgICAgICAgICAgICAgICBzY29yZTogY3VycmVudFNjb3JlLFxuICAgICAgICAgICAgICAgIHBlcmNlbnRhZ2U6IChjdXJyZW50U2NvcmUgKiAxMDApIC8gbWF4U2NvcmUsXG4gICAgICAgICAgICAgICAgcXVlc3Rpb25zU3VjY2VzczogblN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgcXVlc3Rpb25zRmFpbDogbkZhaWxzLFxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uc05vdEF0dGVtcHRlZDogcXVlc3Rpb25zLmxlbmd0aCAtIChuU3VjY2VzcyArIG5GYWlscylcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjYWxpZmljYXRpb24uc3VjY2VzcyA9IGNhbGlmaWNhdGlvbi5wZXJjZW50YWdlID49IHRoaXMub3B0aW9ucy5jdXRPZmZNYXJrO1xuICAgICAgICAgICAgcmV0dXJuIGNhbGlmaWNhdGlvbjtcbiAgICAgICAgfSxcbiAgICAgICAgX2NhbGlmaWNhdGVTaW5nbGVDaG9pY2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50U2NvcmUgPSAwLCBydW50aW1lID0gdGhpcy5fcnVudGltZSwgcXVlc3Rpb25zID0gdGhpcy5fcXVlc3Rpb25zLCBuU3VjY2VzcyA9IDAsIG5GYWlscyA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBxdWVzdGlvbkluZGV4ID0gMCwgcXVlc3Rpb25zTGVuZ3RoID0gcXVlc3Rpb25zLmxlbmd0aDsgcXVlc3Rpb25JbmRleCA8IHF1ZXN0aW9uc0xlbmd0aDsgcXVlc3Rpb25JbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRRdWVzdGlvbiA9IHF1ZXN0aW9uc1txdWVzdGlvbkluZGV4XSwgcXVlc3Rpb25SdW50aW1lID0gcnVudGltZVtjdXJyZW50UXVlc3Rpb24uaWRdLCByZXN1bHQgPSB0aGlzLl9jYWxpZmljYXRlU2luZ2xlQ2hvaWNlUXVlc3Rpb24oY3VycmVudFF1ZXN0aW9uLmlkKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U2NvcmUgKz0gY3VycmVudFF1ZXN0aW9uLnBvaW50c0ZvclN1Y2Nlc3M7XG4gICAgICAgICAgICAgICAgICAgICAgICBuU3VjY2VzcysrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbkZhaWxzKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNjb3JlID49IGN1cnJlbnRRdWVzdGlvbi5wb2ludHNGb3JGYWlsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNjb3JlIC09IGN1cnJlbnRRdWVzdGlvbi5wb2ludHNGb3JGYWlsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuU3VjY2VzczogblN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgbkZhaWxzOiBuRmFpbHMsXG4gICAgICAgICAgICAgICAgc2NvcmU6IGN1cnJlbnRTY29yZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgX2NhbGlmaWNhdGVTaW5nbGVDaG9pY2VRdWVzdGlvbjogZnVuY3Rpb24gKHF1ZXN0aW9uSWQpIHtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHRoaXMuZ2V0UXVlc3Rpb25CeUlkKHF1ZXN0aW9uSWQpLCByZXN1bHQ7XG4gICAgICAgICAgICBpZiAocXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcXVlc3Rpb25SdW50aW1lID0gdGhpcy5fcnVudGltZVtxdWVzdGlvbi5pZF07XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXN0aW9uUnVudGltZSAmJiBxdWVzdGlvblJ1bnRpbWUub3B0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxdWVzdGlvbk9wdGlvbnMgPSBxdWVzdGlvbi5vcHRpb25zLCBxdWVzdGlvbk9wdGlvbnNNYXAgPSBxdWVzdGlvbi5vcHRpb25zTWFwLCBzZWxlY3RlZE9wdGlvbklkID0gcXVlc3Rpb25SdW50aW1lLm9wdGlvbnNbMF0sIHNlbGVjdGVkT3B0aW9uID0gcXVlc3Rpb25PcHRpb25zW3F1ZXN0aW9uT3B0aW9uc01hcFtzZWxlY3RlZE9wdGlvbklkXV07XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHNlbGVjdGVkT3B0aW9uLmlzQ29ycmVjdDtcbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25SdW50aW1lLmlzQ29ycmVjdCA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuICAgICAgICBfY2FsaWZpY2F0ZU11bHRpQ2hvaWNlUXVlc3Rpb246IGZ1bmN0aW9uIChxdWVzdGlvbklkKSB7XG4gICAgICAgICAgICB2YXIgcXVlc3Rpb24gPSB0aGlzLmdldFF1ZXN0aW9uQnlJZChxdWVzdGlvbklkKSwgcmVzdWx0O1xuICAgICAgICAgICAgaWYgKHF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHF1ZXN0aW9uUnVudGltZSA9IHRoaXMuX3J1bnRpbWVbcXVlc3Rpb24uaWRdO1xuICAgICAgICAgICAgICAgIGlmIChxdWVzdGlvblJ1bnRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHF1ZXN0aW9uT3B0aW9ucyA9IHF1ZXN0aW9uLm9wdGlvbnMsIHNlbGVjdGVkT3B0aW9ucyA9IHF1ZXN0aW9uUnVudGltZS5vcHRpb25zLCBuQ29ycmVjdE9wdGlvbnNTZWxlY3RlZCA9IDAsIG5Db3JyZWN0T3B0aW9ucyA9IDAsIG5JbmNvcnJlY3RPcHRpb25zU2VsZWN0ZWQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBxdWVzdGlvbk9wdGlvbkluZGV4ID0gMCwgcXVlc3Rpb25PcHRpb25zTGVuZ3RoID0gcXVlc3Rpb25PcHRpb25zLmxlbmd0aDsgcXVlc3Rpb25PcHRpb25JbmRleCA8IHF1ZXN0aW9uT3B0aW9uc0xlbmd0aDsgcXVlc3Rpb25PcHRpb25JbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudFF1ZXN0aW9uT3B0aW9uID0gcXVlc3Rpb25PcHRpb25zW3F1ZXN0aW9uT3B0aW9uSW5kZXhdLCBjaGVja2VkID0gc2VsZWN0ZWRPcHRpb25zLmluZGV4T2YoY3VycmVudFF1ZXN0aW9uT3B0aW9uLmlkKSAhPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UXVlc3Rpb25PcHRpb24uaXNDb3JyZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbkNvcnJlY3RPcHRpb25zKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbkNvcnJlY3RPcHRpb25zU2VsZWN0ZWQgKz0gY2hlY2tlZCA/IDEgOiAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbkluY29ycmVjdE9wdGlvbnNTZWxlY3RlZCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbk9wdGlvbkluZGV4ID0gcXVlc3Rpb25PcHRpb25zTGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBuSW5jb3JyZWN0T3B0aW9uc1NlbGVjdGVkID09IDAgJiYgbkNvcnJlY3RPcHRpb25zU2VsZWN0ZWQgPT0gbkNvcnJlY3RPcHRpb25zO1xuICAgICAgICAgICAgICAgICAgICBxdWVzdGlvblJ1bnRpbWUuaXNDb3JyZWN0ID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG4gICAgICAgIF9jYWxpZmljYXRlTXVsdGlDaG9pY2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50U2NvcmUgPSAwLCBydW50aW1lID0gdGhpcy5fcnVudGltZSwgcXVlc3Rpb25zID0gdGhpcy5fcXVlc3Rpb25zLCBuU3VjY2VzcyA9IDAsIG5GYWlscyA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBxdWVzdGlvbkluZGV4ID0gMCwgcXVlc3Rpb25zTGVuZ3RoID0gcXVlc3Rpb25zLmxlbmd0aDsgcXVlc3Rpb25JbmRleCA8IHF1ZXN0aW9uc0xlbmd0aDsgcXVlc3Rpb25JbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRRdWVzdGlvbiA9IHF1ZXN0aW9uc1txdWVzdGlvbkluZGV4XSwgcXVlc3Rpb25SdW50aW1lID0gcnVudGltZVtjdXJyZW50UXVlc3Rpb24uaWRdLCByZXN1bHQgPSB0aGlzLl9jYWxpZmljYXRlTXVsdGlDaG9pY2VRdWVzdGlvbihjdXJyZW50UXVlc3Rpb24uaWQpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5TdWNjZXNzKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U2NvcmUgKz0gY3VycmVudFF1ZXN0aW9uLnBvaW50c0ZvclN1Y2Nlc3M7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuRmFpbHMrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2NvcmUgPj0gY3VycmVudFF1ZXN0aW9uLnBvaW50c0ZvckZhaWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U2NvcmUgLT0gY3VycmVudFF1ZXN0aW9uLnBvaW50c0ZvckZhaWw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG5TdWNjZXNzOiBuU3VjY2VzcyxcbiAgICAgICAgICAgICAgICBuRmFpbHM6IG5GYWlscyxcbiAgICAgICAgICAgICAgICBzY29yZTogY3VycmVudFNjb3JlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBfc2hvd09wdGlvblN0YXR1czogZnVuY3Rpb24gKHF1ZXN0aW9uSWQsIG9wdGlvbklkKSB7XG4gICAgICAgICAgICB2YXIgcXVlc3Rpb24gPSB0aGlzLmdldFF1ZXN0aW9uQnlJZChxdWVzdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChxdWVzdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBydW50aW1lID0gdGhpcy5fcnVudGltZVtxdWVzdGlvbi5pZF0sIG9wdGlvbiA9IHF1ZXN0aW9uLm9wdGlvbnNbcXVlc3Rpb24ub3B0aW9uc01hcFtvcHRpb25JZF1dO1xuICAgICAgICAgICAgICAgIGlmIChydW50aW1lICYmIG9wdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSBydW50aW1lLm9wdGlvbnMuaW5kZXhPZihvcHRpb25JZCkgIT0gLTE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRlbGVtZW50LmFkZENsYXNzKG9wdGlvbi5pc0NvcnJlY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uQ29ycmVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb25JbmNvcnJlY3QpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRlbGVtZW50LmFkZENsYXNzKG9wdGlvbi5pc0NvcnJlY3QgPyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkluY29ycmVjdCA6IFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb24uJGVsZW1lbnQuYWRkQ2xhc3Mob3B0aW9uLmlzQ29ycmVjdCA/IHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uSW5jb3JyZWN0IDogXCJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfc2hvd1F1ZXN0aW9uU3RhdHVzOiBmdW5jdGlvbiAocXVlc3Rpb25JZCkge1xuICAgICAgICAgICAgdmFyIHF1ZXN0aW9uID0gdGhpcy5nZXRRdWVzdGlvbkJ5SWQocXVlc3Rpb25JZCk7XG4gICAgICAgICAgICBpZiAocXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcnVudGltZSA9IHRoaXMuX3J1bnRpbWVbcXVlc3Rpb24uaWRdO1xuICAgICAgICAgICAgICAgIGlmIChydW50aW1lICYmIHJ1bnRpbWUub3B0aW9uICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHF1ZXN0aW9uLm9wdGlvbnM7XG4gICAgICAgICAgICAgICAgICAgIGlmIChydW50aW1lLmlzQ29ycmVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb24uJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb25Db3JyZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRlbGVtZW50LmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uSW5jb3JyZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIG9wdGlvbnNfMSA9IG9wdGlvbnM7IF9pIDwgb3B0aW9uc18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRPcHRpb24gPSBvcHRpb25zXzFbX2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRPcHRpb24uaXNDb3JyZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE9wdGlvbi4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkNvcnJlY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE9wdGlvbi4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkluY29ycmVjdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9zaG93T3B0aW9uRmVlZGJhY2s6IGZ1bmN0aW9uIChxdWVzdGlvbklkLCBvcHRpb25JZCkge1xuICAgICAgICAgICAgdmFyIHF1ZXN0aW9uID0gdGhpcy5nZXRRdWVzdGlvbkJ5SWQocXVlc3Rpb25JZCk7XG4gICAgICAgICAgICBpZiAocXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcnVudGltZSA9IHRoaXMuX3J1bnRpbWVbcXVlc3Rpb24uaWRdLCBvcHRpb24gPSBxdWVzdGlvbi5vcHRpb25zW3F1ZXN0aW9uLm9wdGlvbnNNYXBbb3B0aW9uSWRdXTtcbiAgICAgICAgICAgICAgICBpZiAocnVudGltZSAmJiBvcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gcnVudGltZS5vcHRpb25zLmluZGV4T2Yob3B0aW9uSWQpICE9IC0xO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb24uaXNDb3JyZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRmZWVkYmFja0tvLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24uJGZlZWRiYWNrT2suc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRmZWVkYmFja09rLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24uJGZlZWRiYWNrS28uc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfc2hvd1F1ZXN0aW9uRmVlZGJhY2s6IGZ1bmN0aW9uIChxdWVzdGlvbklkKSB7XG4gICAgICAgICAgICB2YXIgcXVlc3Rpb24gPSB0aGlzLmdldFF1ZXN0aW9uQnlJZChxdWVzdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChxdWVzdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBydW50aW1lID0gdGhpcy5fcnVudGltZVtxdWVzdGlvbi5pZF07XG4gICAgICAgICAgICAgICAgaWYgKHJ1bnRpbWUgJiYgcnVudGltZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvbiA9IHRoaXMuZ2V0T3B0aW9uQnlJZChxdWVzdGlvbklkLCBydW50aW1lLm9wdGlvbnNbMF0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9uLmlzQ29ycmVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb24uJGZlZWRiYWNrS28uaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb24uJGZlZWRiYWNrT2suc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb24uJGZlZWRiYWNrT2suaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb24uJGZlZWRiYWNrS28uc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfZGlzYWJsZVF1ZXN0aW9uT3B0aW9uc0ZpZWxkOiBmdW5jdGlvbiAocXVlc3Rpb25JZCkge1xuICAgICAgICAgICAgdmFyIHF1ZXN0aW9uID0gdGhpcy5nZXRRdWVzdGlvbkJ5SWQocXVlc3Rpb25JZCk7XG4gICAgICAgICAgICBpZiAocXVlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm11bHRpY2hvaWNlICYmIHRoaXMuX3N0YXRlID09IHRoaXMuU1RBVEVTLnJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb24uJGVsZW1lbnQuZmluZChcIjpjaGVja2VkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBxdWVzdGlvbi5vcHRpb25zOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvbiA9IF9hW19pXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb24uJGVsZW1lbnQuZmluZChcIjpjaGVja2VkXCIpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24uJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuZGlzYWJsZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbi4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5kaXNhYmxlZCk7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uLiRvcHRpb25zLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmRpc2FibGVkKTtcbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb24uJGVsZW1lbnQuZmluZChcImlucHV0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImRpc2FibGVkXCIsIFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfb25PcHRpb25DbGljazogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBpbnN0YW5jZSA9IGUuZGF0YS5pbnN0YW5jZSwgJHF1ZXN0aW9uID0gJCh0aGlzKSwgcXVlc3Rpb25JZCA9ICRxdWVzdGlvbi5hdHRyKFwiaWRcIiksIHF1ZXN0aW9uUnVudGltZSA9IGluc3RhbmNlLl9ydW50aW1lW3F1ZXN0aW9uSWRdIHx8IHt9O1xuICAgICAgICAgICAgaWYgKGluc3RhbmNlLm9wdGlvbnMuaW1tZWRpYXRlRmVlZGJhY2sgPT09IHRydWUgJiYgcXVlc3Rpb25SdW50aW1lLm9wdGlvbiAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9vbk9wdGlvbkNoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBpbnN0YW5jZSA9IGUuZGF0YS5pbnN0YW5jZTtcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS5vcHRpb25zLmRpc2FibGVkICE9IHRydWUgJiYgaW5zdGFuY2UuX3N0YXRlID09IGluc3RhbmNlLlNUQVRFUy5ydW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgdmFyICRvcHRpb24gPSAkKGUudGFyZ2V0KVxuICAgICAgICAgICAgICAgICAgICAucGFyZW50cyhpbnN0YW5jZS5RVUVSWV9PUFRJT04pLCAkcXVlc3Rpb24gPSAkKHRoaXMpLCBxdWVzdGlvbklkID0gJHF1ZXN0aW9uLmF0dHIoXCJpZFwiKSwgcXVlc3Rpb25SdW50aW1lID0gaW5zdGFuY2UuX3J1bnRpbWVbcXVlc3Rpb25JZF0gfHwge30sIG9wdGlvbnMgPSBxdWVzdGlvblJ1bnRpbWUub3B0aW9ucyB8fCBbXSwgb3B0aW9uc1ZhbHVlcyA9IHF1ZXN0aW9uUnVudGltZS5vcHRpb25zVmFsdWVzIHx8IFtdLCBvcHRpb25JZCA9ICRvcHRpb24uYXR0cihcImlkXCIpLCBvcHRpb25WYWx1ZSA9ICRvcHRpb24uZmluZChcImlucHV0XCIpLmF0dHIoXCJ2YWx1ZVwiKTtcbiAgICAgICAgICAgICAgICBxdWVzdGlvblJ1bnRpbWUub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgICAgICAgICAgcXVlc3Rpb25SdW50aW1lLm9wdGlvbnNWYWx1ZXMgPSBvcHRpb25zVmFsdWVzO1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLl9ydW50aW1lW3F1ZXN0aW9uSWRdID0gcXVlc3Rpb25SdW50aW1lO1xuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5vcHRpb25zLm11bHRpY2hvaWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnB1c2gob3B0aW9uSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvblZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1ZhbHVlcy5wdXNoKG9wdGlvblZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICRvcHRpb24uYWRkQ2xhc3MoaW5zdGFuY2Uub3B0aW9ucy5jbGFzc2VzLnNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLl9yZXNldE9wdGlvbihxdWVzdGlvbklkLCBvcHRpb25JZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnNwbGljZShvcHRpb25zLmluZGV4T2Yob3B0aW9uSWQpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25WYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnNWYWx1ZXMuc3BsaWNlKG9wdGlvbnNWYWx1ZXMuaW5kZXhPZihvcHRpb25WYWx1ZSksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLl9jYWxpZmljYXRlTXVsdGlDaG9pY2VRdWVzdGlvbihxdWVzdGlvbklkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChxdWVzdGlvblJ1bnRpbWUub3B0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fcmVzZXRPcHRpb24ocXVlc3Rpb25JZCwgcXVlc3Rpb25SdW50aW1lLm9wdGlvbnNbMF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnNbMF0gPSBvcHRpb25JZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvblZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zVmFsdWVzWzBdID0gb3B0aW9uVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgJG9wdGlvbi5hZGRDbGFzcyhpbnN0YW5jZS5vcHRpb25zLmNsYXNzZXMuc2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fY2FsaWZpY2F0ZVNpbmdsZUNob2ljZVF1ZXN0aW9uKHF1ZXN0aW9uSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2Uub3B0aW9ucy5hbGxvd0NoYW5nZU9wdGlvbiAhPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLl9kaXNhYmxlUXVlc3Rpb25PcHRpb25zRmllbGQocXVlc3Rpb25JZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5vcHRpb25zLmltbWVkaWF0ZUZlZWRiYWNrID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChpbnN0YW5jZS5vcHRpb25zLmFsbG93Q2hhbmdlT3B0aW9uICE9IHVuZGVmaW5lZCAmJiBpbnN0YW5jZS5vcHRpb25zLmFsbG93Q2hhbmdlT3B0aW9uICE9IHRydWUpIHx8IGluc3RhbmNlLm9wdGlvbnMuZGlzYWJsZU9wdGlvbkFmdGVyU2VsZWN0ID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLl9kaXNhYmxlUXVlc3Rpb25PcHRpb25zRmllbGQocXVlc3Rpb25JZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaW5zdGFuY2Uub3B0aW9ucy5kaXNhYmxlTmV4dFVudGlsU3VjY2VzcyA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fdXBkYXRlTmF2aWdhdGlvbkFjdGlvbnNTdGF0ZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fc2hvd1F1ZXN0aW9uU3RhdHVzKHF1ZXN0aW9uSWQpO1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fc2hvd09wdGlvblN0YXR1cyhxdWVzdGlvbklkLCBvcHRpb25JZCk7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLl9zaG93T3B0aW9uRmVlZGJhY2socXVlc3Rpb25JZCwgb3B0aW9uSWQpO1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5fc2hvd1F1ZXN0aW9uRmVlZGJhY2socXVlc3Rpb25JZCwgb3B0aW9uSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2Uub3B0aW9ucy5hdXRvR29OZXh0ICE9IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZS5vcHRpb25zLm11bHRpY2hvaWNlICE9IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLm5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGluc3RhbmNlLm9wdGlvbnMuZGVsYXlPbkF1dG9OZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5lbGVtZW50LnRyaWdnZXJIYW5kbGVyKGluc3RhbmNlLk9OX09QVElPTl9DSEFOR0UsIFtpbnN0YW5jZSwgcXVlc3Rpb25JZCwgb3B0aW9uSWQsIG9wdGlvblZhbHVlLCBxdWVzdGlvblJ1bnRpbWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgX3Jlc2V0T3B0aW9uOiBmdW5jdGlvbiAocXVlc3Rpb25JZCwgb3B0aW9uSWQpIHtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbiA9IHRoaXMuZ2V0UXVlc3Rpb25CeUlkKHF1ZXN0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKHF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbiA9IHF1ZXN0aW9uLm9wdGlvbnNbcXVlc3Rpb24ub3B0aW9uc01hcFtvcHRpb25JZF1dO1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRmZWVkYmFja0tvLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRmZWVkYmFja09rLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLiRlbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnNlbGVjdGVkICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkNvcnJlY3QgKyBcIiBcIiArIHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uSW5jb3JyZWN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9zZXRPcHRpb246IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9zdXBlcihrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IFwiZGlzYWJsZWRcIikge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9oaWRlOiBmdW5jdGlvbiAocXVlc3Rpb25Ub0hpZGUpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgaGlkZURlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuZWxlbWVudC50cmlnZ2VySGFuZGxlcih0aGlzLk9OX1FVRVNUSU9OX0hJREUsIFt0aGlzLCBxdWVzdGlvblRvSGlkZV0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAhPSB1bmRlZmluZWQgJiYgcmVzdWx0Lmhhc093blByb3BlcnR5KFwidGhlblwiKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaGlkZURlZmVyLnJlc29sdmVXaXRoKF90aGlzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1ZXN0aW9uVG9IaWRlLmZhZGVPdXQoNDAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGhpZGVEZWZlci5yZXNvbHZlV2l0aChfdGhpcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaGlkZURlZmVyLnByb21pc2UoKTtcbiAgICAgICAgfSxcbiAgICAgICAgX3Nob3c6IGZ1bmN0aW9uIChuZXh0UXVlc3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgc2hvd0RlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuZWxlbWVudC50cmlnZ2VySGFuZGxlcih0aGlzLk9OX1FVRVNUSU9OX1NIT1csIFt0aGlzLCBuZXh0UXVlc3Rpb25dKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT0gdW5kZWZpbmVkICYmIHJlc3VsdC5oYXNPd25Qcm9wZXJ0eShcInRoZW5cIikpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNob3dEZWZlci5yZXNvbHZlV2l0aChfdGhpcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXh0UXVlc3Rpb24uZmFkZUluKDQwMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzaG93RGVmZXIucmVzb2x2ZVdpdGgoX3RoaXMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNob3dEZWZlci5wcm9taXNlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9vbkhlYWRlckhpZGRlbjogZnVuY3Rpb24gKGRlZmVyKSB7XG4gICAgICAgICAgICBkZWZlci5yZXNvbHZlV2l0aCh0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgX2hpZGVIZWFkZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl8kaGVhZGVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5lbGVtZW50LnRyaWdnZXJIYW5kbGVyKHRoaXMuT05fSEVBREVSX0hJREUsIFt0aGlzLCB0aGlzLl8kaGVhZGVyXSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAhPSB1bmRlZmluZWQgJiYgcmVzdWx0Lmhhc093blByb3BlcnR5KFwidGhlblwiKSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQudGhlbih0aGlzLl9vbkhlYWRlckhpZGRlbi5iaW5kKHRoaXMsIGRlZmVyKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl8kaGVhZGVyLmZhZGVPdXQoNDAwLCB0aGlzLl9vbkhlYWRlckhpZGRlbi5iaW5kKHRoaXMsIGRlZmVyKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb25IZWFkZXJIaWRkZW4oZGVmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTtcbiAgICAgICAgfSxcbiAgICAgICAgX3Nob3dIZWFkZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5fJGhlYWRlci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuZWxlbWVudC50cmlnZ2VySGFuZGxlcih0aGlzLk9OX0hFQURFUl9TSE9XLCBbdGhpcywgdGhpcy5fJGhlYWRlcl0pO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT0gdW5kZWZpbmVkICYmIHJlc3VsdC5oYXNPd25Qcm9wZXJ0eShcInRoZW5cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZVdpdGgoX3RoaXMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuXyRoZWFkZXIuZmFkZUluKDQwMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZVdpdGgoX3RoaXMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlV2l0aCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9vbkJvZHlIaWRkZW46IGZ1bmN0aW9uIChkZWZlcikge1xuICAgICAgICAgICAgZGVmZXIucmVzb2x2ZVdpdGgodGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIF9oaWRlQm9keTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuZWxlbWVudC50cmlnZ2VySGFuZGxlcih0aGlzLk9OX0JPRFlfSElERSwgW3RoaXMsIHRoaXMuXyRib2R5XSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICE9IHVuZGVmaW5lZCAmJiByZXN1bHQuaGFzT3duUHJvcGVydHkoXCJ0aGVuXCIpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnRoZW4odGhpcy5fb25Cb2R5SGlkZGVuLmJpbmQodGhpcywgZGVmZXIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuXyRib2R5LmZhZGVPdXQoNDAwLCB0aGlzLl9vbkJvZHlIaWRkZW4uYmluZCh0aGlzLCBkZWZlcikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTtcbiAgICAgICAgfSxcbiAgICAgICAgX3Nob3dCb2R5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIGRlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuZWxlbWVudC50cmlnZ2VySGFuZGxlcih0aGlzLk9OX0JPRFlfU0hPVywgW3RoaXMsIHRoaXMuXyRib2R5XSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICE9IHVuZGVmaW5lZCAmJiByZXN1bHQuaGFzT3duUHJvcGVydHkoXCJ0aGVuXCIpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlV2l0aChfdGhpcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl8kYm9keS5mYWRlSW4oNDAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlc29sdmVXaXRoKF90aGlzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9hbmltYXRpb25TdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKSwgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLl9oaWRlSGVhZGVyKClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuX3Nob3dCb2R5KClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlV2l0aCh0aGF0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTtcbiAgICAgICAgfSxcbiAgICAgICAgX2FuaW1hdGlvblN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCksIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5faGlkZUJvZHkoKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5fc2hvd0hlYWRlcigpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZVdpdGgodGhhdCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9kaXNhYmxlRW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl8kZW5kQnRuLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuXyRlbmRCdG4uYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuZGlzYWJsZWQpO1xuICAgICAgICB9LFxuICAgICAgICBfZW5hYmxlRW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl8kZW5kQnRuLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLl8kZW5kQnRuLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmRpc2FibGVkKTtcbiAgICAgICAgfSxcbiAgICAgICAgX2Rpc2FibGVQcmV2OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl8kcHJldkJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLl8kcHJldkJ0bi5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5kaXNhYmxlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9lbmFibGVQcmV2OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl8kcHJldkJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5fJHByZXZCdG4ucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuZGlzYWJsZWQpO1xuICAgICAgICB9LFxuICAgICAgICBfZGlzYWJsZU5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuXyRuZXh0QnRuLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuXyRuZXh0QnRuLmFkZENsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmRpc2FibGVkKTtcbiAgICAgICAgfSxcbiAgICAgICAgX2VuYWJsZU5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuXyRuZXh0QnRuLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLl8kbmV4dEJ0bi5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5kaXNhYmxlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9kaXNhYmxlU3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuXyRzdGFydEJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLl8kc3RhcnRCdG4uYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuZGlzYWJsZWQpO1xuICAgICAgICB9LFxuICAgICAgICBfZW5hYmxlU3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuXyRzdGFydEJ0bi5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5fJHN0YXJ0QnRuLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmRpc2FibGVkKTtcbiAgICAgICAgfSxcbiAgICAgICAgX29uQW5pbWF0aW9uU3RhcnRFbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaW5pdGlhbFF1ZXN0aW9uICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ29Ubyh0aGlzLm9wdGlvbnMuaW5pdGlhbFF1ZXN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC50cmlnZ2VyKHRoaXMuT05fU1RBUlRFRCwgW3RoaXNdKTtcbiAgICAgICAgfSxcbiAgICAgICAgX29uQW5pbWF0aW9uRW5kRW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIF9vblF1ZXN0aW9uVHJhbnNpdGlvbkVuZDogZnVuY3Rpb24gKG9sZFBhZ2UsIG5ld1BhZ2UsIGRlZmVyKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVOYXZpZ2F0aW9uQWN0aW9uc1N0YXRlcygpO1xuICAgICAgICAgICAgZGVmZXIucmVzb2x2ZVdpdGgodGhpcyk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQudHJpZ2dlckhhbmRsZXIodGhpcy5PTl9UUkFOU0lUSU9OX0VORCwgW3RoaXMsIG9sZFBhZ2UsIG5ld1BhZ2VdKTtcbiAgICAgICAgfSxcbiAgICAgICAgX3VwZGF0ZU5hdmlnYXRpb25BY3Rpb25zU3RhdGVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcXVlc3Rpb24gPSB0aGlzLmdldFF1ZXN0aW9uQnlJbmRleCh0aGlzLl9jdXJyZW50UXVlc3Rpb25JbmRleCksIHF1ZXN0aW9uUnVudGltZSA9IHRoaXMuX3J1bnRpbWVbcXVlc3Rpb24uaWRdO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRRdWVzdGlvbkluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZVByZXYoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVOZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLl9jdXJyZW50UXVlc3Rpb25JbmRleCA9PT0gdGhpcy5fcXVlc3Rpb25zLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlTmV4dCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2VuYWJsZVByZXYoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VuYWJsZVByZXYoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVOZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmltbWVkaWF0ZUZlZWRiYWNrID09IHRydWUgJiYgdGhpcy5vcHRpb25zLmRpc2FibGVPcHRpb25BZnRlclNlbGVjdCAhPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXNhYmxlTmV4dFVudGlsU3VjY2VzcyA9PSB0cnVlICYmIChxdWVzdGlvblJ1bnRpbWUgPT0gdW5kZWZpbmVkIHx8IHF1ZXN0aW9uUnVudGltZS5pc0NvcnJlY3QgIT0gdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5leHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLm9wdGlvbnMuZGlzYWJsZUVuZEFjdGlvblVudGlsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5ESVNBQkxFX0VORC5iZWZvcmVBbnN3ZXJBbGw6XG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyh0aGlzLl9ydW50aW1lKSA9PSB0aGlzLl9xdWVzdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5ESVNBQkxFX0VORC5iZWZvcmVBbnN3ZXJBbGxDb3JyZWN0OlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvcnJlY3QgPSAwLCBydW50aW1lID0gdGhpcy5fcnVudGltZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHF1ZXN0aW9uSWQgaW4gcnVudGltZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBxdWVzdGlvblJ1bnRpbWVfMSA9IHJ1bnRpbWVbcXVlc3Rpb25JZF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHF1ZXN0aW9uUnVudGltZV8xLmlzQ29ycmVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3JyZWN0Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvcnJlY3QgPT0gdGhpcy5fcXVlc3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VuYWJsZUVuZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZUVuZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfb25FbmRTaG93UmVzdWx0OiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIGluc3RhbmNlID0gZS5kYXRhLmluc3RhbmNlO1xuICAgICAgICAgICAgaW5zdGFuY2UuZW5kKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldE1heFBvaW50czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21heFNjb3JlO1xuICAgICAgICB9LFxuICAgICAgICBnZXRJZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5hdHRyKFwiaWRcIik7XG4gICAgICAgIH0sXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jdXJyZW50UXVlc3Rpb25JbmRleCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nb1RvKHRoaXMuX2N1cnJlbnRRdWVzdGlvbkluZGV4ICsgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nb1RvKDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBwcmV2OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY3VycmVudFF1ZXN0aW9uSW5kZXggIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ29Ubyh0aGlzLl9jdXJyZW50UXVlc3Rpb25JbmRleCAtIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ29UbygwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZ29UbzogZnVuY3Rpb24gKHF1ZXN0aW9uSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgcHJvbWlzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdGF0ZSA9PT0gdGhpcy5TVEFURVMucnVubmluZyB8fCB0aGlzLl9zdGF0ZSA9PSB0aGlzLlNUQVRFUy5yZXZpZXcpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dFF1ZXN0aW9uXzEgPSB0aGlzLl9xdWVzdGlvbnNbcXVlc3Rpb25JbmRleF0sIGN1cnJlbnRRdWVzdGlvbkluZGV4ID0gdGhpcy5fY3VycmVudFF1ZXN0aW9uSW5kZXgsIGN1cnJlbnRRdWVzdGlvbl8xID0gdGhpcy5fcXVlc3Rpb25zW2N1cnJlbnRRdWVzdGlvbkluZGV4XTtcbiAgICAgICAgICAgICAgICBpZiAobmV4dFF1ZXN0aW9uXzEgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UXVlc3Rpb25fMSA9PSB1bmRlZmluZWQgfHwgY3VycmVudFF1ZXN0aW9uXzEgIT0gbmV4dFF1ZXN0aW9uXzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZWZlcl8xID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZSA9IGRlZmVyXzEucHJvbWlzZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZU5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVQcmV2KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50UXVlc3Rpb25JbmRleCA9IHF1ZXN0aW9uSW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocXVlc3Rpb25JbmRleCA9PSB0aGlzLl9xdWVzdGlvbnMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5maXJzdFF1ZXN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMubGFzdFF1ZXN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHF1ZXN0aW9uSW5kZXggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5sYXN0UXVlc3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5maXJzdFF1ZXN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5maXJzdFF1ZXN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMubGFzdFF1ZXN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hdHRyKHRoaXMuQVRUUl9DVVJSRU5UX1FVRVNUSU9OLCBxdWVzdGlvbkluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50UXVlc3Rpb25fMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2hpZGUoY3VycmVudFF1ZXN0aW9uXzEuJGVsZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX3Nob3cobmV4dFF1ZXN0aW9uXzEuJGVsZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihfdGhpcy5fb25RdWVzdGlvblRyYW5zaXRpb25FbmQuYmluZChfdGhpcywgY3VycmVudFF1ZXN0aW9uXzEsIG5leHRRdWVzdGlvbl8xLCBkZWZlcl8xKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zaG93KG5leHRRdWVzdGlvbl8xLiRlbGVtZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbih0aGlzLl9vblF1ZXN0aW9uVHJhbnNpdGlvbkVuZC5iaW5kKHRoaXMsIGN1cnJlbnRRdWVzdGlvbl8xLCBuZXh0UXVlc3Rpb25fMSwgZGVmZXJfMSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFF1ZXN0aW9uXzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2UgPSBkZWZlci5wcm9taXNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9oaWRlKGN1cnJlbnRRdWVzdGlvbl8xLiRlbGVtZW50KS50aGVuKHRoaXMuX29uUXVlc3Rpb25UcmFuc2l0aW9uRW5kLmJpbmQodGhpcywgY3VycmVudFF1ZXN0aW9uXzEsIG51bGwsIGRlZmVyKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0UXVlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcXVlc3Rpb25zO1xuICAgICAgICB9LFxuICAgICAgICBnZXRRdWVzdGlvbkJ5SW5kZXg6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3F1ZXN0aW9uc1tpbmRleF07XG4gICAgICAgIH0sXG4gICAgICAgIGdldFF1ZXN0aW9uQnlJZDogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRRdWVzdGlvbkJ5SW5kZXgodGhpcy5fcXVlc3Rpb25zTWFwW2lkXSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldE9wdGlvbnM6IGZ1bmN0aW9uIChxdWVzdGlvbklkKSB7XG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuZ2V0UXVlc3Rpb25CeUlkKHF1ZXN0aW9uSWQpIHx8IHt9KS5vcHRpb25zO1xuICAgICAgICB9LFxuICAgICAgICBnZXRPcHRpb25CeUluZGV4OiBmdW5jdGlvbiAocXVlc3Rpb25JZCwgb3B0aW9uSW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zKHF1ZXN0aW9uSWQpLCBvcHRpb247XG4gICAgICAgICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICAgICAgICAgIG9wdGlvbiA9IG9wdGlvbnNbb3B0aW9uSW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbjtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0T3B0aW9uQnlJZDogZnVuY3Rpb24gKHF1ZXN0aW9uSWQsIG9wdGlvbklkKSB7XG4gICAgICAgICAgICB2YXIgcXVlc3Rpb24gPSB0aGlzLmdldFF1ZXN0aW9uQnlJZChxdWVzdGlvbklkKSwgb3B0aW9uO1xuICAgICAgICAgICAgaWYgKHF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9uID0gcXVlc3Rpb24ub3B0aW9uc1txdWVzdGlvbi5vcHRpb25zTWFwW29wdGlvbklkXV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9uO1xuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfSxcbiAgICAgICAgcmVkcmF3UHJvcGVydGllczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyT3B0aW9ucygpO1xuICAgICAgICB9LFxuICAgICAgICByZXNldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fcnVudGltZSA9IHt9O1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHIodGhpcy5BVFRSX0NVUlJFTlRfUVVFU1RJT04pO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmZpcnN0UXVlc3Rpb24pO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmxhc3RRdWVzdGlvbik7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50UXVlc3Rpb25JbmRleCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl8kcXVlc3Rpb25zLmhpZGUoKTtcbiAgICAgICAgICAgIHRoaXMuXyRxdWVzdGlvbnMuZmlyc3QoKVxuICAgICAgICAgICAgICAgIC5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLl8kcXVlc3Rpb25zLmZpbmQoXCJpbnB1dFwiKVxuICAgICAgICAgICAgICAgIC5wcm9wKFwiY2hlY2tlZFwiLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cihcImRpc2FibGVkXCIpO1xuICAgICAgICAgICAgdGhpcy5fJHF1ZXN0aW9ucy5maW5kKFwiLlwiICsgdGhpcy5vcHRpb25zLmNsYXNzZXMuZGlzYWJsZWQpLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmRpc2FibGVkKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5maW5kKHRoaXMuUVVFUllfRkVFREJBQ0spXG4gICAgICAgICAgICAgICAgLmhpZGUoKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5maW5kKFwiLlwiICsgdGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb25Db3JyZWN0KVxuICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkNvcnJlY3QpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmZpbmQoXCIuXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5xdWVzdGlvbkluY29ycmVjdClcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMucXVlc3Rpb25JbmNvcnJlY3QpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmZpbmQoXCIuXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zZWxlY3RlZClcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuc2VsZWN0ZWQpO1xuICAgICAgICB9LFxuICAgICAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kaXNhYmxlZCAhPSB0cnVlICYmIHRoaXMuX3N0YXRlID09PSB0aGlzLlNUQVRFUy5vZmYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VTdGF0ZSh0aGlzLlNUQVRFUy5ydW5uaW5nKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQudHJpZ2dlcih0aGlzLk9OX1NUQVJULCBbdGhpc10pO1xuICAgICAgICAgICAgICAgIHRoaXMuX3J1bnRpbWUgPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hbmltYXRpb25TdGFydCgpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uQW5pbWF0aW9uU3RhcnRFbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzaG93UmVzdWx0OiBmdW5jdGlvbiAoY2FsaWZpY2F0aW9uKSB7XG4gICAgICAgICAgICBpZiAoY2FsaWZpY2F0aW9uICYmIHRoaXMub3B0aW9ucy5zaG93UmVzdWx0ICYmIHRoaXMuXyRyZXN1bHQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NoYW5nZVN0YXRlKHRoaXMuU1RBVEVTLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVuZGVyVmFyKHRoaXMuUVVFUllfUkVOREVSX1JFU1VMVCwgXCJqcVF1aXpSZXN1bHRJdGVtXCIsIGNhbGlmaWNhdGlvbiwgdGhpcy5fJHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fJHJlc3VsdC5kaWFsb2codGhpcy5vcHRpb25zLmRpYWxvZylcbiAgICAgICAgICAgICAgICAgICAgLm9uZShcImRpYWxvZ2Nsb3NlXCIsIHsgaW5zdGFuY2U6IHRoaXMgfSwgdGhpcy5fb25FbmRTaG93UmVzdWx0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2hvd0NvcnJlY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2hvd0NvcnJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcXVlc3Rpb25zID0gdGhpcy5fcXVlc3Rpb25zO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHF1ZXN0aW9uSW5kZXggPSAwLCBxdWVzdGlvbnNMZW5ndGggPSBxdWVzdGlvbnMubGVuZ3RoOyBxdWVzdGlvbkluZGV4IDwgcXVlc3Rpb25zTGVuZ3RoOyBxdWVzdGlvbkluZGV4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRRdWVzdGlvbiA9IHF1ZXN0aW9uc1txdWVzdGlvbkluZGV4XSwgb3B0aW9ucyA9IGN1cnJlbnRRdWVzdGlvbi5vcHRpb25zO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBvcHRpb25JbmRleCA9IDAsIG9wdGlvbnNMZW5ndGggPSBvcHRpb25zLmxlbmd0aDsgb3B0aW9uSW5kZXggPCBvcHRpb25zTGVuZ3RoOyBvcHRpb25JbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudE9wdGlvbiA9IG9wdGlvbnNbb3B0aW9uSW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2hvd09wdGlvblN0YXR1cyhjdXJyZW50UXVlc3Rpb24uaWQsIGN1cnJlbnRPcHRpb24uaWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGVRdWVzdGlvbk9wdGlvbnNGaWVsZChjdXJyZW50UXVlc3Rpb24uaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VTdGF0ZSh0aGlzLlNUQVRFUy5yZXZpZXcpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ29UbygwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgX2Rpc2FibGVBbGxRdWVzdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBxdWVzdGlvbnMgPSB0aGlzLl9xdWVzdGlvbnM7XG4gICAgICAgICAgICBmb3IgKHZhciBxdWVzdGlvbkluZGV4ID0gMCwgcXVlc3Rpb25zTGVuZ3RoID0gcXVlc3Rpb25zLmxlbmd0aDsgcXVlc3Rpb25JbmRleCA8IHF1ZXN0aW9uc0xlbmd0aDsgcXVlc3Rpb25JbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRRdWVzdGlvbiA9IHF1ZXN0aW9uc1txdWVzdGlvbkluZGV4XTtcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlUXVlc3Rpb25PcHRpb25zRmllbGQoY3VycmVudFF1ZXN0aW9uLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fc3RhdGUgPT09IHRoaXMuU1RBVEVTLnJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FsaWZpY2F0aW9uID0gdGhpcy5fY2FsaWZpY2F0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMubGFzdENhbGlmaWNhdGlvbiA9IGNhbGlmaWNhdGlvbjtcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlQWxsUXVlc3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnRyaWdnZXIodGhpcy5PTl9FTkQsIFt0aGlzLCBjYWxpZmljYXRpb25dKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2hvd1Jlc3VsdChjYWxpZmljYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5zaG93Q29ycmVjdGlvbigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VTdGF0ZSh0aGlzLlNUQVRFUy5vZmYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uU3RvcCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fb25BbmltYXRpb25FbmRFbmQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBjYWxpZmljYXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLl9zdGF0ZSA9PSB0aGlzLlNUQVRFUy5yZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2hvd0NvcnJlY3Rpb24oKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VTdGF0ZSh0aGlzLlNUQVRFUy5vZmYpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hbmltYXRpb25TdG9wKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uQW5pbWF0aW9uRW5kRW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFzdENhbGlmaWNhdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuX3N0YXRlID09IHRoaXMuU1RBVEVTLnJldmlldykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NoYW5nZVN0YXRlKHRoaXMuU1RBVEVTLm9mZik7XG4gICAgICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uU3RvcCgpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHRoaXMuX29uQW5pbWF0aW9uRW5kRW5kKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sYXN0Q2FsaWZpY2F0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBfY2hhbmdlU3RhdGU6IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAgICAgc3dpdGNoIChzdGF0ZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5TVEFURVMucmV2aWV3OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuc3RhdGVSdW5uaW5nICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGF0ZVJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGF0ZVJldmlldyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5TVEFURVMucnVubmluZzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnN0YXRlUmV2aWV3ICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGF0ZVJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGF0ZVJ1bm5pbmcpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHRoaXMuU1RBVEVTLnJlc3VsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnN0YXRlUmV2aWV3ICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGF0ZVJ1bm5pbmcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuc3RhdGVSZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHRoaXMuU1RBVEVTLm9mZjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnN0YXRlUmVzdWx0ICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5zdGF0ZVJldmlldyArIFwiIFwiICsgdGhpcy5vcHRpb25zLmNsYXNzZXMuc3RhdGVSdW5uaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9kaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9kaXNhYmxlU3RhcnQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgX2VuYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fZW5hYmxlU3RhcnQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fc3VwZXIoKTtcbiAgICAgICAgICAgIHRoaXMuX2Rpc2FibGUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9zdXBlcigpO1xuICAgICAgICAgICAgdGhpcy5fZW5hYmxlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuXyR3cmFwcGVyLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLndyYXBwZXIpO1xuICAgICAgICAgICAgdGhpcy5fJGhlYWRlci5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5oZWFkZXIpO1xuICAgICAgICAgICAgdGhpcy5fJGJvZHkucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuYm9keSk7XG4gICAgICAgICAgICB0aGlzLl8kYm9keS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLl8kcHJvcGVydGllcy5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xhc3Nlcy5wcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgIHRoaXMuXyRxdWVzdGlvbnNXcmFwcGVyLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLl8kcXVlc3Rpb25zLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLnF1ZXN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuXyRxdWVzdGlvbnMuc2hvdygpO1xuICAgICAgICAgICAgdGhpcy5fJHN0YXJ0QnRuLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmJ1dHRvbiArIFwiIFwiICsgdGhpcy5vcHRpb25zLmNsYXNzZXMuc3RhcnRCdG4pO1xuICAgICAgICAgICAgdGhpcy5fJG5leHRCdG4ucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMuYnV0dG9uICsgXCIgXCIgKyB0aGlzLm9wdGlvbnMuY2xhc3Nlcy5uZXh0QnRuKTtcbiAgICAgICAgICAgIHRoaXMuXyRwcmV2QnRuLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmJ1dHRvbiArIFwiIFwiICsgdGhpcy5vcHRpb25zLmNsYXNzZXMucHJldkJ0bik7XG4gICAgICAgICAgICB0aGlzLl8kZW5kQnRuLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGFzc2VzLmJ1dHRvbiArIFwiIFwiICsgdGhpcy5vcHRpb25zLmNsYXNzZXMuZW5kQnRuKTtcbiAgICAgICAgICAgIHRoaXMuXyRyZXN1bHQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsYXNzZXMucmVzdWx0KTtcbiAgICAgICAgICAgIGlmICh0aGlzLl8kcmVzdWx0LmRhdGEoXCJ1aURpYWxvZ1wiKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuXyRyZXN1bHQuZGlhbG9nKFwiZGVzdHJveVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiAkLnVpLmpxUXVpejtcbn0pKTtcbiJdLCJmaWxlIjoianF1ZXJ5LnF1aXouanMifQ==
