import { createBrowserRouter } from "react-router-dom";
import MessageComponent from "../messages/MessageComponent";
/// here should add routers/ pages
export const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello world!</div>,
  },

  {
    path: "/profile",
    element: <div>Hello user!</div>,
  },
  {
    path: "/messages",
    element: <MessageComponent />,
  },
]);
