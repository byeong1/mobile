import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../components/Login.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../components/Register.vue"),
  },
  {
    path: "/characters",
    name: "Characters",
    component: () => import("../components/CharacterList.vue"),
  },
  {
    path: "/characters/add",
    name: "CharacterAdd",
    component: () => import("../components/CharacterAdd.vue"),
  },
  {
    path: "/characters/:id",
    name: "CharacterHome",
    component: () => import("../components/Home.vue"),
    props: true,
  },
  {
    path: "/",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
