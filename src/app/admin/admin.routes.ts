import { Routes } from '@angular/router';
import { canActivateAdmin } from '../guards/admin.guard';

import { AdminCategoriesComponent } from './categories.component';
import { AdminCategoryFormComponent } from './category-form.component';
import { AdminQuestionsComponent } from './questions.component';
import { AdminQuestionFormComponent } from './question-form.component';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'questions' },
      {
        path: 'categories',
        //canActivate: [canActivateAdmin],
        children: [
          { path: '', component: AdminCategoriesComponent },
          { path: 'new', component: AdminCategoryFormComponent },
          { path: ':id', component: AdminCategoryFormComponent },
        ],
      },
      {
        path: 'questions',
        canActivate: [canActivateAdmin],
        children: [
          { path: '', component: AdminQuestionsComponent },
          { path: 'new', component: AdminQuestionFormComponent },
          { path: ':id', component: AdminQuestionFormComponent },
        ],
      },
    ],
  },
];
