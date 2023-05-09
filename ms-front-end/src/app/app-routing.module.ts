import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./core/login/login.component";
import { LogoutComponent } from "./core/logout/logout.component";

const appRoutes: Routes = [
  { path: "", redirectTo: "recipe", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "logout", component: LogoutComponent },
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(appRoutes, {
      relativeLinkResolution: "legacy",
      scrollPositionRestoration: "enabled",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
