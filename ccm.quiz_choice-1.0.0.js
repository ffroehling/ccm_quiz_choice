/**
 * @overview ccm component for quiz multiple and single choice question
 * @author Felix Fröhling <felix.froehling@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 * @version latest (1.0.0)
 */

{

  var component  = {

    /**
     * unique component name
     * @type {string}
     */
    name: 'quiz_choice',
    version: [1,0,0],
    
    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-20.7.2.js',
    /**
     * default instance configuration
     * @type {object}
     */
    config: {
      html: {
        main: {
          inner: [
              {tag : "img", id : 'question_img', inner : ""},
              {tag : "h3", id : 'question_text', inner : ""},
              { tag : 'div', id : "answers", inner : [] },
          ]
        }
      }
    },

    /**
     * for creating instances of this component
     * @constructor
     */
    Instance: function () {

      "use strict";

      /**
       * own reference for inner functions
       * @type {Instance}
       */
      const self = this;

      /**
       * shortcut to help functions
       * @type {Object.<string,function>}
       */
      let $;

      /**
       * init is called once after all dependencies are solved and is then deleted
       */
      this.init = async () => {
        // set shortcut to help functions
        $ = self.ccm.helper;
        this.traverse_light_dom();
      };
  
      this.traverse_light_dom = () => {
        /*
         * #################
         * THE SOURCE CODE IN THIS AREA IS BASED AND ALMOST EQUIVALENT 
         * TO André Kless' quiz component
         * https://akless.github.io/ccm-components/quiz/ccm.quiz.js
         * #################
         */  

        //if there's no lightdom we can just skip
        if(!self.inner){
          return;
        }
        
        let answers = [];

        [ ...self.inner.children ].forEach( answer_tag => {
            // no answer tag? => skip
            if ( answer_tag.tagName !== 'CCM-CHOICE-ANSWER' ) return;

            /**
             * answer data (generated out of answer tag)
             * @type {Object}
             */
            const answer = $.generateConfig( answer_tag );
            answers.push(answer);

          } );

          // add question data to question data sets
          if(answers.length > 0){
            this.answers = answers;
          }
      } ;


      /**
       * is called once after the initialization and is then deleted
       */
      this.ready = async () => {
      };

      this.set_given_answer = (answer) => {
        this.given_answer = answer;
      };

      this.show_multiple_correct_answer = () => {
        this.given_answer.forEach((given_answer) => {
          //get correctness
          let correct = given_answer.selected == given_answer.correct;

          //get according answer
          this.element.querySelectorAll('.multiple_wrapper').forEach(wrapper => {
            let content = wrapper.querySelector('label').innerHTML;
            if(content == given_answer.value){
              if(correct){
                wrapper.classList.add('correct');
              }
              else{
                wrapper.classList.add('wrong');
              }
            }

          });
        });
      };

      this.show_single_correct_answer = () => {
        //get correct answer
        this.correct_answer = null;
        this.answers.forEach(answer => {
          if(answer.correct){
            this.correct_answer = answer;
          }
        });

        this.element.querySelectorAll('button').forEach((button) => {
          if(this.given_answer.value == button.innerHTML){
            if(!this.given_answer.correct){
              button.classList.add('wrong');
            }
          }
         
          if(this.correct_answer.value == button.innerHTML){
            button.classList.add('correct');
          }
        });
      };

      this.show_correct_answer  = () => {
        this.disabled_submit = true; 
        this.element.querySelectorAll('button').forEach((button)  => {
          button.classList.add('disabled');
        });

        if(this.type == 'single'){
          this.show_single_correct_answer();
        }
        else{
          this.show_multiple_correct_answer();
        }
      };

      this.on_answer_callback = () => {
        if(this.answer_callback){
          this.answer_callback(this.percentage, this.given_answer);
        }
      }

      this.handle_single_answer = (answer) => {
        return (event) => {
          event.stopPropagation();
          event.preventDefault();

          if(this.disabled_submit){
            return;
          }

          this.percentage = answer.correct ? 100 : 0;
          this.given_answer = answer;
          this.on_answer_callback();
        
          if(this.show_feedback){
            this.show_correct_answer();
          }
        };
      }

      this.handle_multiple_answer = () => {
        let percentage = 0;
        let perc_answer = Math.floor(100 / this.answers.length);

        if(this.disabled_submit){
          return;
        }

        this.answers.forEach(answer => {
          if(answer.selected == answer.correct){
            percentage += perc_answer;
          }
          else{
            percentage -= perc_answer;
          }
        });
        
        if(percentage < 0){
          percentage = 0;
        }
        else if(percentage > 100){
          percentage = 100;
        }

        this.percentage = percentage;
        this.given_answer = this.answers;
        this.on_answer_callback();

          if(this.show_feedback){
            this.show_correct_answer();
          }
      }

      this.get_answer_div = () => {
        return this.html.main.inner[this.html.main.inner.length - 1].inner;
      }

      this.render_single = () => {
        this.answers.forEach(answer => {
          let button = {
            tag : 'button',
            correct : answer.correct,
            class : 'single_answer',
            inner : answer.value,
            onclick : this.handle_single_answer(answer).bind(this)
          };

          this.get_answer_div().push(button);
        });
      };

      this.render_multiple = () => {
        this.answers.forEach(answer => {
          answer.selected = false;

          let id = Math.random() * (100000 - 9999999) + 100000;

          let checkbox = {
            tag : 'input',
            type : 'checkbox',
            id : id,
            class : 'multiple_answer',
            inner : answer.value,
            onchange : function(event){
              event.stopPropagation();
              event.preventDefault();

              answer.selected =  this.checked;
            }

          };

          var label = {
            tag : 'label',
            for : id,
            class : 'answer_label',
            inner : answer.value
          }

          let wrapper = {
            class : 'multiple_wrapper',
            inner : [
              checkbox, 
              label
            ]
          }

          this.get_answer_div().push(wrapper);
        });

        let submit = {
          tag : 'button',
          id : 'multiple_submit',
          inner : 'Submit',
          onclick : this.handle_multiple_answer.bind(this)
        }

        this.get_answer_div().push(submit);
      },

      this.set_question = () => {
        if(this.question_text){
          this.html.main.inner[1].inner = this.question_text;
        }
        else{
          this.html.main.inner.splice(1,1)
        }

        if(this.question_image){
          this.html.main.inner[0].src = this.question_image;
        }
        else{
          this.html.main.inner.splice(0,1);
        }
      }

      this.show_question = () => {
        //set question
        this.set_question();

        if(this.type == 'single'){
          this.render_single();
        }
        else{
          this.render_multiple();
        }

        //let html = $.html(self.html.main, {question : this.question});
        let html = $.html(self.html.main);
        $.setContent(self.element, html);
      };

      this.unify_config = async () => {
        if((!this.answers) || this.answers.length == 0){
          return false;
        }

        if(!(this.type == 'single' || this.type == 'multiple')){
          this.type = 'single';
        }

        if( typeof this.show_feedback === 'undefined'){
          this.show_feedback = true;
        }

        return true;
      }

      /**
       * starts the instance
       */
      this.start = async () => {
        //Abort on invalid config
        if(! await this.unify_config()){
          console.error('Invalid configuration received. App not started');
          return;
        }

        this.show_question();
        
      };

    }
  };

  function p(){window.ccm[v].component(component)}const f="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[f])window.ccm.files[f]=component;else{const n=window.ccm&&window.ccm.components[component.name];n&&n.ccm&&(component.ccm=n.ccm),"string"===typeof component.ccm&&(component.ccm={url:component.ccm});var v=component.ccm.url.split("/").pop().split("-");if(v.length>1?(v=v[1].split("."),v.pop(),"min"===v[v.length-1]&&v.pop(),v=v.join(".")):v="latest",window.ccm&&window.ccm[v])p();else{const e=document.createElement("script");document.head.appendChild(e),component.ccm.integrity&&e.setAttribute("integrity",component.ccm.integrity),component.ccm.crossorigin&&e.setAttribute("crossorigin",component.ccm.crossorigin),e.onload=function(){p(),document.head.removeChild(e)},e.src=component.ccm.url}}
}
