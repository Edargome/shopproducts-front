import { Routes } from '@angular/router';
import { CatalogPageComponent } from './features/catalog/page/catalog-page.component';
import { LoginPageComponent } from './features/auth/pages/login-page.component';
import { AdminProductsPageComponent } from './features/admin/page/admin-products-page.component';
import { ProductFormPageComponent } from './features/admin/page/product-form-page.component';
import { AdminLayoutComponent } from './features/admin/page/admin-layout.component';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'catalog', pathMatch: 'full' },

  { path: 'catalog', component: CatalogPageComponent },
  { path: 'login', component: LoginPageComponent },

  {
    path: 'admin/products',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminProductsPageComponent },
      { path: 'new', component: ProductFormPageComponent },
      { path: ':id/edit', component: ProductFormPageComponent },
    ],
  },

  { path: '**', redirectTo: 'catalog' },
];
