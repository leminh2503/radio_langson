import EquipmentManagement from "../Pages/EquipmentManagement/EquipmentManagement";
import BroadcastCalendar   from "../Pages/BroadcastCalendar/BroadcastCalendar";
import RadioProgram        from "../Pages/RadioProgram/RadioProgram";
import ContentManagement   from "../Pages/ContentManagement/ContentManagement";
import Account             from "../Pages/Account/Account";
import SignIn              from "../Pages/Auth/SignIn";
import SignUp              from "../Pages/Auth/SignUp";
import ForgotPassword      from "../Pages/Auth/ForgotPassword";
import Dashboard           from "../Pages/Dashboards/Dashboard";

const dashboardRoutes = {
    path: "",
    name: "Dash board",
    children: [
        {
            path: "/dashboard",
            name: "Dashboard",
            component: Dashboard
        },
        {
            path: "/equipment-management",
            name: "Equipment management",
            component: EquipmentManagement
        },
        {
            path: "/broadcast-calendar",
            name: "Broadcast schedule",
            component: BroadcastCalendar
        },
        {
            path: "/content-management",
            name: "Content management",
            component: ContentManagement
        },
        {
            path: "/content-management/:id",
            name: "Content management",
            component: ContentManagement
        },
        {
            path: "/account",
            name: "Account",
            component: Account
        },
        {
            path: "/radio-program/:id",
            name: "Radio Program",
            component: RadioProgram
        }
    ]
};

const authRoutes = {
    path: "/auth",
    name: "Auth",
    children: [
        {
            path: "/sign-in",
            name: "Sign In",
            component: SignIn
        },
        {
            path: "/sign-up",
            name: "Sign Up",
            component: SignUp
        },
        {
            path: "/forgot-password",
            name: "Forgot Password",
            component: ForgotPassword
        }
    ]
};

export const dashboard = [
    dashboardRoutes
];

export const auth = [
    authRoutes
];
