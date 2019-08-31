/**
 * @overview ccm component for quiz single choice question
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
    
    ccm: './ccm/versions/ccm-20.7.2.js',
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
              //{ tag : 'button', id : "submit", inner :  'test'} //TODO: Make sth with placeholder here, etc.*/
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
        //this.traverse_light_dom();
      };
  
      this.traverse_light_dom = () => {
        [ ...self.inner.children ].forEach( question_tag => {
          console.log(question_tag);
          console.log(question_tag.tagName);

          // no question tag? => skip
          if ( question_tag.tagName !== 'QUESTION' ) {
              console.log('it is no question');
              return;
          }
          else{
            console.log('it is a question');
            return;
          }

          /**
           * question data (generated out of question tag)
           * @type {Object}
           */
          const question = $.generateConfig( question_tag );

          /**
           * answer data sets (generated out of question tag)
           * @type {Object[]}
           */
          question.answers = [];

          // iterate over all children of question tag to search for answer tags
          [ ...question.inner.children ].forEach( answer_tag => {

            // no answer tag? => skip
            if ( answer_tag.tagName !== 'ANSWER' ) return;

            /**
             * answer data (generated out of answer tag)
             * @type {Object}
             */
            const answer = $.generateConfig( answer_tag );

            // remove no more needed properties in answer data
            delete answer.inner;

            // add answer data to answer data sets
            question.answers.push( answer );

          } );

          // remove no more needed properties in question data
          delete question.inner;

          // add question data to question data sets
          question.answers.length > 0 && questions.push( question );
        });

      } ;


      /**
       * is called once after the initialization and is then deleted
       */
      this.ready = async () => {
        // set shortcut to help functions
        $ = self.ccm.helper;
      };

      //curry the click function to access the answer
      /*this.oncheck = function(answer){
        return function(event){
          event.stopPropagation();
          event.preventDefault();

          var given = this.checked;

          //answer is reference to array element, so we can safely do this
          answer.given = given;
        }
      };*/

      /*this.submit = function(event){
          event.stopPropagation();
          event.preventDefault();

          var perc_part = Math.ceil(100 / self.answers.length);
          var perc = 0;
    
          for(var i = 0; i < self.answers.length; i++){
            var correct = (self.answers[i].given || false) == self.answers[i].correct;

            if(correct){
              perc += perc_part; 
            }
          }

          //Due to roundings it's possible to get a number > 100 -> fix this
          perc = perc > 100 ? 100 : perc;

          //TODO: Perc is the result percentage. Give it back if possible or do further processing
      }*/

      /*this.render = function(){
        const main = self.html.main;
        const question = main.inner[0];
        const answers= main.inner[1];

        //build answer array
        for(var i = 0; i < this.answers.length; i++){
          //random id for linking label and checkbox
          var id = Math.random() * (100000 - 9999999) + 100000;


          var cb = { 
            tag :'input', 
            type : 'checkbox', 
            id : id,
            class : 'answer_cb', 
            onchange : this.oncheck(this.answers[i]), 
          };

          var label = {
            tag : 'label',
            for : id,
            class : 'answer_label',
            inner : this.answers[i].value
          }

          answers.inner.push(cb);
          answers.inner.push(label);
        }

        //show question if required
        if(this.show_question){
          question.inner = this.question;    
        }
        else{
          //remove element
          main.inner.splice(0, 1);
        }

        $.setContent(self.element, $.html(main));
      }*/

      this.handle_single_answer = (percentage) => {
        return (event) => {
          event.stopPropagation();
          event.preventDefault();
          
          alert(percentage);
        };
      }

      this.handle_multiple_answer = () => {
        let percentage = 0;
        let perc_answer = Math.floor(100 / this.answers.length);
        console.log(this.answers);

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
      }

      this.get_answer_div = () => {
        return this.html.main.inner[this.html.main.inner.length - 1].inner;
      }

      this.render_single = () => {
        this.answers.forEach(answer => {
          let button = {
            tag : 'button',
            class : 'single_answer',
            inner : answer.value,
            onclick : this.handle_single_answer(answer.correct ? 100 : 0).bind(this)
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

        this.html.main.inner.push(submit);
        console.log(this.answers);
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


      /**
       * starts the instance
       */
      this.start = async () => {
        //self.html.main.inner[2].onclick = this.submit;
        //this.render();

        this.show_question();
      };

    }

  };

  function p(){window.ccm[v].component(component)}const f="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[f])window.ccm.files[f]=component;else{const n=window.ccm&&window.ccm.components[component.name];n&&n.ccm&&(component.ccm=n.ccm),"string"===typeof component.ccm&&(component.ccm={url:component.ccm});var v=component.ccm.url.split("/").pop().split("-");if(v.length>1?(v=v[1].split("."),v.pop(),"min"===v[v.length-1]&&v.pop(),v=v.join(".")):v="latest",window.ccm&&window.ccm[v])p();else{const e=document.createElement("script");document.head.appendChild(e),component.ccm.integrity&&e.setAttribute("integrity",component.ccm.integrity),component.ccm.crossorigin&&e.setAttribute("crossorigin",component.ccm.crossorigin),e.onload=function(){p(),document.head.removeChild(e)},e.src=component.ccm.url}}
}
