import { Routes } from '@angular/router';
import { canActivateAdmin } from '../guards/admin.guard';

import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminCategoriesComponent } from './categories/categories.component';
import { AdminCategoryFormComponent } from './category-form/category-form.component';
import { AdminQuestionsComponent } from './questions/questions.component';
import { AdminQuestionFormComponent } from './question-form/question-form.component';
import { AdminUsersComponent } from './users/users.component';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    canActivate: [canActivateAdmin],
    component: AdminLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'questions' },
      {
        path: 'categories',
        children: [
          { path: '', component: AdminCategoriesComponent },
          { path: 'new', component: AdminCategoryFormComponent },
          { path: ':id', component: AdminCategoryFormComponent },
        ],
      },
      {
        path: 'questions',
        children: [
          { path: '', component: AdminQuestionsComponent },
          { path: 'new', component: AdminQuestionFormComponent },
          { path: ':id', component: AdminQuestionFormComponent },
        ],
      },
      {
        path: 'users',
        component: AdminUsersComponent,
      },
    ],
  },
];
