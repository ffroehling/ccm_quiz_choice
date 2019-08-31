ccm.files[ 'config.multiple.js' ] = {
  "local" : {
    "css" : ['ccm.load', './style.css'],
    "type" : "multiple" ,
    "question_text" : "Welche Antworten sind korrekt?",
    "answers": [
      {"value" : "Antwort 1", "correct" : false} ,
      {"value" : "Antwort 2 (Richtig)", "correct" : true},
      {"value" : "Antwort 3 (Richtig)", "correct" : true},
      {"value" : "Antwort 4", "correct" : false}
    ]
  }
}
