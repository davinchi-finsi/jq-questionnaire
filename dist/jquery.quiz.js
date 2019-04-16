/**
 * @license jq-quiz v3.0.0-beta.3
 * (c) 2019 Finsi, Inc.
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, (function () { 'use strict';

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
        ON_QUESTION_HIDDEN: "jqQuiz:questionHidden",
        ON_QUESTION_SHOW: "jqQuiz:questionShow",
        ON_QUESTION_SHOWN: "jqQuiz:questionShow",
        ON_HEADER_HIDE: "jqQuiz:headerHide",
        ON_HEADER_SHOW: "jqQuiz:headerShow",
        ON_BODY_HIDE: "jqQuiz:bodyHide",
        ON_BODY_HIDDEN: "jqQuiz:bodyHidden",
        ON_BODY_SHOW: "jqQuiz:bodyShow",
        ON_BODY_SHOWN: "jqQuiz:bodyShown",
        ON_TRANSITION_END: "jqQuiz:transitionEnd",
        ON_OPTION_CHANGE: "jqQuiz:questionChange",
        ON_START: "jqQuiz:start",
        ON_STARTED: "jqQuiz:started",
        ON_END: "jqQuiz:end",
        ON_FINISHED: "jqQuiz:finished",
        ON_REVIEW_END: "jqQuiz:reviewEnd",
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
                lastQuestionToAsk: "jq-quiz--last-question-to-ask",
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
                title: "jq-quiz__title",
                description: "jq-quiz__description",
                disabled: "jq-quiz--disabled",
                property: "jq-quiz__property",
                actions: "jq-quiz__actions",
                action: "jq-quiz__action",
                statement: "jq-quiz__statement",
                options: "jq-quiz__options",
                field: "jq-quiz__option-field",
                feedback: "jq-quiz__feedback",
                resultItem: "jq-quiz__result-item",
                label: "jq-quiz__option-label",
                propertyName: "jq-quiz__property"
            },
            delayOnAutoNext: 500,
            pointsForSuccess: 1,
            pointsForFail: 0,
            cutOffMark: 50,
            immediateFeedback: false,
            allowChangeOption: false,
            autoGoNext: true,
            showCorrection: true,
            showResult: true,
            multichoice: false,
            disableNextUntil: -1,
            disableEndActionUntil: 0,
            dialog: {
                draggable: false,
                autoOpen: true,
                resizable: false,
                modal: true,
                classes: {
                    "ui-dialog": "jq-quiz-results-dialog"
                }
            },
            randomize: false,
            initialQuestion: null,
            autoStart: false //auto start the quiz
        },
        /**
         * @constructor
         * @private
         */
        _create: function () {
            this.element.addClass(this.options.classes.widget);
            if (this.options.quiz && this.element.children().length == 0) {
                this.element.html(this._renderTemplate());
            }
            this._getElements();
            this.element.uniqueId();
            this._mapQuestions();
            this._questions = this._originalQuestions.slice("");
            this._changeState(this.STATES.off);
            this._assignEvents();
            this._renderOptions();
            if (this.options.autoStart) {
                this.start();
            }
        },
        /**
         * Renderiza una opción escaneando los elementos que coincidan con QUERY_RENDER_OPTION
         * Es posible establecer un valor a renderizar en caso de que el atributo sea true o false usando la sintaxis del operador ternario: nombreOpcion ? valorSiTrue : valorSiFalse
         * @private
         * @example
         * let options = {cutOffMark:50};
         * <span data-quiz-render-option="cutOffMark"></span>
         * Renderiza:
         * <span data-quiz-render-option="cutOffMark">50</span>
         * @example
         * let options = {immediateFeedback:false};
         * <span data-quiz-render-option="immediateFeedback?Si:No"></span>
         * Renderiza:
         * <span data-quiz-render-option="immediateFeedback?Si:No">No</span>
         * @see _renderVar
         */
        _renderOptions: function () {
            this._renderVar(this.QUERY_RENDER_OPTION, "jqQuizProperty");
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
                var $element = $(element), optionName = ($element.data(data) || ""), //get the data name
                optionAsTrue = void 0, optionAsFalse = void 0;
                if (optionName != undefined) { //if exists
                    _a = optionName.split("?"), optionName = _a[0], optionAsTrue = _a[1]; //split to get the parts
                    optionName = optionName.trim();
                    if (optionAsTrue != undefined) { //if optionAsTrue exists
                        _b = optionAsTrue.split(":"), optionAsTrue = _b[0], optionAsFalse = _b[1]; //destructure
                        optionAsTrue.trim();
                        optionAsFalse.trim();
                    }
                    var optionValue = store[optionName]; //get the value of data
                    optionValue = optionValue != undefined ? optionValue : ""; //if undefined, assign empty string
                    if (optionAsTrue != undefined && !!optionValue) { //if the value is true and optionAsTrue is provided, the value to display is optionAsTrue
                        optionValue = optionAsTrue;
                    }
                    else if (optionAsFalse != undefined && !optionValue) { //if the value is false and optionAsFalse is provided, the value to display is optionAsFalse
                        optionValue = optionAsFalse;
                    }
                    $element.html(optionValue);
                }
            }
            var _a, _b;
        },
        _renderTemplate: function () {
            var result;
            var quiz = this.options.quiz;
            if (quiz) {
                result = "\n                    <form class=\"" + (this.options.classes.wrapper + (quiz.wrapper && quiz.wrapper.cssClass ? " " + quiz.wrapper.cssClass : "")) + "\" data-jq-quiz-wrapper>\n                        " + this._renderTemplateHeader(quiz.header) + "\n                        " + this._renderTemplateBody(quiz.body) + "\n                        " + this._renderTemplateResult(quiz.result) + "\n                    </form>\n                ";
            }
            return result;
        },
        _renderTemplateHeader: function (header) {
            var result = "";
            if (header) {
                result = "\n                    <div class=\"" + (this.options.classes.header + (header.cssClass ? " " + header.cssClass : "")) + "\" data-jq-quiz-header>\n                        " + this._renderTemplateHeaderTitle(header.title) + "\n                        " + this._renderTemplateHeaderDescription(header.description) + "\n                        " + this._renderTemplateHeaderProperties(header.properties) + "\n                        " + this._renderTemplateActions(header.actions) + "\n                    </div>\n                ";
            }
            return result;
        },
        _renderTemplateHeaderTitle: function (title) {
            var result = "";
            if (title) {
                if ((typeof title).toLowerCase() == "string") {
                    title = {
                        tag: "h",
                        level: 1,
                        content: title
                    };
                }
                if (title.tag == "h" && !title.level) {
                    title.level = 1;
                }
                result = "\n                    <" + title.tag + title.level + " class=\"" + (this.options.classes.title + (title.cssClass ? " " + title.cssClass : "")) + "\" data-jq-quiz-title>\n                        " + title.content + "\n                    </" + title.tag + title.level + ">\n                ";
            }
            return result;
        },
        _renderTemplateHeaderDescription: function (description) {
            var result = "";
            if (description) {
                if ((typeof description).toLowerCase() == "string") {
                    description = {
                        tag: "p",
                        content: description
                    };
                }
                result = "\n                    <" + (description.tag || "p") + " class=\"" + (this.options.classes.description + (description.cssClass ? " " + description.cssClass : "")) + "\" data-jq-quiz-description>\n                        " + description.content + "\n                    </" + (description.tag || "p") + ">\n                ";
            }
            return result;
        },
        _renderTemplateHeaderProperties: function (properties) {
            var result = "";
            if (properties) {
                if (Array.isArray(properties)) {
                    properties = {
                        tag: "dl",
                        properties: properties
                    };
                }
                var propertiesStr = "";
                for (var propertyIndex = 0, propertiesLength = properties.properties.length; propertyIndex < propertiesLength; propertyIndex++) {
                    var property = properties.properties[propertyIndex];
                    propertiesStr += this._renderTemplateHeaderProperty(property);
                }
                result = "\n                    <" + (properties.tag || "dl") + " class=\"" + (this.options.classes.properties + (properties.cssClass ? " " + properties.cssClass : "")) + "\" data-jq-quiz-properties>\n                        " + propertiesStr + "\n                    </" + (properties.tag || "dl") + ">\n                ";
            }
            return result;
        },
        _renderTemplateHeaderProperty: function (property) {
            var result = "";
            if (property) {
                result = "\n                    <" + (property.tagName || "dt") + " class=\"" + (this.options.classes.propertyName + (property.cssClass ? " " + property.cssClass : "")) + "\">\n                        " + property.content + "\n                    </" + (property.tagName || "dt") + ">\n                    <" + (property.tagName || "dd") + " class=\"" + (this.options.classes.propertyName + (property.cssClass ? " " + property.cssClass : "")) + "\" data-jq-quiz-property=\"" + property.type + "\">\n                        \n                    </" + (property.tagName || "dd") + ">\n                ";
            }
            return result;
        },
        _renderTemplateActions: function (actions) {
            var result = "";
            if (actions) {
                if (Array.isArray(actions)) {
                    actions = {
                        tag: "div",
                        actions: actions
                    };
                }
                var actionsStr = "";
                for (var actionIndex = 0, actionsLength = actions.actions.length; actionIndex < actionsLength; actionIndex++) {
                    var action = actions.actions[actionIndex];
                    actionsStr += this._renderTemplateAction(action);
                }
                result = "\n                    <" + (actions.tag || "div") + " class=\"" + (this.options.classes.actions + (actions.cssClass ? " " + actions.cssClass : "")) + "\" data-jq-quiz-actions>\n                        " + actionsStr + "\n                    </" + (actions.tag || "div") + ">\n                ";
            }
            return result;
        },
        _renderTemplateAction: function (action) {
            var result = "";
            if (action) {
                result = "\n                    <" + (action.tagName || "button") + " class=\"" + (this.options.classes.action + (action.cssClass ? " " + action.cssClass : "")) + "\" data-jq-quiz-" + action.type + ">\n                        " + action.content + "\n                    </" + (action.tagName || "button") + ">\n                ";
            }
            return result;
        },
        _renderTemplateBody: function (body) {
            var result = "";
            if (body) {
                result = "\n                    <" + (body.tag || "div") + " class=\"" + (this.options.classes.body + (body.cssClass ? " " + body.cssClass : "")) + "\" data-jq-quiz-body>\n                        " + this._renderTemplateBodyQuestions(body.questions) + "\n                        " + this._renderTemplateActions(body.actions) + "\n                    </" + (body.tag || "div") + ">\n                ";
            }
            return result;
        },
        _renderTemplateBodyQuestions: function (questions) {
            var result = "";
            if (questions && Array.isArray(questions)) {
                if (Array.isArray(questions)) {
                    questions = {
                        questions: questions
                    };
                }
                var questionsStr = "";
                for (var _i = 0, _a = questions.questions; _i < _a.length; _i++) {
                    var question = _a[_i];
                    questionsStr += this._renderTemplateBodyQuestion(question);
                }
                result = "\n                    <" + (questions.tag || "div") + " class=\"" + (this.options.classes.questions + (questions.cssClass
                    ? " " + questions.cssClass
                    : "")) + "\" data-jq-quiz-questions>\n                        " + questionsStr + "\n                    </" + (questions.tag || "div") + ">\n                ";
            }
            return result;
        },
        _renderTemplateBodyQuestion: function (question) {
            var result = "";
            if (question) {
                result = "\n                    <" + (question.tag || "fieldset") + " " + (question.id ? "id='" + question.id + "'" : "") + " class=\"" + (this.options.classes.question + (question.cssClass
                    ? " " + question.cssClass
                    : "")) + "\" data-jq-quiz-question>\n                        " + this._renderTemplateBodyQuestionStatement(question.content) + "\n                        " + this._renderTemplateBodyQuestionOptions(question.options) + "\n                        " + this._renderTemplateBodyQuestionFeedback(question.feedback) + "\n                    </" + (question.tag || "fieldset") + ">\n                ";
            }
            return result;
        },
        _renderTemplateBodyQuestionStatement: function (statement) {
            var result = "";
            if (statement) {
                if ((typeof statement).toLowerCase() == "string") {
                    statement = {
                        content: statement
                    };
                }
                result = "\n                    <" + (statement.tag || "legend") + " class=\"" + (this.options.classes.statement + (statement.cssClass
                    ? " " + statement.cssClass
                    : "")) + "\" data-jq-quiz-statement>\n                        " + statement.content + "\n                    </" + (statement.tag || "legend") + ">\n                ";
            }
            return result;
        },
        _renderTemplateBodyQuestionOptions: function (options) {
            var result = "";
            if (options) {
                var optionsStr = "";
                if (Array.isArray(options)) {
                    options = {
                        options: options
                    };
                }
                for (var _i = 0, _a = options.options; _i < _a.length; _i++) {
                    var option = _a[_i];
                    optionsStr += this._renderTemplateBodyQuestionOption(option);
                }
                result = "\n                    <" + (options.tag || "ul") + "  class=\"" + (this.options.classes.options + (options.cssClass
                    ? " " + options.cssClass
                    : "")) + "\" data-jq-quiz-options>\n                        " + optionsStr + "\n                    </" + (options.tag || "ul") + ">\n                ";
            }
            return result;
        },
        _renderTemplateBodyQuestionOption: function (option) {
            var result = "";
            if (option) {
                option.label = option.label || {};
                option.field = option.field || {};
                result = "\n                    <" + (option.tag || "li") + " class=\"" + (this.options.classes.option + (option.cssClass
                    ? " " + option.cssClass
                    : "")) + "\" data-jq-quiz-option data-is-correct=\"" + !!option.isCorrect + "\">\n                        <label class=\"" + (this.options.classes.label + (option.label.cssClass
                    ? " " + option.label.cssClass
                    : "")) + "\"\n                                " + (option.field && option.field.id ? "for=" + option.field.id : "") + ">\n                                <span>" + option.content + "</span>\n                                <input " + (option.field && option.field.id ? "id=" + option.field.id : "") + "\n                                       class=\"" + (this.options.classes.field + (option.field.cssClass
                    ? " " + option.field.cssClass
                    : "")) + "\" \n                                       type=\"" + (this.options.multichoice ? "checkbox" : "radio") + "\"\n                                       " + (option.field && option.field.required ? "required" : "") + "\n                                       " + (option.name ? "name=" + option.name : "") + "\n                                       " + (option.value ? "value=" + option.value : "") + "\n                                />\n                                \n                        </label>\n                        " + this._renderTemplateBodyQuestionFeedback(option.feedback) + "  \n                    </" + (option.tag || "li") + ">\n                ";
            }
            return result;
        },
        _renderTemplateBodyQuestionFeedback: function (feedback) {
            var result = "";
            if (feedback && Array.isArray(feedback)) {
                for (var _i = 0, feedback_1 = feedback; _i < feedback_1.length; _i++) {
                    var item = feedback_1[_i];
                    result += "\n                        <" + (item.tag || "div") + "  class=\"" + (this.options.classes.feedback + (item.cssClass
                        ? " " + item.cssClass
                        : "")) + "\" data-jq-quiz-feedback=\"" + item.type + "\">\n                            " + item.content + "\n                        </" + (item.tag || "div") + ">\n                    ";
                }
            }
            return result;
        },
        _renderTemplateResult: function (resultOptions) {
            var result = "";
            if (resultOptions) {
                if (Array.isArray(resultOptions)) {
                    resultOptions = {
                        items: resultOptions
                    };
                }
                var resultStr = "";
                for (var _i = 0, _a = resultOptions.items; _i < _a.length; _i++) {
                    var resultItem = _a[_i];
                    resultStr += this._renderTemplateResultItem(resultItem);
                }
                result = "\n                    <" + (resultOptions.tag || "div") + " class=\"" + (this.options.classes.result + (resultOptions.cssClass
                    ? " " + resultOptions.cssClass
                    : "")) + "\" data-jq-quiz-result>\n                        " + resultStr + "\n                    </" + (resultOptions.tag || "div") + ">\n                ";
            }
            return result;
        },
        _renderTemplateResultItem: function (item) {
            var result = "";
            if (item) {
                result = "\n                    <" + (item.tagName || "dt") + " class=\"" + (this.options.classes.resultItem + (item.cssClass ? " " + item.cssClass : "")) + "\" data-jq-quiz-result-item-label=\"" + item.type + "\">\n                        " + item.content + "\n                    </" + (item.tagName || "dt") + ">\n                    <" + (item.tagName || "dd") + " class=\"" + (this.options.classes.resultItem + (item.cssClass ? " " + item.cssClass : "")) + "\" data-jq-quiz-result-item=\"" + item.type + "\">\n                        \n                    </" + (item.tagName || "dd") + ">\n                ";
            }
            return result;
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
            //if the options has checkbox, the quiz is multichoice
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
            var $questions = this._$questions, questions = [], maxScore = 0;
            //map each question
            for (var questionIndex = 0, $questionsLength = $questions.length; questionIndex < $questionsLength; questionIndex++) {
                var $current = $($questions[questionIndex]), parsedQuestion = this._mapQuestion($current);
                questions.push(parsedQuestion);
                maxScore += parsedQuestion.pointsForSuccess; //increment the max score
            }
            this._originalQuestions = questions;
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
        calificate: function (runtime) {
            var currentScore = 0, maxScore = this._maxScore, runtimeToCalificate = runtime || this._runtime, questions = this._questions, calification, nSuccess = 0, nFails = 0;
            if (this._runtime != undefined || runtime != undefined) {
                if (this.options.multichoice != true) {
                    var result = this._calificateSingleChoice(runtimeToCalificate);
                    nSuccess = result.nSuccess;
                    nFails = result.nFails;
                    currentScore = result.score;
                }
                else {
                    var result = this._calificateMultiChoice(runtimeToCalificate);
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
            }
            else {
                console.log("[jqQuiz] WARN: calificate must be used when the quiz is in running or review state or with a specific runtime");
            }
            return calification;
        },
        _calificateSingleChoice: function (runtime) {
            var currentScore = 0, runtimeToCalificate = runtime || this._runtime, questions = this._questions, nSuccess = 0, nFails = 0;
            //for each question
            for (var questionIndex = 0, questionsLength = questions.length; questionIndex < questionsLength; questionIndex++) {
                var currentQuestion = questions[questionIndex], questionRuntime = runtimeToCalificate[currentQuestion.id], //get runtime for question
                result = this._calificateSingleChoiceQuestion(currentQuestion.id, runtime);
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
        _calificateSingleChoiceQuestion: function (questionId, runtime) {
            var runtimeToCalificate = runtime || this._runtime, question = this.getQuestionById(questionId), result;
            if (question) {
                var questionRuntime = runtimeToCalificate[question.id]; //get runtime for question
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
        _calificateMultiChoiceQuestion: function (questionId, runtime) {
            var runtimeToCalificate = runtime || this._runtime, question = this.getQuestionById(questionId), result;
            if (question) {
                var questionRuntime = runtimeToCalificate[question.id]; //get runtime for question
                if (questionRuntime) {
                    var questionOptions = question.options, //get the options of the question
                    selectedOptions = questionRuntime.options, //get selected options
                    nCorrectOptionsSelected = 0, //count the success options of the question
                    nCorrectOptions = 0, nIncorrectOptionsSelected = 0;
                    //check if the correct options are all checked
                    for (var questionOptionIndex = 0, questionOptionsLength = questionOptions.length; questionOptionIndex < questionOptionsLength; questionOptionIndex++) {
                        var currentQuestionOption = questionOptions[questionOptionIndex], checked = selectedOptions.indexOf(currentQuestionOption.id) != -1; //is checked
                        if (currentQuestionOption.isCorrect) { //option is correct
                            nCorrectOptions++; //increase total
                            nCorrectOptionsSelected += checked ? 1 : 0; //increase selected
                        }
                        else {
                            if (checked) { //if a incorrect option is checked, stop checking
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
        _calificateMultiChoice: function (runtime) {
            var currentScore = 0, runtimeToCalificate = runtime || this._runtime, questions = this._questions, nSuccess = 0, nFails = 0;
            //for each question
            for (var questionIndex = 0, questionsLength = questions.length; questionIndex < questionsLength; questionIndex++) {
                var currentQuestion = questions[questionIndex], questionRuntime = runtimeToCalificate[currentQuestion.id], //get runtime for question
                result = this._calificateMultiChoiceQuestion(currentQuestion.id, runtime);
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
                    if (selected) { //if is correct add the class, if incorrect the incorrect class
                        option.$element.addClass(option.isCorrect
                            ? this.options.classes.questionCorrect
                            : this.options.classes.questionIncorrect);
                    }
                    else { //if is not selected but is correct, add the incorrect class
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
                    var correct = true;
                    //todo add control of multi choice
                    if (this.options.multichoice) {
                        var correctOptions = question.options.filter(function (o) { return o.isCorrect; });
                        if (correctOptions.length == runtime.options.length) {
                            for (var correctOptionIndex = 0, correctOptionsLength = correctOptions.length; correctOptionIndex < correctOptionsLength; correctOptionIndex++) {
                                var currentOption = correctOptions[correctOptionIndex];
                                if (runtime.options.indexOf(currentOption.id) == -1) {
                                    correct = false;
                                    correctOptionIndex = correctOptionsLength;
                                }
                            }
                        }
                        else {
                            correct = false;
                        }
                        if (correct) {
                            question.$feedbackKo.hide();
                            question.$feedbackOk.show();
                        }
                        else {
                            question.$feedbackOk.hide();
                            question.$feedbackKo.show();
                        }
                    }
                    else {
                        var option = this.getOptionById(questionId, runtime.options[0]);
                        correct = option.isCorrect;
                    }
                    if (correct) {
                        question.$feedbackKo.hide();
                        question.$feedbackOk.show();
                    }
                    else {
                        question.$feedbackOk.hide();
                        question.$feedbackKo.show();
                    }
                }
                else {
                    question.$feedbackOk.hide();
                    question.$feedbackKo.show();
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
                if (this.options.multichoice && this._state == this.STATES.running) { //if multichoice, disable only the selected fields
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
            var instance = e.data.instance, $question = $(this), //the event handler it's attached to the question
            questionId = $question.attr("id"), questionRuntime = instance._runtime[questionId] || {};
            if (instance.options.immediateFeedback === true && questionRuntime.option != undefined) {
                e.preventDefault();
            }
        },
        _updateRuntime: function (questionId, optionId, optionValue, selected) {
            var questionRuntime = this._runtime[questionId] || {}, options = questionRuntime.options || [], optionsValues = questionRuntime.optionsValues || [];
            questionRuntime.options = options;
            questionRuntime.optionsValues = optionsValues;
            if (this.options.multichoice) {
                if (selected) {
                    //store the option in the runtime
                    options.push(optionId);
                    if (optionValue) {
                        optionsValues.push(optionValue);
                    }
                }
                else {
                    options.splice(options.indexOf(optionId), 1);
                    if (optionValue) {
                        optionsValues.splice(optionsValues.indexOf(optionValue), 1);
                    }
                }
            }
            else {
                //if single choice
                //store the option in the runtime
                options[0] = optionId;
                if (optionValue) {
                    optionsValues[0] = optionValue;
                }
            }
            return questionRuntime;
        },
        _updateQuestionAndOptionUI: function (questionId, optionId, $option, checked) {
            var questionRuntime = this._runtime[questionId];
            //if multichoice
            if (this.options.multichoice) {
                //if item is selected
                if (checked) {
                    $option.addClass(this.options.classes.selected);
                }
                else {
                    //remove the option and reset the dom
                    this._resetOption(questionId, optionId);
                }
            }
            else {
                //if single choice
                //check if exists an option in the runtime
                if (questionRuntime && questionRuntime.options.length > 0) {
                    //reset the option
                    this._resetOption(questionId, questionRuntime.options[0]);
                }
                $option.addClass(this.options.classes.selected);
            }
        },
        _updateQuestionsProperties: function (questionId, optionId) {
            if (this._state != this.STATES.running || this.options.allowChangeOption != true) {
                this._disableQuestionOptionsField(questionId);
            }
            //go next if isn't immediateFeedback and isnt multichoice
            if (this._state != this.STATES.running || this.options.immediateFeedback == true) {
                //if allowChangeOption is not true, the options will be disabled
                if (this.options.allowChangeOption != undefined && this.options.allowChangeOption != true) {
                    this._disableQuestionOptionsField(questionId);
                }
                this._showQuestionStatus(questionId);
                this._showOptionStatus(questionId, optionId);
                this._showOptionFeedback(questionId, optionId);
                this._showQuestionFeedback(questionId, optionId);
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
                questionId = $question.attr("id"), optionId = $option.attr("id"), optionValue = $option.find("input").attr("value"), pendingQuestionIndex = void 0;
                for (var questionIndex = 0, questionsLength = instance.pendingQuestions.length; questionIndex < questionsLength; questionIndex++) {
                    var question = instance.pendingQuestions[questionIndex];
                    if (question.id === questionId) {
                        pendingQuestionIndex = questionIndex;
                        questionIndex = instance.pendingQuestions.length;
                    }
                }
                if (pendingQuestionIndex != -1) {
                    instance.pendingQuestions.splice(pendingQuestionIndex, 1);
                }
                instance._updateQuestionAndOptionUI(questionId, optionId, $option, e.target.checked);
                var questionRuntime = instance._updateRuntime(questionId, optionId, optionValue, e.target.checked);
                instance._runtime[questionId] = questionRuntime;
                //if multichoice
                if (instance.options.multichoice) {
                    instance._calificateMultiChoiceQuestion(questionId);
                }
                else {
                    instance._calificateSingleChoiceQuestion(questionId);
                }
                instance._updateQuestionsProperties(questionId, optionId);
                if (instance.options.autoGoNext != false && instance.options.multichoice != true && instance.options.allowChangeOption != true) {
                    setTimeout(function () {
                        if (instance.pendingQuestions && instance.pendingQuestions.length > 0) {
                            instance.next();
                        }
                        else {
                            instance.end();
                        }
                    }, instance.options.delayOnAutoNext);
                }
                else {
                    instance._updateNavigationActionsStates();
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
            if (key === "pointsForSuccess" || key === "pointsForFail") {
                this._mapQuestions();
                this._questions = this._originalQuestions.slice("");
            }
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
                    _this.element.triggerHandler(_this.ON_QUESTION_HIDDEN, [_this, questionToHide]);
                    hideDefer.resolveWith(_this);
                });
            }
            else {
                questionToHide.fadeOut(400, function () {
                    _this.element.triggerHandler(_this.ON_QUESTION_HIDDEN, [_this, questionToHide]);
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
                    _this.element.triggerHandler(_this.ON_QUESTION_SHOWN, [_this, nextQuestion]);
                    showDefer.resolveWith(_this);
                });
            }
            else {
                nextQuestion.fadeIn(400, function () {
                    _this.element.triggerHandler(_this.ON_QUESTION_SHOWN, [_this, nextQuestion]);
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
        /**
         * Ejecuta la animación para mostrar la cabecera
         * Lanza el evento ON_HEADER_SHOW. Si el evento devuelve una promesa, no se ejecuta la animación por defecto y en su lugar espera a que se complete la promesa devuelta
         * @returns {JQueryPromise<T>}
         * @private
         */
        _showHeader: function () {
            var _this = this;
            var defer = $.Deferred();
            if (this._$header.length > 0) {
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
            }
            else {
                defer.resolveWith(this);
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
         * Deshabilita el botón siguiente
         * @private
         */
        _disableStart: function () {
            this._$startBtn.prop("disabled", true);
            this._$startBtn.addClass(this.options.classes.disabled);
        },
        /**
         * Habilita el botón siguiente
         * @private
         */
        _enableStart: function () {
            this._$startBtn.prop("disabled", false);
            this._$startBtn.removeClass(this.options.classes.disabled);
        },
        /**
         * Invocado al finalizar la animación  de comienzo. Avanza a la primera página y lanza el evento ON_START
         * @returns {JQueryPromise<T>}
         * @private
         */
        _onAnimationStartEnd: function () {
            var goTo;
            if (this._state === this.STATES.running) {
                if (this.pendingQuestions.length === this._questions.length) {
                    goTo = this.options.initialQuestion || 0;
                }
                else {
                    goTo = "" + this.pendingQuestions[0].id;
                }
            }
            else {
                goTo = 0;
            }
            this.goTo(goTo);
            if (this._state == this.STATES.review) {
                this.showCorrection();
            }
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
            if (this._state == this.STATES.running && this.options.disableNextUntil != -1) {
                if (this.options.allowChangeOption == false) {
                    if (this.options.disableNextUntil >= 0 && questionRuntime == undefined) {
                        this._disableNext();
                    }
                }
                else {
                    if ((questionRuntime == undefined && this.options.disableNextUntil == 0) || (this.options.disableNextUntil == 1 && (questionRuntime == undefined || !questionRuntime.isCorrect))) {
                        this._disableNext();
                    }
                }
            }
            if (this._state == this.STATES.running && this.options.immediateFeedback == true && this.options.allowChangeOption == true) {
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
            instance._enableEnd();
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
        goTo: function (questionIdOrIndex) {
            var _this = this;
            var defer = $.Deferred();
            var promise = defer.promise();
            if (this._state === this.STATES.running || this._state == this.STATES.review) {
                var nextQuestion_1, questionIndex = questionIdOrIndex;
                if ((typeof questionIndex).toLowerCase() == "string") {
                    questionIndex = this._questions.findIndex(function (q) { return q.id == questionIdOrIndex; });
                }
                nextQuestion_1 = this._questions[questionIndex];
                var currentQuestionIndex = this._currentQuestionIndex, currentQuestion_1 = this._questions[currentQuestionIndex];
                //ensure that next question exists and it's different of the current question
                if (nextQuestion_1 != undefined) {
                    if (currentQuestion_1 == undefined || currentQuestion_1 != nextQuestion_1) {
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
                                    .then(_this._onQuestionTransitionEnd.bind(_this, currentQuestion_1, nextQuestion_1, defer));
                            });
                        }
                        else {
                            //if current quesiton doesn't exists
                            this._show(nextQuestion_1.$element)
                                .then(this._onQuestionTransitionEnd.bind(this, currentQuestion_1, nextQuestion_1, defer));
                        }
                    }
                    else {
                        defer.reject();
                    }
                }
                else {
                    defer.reject();
                } /*else{
                    //hide current question
                    if(currentQuestion) {
                        let defer = $.Deferred();
                        promise = defer.promise();
                        this._hide(currentQuestion.$element).then(this._onQuestionTransitionEnd.bind(
                            this,
                            currentQuestion,
                            null,
                            defer
                        ));
                    }
                }*/
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
            return this.getQuestionByIndex(this._questions.findIndex(function (q) { return q.id == id; }));
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
         * Redraw the properties
         */
        redrawProperties: function () {
            this._renderOptions();
        },
        /**
         * Resetea el formulario
         */
        reset: function () {
            this._runtime = {};
            this.pendingQuestions = null;
            this.completedQuestions = null;
            this.element.removeAttr(this.ATTR_CURRENT_QUESTION);
            this.element.removeClass(this.options.classes.firstQuestion);
            this.element.removeClass(this.options.classes.lastQuestion);
            this._currentQuestionIndex = null;
            this._resetUI();
        },
        /**
         * Comienza el cuestionario
         */
        start: function (params) {
            if (this.options.disabled != true && this._state === this.STATES.off) {
                this._changeState((params && params.review && this.STATES.review) || this.STATES.running);
                this._runtime = (params && params.runtime) || {};
                this._questions = this._originalQuestions.slice();
                this.pendingQuestions = this._questions.slice();
                if (params && params.runtime) {
                    this._setRuntimeState(params.runtime, this._questions);
                    for (var questionId in this._runtime) {
                        for (var questionIndex = 0, questionsLength = this.pendingQuestions.length; questionIndex < questionsLength; questionIndex++) {
                            var question = this.pendingQuestions[questionIndex];
                            if (question.id === questionId) {
                                this.pendingQuestions.splice(questionIndex, 1);
                                questionIndex = this.pendingQuestions.length + 1;
                            }
                        }
                    }
                }
                if (this.options.randomize) {
                    this._questions = this._shuffle(this._questions);
                }
                this.element.trigger(this.ON_START, [this]);
                this._animationStart()
                    .then(this._onAnimationStartEnd);
            }
        },
        /**
         * Muestra el resultado del cuestionario
         * @param calification
         */
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
        /**
         * Muestra la corrección del cuestionario
         * @returns {boolean}
         */
        showCorrection: function () {
            if (this.options.showCorrection) {
                this._changeState(this.STATES.review);
                this.goTo(0);
                var questions = this._questions;
                for (var questionIndex = 0, questionsLength = questions.length; questionIndex < questionsLength; questionIndex++) {
                    var currentQuestion = questions[questionIndex], options = currentQuestion.options;
                    for (var optionIndex = 0, optionsLength = options.length; optionIndex < optionsLength; optionIndex++) {
                        var currentOption = options[optionIndex];
                        this._showOptionStatus(currentQuestion.id, currentOption.id);
                    }
                    if (this._runtime[currentQuestion.id]) {
                        var runtime = this._runtime[currentQuestion.id], options_2 = runtime.options;
                        for (var _i = 0, options_3 = options_2; _i < options_3.length; _i++) {
                            var option = options_3[_i];
                            this._updateQuestionsProperties(currentQuestion.id, option);
                        }
                    }
                    this._disableQuestionOptionsField(currentQuestion.id);
                }
                return true;
            }
            else {
                return false;
            }
        },
        _shuffle: function (a) {
            for (var i = a.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                _a = [a[j], a[i]], a[i] = _a[0], a[j] = _a[1];
            }
            return a;
            var _a;
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
                this._disableEnd();
                //calificate
                var calification = this.calificate();
                this.lastCalification = calification;
                this._disableAllQuestions();
                this.element.trigger(this.ON_END, [this, calification, this._runtime]);
                //if show result is disabled
                if (!this.showResult(calification)) {
                    //if show correction
                    this._enableEnd();
                    if (!this.showCorrection()) {
                        this._changeState(this.STATES.off);
                        this._animationStop()
                            .then(this._onAnimationEndEnd);
                    }
                }
                return calification;
                //if its with result
            }
            else if (this._state == this.STATES.result) {
                this._disableEnd();
                //if show correction is distabled
                this._enableEnd();
                if (!this.showCorrection()) {
                    this._changeState(this.STATES.off);
                    this._animationStop()
                        .then(this._onAnimationEndEnd);
                    this.element.trigger(this.ON_FINISHED, [this, this.latestCalification || this.calificate(), this._runtime]);
                }
                return this.lastCalification;
                //if its reviewing
            }
            else if (this._state == this.STATES.review) {
                this._changeState(this.STATES.off);
                this._enableEnd();
                this._animationStop()
                    .then(this._onAnimationEndEnd);
                this.element.trigger(this.ON_REVIEW_END, [this, this.latestCalification || this.calificate(), this._runtime]);
                this.element.trigger(this.ON_FINISHED, [this, this.latestCalification || this.calificate(), this._runtime]);
                return this.lastCalification;
            }
        },
        _resetUI: function () {
            this._$questions.hide();
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
        _getRandomNextQuestionIndex: function () {
            var result;
            var questionId = this.pendingQuestions[Math.floor(Math.random() * this.pendingQuestions.length)];
            result = this._questions.findIndex(function (q) { return q.id == questionId; });
            return result;
        },
        _setRuntimeState: function (states, questions) {
            var _loop_1 = function (questionId) {
                var state = states[questionId], 
                //find it
                question = questions.find(function (q) { return q.id === questionId; });
                if (question) {
                    //find selected option
                    for (var optionStateIndex = 0, optionsLength = state.options.length; optionStateIndex < optionsLength; optionStateIndex++) {
                        var optionId = state.options[optionStateIndex], optionIndex = question.optionsMap[optionId];
                        if (optionIndex != null) {
                            //mark as checked
                            question.options[optionIndex].$element.find("input").prop("checked", true);
                            this_1._updateQuestionAndOptionUI(questionId, optionId, question.options[optionIndex].$element, true);
                            this_1._updateQuestionsProperties(questionId, optionId);
                        }
                    }
                }
            };
            var this_1 = this;
            //for each question
            for (var questionId in states) {
                _loop_1(questionId);
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
        /**
         * Disable the quiz.
         * Disable only affects to start button, if the quiz has been started, the current attempt still being enabled
         */
        disable: function () {
            this._super();
            this._disable();
        },
        /**
         * Enable the quiz.
         * Enable only affects to start button.
         */
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
            this._super();
        },
        getRuntime: function () {
            return this._runtime;
        }
    });

})));
