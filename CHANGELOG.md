# Change Log
<a name="1.1.0"></a>
## [1.0.0](https://github.com/davinchi-finsi/jq-quiz/compare/v1.0.0...v1.1.0) (2018-05-17)
### Features
* Now goTo accepts the id of the question or the index

<a name="1.0.0"></a>
## [1.0.0](https://github.com/davinchi-finsi/jq-quiz/compare/v0.6.3...v1.0.0) (2018-03-01)

### BREAKING CHANGES
* **chore:** Bundling process changed
* **chore:** Removed imports of JQuery ui dependencies
* Removed deprecated jqQuiz.pug
### Features
* Added ON_BODY_HIDDEN and ON_BODY_SHOWN events
* Add a class to question element and options elements when the question is disabled
* autoStart option
* Header element now is optional
* Add options values to the runtime (using input value attribute). value is optional
* Method to hide the current question
* initialQuestion option. The question to show when the quiz starts*
* showResult: $result checking always true
* Css class for body

### Refactor
* Trigger ON_END right after ends the quiz and before starting the review

### Bug Fixes
* ON_OPTION_CHANGE pass the jquery element instead of the widget instance

