import { Component, AfterViewInit } from '@angular/core';
import { QuizService } from 'src/app/services/quiz.service';
import { Router, ActivatedRoute } from '@angular/router';
import { StateService } from 'src/app/services/state.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Quiz } from 'src/app/models/quiz';

@Component({
  templateUrl: 'question.component.html',
})
export class QuestionComponent implements AfterViewInit {
  filter: string = "";

  constructor(
    private quizService: QuizService,
    private stateService: StateService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private route: Router,
    private activatedRoute: ActivatedRoute // Add ActivatedRoute for getting parameters from URL
  ) {}

  ngAfterViewInit() {
    // Retrieve quizId and questionId from the URL parameters
    const quizId = this.activatedRoute.snapshot.params['quizId'];
    const questionId = this.activatedRoute.snapshot.params['id'];

    // Use quizId and questionId as needed

    // Example: Fetch quiz and question data based on IDs
    this.quizService.getQuiz(quizId).subscribe((quiz: Quiz) => {
      // Fetch the quiz data
      console.log(quiz);

      // Now, you can use the questionId to fetch the corresponding question data
      this.quizService.getQuestion(questionId).subscribe((question) => {
        // Fetch the question data
        console.log(question);
      });
    });
  }

  edit(quiz: Quiz) {
    console.log(quiz);
  }

  refresh() {
    // Implement the refresh logic as needed
  }

  // Utiliser dialog pour delete?
}
