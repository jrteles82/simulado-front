import { Routes } from '@angular/router';
import { canActivateAdmin } from '../guards/admin.guard';

import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminCategoriesComponent } from './categories/categories.component';
import { AdminCategoryFormComponent } from './category-form/category-form.component';
import { AdminQuestionsComponent } from './questions/questions.component';
import { AdminQuestionFormComponent } from './question-form/question-form.component';
import { AdminUsersComponent } from './users/users.component';
import { AdminPlansComponent } from './plans/plans.component';
import { AdminPlanFormComponent } from './plans/plan-form.component';

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
        path: 'plans',
        children: [
          { path: '', component: AdminPlansComponent },
          { path: 'new', component: AdminPlanFormComponent },
          { path: ':id', component: AdminPlanFormComponent },
        ],
      },
      {
        path: 'users',
        component: AdminUsersComponent,
      },
    ],
  },
];
